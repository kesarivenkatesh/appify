import { useNavigate } from 'react-router';
import { useState } from 'react';
import '../Login/Login.css'
import UserService from '../../services/UserService'

function Register() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        username: "",
        firstname: "",
        lastname: "",
        password: "",
    });

    const [errors] = useState({
        username: "",
        firstname: "",
        lastname: "",
        password: "",
    });

    const redirect = () => {
        navigate("/login");
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
            case "firstname":
                errors.firstname = value.length > 15 ? "First Name must be less than 15 characters" : "";
                if(errors.firstname==="") {
                    errors.firstname = value.length === 0 ? "First Name cannot be empty" : "";
                }
                break;
            case "lastname":
                errors.lastname = value.length > 10 ? "Last Name Max must be less than 10 characters" : "";
                if(errors.firstname==="") {
                    errors.lastname = value.length === 0 ? "Last Name cannot be empty" : "";
                }
                break;
            default:
                break;
        }

        setUser({ ...user, [name]: value });
    };

    
    const register = () => {
        const body = {
            "firstname": user.firstname,
            "lastname": user.lastname
        }
        new UserService().register(body, user.username, user.password)
            .then(response => {
                console.log(response, response.data.message);
                if(response.status === 201 && response.data.message === "User registered successfully") {
                    navigate("/login");
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
                <h1 className="title">Register</h1>
                <div className="register-form" id="registerForm">
                    <input type="text" placeholder="Username" id="username" name='username' onChange={(e) => handleChange(e)} />
                    {errors.username.length > 0 && (<span className="error">{errors.username}</span>)}
                    <input type="password" placeholder="Password" id="password" name='password' onChange={(e) => handleChange(e)} />
                    {errors.password.length > 0 && (<span className="error">{errors.password}</span>)}
                    <input type="text" placeholder="First Name" id="firstname" name='firstname' onChange={(e) => handleChange(e)} />
                    {errors.firstname.length > 0 && (<span className="error">{errors.firstname}</span>)}
                    <input type="text" placeholder="Last Name" id="lastname" name='lastname' onChange={(e) => handleChange(e)} />
                    {errors.lastname.length > 0 && (<span className="error">{errors.lastname}</span>)}
                    <button id="register" onClick={register}>Register</button>
                </div>
                <p>Already have an account? <button onClick={redirect}>Login here</button></p>
            </div>
        </div>
    );
}

export default Register;