import { Laugh } from "lucide-react";

const Header = () => {
    return (
        <div className="header">
            <div className="logo flex items-center gap-2">
                <Laugh size={32} color="#7C3AED" />
                <h1 style={{ color: "#7C3AED" }}>Happify</h1>
            </div>
        </div>
    );
}

export default Header;