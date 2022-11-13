import React, {useEffect, useState} from "react";
import Login from "./login";
import "./styles/home.css"

const Home = ({updateUserLoginStatus}) => {
    const [state, setState] = useState({
        userLoginStatus: 0
    })

    useEffect(() => {
        console.log(`User is logged in: ${state.userLoginStatus}`)
        updateUserLoginStatus(state.userLoginStatus)
    }, [state.userLoginStatus])

    const updateLoginStatus = (val) => {
        setState({
            ...state,
            userLoginStatus: val
        })
    }

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
            <hr/>
            <Login updateParentLoginStatus={updateLoginStatus}/>
        </div>
    )
}

export default Home;