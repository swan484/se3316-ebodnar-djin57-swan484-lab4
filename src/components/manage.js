import React, {useEffect, useState, useCallback} from "react";
import './styles/manage.css'

const Manage = ({loginStatus}) => {
    const [search, setSearch] = useState('');

    const updateSearch = (s) => {
        setSearch(s.target.value)
    }

    // Default page for non-admins
    if(!loginStatus.admin){
        return (
            <div>
                <h1>You are not an admin</h1>
                <p>Please contact your administrator for help</p>
            </div>
        )
    }
    return (
        <div className="admin-form">
            <label className="admin-label">Search by user</label>
            <input className="admin-input" type="text"/>
            <button className="admin-button">Search</button>
            <h1>Do admin stuff...</h1>
            <p>Grant other users admin privileges, make reviews hidden (in the view playlists area), manage which users are deactivated</p>
            <p>Make sure greater authentication is used for these endpoints (need to check that calling user is an admin)</p>
        </div>
    )
}

export default Manage;