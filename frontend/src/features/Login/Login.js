import { useNavigate } from 'react-router';
import './Login.css'

function Login() {
    const navigate = useNavigate();
    const register = () => {
        navigate("/register");
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
                    <input type="text" placeholder="Username" id="username" />
                    <input type="password" placeholder="Password" id="password" />
                    <button id="loginButton">Login</button>
                </div>
                <p>Don't have an account? <button onClick={register}>Register here</button></p>
            </div>
        </div>
    );
}

export default Login;