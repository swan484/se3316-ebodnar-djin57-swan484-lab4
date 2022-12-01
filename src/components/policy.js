import React, {useEffect, useState, useCallback, useReducer} from "react";
import './styles/manage.css'
import './styles/policy.css'

const UNKNOWN = "Unknown"
const YES = "Yes"
const NO = "No"

const Policy = ({loginStatus}) => {
    const [state, setState] = useState({
        policyFields: [],
        buttonEnabled: false,
    })

    /*
    useEffect(() => {
        loadData()
    }, [])
    

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
    */

    // Default page for non-admins
    if(!loginStatus.admin){
        return (
            <div>
                <h1>You are not an admin</h1>
                <p>Please contact your administrator for help</p>
            </div>
        )
    }
    // Admin view
    return (
        <div>
            <div className="admin-form">
                <h1>Create privacy policy</h1>
                <label className="admin-label">What information is collected</label>
                <textarea id="zero" className="admin-input"></textarea>
                <label className="admin-label">Justification for collection</label>
                <input id="one" className="admin-input"></input>
                <label className="admin-label">How information is used</label>
                <input id="two" className="admin-input"></input>
                <label className="admin-label">Who has access to information</label>
                <input id="three" className="admin-input"></input>
                <label className="admin-label">What happens in event of takeover of dissolution</label>
                <input id="four" className="admin-input"></input>
            </div>
            <div>
                <button>Preview</button>
                <button>Update</button>
            </div>
            <div className="preview">
                <h1>Preview</h1>
                <h2>What information is collected</h2>
                <p></p>
                <h2>Justification for collection</h2>
                <p></p>
                <h2>How information is used</h2>
                <p></p>
                <h2>Who has access to information</h2>
                <p></p>
                <h2>What happens in event of takeover of dissolution</h2>
                <p></p>
            </div>
            
        </div>
    )
}

export default Policy;