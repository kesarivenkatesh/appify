document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const registerButton = document.getElementById("registerButton");

    // Slide-in animation
    setTimeout(() => {
        registerForm.style.animation = "slideIn 1s forwards";
    }, 2000);

    // Handle Registration
    registerButton.addEventListener("click", async function () {
        const username = document.getElementById("regUsername").value;
        const password = document.getElementById("regPassword").value;

        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            alert(result.message);

            if (result.success) {
                window.location.href = "index.html"; // Redirect to login
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to register. Try again.");
        }
    });
});
