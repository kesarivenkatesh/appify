import { useNavigate } from 'react-router';
import './Login.css'
import { useState } from 'react';
import UserService from '../../services/UserService'

function Login() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: "",
        password: ""
    });

    const [errors] = useState({
        username: "",
        password: ""
    });
    const redirect = () => {
        navigate("/register");
    };
    const handleChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case "username":
                errors.username = value.length < 5 ? "Username must be atleast 5 characters" : "";
                break;
            case "password":
                errors.password = value.length < 5 ? "Password must be atleast 5 characters" : "";
                break;
            default:
                break;
        }

        setUser({ ...user, [name]: value });
    };
    const login = () => {
        new UserService().login(user.username, user.password)
            .then(response => {
                console.log(response, response.data.message);
                if(response.status === 200 && response.data.message === "Login successful") {
                    navigate("/dashboard");
                }
            })
            .catch(error => {
                console.error(error);
            });
        
    };
    return (
        <div>
            <div className="video-background">
                <video autoPlay loop muted>
                    <source src="/assets/videos/female-avatar-animation.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="container">
                <h1 className="title">Login</h1>
                <div className="login-form" id="loginForm">
                    <input type="text" placeholder="Username" id="username" name='username' onChange={(e) => handleChange(e)} />
                    {errors.username.length > 0 && (<span className="error">{errors.username}</span>)}
                    <input type="password" placeholder="Password" id="password" name='password' onChange={(e) => handleChange(e)} />
                    {errors.password.length > 0 && (<span className="error">{errors.password}</span>)}
                    <button id="login" onClick={login}>Login</button>
                </div>
                <p>Don't have an account? <button onClick={redirect}>Register here</button></p>
            </div>
        </div>
    );
}

export default Login;