import React, {useEffect, useState} from "react";
import { useLoaderData } from "react-router-dom";
import './styles/manage.css'
import './styles/policy.css'


const ViewPolicy = () => {
    const [state, setState] = useState({
        policyFields: ["", "", "", "", ""],
        dmcaPolicy: "",
        aupPolicy: ""
    })

    useEffect(() => {
        loadPage()
    }, [])

    const loadPage = async () => {
        await loadPolicies()
    }

    const loadPolicies = async () => {
        console.log("Querying policies")

        let privacy = []
        let dmca = ""
        let aup = ""

        // Query privacy policies
        await fetch(`http://localhost:3001/api/policy`, {
            headers: new Headers({ 
                "Authorization": localStorage.getItem('token') 
            }),
        })
        .then((a) => {
            return a.json()
        })
        .then(async (a) => {
            privacy = a.content
            console.log("Finished query")
        })

        // Query DMCA Policies
        await fetch(`http://localhost:3001/api/dmca-policy`, {
            headers: new Headers({ 
                "Authorization": localStorage.getItem('token') 
            }),
        })
        .then((a) => {
            return a.json()
        })
        .then(async (a) => {
            dmca = a.policy
            console.log("Finished query")
        })

        // Query AUP Policy
        await fetch(`http://localhost:3001/api/aup-policy`, {
            headers: new Headers({ 
                "Authorization": localStorage.getItem('token') 
            }),
        })
        .then((a) => {
            return a.json()
        })
        .then(async (a) => {
            aup = a.policy
            console.log("Finished query")
        })

        await setState({
            ...state,
            policyFields: privacy,
            dmcaPolicy: dmca,
            aupPolicy: aup,
        })
    }


    // Admin view
    return (
        <div>
            {state.policyFields &&
                <div className="preview">
                    {console.log("test: ", state.policyFields)}
                <h1>Privacy Policy</h1>
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

                <h1>DMCA Notice & Takedown Policy</h1>
                <p>{state.dmcaPolicy}</p>

                <h1>Acceptable Use Policy</h1>
                <p>{state.aupPolicy}</p>
            </div>
            }
        </div>
    )
}

export default ViewPolicy;