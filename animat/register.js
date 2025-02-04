document.getElementById("registerButton").addEventListener("click", async () => {
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (data.success) {
            alert("Registration successful! You can now log in.");
            // Redirect to login page or perform other actions
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration.");
    }
});
