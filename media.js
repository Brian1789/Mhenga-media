(() => {
  const root = document.getElementById("js-media-root");
  if (!root) return;

  const channelId =
    root.dataset.youtubeChannel && root.dataset.youtubeChannel !== "CHANNEL_ID"
      ? root.dataset.youtubeChannel
      : "CHANNEL_ID";

  const latestFrame = document.getElementById("js-latest-iframe");
  const latestTitle = document.getElementById("js-latest-title");
  const latestMeta = document.getElementById("js-latest-meta");
  const archive = document.getElementById("js-archive");
  const status = document.getElementById("js-media-status");

  const RSS = (id) => `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`;
  const RSS_TO_JSON = (rssUrl) =>
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

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
    if (channelId === "CHANNEL_ID") {
      setStatus(
        "Set your YouTube Channel ID in the Media page markup (data-youtube-channel) to enable auto-updates."
      );
      return;
    }

    setStatus("Loading latest video…");

    const url = RSS_TO_JSON(RSS(channelId));
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Request failed (${res.status}).`);
    const data = await res.json();

    const items = Array.isArray(data?.items) ? data.items : [];
    if (!items.length) throw new Error("No videos found for this channel.");

    setLatest(items[0]);
    renderArchive(items.slice(1, 9));
    setStatus("");
  };

  main().catch((err) => {
    console.error(err);
    setStatus("Couldn’t load the latest video right now. Please refresh or try again later.");
  });
})();

