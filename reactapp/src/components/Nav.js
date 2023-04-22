import Logo from './logo512.png';
import { HiUser, HiSearch, HiLogout, HiBookmark, HiTemplate, HiLogin, HiCursorClick } from "react-icons/hi";
import { RiAddCircleFill } from "react-icons/ri";
import { Link, useLocation } from 'react-router-dom';
;
const Nav = ({ user, onLogOut, loading }) => {
    const { pathname } = useLocation();

    return (
        <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
            <Link className="navbar-brand" to="/"><img id="nav-logo" src={Logo} alt="VarTemplate Logo" /><span className="text-padding vertical-text">VarTemplate</span></Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
            {(user) ? (<><ul className="navbar-nav ms-auto">
                <li className="nav-item">
                <Link className="nav-link" to="/"><HiSearch /><span className="text-padding">Search</span></Link>
                </li>
                <li className="nav-item">
                <Link className="nav-link" to="/create"><RiAddCircleFill /><span className="text-padding">Create</span></Link>
                </li>
                <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <HiUser />
                    <span className="text-padding">{user}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                    <li><Link className="dropdown-item" to="/your-templates"><HiTemplate /><span className="text-padding">Your templates</span></Link></li>
                    <li><Link className="dropdown-item" to="/saved-templates"><HiBookmark /><span className="text-padding">Saved templates</span></Link></li>
                    <li><Link className="dropdown-item" to="/" onClick={onLogOut}><HiLogout /><span className="text-padding">Log Out</span></Link></li>
                </ul>
                </li>
            </ul></>) : 
            (<><ul className="navbar-nav ms-auto">
            {(pathname !== '/signup') &&
            (<li className="nav-item">
            <Link className="nav-link" to="/signup"><HiCursorClick /><span className="text-padding">Sign Up</span></Link>
            </li>)}
            {(pathname !== '/login') &&
            (<li className="nav-item">
            <Link className="nav-link" to="/login"><HiLogin /><span className="text-padding">Log In</span></Link>
            </li>)}
            </ul></>)}
            </div>
        </div>
        </nav>
    );
}

export default Nav;