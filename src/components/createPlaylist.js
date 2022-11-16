import React, { useEffect } from "react";
import './styles/createPlaylist.css'

const CreatePlaylist = ({userLoggedInStatus}) => {
    if(!userLoggedInStatus){
        return (
            <div className="unauthorized">
                <h1>Unavailable</h1>
                <div>You need to be logged in to access this...</div>
            </div>
        )
    }
    return (
        <div>
            <h1>My Playlists</h1>
        </div>
    )
}

export default CreatePlaylist;