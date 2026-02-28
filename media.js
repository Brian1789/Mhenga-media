(() => {
  const root = document.getElementById("js-media-root");
  if (!root) return;

  const apiKey = root.dataset.youtubeApiKey || "";
  const handle = root.dataset.youtubeHandle || "";
  const channelId =
    root.dataset.youtubeChannel && root.dataset.youtubeChannel !== "CHANNEL_ID"
      ? root.dataset.youtubeChannel
      : "";

  const latestFrame = document.getElementById("js-latest-iframe");
  const latestTitle = document.getElementById("js-latest-title");
  const latestMeta = document.getElementById("js-latest-meta");
  const archive = document.getElementById("js-archive");
  const status = document.getElementById("js-media-status");

  const YT_API = "https://www.googleapis.com/youtube/v3";
  const RSS_CHAN = (id) => `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`;
  const RSS_TO_JSON = (rssUrl) =>
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
  const CORS_PROXY = (url) =>
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchWithRetry = async (url, opts = {}, retries = 3, delayMs = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const res = await fetch(url, opts);
      if (res.ok) return res;
      if (attempt < retries && res.status >= 500) {
        await sleep(delayMs * attempt);
        continue;
      }
      throw new Error(`Request failed (${res.status}).`);
    }
  };

  // ── YouTube Data API v3 ──────────────────────────────────────────────────────

  const ytApiItems = async (key, searchHandle) => {
    // 1. Resolve handle → uploads playlist ID
    const cleanHandle = searchHandle.replace(/^@/, "");
    const chanUrl = `${YT_API}/channels?part=contentDetails&forHandle=${encodeURIComponent(cleanHandle)}&key=${encodeURIComponent(key)}`;
    const chanRes = await fetchWithRetry(chanUrl, { cache: "no-store" });
    const chanData = await chanRes.json();
    if (chanData.error) throw new Error(`YouTube API: ${chanData.error.message}`);
    const uploadsId = chanData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) throw new Error("Could not find uploads playlist for this channel.");

    // 2. Fetch latest 10 items from uploads playlist
    const plUrl = `${YT_API}/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploadsId)}&maxResults=10&key=${encodeURIComponent(key)}`;
    const plRes = await fetchWithRetry(plUrl, { cache: "no-store" });
    const plData = await plRes.json();
    if (plData.error) throw new Error(`YouTube API: ${plData.error.message}`);

    return (plData.items || []).map((item) => {
      const s = item.snippet;
      const videoId = s?.resourceId?.videoId || "";
      return {
        title: s?.title || "",
        link: videoId ? `https://www.youtube.com/watch?v=${videoId}` : "",
        pubDate: s?.publishedAt || "",
        thumbnail: s?.thumbnails?.high?.url
          || s?.thumbnails?.medium?.url
          || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : ""),
        description: s?.description || "",
        guid: videoId,
      };
    });
  };

  const parseRssXml = (xmlText) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "application/xml");

    // yt:videoId uses a namespace — try multiple strategies to extract it
    const getVideoId = (entry) => {
      // Strategy 1: yt:videoId namespace element
      const ns = entry.getElementsByTagNameNS("http://www.youtube.com/xml/schemas/2015", "videoId");
      if (ns.length) return ns[0].textContent.trim();

      // Strategy 2: unprefixed fallback some parsers expose
      const plain = entry.getElementsByTagName("yt:videoId");
      if (plain.length) return plain[0].textContent.trim();

      // Strategy 3: extract from <id> text like "yt:video:VIDEOID"
      const idEl = entry.querySelector("id");
      if (idEl) {
        const m = idEl.textContent.match(/yt:video:([a-zA-Z0-9_-]+)/);
        if (m) return m[1];
      }

      // Strategy 4: extract from <link> href attribute
      const link = entry.querySelector("link");
      const href = link?.getAttribute("href") || "";
      const m2 = href.match(/[?&]v=([^&]+)/);
      if (m2) return m2[1];

      return "";
    };

    const entries = Array.from(doc.querySelectorAll("entry"));
    return entries.map((e) => {
      const videoId = getVideoId(e);
      const link = e.querySelector("link")?.getAttribute("href")
        || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "");
      return {
        title: e.querySelector("title")?.textContent || "",
        link,
        pubDate: e.querySelector("published")?.textContent || "",
        thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "",
        guid: e.querySelector("id")?.textContent || "",
      };
    });
  };

  // Fallback: fetch the RSS directly via a CORS proxy and parse XML
  const fetchViaProxy = async (rssUrl) => {
    const res = await fetch(CORS_PROXY(rssUrl), { cache: "no-store" });
    if (!res.ok) throw new Error(`Proxy request failed (${res.status}).`);
    const json = await res.json();
    const xml = json?.contents;
    if (!xml) throw new Error("Empty proxy response.");
    return parseRssXml(xml);
  };

  const toVideoId = (item) => {
    // rss2json typically provides item.link like "https://www.youtube.com/watch?v=VIDEOID"
    const link = item?.link || "";
    const match = link.match(/[?&]v=([^&]+)/);
    if (match?.[1]) return match[1];
    const short = link.match(/youtu\.be\/([^?]+)/);
    if (short?.[1]) return short[1];

    // If link parsing fails, try a fallback: item.guid sometimes contains the ID
    const guid = item?.guid || "";
    const guidMatch = guid.match(/:video:([a-zA-Z0-9_-]{6,})/);
    return guidMatch?.[1] || null;
  };

  const fmtDate = (isoOrDate) => {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  const setStatus = (msg) => {
    if (!status) return;
    status.textContent = msg;
    status.style.display = msg ? "" : "none";
  };

  const setVideoStructuredData = (video) => {
    const id = toVideoId(video);
    if (!id) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title || "Latest video",
      description: (video.description || "").replace(/\s+/g, " ").trim().slice(0, 280),
      thumbnailUrl: [video.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`],
      uploadDate: video.pubDate || new Date().toISOString(),
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      contentUrl: video.link || `https://www.youtube.com/watch?v=${id}`,
    };

    let el = document.getElementById("js-video-schema");
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = "js-video-schema";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
  };

  const renderArchive = (items) => {
    if (!archive) return;
    archive.innerHTML = "";

    items.forEach((item) => {
      const id = toVideoId(item);
      if (!id) return;

      const a = document.createElement("a");
      a.className = "archive-item";
      a.href = item.link || `https://www.youtube.com/watch?v=${id}`;
      a.target = "_blank";
      a.rel = "noreferrer";

      const thumb = document.createElement("div");
      thumb.className = "thumb";
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = item.title ? `Thumbnail: ${item.title}` : "Video thumbnail";
      img.src = item.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      thumb.appendChild(img);

      const info = document.createElement("div");
      const h = document.createElement("h3");
      h.textContent = item.title || "Video";
      const p = document.createElement("p");
      const date = fmtDate(item.pubDate);
      p.textContent = date ? `Published ${date}` : "Open on YouTube";
      info.append(h, p);

      a.append(thumb, info);
      archive.appendChild(a);
    });
  };

  const setLatest = (item) => {
    const id = toVideoId(item);
    if (!id) throw new Error("Could not determine latest video ID.");

    if (latestFrame) {
      latestFrame.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
      latestFrame.title = item.title || "Latest video";
    }
    if (latestTitle) latestTitle.textContent = item.title || "Latest upload";
    if (latestMeta) {
      const date = fmtDate(item.pubDate);
      latestMeta.textContent = date ? `Published ${date} • Auto-updated from YouTube` : "Auto-updated from YouTube";
    }

    setVideoStructuredData(item);
  };

  const main = async () => {
    const hasApi = apiKey && handle;
    const hasChannel = !!channelId;

    if (!hasApi && !hasChannel) {
      setStatus(
        "Add data-youtube-api-key and data-youtube-handle to the media section to enable auto-updates."
      );
      return;
    }

    setStatus("Loading latest video…");

    let items = [];

    // ── Primary: YouTube Data API v3 ──────────────────────────────────────────
    if (hasApi) {
      try {
        items = await ytApiItems(apiKey, handle);
        if (!items.length) throw new Error("API returned no videos.");
      } catch (apiErr) {
        console.warn("YouTube Data API failed, falling back to RSS:", apiErr.message);
        setStatus(`API: ${apiErr.message} — trying fallback…`);
        items = []; // fall through to RSS
      }
    }

    // ── Fallback chain: rss2json → CORS proxy XML ─────────────────────────────
    if (!items.length) {
      const rssId = channelId || "";
      if (!rssId) throw new Error("No channel ID available for RSS fallback.");
      try {
        const url = RSS_TO_JSON(RSS_CHAN(rssId));
        const res = await fetchWithRetry(url, { cache: "no-store" });
        const data = await res.json();
        items = Array.isArray(data?.items) ? data.items : [];
        if (!items.length) throw new Error("Empty rss2json response.");
      } catch (rssErr) {
        console.warn("rss2json failed, trying direct RSS proxy:", rssErr.message);
        try {
          items = await fetchViaProxy(RSS_CHAN(rssId));
        } catch (proxyErr) {
          throw new Error(`All sources failed. RSS: ${rssErr.message}. Proxy: ${proxyErr.message}`);
        }
      }
    }

    if (!items.length) throw new Error("No videos found for this channel.");

    setLatest(items[0]);
    renderArchive(items.slice(1, 9));
    setStatus("");
  };

  main().catch((err) => {
    console.error(err);
    setStatus(`Couldn't load videos: ${err.message}`);
  });
})();

