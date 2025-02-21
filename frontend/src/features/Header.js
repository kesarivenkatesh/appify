import React from "react";
import { Laugh } from "lucide-react"; // Note: Capitalized 'Laugh'
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <div className="header">
            <div className="logo flex items-center gap-2">
                <Laugh size={32} color="#7C3AED" />
                <h1 style={{ color: "#7C3AED" }}>Happify</h1>
            </div>
            
            <div className="btn flex gap-4">
                <button type="button"><Link to="/Login" color="#fff">Login
                </Link></button>
                <button type="button"><Link to="/Register" color="#fff">SignUp</Link></button>
            </div>
        </div>
    );
}

export default Header;