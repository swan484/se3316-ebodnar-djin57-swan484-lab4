import React, {useEffect, useState, useCallback} from "react";
import '../styles/login.css'
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import CreateForm from "./CreateForm";
import ForgotForm from "./ForgotForm";
import MessageBar from "./MessageBar";
import {BASE_URL} from "../conf.js"

const INVALID_LOGIN = "Unverified Account"
const ERROR_CLASS = "error"
const SUCCESS_CLASS = "login-success"
const SUCCESS_MESSAGE = "Successfully logged in"
const PASSWORD_CHANGE_SUCCESS = "Password changed successfully"
const CREATE_ACCOUNT_SUCCESS = "Account created successfully"

const Login = ({updateParentLoginStatus}) => {
    const [state, setState] = useState({
        email : '',
        existingPassword: '',
        password: '',
        confirmedPassword: '',
        fullName: '',
        error: '',
        buttonEnabled: true,
        authMode: 0,
        successMessage: '',
        verificationPath: ''
    })
    const navigate = useNavigate();

    useEffect(() => {
        setState({
            ...state,
            successMessage: '',
            error: ''
        })
    }, [state.password, state.email, state.confirmedPassword, state.existingPassword, state.fullName])

    const clearSuccess = () => {
        setState({
            ...state,
            successMessage: ''
        })
    }
    const updateEmail = (e) => {
        setState({
            ...state,
            email: e
        })
    }
    const updatePassword = (p) => {
        setState({
            ...state,
            password: p
        })
    }
    const updateExistingPassword = (p) => {
        setState({
            ...state,
            existingPassword: p
        })
    }
    const updateConfirmedPassword = (p) => {
        setState({
            ...state,
            confirmedPassword: p
        })
    }
    const updateFullName = (f) => {
        setState({
            ...state,
            fullName: f
        })
    }
    const updateSuccessMessage = (m) => {
        setState({
            ...state,
            successMessage: m
        })
    }

    const clearError = async () => {
        await setState({
            ...state,
            error: ''
        })
    }
    const writeErroMessage = async (e) => {
        await setState({
            ...state,
            error: e
        })
    }

    const updateError = async (err) => {
        if(err){
            await writeErroMessage(err)
        }
        else{
            await clearError()
        }
    }
    const toggleButtonEnabled = (val) => {
        setState({
            ...state,
            buttonEnabled: val
        })
    }
    const updateLoggedInStatus = (val) => {
        updateParentLoginStatus(val)
    }
    const updatePageStatus = (val) => {
        setState({
            ...state,
            authMode: val,
            successMessage: '',
            error: ''
        })
    }

    useEffect(() => {
        console.log(`Button enabled? ${state.buttonEnabled}`)
    }, [state.buttonEnabled])

    const submitLogin = async () => {
        setState({
            ...state,
            buttonEnabled: false,
            successMessage: ''
        })

        const payload = {
            email: state.email,
            password: state.password
        }

        await fetch(`${BASE_URL}/api/user/information`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(async (a) => {
            if(a.status === 202){
                const text = await a.text()
                await setState({
                    ...state,
                    verificationPath: text,
                    error: INVALID_LOGIN,
                    successMessage: '',
                    buttonEnabled: true
                })
                return;
            }
            else if(a.status !== 200){
                throw new Error(a.statusText)
            }

            return a.json()
        })
        .then((a) => {
            if(!a){
                return;
            }
            else if(a.deactivated){
                navigate("/deactivated")
            }
            else{
                localStorage.setItem('token', a.token)
                updateLoggedInStatus({
                    verified: a.verified,
                    deactivated: a.deactivated, 
                    admin: a.admin
                })
                updateSuccessMessage(SUCCESS_MESSAGE)
            }
        })
        .catch(async (err) => {
            console.log(err.message)
            setState({
                ...state,
                error: err.message,
                successMessage: '',
                buttonEnabled: true
            })
        })
    }
    const submitChange = async () => {
        if(state.password !== state.confirmedPassword){
            return;
        }
        await setState({
            ...state,
            buttonEnabled: false,
            successMessage: ''
        })
        const payload = {
            email: state.email,
            password: state.existingPassword,
            newPassword: state.password
        }
        await fetch(`${BASE_URL}/api/user`, {
            method: "PUT",
            headers: new Headers({ 
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(payload),
          })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            setState({
                ...state,
                successMessage: PASSWORD_CHANGE_SUCCESS,
                error: '',
                buttonEnabled: true
            })
        })
        .catch((a) => {
            setState({
                ...state,
                successMessage: '',
                error: a.message,
                buttonEnabled: true
            })
        })
    }
    const createAccount = async () => {
        if(state.password !== state.confirmedPassword){
            return;
        }
        await setState({
            ...state,
            buttonEnabled: false,
            successMessage: ''
        })
        const payload = {
            email: state.email,
            password: state.password,
            fullName: state.fullName
        }
        await fetch(`${BASE_URL}/api/user`, {
            method: "POST",
            headers: new Headers({ 
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(payload),
          })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }

            return a.text()
        }).then((result) => {
            setState({
                ...state,
                verificationPath: result,
                successMessage: CREATE_ACCOUNT_SUCCESS,
                buttonEnabled: true,
                error: ''
            })
        })
        .catch(async (a) => {
            setState({
                ...state,
                successMessage: '',
                error: a.message,
                buttonEnabled: true
            })
        })
    }

    const verifyAccount = () => {
        navigate(`/verify?id=${state.verificationPath}`)
    }
    
    if(state.authMode === 1){
        return (
            <div className="login">
                <h1>Sign Up</h1>
                <p onClick={() => updatePageStatus(0)} className='login-link'>Log in</p>
                <p onClick={() => updatePageStatus(2)} className='login-link'>Change password</p>
                <CreateForm updateParentEmail={updateEmail} updateParentPassword={updatePassword}
                    updateParentConfirmedPassword={updateConfirmedPassword} updateParentFullName={updateFullName} />
                {state.successMessage.length > 0 && state.error.length === 0 && <div>
                    <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />
                    {state.verificationPath.length > 0 && <p onClick={verifyAccount} className='underline-p'>Verify account</p>}
                </div>}
                {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
                <button disabled={!state.buttonEnabled} onClick={() => createAccount()} className="submit-button">
                    Submit
                </button>
            </div>
        )
    }
    else if(state.authMode === 2){
        return (
            <div className="login">
                <h1>Change Password</h1>
                <p onClick={() => updatePageStatus(0)} className='login-link'>Log in</p>
                <p onClick={() => updatePageStatus(1)} className='login-link'>Sign Up</p>
                <ForgotForm updateParentEmail={updateEmail} updateParentPassword={updatePassword}
                    updateParentConfirmedPassword={updateConfirmedPassword} updateParentExistingPassword={updateExistingPassword} />
                {state.successMessage.length > 0 && state.error.length === 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
                {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
                <button disabled={!state.buttonEnabled} onClick={() => submitChange()} className="submit-button">
                    Submit
                </button>
            </div>
        )
    }
    return (
        <div className="login">
            <h1>Log In</h1>
            <p onClick={() => updatePageStatus(1)} className='login-link'>Sign Up</p>
            <p onClick={() => updatePageStatus(2)} className='login-link'>Change password</p>
            <LoginForm updateParentEmail={updateEmail} updateParentPassword={updatePassword} />
            {state.successMessage.length > 0 && state.error.length === 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
            {state.error.length > 0 && <div> 
                <MessageBar message={state.error} cName={ERROR_CLASS} />
                {state.verificationPath.length > 0 && <div className='subtext'>
                    <p>Your account has not been verified</p>
                    <p onClick={verifyAccount} className='underline-p'>Verify account</p>
                </div>}
            </div>}
            <button disabled={!state.buttonEnabled} onClick={() => submitLogin()} className="submit-button">
                Submit
            </button>
        </div>
    )
}

export default Login;