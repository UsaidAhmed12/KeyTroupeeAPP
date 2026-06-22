// Empty base = same origin: the page and the API are served from one place.
const API_BASE = "";

window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed. Please check your email and password.");
                return;
            }

            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("userName", data.name);
            sessionStorage.setItem("userEmail", data.email);
            alert("Login successful!");
            window.location.href = "../tempelate/Profile.html";
        } catch (err) {
            alert("Could not reach the server. Please make sure the app started correctly.");
        }
    });
});
