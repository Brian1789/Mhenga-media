(() => {
    "use strict";

    /* ============================
       CONFIG
       ============================ */
    const RENDER_URL = "https://mhenga-media.onrender.com";
    const API = window.location.hostname === "localhost" ? "/api" : RENDER_URL + "/api";
    const TOKEN_KEY = "mhenga_token";

    /* ============================
       HELPERS
       ============================ */
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const esc = (str) => {
        if (str == null) return "";
        const el = document.createElement("span");
        el.textContent = String(str);
        return el.innerHTML;
    };

    const fmtDate = (d) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    /* ============================
       TOKEN
       ============================ */
    function getToken() { return localStorage.getItem(TOKEN_KEY); }
    function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = "login.html";
    }

    /* ============================
       AUTH GATE — redirect if no token
       ============================ */
    if (!getToken()) { window.location.href = "login.html"; }

    /* ============================
       API FETCH WRAPPER
       ============================ */
    async function api(path, opts = {}) {
        const token = getToken();
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        if (opts.body && !(opts.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
            opts.body = JSON.stringify(opts.body);
        }

        const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });

        if (res.status === 401) {
            logout();
            return;
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Request failed");
        return data;
    }

    /* ============================
       TOAST
       ============================ */
    let toastContainer;
    function toast(msg, type = "success") {
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.className = "toast-container";
            document.body.appendChild(toastContainer);
        }
        const t = document.createElement("div");
        t.className = `toast toast--${type}`;
        t.textContent = msg;
        toastContainer.appendChild(t);
        setTimeout(() => t.remove(), 3200);
    }

    /* ============================
       UI REFERENCES
       ============================ */
    const sidebarToggle = $("#js-sidebar-toggle");
    const sidebar = $("#js-sidebar");
    const pageTitle = $("#js-page-title");

    /* ============================
       LOGOUT
       ============================ */
    $("#js-logout").addEventListener("click", () => {
        logout();
    });

    /* ============================
       SIDEBAR / NAV
       ============================ */
    sidebarToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

    document.addEventListener("click", (e) => {
        if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
            sidebar.classList.remove("open");
        }
    });

    $$(".sidebar-link[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
            const page = btn.dataset.page;
            $$(".sidebar-link[data-page]").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            $$(".page").forEach(p => p.classList.remove("active"));
            const target = $(`#page-${page}`);
            if (target) target.classList.add("active");
            pageTitle.textContent = btn.textContent.trim();
            sidebar.classList.remove("open");
        });
    });

    /* ============================
       DASHBOARD
       ============================ */
    let cachedBookings = [];
    let cachedPortfolio = [];
    let cachedMessages = [];

    async function refreshDashboard() {
        try {
            const [bookingStats, msgStats, portfolio] = await Promise.all([
                api("/bookings/stats"),
                api("/messages/stats"),
                api("/content/portfolio"),
            ]);

            $("#stat-bookings").textContent = bookingStats.total;
            $("#stat-pending").textContent = bookingStats.pending;
            $("#stat-portfolio").textContent = portfolio.length;
            $("#stat-messages").textContent = msgStats.unread;

            const bookings = await api("/bookings");
            cachedBookings = bookings;
            const recent = bookings.slice(0, 5);
            const tbody = $("#js-bookings-table");

            if (!recent.length) {
                tbody.innerHTML = '<tr class="table-empty"><td colspan="5">No bookings yet</td></tr>';
                return;
            }

            tbody.innerHTML = recent.map(b => `
        <tr>
          <td>${esc(b.client)}</td>
          <td>${esc(b.service)}</td>
          <td>${fmtDate(b.date)}</td>
          <td><span class="badge badge--${b.status.toLowerCase()}">${esc(b.status)}</span></td>
          <td>
            <button class="action-btn" onclick="adminApp.editBooking('${b._id}')" title="Edit">&#9998;</button>
          </td>
        </tr>
      `).join("");
        } catch (err) {
            console.error("Dashboard refresh failed:", err);
        }
    }

    /* ============================
       BOOKINGS CRUD
       ============================ */
    const bookingModal = $("#js-booking-modal");
    const bookingForm = $("#js-booking-form");

    async function renderAllBookings() {
        try {
            const bookings = await api("/bookings");
            cachedBookings = bookings;
            const tbody = $("#js-all-bookings");

            if (!bookings.length) {
                tbody.innerHTML = '<tr class="table-empty"><td colspan="6">No bookings yet</td></tr>';
                return;
            }

            tbody.innerHTML = bookings.map(b => `
        <tr>
          <td>${esc(b.client)}</td>
          <td>${esc(b.email)}</td>
          <td>${esc(b.service)}</td>
          <td>${fmtDate(b.date)}</td>
          <td><span class="badge badge--${b.status.toLowerCase()}">${esc(b.status)}</span></td>
          <td>
            <button class="action-btn" onclick="adminApp.editBooking('${b._id}')" title="Edit">&#9998;</button>
            <button class="action-btn action-btn--del" onclick="adminApp.deleteBooking('${b._id}')" title="Delete">&#10005;</button>
          </td>
        </tr>
      `).join("");
        } catch (err) {
            console.error("Render bookings failed:", err);
        }
    }

    function openBookingModal(data = null) {
        $("#js-booking-modal-title").textContent = data ? "Edit Booking" : "New Booking";
        $("#booking-id").value = data ? data._id : "";
        $("#booking-client").value = data ? data.client : "";
        $("#booking-email").value = data ? data.email : "";
        $("#booking-service").value = data ? data.service : "Photoshoot";
        $("#booking-date").value = data && data.date ? data.date.slice(0, 10) : "";
        $("#booking-status").value = data ? data.status : "Pending";
        $("#booking-notes").value = data ? data.notes : "";
        bookingModal.hidden = false;
    }

    function closeBookingModal() {
        bookingModal.hidden = true;
        bookingForm.reset();
    }

    $("#js-add-booking").addEventListener("click", () => openBookingModal());
    $("#js-booking-modal-close").addEventListener("click", closeBookingModal);
    $("#js-booking-cancel").addEventListener("click", closeBookingModal);

    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = $("#booking-id").value;
        const body = {
            client: $("#booking-client").value.trim(),
            email: $("#booking-email").value.trim(),
            service: $("#booking-service").value,
            date: $("#booking-date").value,
            status: $("#booking-status").value,
            notes: $("#booking-notes").value.trim(),
        };

        try {
            if (id) {
                await api(`/bookings/${id}`, { method: "PUT", body });
                toast("Booking updated");
            } else {
                await api("/bookings", { method: "POST", body });
                toast("Booking added");
            }
            closeBookingModal();
            await Promise.all([renderAllBookings(), refreshDashboard()]);
        } catch (err) {
            toast(err.message, "error");
        }
    });

    function editBooking(id) {
        const b = cachedBookings.find(x => x._id === id);
        if (b) openBookingModal(b);
    }

    async function deleteBooking(id) {
        if (!confirm("Delete this booking?")) return;
        try {
            await api(`/bookings/${id}`, { method: "DELETE" });
            toast("Booking deleted", "error");
            await Promise.all([renderAllBookings(), refreshDashboard()]);
        } catch (err) {
            toast(err.message, "error");
        }
    }

    /* ============================
       PORTFOLIO CRUD
       ============================ */
    const portfolioModal = $("#js-portfolio-modal");
    const portfolioForm = $("#js-portfolio-form");

    async function renderPortfolio() {
        try {
            const items = await api("/content/portfolio");
            cachedPortfolio = items;
            const grid = $("#js-portfolio-grid");

            if (!items.length) {
                grid.innerHTML = '<p class="empty-msg">No portfolio items yet</p>';
                return;
            }

            grid.innerHTML = items.map(p => {
                let imgSrc = p.imageUrl || "";
                if (imgSrc.startsWith("/uploads")) imgSrc = API.replace("/api", "") + imgSrc;
                return `
          <div class="pf-card">
            ${imgSrc ? `<img class="pf-card-img" src="${esc(imgSrc)}" alt="${esc(p.title)}" />` : '<div class="pf-card-img"></div>'}
            <div class="pf-card-body">
              <h4>${esc(p.title)}</h4>
              <p>${esc(p.subtitle)}</p>
              <div class="pf-card-actions">
                <button class="action-btn" onclick="adminApp.editPortfolio('${p._id}')" title="Edit">&#9998;</button>
                <button class="action-btn action-btn--del" onclick="adminApp.deletePortfolio('${p._id}')" title="Delete">&#10005;</button>
              </div>
            </div>
          </div>`;
            }).join("");
        } catch (err) {
            console.error("Render portfolio failed:", err);
        }
    }

    function openPortfolioModal(data = null) {
        $("#js-portfolio-modal-title").textContent = data ? "Edit Portfolio Item" : "Add Portfolio Item";
        $("#portfolio-id").value = data ? data._id : "";
        $("#portfolio-title").value = data ? data.title : "";
        $("#portfolio-category").value = data ? data.subtitle : "Photoshoot";
        $("#portfolio-desc").value = data ? data.description : "";
        $("#portfolio-image").value = data ? data.imageUrl : "";
        portfolioModal.hidden = false;
    }

    function closePortfolioModal() {
        portfolioModal.hidden = true;
        portfolioForm.reset();
    }

    $("#js-add-portfolio").addEventListener("click", () => openPortfolioModal());
    $("#js-portfolio-modal-close").addEventListener("click", closePortfolioModal);
    $("#js-portfolio-cancel").addEventListener("click", closePortfolioModal);

    portfolioForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = $("#portfolio-id").value;
        const body = {
            sectionName: "portfolio",
            title: $("#portfolio-title").value.trim(),
            subtitle: $("#portfolio-category").value,
            description: $("#portfolio-desc").value.trim(),
            imageUrl: $("#portfolio-image").value.trim(),
        };

        try {
            if (id) {
                await api(`/content/${id}`, { method: "PUT", body });
                toast("Portfolio item updated");
            } else {
                await api("/content", { method: "POST", body });
                toast("Portfolio item added");
            }
            closePortfolioModal();
            await Promise.all([renderPortfolio(), refreshDashboard()]);
        } catch (err) {
            toast(err.message, "error");
        }
    });

    function editPortfolio(id) {
        const p = cachedPortfolio.find(x => x._id === id);
        if (p) openPortfolioModal(p);
    }

    async function deletePortfolio(id) {
        if (!confirm("Delete this portfolio item?")) return;
        try {
            await api(`/content/${id}`, { method: "DELETE" });
            toast("Portfolio item deleted", "error");
            await Promise.all([renderPortfolio(), refreshDashboard()]);
        } catch (err) {
            toast(err.message, "error");
        }
    }

    /* ============================
       MESSAGES
       ============================ */
    async function renderMessages() {
        try {
            const messages = await api("/messages");
            cachedMessages = messages;
            const tbody = $("#js-messages-table");

            if (!messages.length) {
                tbody.innerHTML = '<tr class="table-empty"><td colspan="5">No messages yet</td></tr>';
                return;
            }

            tbody.innerHTML = messages.map(m => `
        <tr style="${m.read ? '' : 'background:rgba(34,211,238,.04)'}">
          <td><strong>${esc(m.from)}</strong></td>
          <td>${esc(m.email)}</td>
          <td>${esc(m.subject)}</td>
          <td>${fmtDate(m.date)}</td>
          <td>
            ${!m.read ? `<button class="action-btn" onclick="adminApp.markRead('${m._id}')" title="Mark read">&#10003;</button>` : ''}
            <button class="action-btn action-btn--del" onclick="adminApp.deleteMessage('${m._id}')" title="Delete">&#10005;</button>
          </td>
        </tr>
      `).join("");
        } catch (err) {
            console.error("Render messages failed:", err);
        }
    }

    async function markRead(id) {
        try {
            await api(`/messages/${id}/read`, { method: "PATCH" });
            await Promise.all([renderMessages(), refreshDashboard()]);
        } catch (err) {
            toast(err.message, "error");
        }
    }

    async function deleteMessage(id) {
        if (!confirm("Delete this message?")) return;
        try {
            await api(`/messages/${id}`, { method: "DELETE" });
            toast("Message deleted", "error");
            await Promise.all([renderMessages(), refreshDashboard()]);
        } catch (err) {
            toast(err.message, "error");
        }
    }

    /* ============================
       SETTINGS
       ============================ */
    function loadSettings() {
        const s = JSON.parse(localStorage.getItem("mhenga_settings") || "{}");
        if (s.siteName) $("#settings-site-name").value = s.siteName;
        if (s.tagline) $("#settings-tagline").value = s.tagline;
        if (s.email) $("#settings-email").value = s.email;
        if (s.phone) $("#settings-phone").value = s.phone;
    }

    $("#js-settings-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        localStorage.setItem("mhenga_settings", JSON.stringify({
            siteName: $("#settings-site-name").value.trim(),
            tagline: $("#settings-tagline").value.trim(),
            email: $("#settings-email").value.trim(),
            phone: $("#settings-phone").value.trim(),
        }));

        const currentPw = $("#settings-current-pw").value;
        const newPw = $("#settings-new-pw").value;
        const confirmPw = $("#settings-confirm-pw").value;

        if (currentPw || newPw || confirmPw) {
            if (!currentPw || !newPw || !confirmPw) {
                toast("Fill all password fields to change password", "error");
                return;
            }
            if (newPw.length < 6) {
                toast("New password must be at least 6 characters", "error");
                return;
            }
            if (newPw !== confirmPw) {
                toast("New passwords don't match", "error");
                return;
            }
            try {
                const data = await api("/auth/change-password", {
                    method: "POST",
                    body: { currentPassword: currentPw, newPassword: newPw },
                });
                setToken(data.token);
                $("#settings-current-pw").value = "";
                $("#settings-new-pw").value = "";
                $("#settings-confirm-pw").value = "";
                toast("Password updated!");
            } catch (err) {
                toast(err.message, "error");
                return;
            }
        }

        toast("Settings saved!");
    });

    /* ============================
       DATA MANAGEMENT
       ============================ */
    $("#js-export-data").addEventListener("click", async () => {
        try {
            const [bookings, portfolio, messages] = await Promise.all([
                api("/bookings"),
                api("/content"),
                api("/messages"),
            ]);
            const data = { bookings, portfolio, messages, settings: JSON.parse(localStorage.getItem("mhenga_settings") || "{}") };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mhenga-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast("Data exported!");
        } catch (err) {
            toast(err.message, "error");
        }
    });

    const importInput = $("#js-import-data");
    if (importInput) {
        importInput.addEventListener("change", () => {
            toast("Import from JSON coming soon — use the API for data management", "error");
            importInput.value = "";
        });
    }

    const clearBtn = $("#js-clear-data");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            toast("Clear all data is disabled — manage records individually", "error");
        });
    }

    /* ============================
       CLOSE MODALS ON ESCAPE
       ============================ */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeBookingModal();
            closePortfolioModal();
        }
    });

    /* ============================
       EXPOSE FOR INLINE HANDLERS
       ============================ */
    window.adminApp = {
        editBooking,
        deleteBooking,
        editPortfolio,
        deletePortfolio,
        markRead,
        deleteMessage,
    };

    /* ============================
       BOOT — load all data
       ============================ */
    Promise.all([refreshDashboard(), renderAllBookings(), renderPortfolio(), renderMessages()])
        .then(() => loadSettings())
        .catch(err => console.error("Boot failed:", err));
})();
