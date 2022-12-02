import React, {useEffect, useState, useCallback, useReducer} from "react";
import './styles/manage.css'
import './styles/policy.css'

const UNKNOWN = "Unknown"
const YES = "Yes"
const NO = "No"

const Policy = ({loginStatus}) => {
    const [state, setState] = useState({
        policyFields: [],
        buttonEnabled: true,
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

    const previewPolicy =  async (e) => {
        console.log("Loading preview ...")
        const zero = document.getElementById("zero").value
        const one = document.getElementById("one").value
        const two = document.getElementById("two").value
        const three = document.getElementById("three").value
        const four = document.getElementById("four").value

        setState({
            ...state,
            policyFields: [zero, one, two, three, four]
        })
        console.log(state.policyFields)
        console.log("Preview loaded.")
    }

    // add new record into the policy database
    const updatePolicy = async (e) => {
        setState({
            ...state,
            buttonEnabled: false
        })
        console.log("Updating policy")
        const message = {
            content: state.policyFields
        }
        await fetch(`http://localhost:3001/api/admin/policy`, {
            method: "POST",
            headers: new Headers({ 
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token') 
            }),
            body: JSON.stringify(message),
        })
        .then((a) => {
            console.log(a)
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            setState({
                ...state,
                buttonEnabled: true
            })
            console.log("Finished POST")
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
    // Admin view
    return (
        <div>
            <div className="admin-form">
                <h1>Create privacy policy</h1>
                <label className="admin-label">What information is collected</label>
                <textarea id="zero" className="admin-input"></textarea>
                <label className="admin-label">Justification for collection</label>
                <textarea id="one" className="admin-input"></textarea>
                <label className="admin-label">How information is used</label>
                <textarea id="two" className="admin-input"></textarea>
                <label className="admin-label">Who has access to information</label>
                <textarea id="three" className="admin-input"></textarea>
                <label className="admin-label">What happens in event of takeover of dissolution</label>
                <textarea id="four" className="admin-input"></textarea>
            </div>
            <div>
                <button className="admin-button" onClick={(e) => previewPolicy(e)}>Preview</button>
                <button className="admin-button" onClick={(e) => updatePolicy(e)}>Update</button>
                {!state.buttonEnabled && <p className='loading-msg'>Updating policies...</p>}
            </div>
            {state.policyFields &&
                <div className="preview">
                    {console.log("test: ", state.policyFields)}
                <h1>Preview</h1>
                <h2>What information is collected</h2>
                <p>{state.policyFields[0]}</p>
                <h2>Justification for collection</h2>
                <p>{state.policyFields[1]}</p>
                <h2>How information is used</h2>
                <p>{state.policyFields[2]}</p>
                <h2>Who has access to information</h2>
                <p>{state.policyFields[3]}</p>
                <h2>What happens in event of takeover of dissolution</h2>
                <p>{state.policyFields[4]}</p>
            </div>
            }
            
            
        </div>
    )
}

export default Policy;