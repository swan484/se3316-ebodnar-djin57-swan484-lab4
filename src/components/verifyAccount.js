import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/verifyAccount.css"

const VerifyAccount = ({userDetails}) => {
    const navigate = useNavigate()
    const [verified, setVerified] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        console.log("Loaded verification")
        submitVerification()
    }, [])

    const navigateToLogin = () => {
        navigate("/")
    }

    const submitVerification = () => {
        const payload = {
            id: window.location.search.split('id=')[1]
        }
        fetch(`http://localhost:3001/api/user/decrypt`, {
            method: "POST",
            headers: new Headers({ 
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token') 
            }),
            body: JSON.stringify(payload),
          })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            setVerified(true)
            console.log("Successfully verified")
        })
        .catch((a) => {
            console.log(`Got error ${a.message}`)
            setError(a.message)
        })
    }

    return(
        <div>
            <h1>Verify account</h1>
            {!verified && <div>
                <p className="verifying">Verifying account</p>
            </div>}
            {verified && <div>
                <p className="verified">Thank You!</p>
                <p className="sub">
                    Your account has been verified. <br/>
                    Please <span className="login-nav sub" onClick={navigateToLogin}>Login</span>
                </p>
            </div>}
            {error.length > 0 && <div>
                <p className="failure">Sorry</p>
                <p className="sub">
                    Your account could not be verified - please copy this link and try again later.
                </p>
            </div>}
        </div>
    )
}

export default VerifyAccount;