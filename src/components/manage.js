import React, {useEffect, useState, useCallback} from "react";

const Manage = ({loginStatus}) => {
    if(!loginStatus.admin){
        return (
            <div>
                <h1>You are not an admin</h1>
                <p>Only administrators can access this page...</p>
            </div>
        )
    }
    return (
        <div>
            <h1>Do admin stuff...</h1>
            <p>Grant other users admin privileges, make reviews hidden (in the view playlists area), manage which users are deactivated</p>
            <p>Make sure greater authentication is used for these endpoints (need to check that calling user is an admin)</p>
        </div>
    )
}

export default Manage;