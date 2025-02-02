document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginButton");

    // Slide-in animation
    setTimeout(() => {
        loginForm.style.animation = "slideIn 1s forwards";
    }, 2000);

    // Handle login
    loginButton.addEventListener("click", async function () {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        alert(result.message);
    });
});
