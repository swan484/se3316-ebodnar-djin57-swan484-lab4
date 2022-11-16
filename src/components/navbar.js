import React from "react";
import { NavLink } from "react-router-dom";
import './styles/navbar.css';

const Navbar = ({userLoggedInStatus}) => {
    return(
        <nav>
            <ul className="navbar">
                <li>
                    <NavLink to='/' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Home</NavLink>
                </li>
                <li>
                    <NavLink to='/search' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Search</NavLink>
                </li>
                <li>
                    <NavLink to='/playlists' className={({ isActive }) => "link" + (isActive ? " active" : "")}>View Playlists</NavLink>
                </li>
                {userLoggedInStatus > 0 && <li>
                    <NavLink to='/create' className={({ isActive }) => "link" + (isActive ? " active" : "")}>My Playlists</NavLink>
                </li>}
            </ul>
        </nav>
    )
}

export default Navbar;