import { Laugh } from "lucide-react";
import { useNavigate } from 'react-router';
import { useState, useEffect, useContext } from 'react';
import UserService from "../../services/UserService";
import { AuthContext } from "../AuthContext/AuthContext";

const Header = () => {
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useContext(AuthContext);
    // const [isLoggedIn, setIsLoggedIn] = useState(false);

  
    //   // Check authentication status on component mount
    //   useEffect(() => {
          
    //       setIsLoggedIn(getCookie("valid"));
    //   }, []);
  
    //   function getCookie(name) {
    //       var dc = document.cookie;
    //       var prefix = name + "=";
    //       var begin = dc.indexOf("; " + prefix);
    //       if (begin == -1) {
    //           begin = dc.indexOf(prefix);
    //           if (begin != 0) return null;
    //       }
    //       else
    //       {
    //           begin += 2;
    //           var end = document.cookie.indexOf(";", begin);
    //           if (end == -1) {
    //           end = dc.length;
    //           }
    //       }
    //       // because unescape has been deprecated, replaced with decodeURI
    //       //return unescape(dc.substring(begin + prefix.length, end));
    //       return decodeURI(dc.substring(begin + prefix.length, end));
    //   }

    const handleLogout = async () => {
        try {
            await new UserService().logout();
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="header">
            <div className="logo flex items-center gap-2">
                
                <Laugh size={32} color="#7C3AED" />
                <h1 style={{ color: "#7C3AED" }}>Happify</h1>
            </div>    
                {isLoggedIn ? (
                    <button type="button" class="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors duration-200 mr-4" onClick={handleLogout} >Logout</button>
                ) : (
                    <button type="button" class="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors duration-200 mr-4" color="#7C3AED" onClick={() => navigate("/login")} >Login</button>
                )}
            
        </div>
    );
}

export default Header;