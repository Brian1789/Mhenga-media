(() => {
    "use strict";

    const RENDER_URL = "https://mhenga-media.onrender.com";
    const API = window.location.hostname === "localhost" ? "/api" : RENDER_URL + "/api";
    const TOKEN_KEY = "mhenga_token";

    const $ = (sel) => document.querySelector(sel);

    /* If already logged in, go straight to dashboard */
    if (localStorage.getItem(TOKEN_KEY)) {
        window.location.href = "dashboard.html";
        return;          // stop executing the rest
    }

    const loginForm = $("#js-login-form");
    const loginError = $("#js-login-error");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        loginError.textContent = "";

        const email = $("#login-user").value.trim();
        const password = $("#login-pass").value;

        if (!email || !password) {
            loginError.textContent = "Please fill in both fields.";
            return;
        }

        try {
            loginError.textContent = "Signing in\u2026";

            const res = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                loginError.textContent = data.message || "Invalid email or password.";
                return;
            }

            localStorage.setItem(TOKEN_KEY, data.token);
            window.location.href = "dashboard.html";
        } catch (err) {
            loginError.textContent = "Network error — is the server running?";
        }
    });

    /* Toggle password visibility */
    $("#js-pass-toggle").addEventListener("click", () => {
        const input = $("#login-pass");
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        $("#js-pass-toggle").setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
})();
