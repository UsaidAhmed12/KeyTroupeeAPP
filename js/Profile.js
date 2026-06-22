window.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("isLoggedIn") !== "true") {
        alert("Please log in first to access your Profile page.");
        window.location.href = "../tempelate/Login.html";
        return;
    }

    const username = sessionStorage.getItem("userName");
    const usernameElement = document.getElementById("username");
    const logoutButton = document.getElementById("logoutBtn");
    const logoutLink = document.getElementById("profileLogoutLink");

    if (username && usernameElement) {
        usernameElement.textContent = username;
    }

    function logout(event) {
        if (event) {
            event.preventDefault();
        }

        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("userEmail");
        window.location.href = "../tempelate/Login.html";
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }

    if (logoutLink) {
        logoutLink.addEventListener("click", logout);
    }
});
