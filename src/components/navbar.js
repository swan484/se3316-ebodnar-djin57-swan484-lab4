import React from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import './styles/navbar.css';

const Navbar = () => {
    return(
        <nav>
            <ul>
                <li>
                    <Link to='/' class='link'>Home</Link>
                </li>
                <li>
                    <Link to='/login' class='link'>Login</Link>
                </li>
            </ul>
        </nav>
    )
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("HI");
})

export default Navbar;