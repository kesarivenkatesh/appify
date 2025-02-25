import { Laugh } from "lucide-react";
import { useNavigate } from 'react-router';
import UserService from "../../services/UserService";

const Header = () => {
    const navigate = useNavigate();
    return (
        <div className="header">
            <div className="logo flex items-center gap-2">
                <Laugh size={32} color="#7C3AED" />
                <h1 style={{ color: "#7C3AED" }}>Happify</h1>
                <button onClick={()=>{new UserService().logout(); navigate("/login")}}>Logout</button>
            </div>
        </div>
    );
}

export default Header;