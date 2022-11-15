import React from "react";
import { NavLink } from "react-router-dom";
import './styles/navbar.css';

const Navbar = () => {
    return(
        <nav>
            <ul>
                <li>
                    <NavLink to='/' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Home</NavLink>
                </li>
                <li>
                    <NavLink to='/search' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Search</NavLink>
                </li>
                <li>
                    <NavLink to='/playlists' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Playlists</NavLink>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar;