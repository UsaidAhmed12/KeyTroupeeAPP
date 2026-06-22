// Empty base = same origin: the page and the API are served from one place.
const API_BASE = "";

window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const firstName = document.getElementById("FirstName").value.trim();
        const lastName = document.getElementById("LastName").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        if (!firstName || !lastName || !email || !password) {
            alert("Please fill out every field.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `${firstName} ${lastName}`,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Registration failed.");
                return;
            }

            alert("Registered successfully!");
            window.location.href = "../tempelate/Login.html";
        } catch (err) {
            alert("Could not reach the server. Please make sure the app started correctly.");
        }
    });
});
