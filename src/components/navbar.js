import React, { useEffect } from "react";
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
                {userLoggedInStatus && Object.keys(userLoggedInStatus).length > 0 && <li>
                    <NavLink to='/create' className={({ isActive }) => "link" + (isActive ? " active" : "")}>My Playlists</NavLink>
                </li>}
                {userLoggedInStatus && Object.keys(userLoggedInStatus).length > 0 && <li>
                    <NavLink to='/review' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Rate Playlists</NavLink>
                </li>}
            </ul>
        </nav>
    )
}

export default Navbar;