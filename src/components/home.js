import React from "react";
import Login from "./login";
import "./styles/home.css"

const Home = () => {
    return (
        <div className='home-block'>
            <h1>
                Welcome to APP NAME
            </h1>
            <p>
                Features of this app include:
            </p>
            <ul className='about'>
                <li>Feature 1...</li>
                <li>Feature 2...</li>
            </ul>
            <Login />
        </div>
    )
}

export default Home;