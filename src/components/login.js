import React, {useEffect, useState} from "react";
import './styles/login.css'

const PASSWORD_MISMATCH = "Passwords do not match!"
const EMAIL_REGEX = /[a-zA-Z0-9.-_]{1,}@[a-zA-Z0-9.-]{1,}[.]{1}[a-zA-Z0-9]{1,}/
const EMAIL_FORMAT = "Email is not valid"
const INVALID_LOGIN = "Incorrect username or password"
const CLEAR_PASSWORD_TIME = 2000

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

const LoginForm = ({updateParentEmail, updateParentPassword}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

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

    return (
        <div className="form">
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
        </div>
    )
}

const CreateForm = ({updateParentEmail, updateParentPassword, updateParentFullName, updateParentConfirmedPassword}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [confirmedPassword, setConfirmedPassword] = useState('')

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
    
    return (
        <div className="form">
            <FormRow updateInput={updateFullName} inputType='text' inputTitle={'Full Name'} />
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <FormRow updateInput={updateConfirmedPassword} inputType='password' inputTitle={'Confirm Password'} />
        </div>
    )
}

const ForgotForm = ({updateParentEmail, updateParentPassword, updateParentConfirmedPassword, updateParentExistingPassword}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmedPassword, setConfirmedPassword] = useState('')
    const [existingPassword, setExistingPassword] = useState('')

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
    
    return (
        <div className="form">
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updateExistingPassword} inputType='password' inputTitle={'Current Password'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'New Password'} />
            <FormRow updateInput={updateConfirmedPassword} inputType='password' inputTitle={'Confirm New Password'} />
        </div>
    )
}

const ErrorBar = ({errorMessage}) => {
    if(errorMessage.length === 0){
        return (
            <>
            </>
        )
    }
    return (
        <div className="error">
            {errorMessage}
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
        userLoginStatus: 0
    })

    useEffect(() => {
        updateParentLoginStatus(state.userLoginStatus)
    }, [state.userLoginStatus])

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
    const updateAuthMode = (m) => {
        setState({
            ...state,
            authMode: m
        })
    }

    useEffect(() => {
        updateError()
    }, [state.password, state.email, state.confirmedPassword])

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
        else if(state.authMode != 0 && state.password.length > 0 && state.confirmedPassword.length > 0 && (state.password != state.confirmedPassword)){
            writeErroMessage(PASSWORD_MISMATCH)
        }
        else if(state.email.length === 0 || EMAIL_REGEX.test(state.email)) {
            clearError()
        }
        else if(!EMAIL_REGEX.test(state.email)){
            writeErroMessage(EMAIL_FORMAT)
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
    const submitSearch = () => {
        if(state.error.length > 0) return;
        toggleButtonEnabled(false)
        fetch(`http://localhost:3001/api/user/${state.email}`)
            .then((a) => {
                return a.json()
            })
            .then((a) => {
                toggleButtonEnabled(true)
                if(!(a.email === state.email && a.password === state.password)){
                    updateError(INVALID_LOGIN)
                }
                else{
                    updateLoggedInStatus(1)
                }
            })
            .catch(() => {
                toggleButtonEnabled(true)
                updateError(INVALID_LOGIN)
            })
    }
    
    if(state.authMode === 1){
        return (
            <div className="login">
                <h1>Sign Up</h1>
                <p onClick={() => updateAuthMode(0)} className='login-link'>Log in</p>
                <p onClick={() => updateAuthMode(2)} className='login-link'>Change password</p>
                <CreateForm updateParentEmail={updateEmail} updateParentPassword={updatePassword}
                    updateParentConfirmedPassword={updateConfirmedPassword} updateParentFullName={updateFullName}/>
                <ErrorBar errorMessage={state.error} />
                <button disabled={!state.buttonEnabled} onClick={() => submitSearch()}>
                    Submit
                </button>
            </div>
        )
    }
    else if(state.authMode === 2){
        return (
            <div className="login">
                <h1>Change Password</h1>
                <p onClick={() => updateAuthMode(0)} className='login-link'>Log in</p>
                <p onClick={() => updateAuthMode(1)} className='login-link'>Sign Up</p>
                <ForgotForm updateParentEmail={updateEmail} updateParentPassword={updatePassword}
                    updateParentConfirmedPassword={updateConfirmedPassword} updateParentExistingPassword={updateExistingPassword}/>
                <ErrorBar errorMessage={state.error} />
                <button disabled={!state.buttonEnabled} onClick={() => submitSearch()}>
                    Submit
                </button>
            </div>
        )
    }
    return (
        <div className="login">
            <h1>Log In</h1>
            <p onClick={() => updateAuthMode(1)} className='login-link'>Sign Up</p>
            <p onClick={() => updateAuthMode(2)} className='login-link'>Change password</p>
            <LoginForm updateParentEmail={updateEmail} updateParentPassword={updatePassword} />
            <ErrorBar errorMessage={state.error} />
            <button disabled={!state.buttonEnabled} onClick={() => submitSearch()}>
                Submit
            </button>
        </div>
    )
}

export default Login;