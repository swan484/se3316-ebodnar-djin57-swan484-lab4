import React, { startTransition, useEffect, useState } from "react";
import Playlist from "./playlist";
import './styles/reviewPlaylist.css'

const PLAYLISTS_LIMIT = 1000;

const ReviewPlaylist = ({userLoggedInStatus}) => {
    const [state, setState] = useState({
        searchResults: [],
        buttonEnabled: false
    })

    if(!(userLoggedInStatus && Object.keys(userLoggedInStatus).length > 0)){
        return (
            <div className="unauthorized">
                <h1>Unavailable</h1>
                <div>You need to be logged in to access this...</div>
            </div>
        )
    }
    return (
        <div className="parent-div">
            <Playlist reviewContent={true} displayLimit={PLAYLISTS_LIMIT}/>
        </div>
    )
}

export default ReviewPlaylist;