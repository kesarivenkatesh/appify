document.getElementById("loginButton").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (data.success) {
            alert("Login successful!");
            // Redirect to another page or perform other actions
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login.");
    }
});