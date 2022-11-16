import React, {useEffect, useState, useCallback} from "react";
import './styles/login.css'
import { useNavigate } from "react-router-dom";

const PASSWORD_MISMATCH = "Passwords do not match!"
const EMAIL_REGEX = /[a-zA-Z0-9.-_]{1,}@[a-zA-Z0-9.-]{1,}[.]{1}[a-zA-Z0-9]{1,}/
const EMAIL_FORMAT = "Email is not valid"
const INVALID_LOGIN = "Incorrect username or password"
const ERROR_CLASS = "error"
const SUCCESS_CLASS = "login-success"
const SUCCESS_MESSAGE = "Successfully logged in"
const ENTER_EMAIL = "Please enter an email"
const ENTER_PASSWORD = "Please enter a password"
const ENTER_EXISTING_PASSWORD = "Please enter your existing password"
const ENTER_CONFIRM_PASSWORD = "Please confirm your password"
const ENTER_FULL_NAME = "Please enter your full name"
const INVALID_PASSWORD_CHANGE = "Sorry, your password could not be changed"

const FormRow = ({updateInput, inputType, inputTitle}) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        updateInput(value)
    }, [value]);

    const updateValue = (val) => {
        setValue(val.target.value)
    }
    
    return (
        <div className="pad-top">
            <label>{inputTitle}</label>
            <input type={inputType} onChange={(e) => updateValue(e)} />
        </div>
    )
}

const LoginForm = ({updateParentEmail, updateParentPassword, clearParentMessage}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        clearParentMessage()
        console.log("Clearing from LoginForm")
    }, [])
    useEffect(() => {
        updateError()
    }, [email, password])
    useEffect(() => {
        updateParentEmail(email)
    }, [email])
    useEffect(() => {
        updateParentPassword(password)
    }, [password])

    const updateEmail = (e) => {
        setEmail(e)
    }
    const updatePassword = (p) => {
        setPassword(p)
    }
    const updateError = (e) => {
        if(e){
            setError(e)
        }
        else if(email.length === 0){
            setError(ENTER_EMAIL)
        }
        else if(!EMAIL_REGEX.test(email)){
            setError(EMAIL_FORMAT)
        }
        else if(password.length === 0){
            setError(ENTER_PASSWORD)
        }
        else{
            clearError()
        }
    }
    const clearError = () => {
        setError('')
    }

    return (
        <div className="form">
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <MessageBar message={error} cName={ERROR_CLASS} />
        </div>
    )
}

const CreateForm = ({updateParentEmail, updateParentPassword, updateParentFullName, updateParentConfirmedPassword, clearParentMessage}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [confirmedPassword, setConfirmedPassword] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        clearParentMessage()
        console.log("Clearing from CreateForm")
    }, [])
    useEffect(() => {
        updateError()
    }, [email, password, fullName, confirmedPassword])
    useEffect(() => {
        updateParentEmail(email)
    }, [email])
    useEffect(() => {
        updateParentPassword(password)
    }, [password])
    useEffect(() => {
        updateParentFullName(fullName)
    }, [fullName])
    useEffect(() => {
        updateParentConfirmedPassword(confirmedPassword)
    }, [confirmedPassword])

    const updateEmail = (e) => {
        setEmail(e)
    }
    const updatePassword = (p) => {
        setPassword(p)
    }
    const updateFullName = (f) => {
        setFullName(f)
    }
    const updateConfirmedPassword = (p) => {
        setConfirmedPassword(p)
    }
    const updateError = (e) => {
        if(e){
            setError(e)
        }
        else if(fullName.length === 0){
            setError(ENTER_FULL_NAME)
        }
        else if(email.length === 0){
            setError(ENTER_EMAIL)
        }
        else if(!EMAIL_REGEX.test(email)){
            setError(EMAIL_FORMAT)
        }
        else if(password.length === 0){
            setError(ENTER_PASSWORD)
        }
        else if(confirmedPassword.length === 0){
            setError(ENTER_CONFIRM_PASSWORD)
        }
        else if(password !== confirmedPassword){
            setError(PASSWORD_MISMATCH)
        }
        else{
            clearError()
        }
    }
    const clearError = () => {
        setError('')
    }
    
    return (
        <div className="form">
            <FormRow updateInput={updateFullName} inputType='text' inputTitle={'Full Name'} />
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <FormRow updateInput={updateConfirmedPassword} inputType='password' inputTitle={'Confirm Password'} />
            <MessageBar message={error} cName={ERROR_CLASS} />
        </div>
    )
}

const ForgotForm = ({updateParentEmail, updateParentPassword, updateParentConfirmedPassword, updateParentExistingPassword, clearParentMessage}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmedPassword, setConfirmedPassword] = useState('')
    const [existingPassword, setExistingPassword] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        clearParentMessage()
        console.log("Clearing from ForgotForm")
    }, [])
    useEffect(() => {
        updateError()
    }, [email, password, confirmedPassword, existingPassword])
    useEffect(() => {
        updateParentEmail(email)
    }, [email])
    useEffect(() => {
        updateParentPassword(password)
    }, [password])
    useEffect(() => {
        updateParentConfirmedPassword(confirmedPassword)
    }, [confirmedPassword])
    useEffect(() => {
        updateParentExistingPassword(existingPassword)
    }, [existingPassword])

    const updateEmail = (e) => {
        setEmail(e)
    }
    const updatePassword = (p) => {
        setPassword(p)
    }
    const updateConfirmedPassword = (p) => {
        setConfirmedPassword(p)
    }
    const updateExistingPassword = (p) => {
        setExistingPassword(p)
    }
    const updateError = (e) => {
        if(e){
            setError(e)
        }
        else if(email.length === 0){
            setError(ENTER_EMAIL)
        }
        else if(!EMAIL_REGEX.test(email)){
            setError(EMAIL_FORMAT)
        }
        else if(existingPassword.length === 0){
            setError(ENTER_EXISTING_PASSWORD)
        }
        else if(password.length === 0){
            setError(ENTER_PASSWORD)
        }
        else if(confirmedPassword.length === 0){
            setError(ENTER_CONFIRM_PASSWORD)
        }
        else if(password !== confirmedPassword){
            setError(PASSWORD_MISMATCH)
        }
        else{
            clearError()
        }
    }
    const clearError = () => {
        setError('')
    }
    
    return (
        <div className="form">
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updateExistingPassword} inputType='password' inputTitle={'Current Password'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'New Password'} />
            <FormRow updateInput={updateConfirmedPassword} inputType='password' inputTitle={'Confirm New Password'} />
            <MessageBar message={error} cName={ERROR_CLASS} />
        </div>
    )
}

const MessageBar = ({message, cName}) => {
    if(message.length === 0){
        return (
            <>
            </>
        )
    }
    return (
        <div className={cName}>
            {message}
        </div>
    )
}

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
        userLoginStatus: 0,
        successMessage: ''
    })
    const navigate = useNavigate();

    useEffect(() => {
        updateError()
    }, [state.password, state.email, state.confirmedPassword])
    useEffect(() => {
        updateParentLoginStatus(state.userLoginStatus);
    }, [state.userLoginStatus])

    const clearSuccess = () => {
        console.log("Clearing success in parent")
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
        setState({
            ...state,
            userLoginStatus: val
        })
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
        if(state.error.length > 0) return;
        console.log(state)
        toggleButtonEnabled(false)
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
                updateLoggedInStatus(1)
                updateSuccessMessage(SUCCESS_MESSAGE)
            }
        })
        .catch(() => {
            toggleButtonEnabled(true)
            updateError(INVALID_LOGIN)
        })
    }
    const submitChange = () => {
        if(state.error.length > 0) return;
        console.log(state)
        toggleButtonEnabled(false)
        const payload = {
            email: state.email,
            password: state.password,
            newPassword: state.newPassword
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
            return a.json()
        })
        .then(() => {
            toggleButtonEnabled(true)
            console.log("Success!")
        })
        .catch((a) => {
            toggleButtonEnabled(true)
            updateError(a.message)
        })
    }
    
    if(state.authMode === 1){
        return (
            <div className="login">
                <h1>Sign Up</h1>
                <p onClick={() => updatePageStatus(0)} className='login-link'>Log in</p>
                <p onClick={() => updatePageStatus(2)} className='login-link'>Change password</p>
                <CreateForm updateParentEmail={updateEmail} updateParentPassword={updatePassword} clearParentMessage={clearSuccess}
                    updateParentConfirmedPassword={updateConfirmedPassword} updateParentFullName={updateFullName} />
                {state.successMessage.length > 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
                {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
                <button disabled={!state.buttonEnabled} onClick={() => submitLogin()}>
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
                <ForgotForm updateParentEmail={updateEmail} updateParentPassword={updatePassword} clearParentMessage={clearSuccess}
                    updateParentConfirmedPassword={updateConfirmedPassword} updateParentExistingPassword={updateExistingPassword} />
                {state.successMessage.length > 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
                {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
                <button disabled={!state.buttonEnabled} onClick={() => submitChange()}>
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
            <LoginForm updateParentEmail={updateEmail} updateParentPassword={updatePassword} clearParentMessage={clearSuccess} />
            {state.successMessage.length > 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
            {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
            <button disabled={!state.buttonEnabled} onClick={() => submitLogin()}>
                Submit
            </button>
        </div>
    )
}

export default Login;