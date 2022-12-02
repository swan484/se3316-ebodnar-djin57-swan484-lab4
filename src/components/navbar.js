import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import './styles/navbar.css';

const Navbar = ({userLoggedInStatus}) => {
    return(
        <nav>
            <ul className={"navbar " + (userLoggedInStatus.admin === true ? "admin" : "")}>
                <li>
                    <NavLink to='/' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Home</NavLink>
                </li>
                <li>
                    <NavLink to='/search' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Search</NavLink>
                </li>
                <li>
                    <NavLink to='/playlists' className={({ isActive }) => "link" + (isActive ? " active" : "")}>View Playlists</NavLink>
                </li>
                {userLoggedInStatus && Object.keys(userLoggedInStatus).length > 0 && !userLoggedInStatus.admin && <li>
                    <NavLink to='/create' className={({ isActive }) => "link" + (isActive ? " active" : "")}>My Playlists</NavLink>
                </li>}
                {userLoggedInStatus && Object.keys(userLoggedInStatus).length > 0 && !userLoggedInStatus.admin && <li>
                    <NavLink to='/review' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Rate Playlists</NavLink>
                </li>}
                {userLoggedInStatus.admin === true && <li>
                    <NavLink to='/manage' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Manage Users</NavLink>
                </li>}
                {userLoggedInStatus.admin === true && <li>
                    <NavLink to='/policy' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Create Policies</NavLink>
                </li>}
                <li>
                    <NavLink to='/viewPolicy' className={({ isActive }) => "link" + (isActive ? " active" : "")}>Site Information</NavLink>
                </li>
                {userLoggedInStatus.admin === true && <li className="right-display">Admin Console</li>}
            </ul>
        </nav>
    )
}

export default Navbar;