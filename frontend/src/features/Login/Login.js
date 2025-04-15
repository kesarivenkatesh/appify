import { useNavigate } from 'react-router';
import { useState, useContext } from 'react';
import './Login.css';
import UserService from '../../services/UserService';
import { AuthContext } from "../AuthContext/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({
        username: "",
        password: ""
    });

    const [errors, setErrors] = useState({
        username: "",
        password: ""
    });

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            username: "",
            password: ""
        };

        if (credentials.username.length < 5) {
            newErrors.username = "Username must be at least 5 characters";
            isValid = false;
        }

        if (credentials.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await new UserService().login(
                credentials.username, 
                credentials.password
            );

            if (response.status === 200 && response.data.message === "Login successful") {
                login();
                navigate("/moodcheck");
            }
        } catch (error) {
            console.error("Login failed:", error);
            setErrors(prev => ({
                ...prev,
                server: "Invalid credentials or server error"
            }));
        }
    };

    const redirectToRegister = () => {
        navigate("/register");
    };

    const onLogin = () => {
        new UserService().login(credentials.username, credentials.password)
            .then(response => {
                if(response.status === 200 && response.data.message === "Login successful") {
                    navigate("/moodcheck");
                }
            })
            .catch(error => {
                console.error(error);
            });
        
    };

    return (
        <div className="app-container">
            <div className="card">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            className={errors.username ? 'error' : ''}
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {errors.server && <div className="error-message server-error">{errors.server}</div>}

                    <button type="submit" onClick={onLogin}>Login</button>
                </form>

                <div className="login-link">
                    Don't have an account? <button onClick={redirectToRegister}>Register here</button>
                </div>
            </div>
        </div>
    );
}

export default Login;