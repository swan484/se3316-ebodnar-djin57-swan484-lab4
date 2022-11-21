import React, {useEffect, useState, useCallback} from "react";
import '../styles/login.css'
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import CreateForm from "./CreateForm";
import ForgotForm from "./ForgotForm";
import MessageBar from "./MessageBar";

const INVALID_LOGIN = "Incorrect username or password"
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
        successMessage: ''
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

    const clearError = () => {
        setState({
            ...state,
            error: ''
        })
    }
    const writeErroMessage = (e) => {
        setState({
            ...state,
            error: e
        })
    }

    const updateError = (err) => {
        if(err){
            writeErroMessage(err)
        }
        else{
            clearError()
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
    const submitLogin = () => {
        console.log(state)
        toggleButtonEnabled(false)
        clearSuccess()
        fetch(`http://localhost:3001/api/user/${state.email}`)
        .then((a) => {
            return a.json()
        })
        .then((a) => {
            toggleButtonEnabled(true)
            if(a.deactivated){
                navigate("/deactivated")
            }
            if(!(a.email === state.email && a.password === state.password)){
                updateError(INVALID_LOGIN)
            }
            else{
                updateLoggedInStatus(a)
                updateSuccessMessage(SUCCESS_MESSAGE)
            }
        })
        .catch(() => {
            toggleButtonEnabled(true)
            updateError(INVALID_LOGIN)
        })
    }
    const submitChange = () => {
        if(state.password !== state.confirmedPassword){
            return;
        }
        console.log(state)
        toggleButtonEnabled(false)
        clearSuccess()
        const payload = {
            email: state.email,
            password: state.existingPassword,
            newPassword: state.password
        }
        fetch(`http://localhost:3001/api/user`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            updateSuccessMessage(PASSWORD_CHANGE_SUCCESS)
        })
        .catch((a) => {
            updateError(a.message)
        })
        toggleButtonEnabled(true)
    }
    const createAccount = () => {
        if(state.password !== state.confirmedPassword){
            return;
        }
        console.log(state)
        toggleButtonEnabled(false)
        clearSuccess()
        const payload = {
            email: state.email,
            password: state.password,
            fullName: state.fullName,
            verified: false
        }
        fetch(`http://localhost:3001/api/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            updateSuccessMessage(CREATE_ACCOUNT_SUCCESS)
        })
        .catch((a) => {
            updateError(a.message)
        })
        toggleButtonEnabled(true)
    }
    
    if(state.authMode === 1){
        return (
            <div className="login">
                <h1>Sign Up</h1>
                <p onClick={() => updatePageStatus(0)} className='login-link'>Log in</p>
                <p onClick={() => updatePageStatus(2)} className='login-link'>Change password</p>
                <CreateForm updateParentEmail={updateEmail} updateParentPassword={updatePassword}
                    updateParentConfirmedPassword={updateConfirmedPassword} updateParentFullName={updateFullName} />
                {state.successMessage.length > 0 && state.error.length === 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
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
            {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
            <button disabled={!state.buttonEnabled} onClick={() => submitLogin()} className="submit-button">
                Submit
            </button>
        </div>
    )
}

export default Login;