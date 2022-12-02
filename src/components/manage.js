import React, {useEffect, useState, useCallback, useReducer} from "react";
import './styles/manage.css'
import './styles/songlist.css'

const UNKNOWN = "Unknown"
const YES = "Yes"
const NO = "No"

const Manage = ({loginStatus}) => {
    const [state, setState] = useState({
        userResults: [],
        errorMessage: '',
        buttonEnabled: false,
        invokeInProgress: false,
    })

    useEffect(() => {
        loadData()
    }, [])

    const searchUsers = async () => {
        console.log("Querying users")

        await fetch(`http://localhost:3001/api/admin/users`, {
            headers: new Headers({ 
                "Authorization": localStorage.getItem('token') 
            }),
        })
        .then((a) => {
            return a.json()
        })
        .then(async (a) => {
            await setState({
                ...state,
                userResults: a,
                buttonEnabled: true,
            })
            console.log("Finished query")
        })
    }

    const loadData = async () => {
        console.log("Loading users")
        await searchUsers()
        console.log("Complete")
    }

    const updateStatus = async (e, user, toChange) => {
        console.log("Updating (PUT) ",  toChange, " for ", user.email)
        setState({
            ...state,
            buttonEnabled: false
        })
        let query = {}

        if (toChange === "admin"){
            query = {
                email: user.email,
                admin: !user.admin,
                deactivated: user.deactivated,
            }
        } else if (toChange === "deactivate"){ // When deactivating/reactivating a user, also revoke admin status
            query = {
                email: user.email,
                admin: false,
                deactivated: !user.deactivated,
            }
        }
        

        await fetch(`http://localhost:3001/api/admin/users/${toChange}`, {
            method: "PUT",
            headers: new Headers({ 
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token') 
            }),
            body: JSON.stringify(query),
        })
        .then((a) => {
            console.log(a)
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            console.log("Finished PUT")
        })
        .then(() => {
            loadData()
        })
        .catch(() => {
            setState({
                ...state,
                buttonEnabled: true
            })
        })
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
            {!state.buttonEnabled && <p className='loading-msg'>Updating user...</p>}
            
            {state.userResults.length > 0 && 
                <div className="heading-row table-row table-header-2">
                    <li>
                        <p className="user-name">USER</p>
                        <p className="email">EMAIL</p>
                        <p className="verified-status">VERIFIED</p>
                        <p className="admin-status">ADMIN</p>
                        <p className="deactivated-status">DEACTIVATE</p>
                    </li>
                </div>
            }
            {state.userResults.map((user) => (
                <div className="table-row table-row-2" key={user.fullName + user.email} >
                        <li>
                            <p className="user-name">{user.fullName}</p>
                            <p className="email">{user.email || UNKNOWN}</p>
                            <p className="verified-status">{user.verified ? YES : NO}</p>
                            <button className="admin-status toggle-user" onClick={(e) => updateStatus(e, user, "admin")}>{user.admin ? YES : NO}</button>
                            <button className="deactivated-status toggle-user" onClick={(e) => updateStatus(e, user, "deactivate")}>{user.deactivated ? YES : NO}</button>
                        </li>
                </div>
            ))}
                
 



            <h1>Do admin stuff...</h1>
            <p>Grant other users admin privileges, make reviews hidden (in the view playlists area), manage which users are deactivated</p>
            <p>Make sure greater authentication is used for these endpoints (need to check that calling user is an admin)</p>
        </div>
    )
}

export default Manage;