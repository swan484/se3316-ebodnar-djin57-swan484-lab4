import React, {useEffect, useState} from "react";
import { useLoaderData } from "react-router-dom";
import './styles/manage.css'
import './styles/policy.css'


const ViewPolicy = () => {
    const [state, setState] = useState({
        policyFields: ["", "", "", "", ""]
    })

    useEffect(() => {
        loadPage()
    }, [])

    const loadPage = async () => {
        await loadPolicies()
    }

    const loadPolicies = async () => {
        console.log("Querying policies")

        await fetch(`http://localhost:3001/api/policy`, {
            headers: new Headers({ 
                "Authorization": localStorage.getItem('token') 
            }),
        })
        .then((a) => {
            return a.json()
        })
        .then(async (a) => {
            setState({
                ...state,
                policyFields: a.content,
            })
            console.log("Finished query")
        })
    }


    // Admin view
    return (
        <div>
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

export default ViewPolicy;