import React, {useEffect, useState, useCallback, useReducer} from "react";
import './styles/manage.css'

const UNKNOWN = "Unknown"
const NONE = "None"
const NO = "No"

const Manage = ({loginStatus}) => {
    const [state, setState] = useState({
        userResults: [],
        errorMessage: '',
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
                userResults: a
            })
            console.log("Finished query")
        })
    }

    const loadData = async () => {
        console.log("Loading users")
        await searchUsers()
        console.log("Complete")
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
            {state.userResults.length > 0 && 
                <div>
                    <li>
                        <p className="username">USER</p>
                        <p className="email">EMAIL</p>
                        <p className="verified-status">VERIFIED?</p>
                        <p className="admin-status">ADMIN</p>
                        <p className="deactivated-status">DEACTIVATE</p>
                    </li>
                </div>
            }
            {state.userResults.map((user) => (
                <div className="table-row table-row-2" key={user.fullName + user.email} >
                        <li>
                            {console.log(user)}
                            <p className="username">{user.fullName || NONE}</p>
                            <p className="email">{user.email || UNKNOWN}</p>
                            <p className="verified-status">{user.verified || NO}</p>
                            <p className="admin-status">{user.admin || NONE}</p>
                            <p className="deactivated-status">{user.deactivated || NO}</p>
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