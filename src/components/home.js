import React, {useEffect, useState} from "react";
import Login from "./login/login";
import "./styles/home.css"

const Home = ({updateUserLoginStatus, loginStatus}) => {
    const [state, setState] = useState({
        userLoginStatus: loginStatus,
        featureMode: {}
    })

    useEffect(() => {
        console.log("Updating login status")
        console.log(state.userLoginStatus)
        updateUserLoginStatus(state.userLoginStatus)
    }, [state.userLoginStatus])

    const updateLoginStatus = (val) => {
        setState({
            ...state,
            userLoginStatus: val
        })
    }
    const toggleFeatureMode = (num) => {
        if(num in state.featureMode){
            delete state.featureMode[num];
            setState({
                ...state,
            })
        }
        else{
            for(const st in state.featureMode){
                delete state.featureMode[st]
            }
            state.featureMode[num] = 1
            setState({
                ...state
            })
        }
    }

    return (
        <div className='home-block parent-div'>
            <h1>
                Welcome to APP NAME
            </h1>
            <div className="pad-bottom-container">            
                <p>
                    Features of this app include:
                </p>
                <p onClick={() => toggleFeatureMode(0)} className="toggle"> Logging In,</p>
                <p onClick={() => toggleFeatureMode(1)} className="toggle"> Searching Tracks,</p>
                <p onClick={() => toggleFeatureMode(2)} className="toggle"> Creating Playlists,</p>
                <p onClick={() => toggleFeatureMode(3)} className="toggle"> Rating Playlists,</p>
                {0 in state.featureMode && <div><br/><p className="about">Log into your account by email, create a new account, or change the password for your existing account.
                    Also supports functionalities of disabled accounts and adminstrative accounts. Logging in provides you with more site privileges.</p></div>}
                {1 in state.featureMode && <div><br/><p className="about">Search tracks by artist, genre, and title. Search on multiple criteria by attaching all the 
                    criteria in a comma separated list in order to view tracks that match all criteria.</p></div>}
                {2 in state.featureMode && <div><br/><p className="about">Logged in users can create up to 20 playlists with their favourite tracks. Users who aren't
                    logged in can favourite up to 10 public playlists.</p></div>}
                {3 in state.featureMode && <div><br/><p className="about">Logged in users can review other playlists, leaving a rating and comment
                    for public playlists (including their own).</p></div>}
            </div>
            <hr/>
            <Login updateParentLoginStatus={updateLoginStatus}/>
        </div>
    )
}

export default Home;