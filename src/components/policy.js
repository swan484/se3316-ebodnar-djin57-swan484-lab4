import React, {useState} from "react";
import './styles/manage.css'
import './styles/policy.css'
import {BASE_URL} from "./conf"

const Policy = ({loginStatus}) => {
    const [state, setState] = useState({
        policyFields: [],
        buttonEnabled: true,
    })

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
        const zero = document.getElementById("zero").value
        const one = document.getElementById("one").value
        const two = document.getElementById("two").value
        const three = document.getElementById("three").value
        const four = document.getElementById("four").value
        console.log("Updating policy")
        const message = {
            content: [zero, one, two, three, four]
        }
        await fetch(`${BASE_URL}/api/admin/policy`, {
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

    // Update DMCA Policy
    const updateDMCAPolicy = async (e) => {
        // Update DMCA Policy
        setState({
            ...state,
            buttonEnabled: false
        })
        const DMCAPolicy = document.getElementById("dmca-policy").value
        console.log("Updating dmca policy", DMCAPolicy)
        const message = {
            policy: DMCAPolicy
        }
        await fetch(`${BASE_URL}/api/admin/dmca-policy`, {
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

    // Update AUP Policy
    const updateAUPPolicy = async (e) => {
        // Update AUP Policy
        setState({
            ...state,
            buttonEnabled: false
        })
        const AUPPolicy = document.getElementById("aup-policy").value
        console.log("Updating aup policy")
        const message = {
            policy: AUPPolicy
        }
        await fetch(`${BASE_URL}/api/admin/aup-policy`, {
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
            <div>
                <h1>Documentation</h1>
                <p>The DMCA notice and takedown policy workflow is as follows:</p>
                <p>1. A user (e.g. a copyright holder) files a DMCA notice for reviews using the flag button.</p>
                <p>2. SongSpot forwards the DMCA notice to the content owner, and the review is hidden from the public.</p>
                <p>3. The content owner can respond with a counter-notice on their ratings dashboard.</p>
                <p>4. SongSpot then forwards the counter-notice to the user.</p>
                <p>5. If the user does not respond within 14 days, admins can unflag the comment, and it will be visible again.</p>
            </div>
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
            
            <div className="admin-form">
                <h1>Create DMCA policy</h1>
                <label className="admin-label">Update the DMCA Policy:</label>
                <textarea id="dmca-policy" className="admin-input"></textarea>
            </div>
            <div>
                <button className="admin-button" onClick={(e) => updateDMCAPolicy(e)}>Update</button>
                {!state.buttonEnabled && <p className='loading-msg'>Updating policies...</p>}
            </div>

            <div className="admin-form">
                <h1>Create AUP policy</h1>
                <label className="admin-label">Update the AUP Policy:</label>
                <textarea id="aup-policy" className="admin-input"></textarea>
            </div>
            <div>
                <button className="admin-button" onClick={(e) => updateAUPPolicy(e)}>Update</button>
                {!state.buttonEnabled && <p className='loading-msg'>Updating AUP policies...</p>}
            </div>
            
        </div>
    )
}

export default Policy;