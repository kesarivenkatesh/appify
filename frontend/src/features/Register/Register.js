import { useNavigate } from 'react-router';
import '../Login/Login.css'

function Register() {
    const navigate = useNavigate();
    const login = () => {
        navigate("/login");
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
                <h1 className="title">Register</h1>
                <div className="register-form" id="registerForm">
                    <input type="text" placeholder="Username" id="regUsername" />
                    <input type="password" placeholder="Password" id="regPassword" />
                    <button id="registerButton">Register</button>
                </div>
                <p>Already have an account? <button onClick={login}>Login here</button></p>
            </div>
        </div>
    );
}

export default Register;