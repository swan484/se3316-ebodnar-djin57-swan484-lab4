import React, {useEffect, useState} from "react";
import './styles/login.css'

const PASSWORD_MISMATCH = "Passwords do not match!"
const EMAIL_REGEX = /[a-zA-Z0-9.-_]{1,}@[a-zA-Z0-9.-]{1,}[.]{1}[a-zA-Z0-9]{1,}/
const EMAIL_FORMAT = "Email is not valid"

const FormRow = ({updateInput, inputType, inputTitle}) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        updateInput(value)
    }, [value]);

    const updateValue = (e) => {
        setValue(e.target.value)
    }
    
    return (
        <div className="pad-top">
            <label>{inputTitle}</label>
            <input type={inputType} onChange={(e) => updateValue(e)} />
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

const LoginForm = ({updateUserLoggedIn}) => {
    const [state, setState] = useState({
        email : '',
        password: '',
        buttonEnabled: false,
        error: ''
    })

    useEffect(() => {
        updateButtonEnabled()
    }, [state.email, state.password])
    useEffect(() => {
        updateError()
    }, [state.email])
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
    const updateError = () => {
        if(state.email.length === 0 || EMAIL_REGEX.test(state.email)) {
            setState({
                ...state,
                error: ''
            })
        }
        else if(!EMAIL_REGEX.test(state.email)){
            setState({
                ...state,
                error: EMAIL_FORMAT
            })
        }
    }
    const updateButtonEnabled = () => {
        if(state.email.length === 0 || state.password.length === 0 || state.error.length > 0){
            setState({
                ...state,
                buttonEnabled: false
            })
        }
        else{
            setState({
                ...state,
                buttonEnabled: true
            })
        }
    }

    return (
        <div className="form">
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <ErrorBar errorMessage={state.error} />
            <button disabled={!state.buttonEnabled} onClick={function() {
                console.log(`${state.email} & ${state.password}`)
            }}>
                Submit
            </button>
        </div>
    )
}

const CreateForm = () => {
    const [state, setState] = useState({
        email : '',
        password: '',
        confirmedPassword: '',
        fullName: '',
        error: '',
        buttonEnabled: false
    })

    useEffect(() => {
        updateButtonEnabled()
    }, [state.email, state.password, state.confirmedPassword, state.fullName, state.error])
    useEffect(() => {
        updateError()
    }, [state.password, state.confirmedPassword, state.email])
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
    const updateError = () => {
        if(state.password.length > 0 && state.confirmedPassword.length > 0 && state.password !== state.confirmedPassword) {
            setState({
                ...state,
                error: PASSWORD_MISMATCH
            })
        }
        else if((state.password === state.confirmedPassword || state.confirmedPassword.length == 0) && (EMAIL_REGEX.test(state.email) || state.email.length === 0)) {
            setState({
                ...state,
                error: ''
            })
        }
        else if(!EMAIL_REGEX.test(state.email)){
            setState({
                ...state,
                error: EMAIL_FORMAT
            })
        }
    }
    const updateButtonEnabled = () => {
        if(state.email.length === 0 || state.password.length === 0 || state.confirmedPassword.length === 0 
            || state.confirmedPassword.length === 0 || state.fullName.length === 0 || state.error.length > 0){
                setState({
                    ...state,
                    buttonEnabled: false
                })
            }
        else{
            setState({
                ...state,
                buttonEnabled: true
            })
        }
    }
    
    return (
        <div className="form">
            <FormRow updateInput={updateFullName} inputType='text' inputTitle={'Full Name'} />
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <FormRow updateInput={updateConfirmedPassword} inputType='password' inputTitle={'Confirm Password'} />
            <ErrorBar errorMessage={state.error} />
            <button disabled={!state.buttonEnabled} onClick={function() {
                console.log(`${state.email} & ${state.password}, ${state.confirmedPassword} & ${state.fullName}`)
            }}>
                Submit
            </button>
        </div>
    )
}

const ForgotForm = () => {
    const [state, setState] = useState({
        email : '',
        existingPassword: '',
        password: '',
        confirmedPassword: '',
        fullName: '',
        error: '',
        buttonEnabled: false
    })

    useEffect(() => {
        updateButtonEnabled()
    }, [state.email, state.existingPassword, state.password, state.confirmedPassword, state.fullName, state.error])
    useEffect(() => {
        updateError()
    }, [state.password, state.confirmedPassword, state.email])
    const updateEmail = (e) => {
        setState({
            ...state,
            email: e
        })
    }
    const updateExistingPassword = (e) => {
        setState({
            ...state,
            existingPassword: e
        })
    }
    const updatePassword = (p) => {
        setState({
            ...state,
            password: p
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
    const updateError = () => {
        if(state.password.length > 0 && state.confirmedPassword.length > 0 && state.password !== state.confirmedPassword) {
            setState({
                ...state,
                error: PASSWORD_MISMATCH
            })
        }
        else if((state.password === state.confirmedPassword || state.confirmedPassword.length == 0) && (state.email.length === 0 || EMAIL_REGEX.test(state.email))) {
            setState({
                ...state,
                error: ''
            })
        }
        else if(!EMAIL_REGEX.test(state.email)){
            setState({
                ...state,
                error: EMAIL_FORMAT
            })
        }
    }
    const updateButtonEnabled = () => {
        if(state.email.length === 0 || state.existingPassword.length === 0 || state.password.length === 0
            || state.confirmedPassword.length === 0 || state.confirmedPassword.length === 0 || state.fullName.length === 0 
            || state.error.length > 0){
                setState({
                    ...state,
                    buttonEnabled: false
                })
            }
        else{
            setState({
                ...state,
                buttonEnabled: true
            })
        }
    }
    
    return (
        <div className="form">
            <FormRow updateInput={updateFullName} inputType='text' inputTitle={'Full Name'} />
            <FormRow updateInput={updateExistingPassword} inputType='password' inputTitle={'Current Password'} />
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <FormRow updateInput={updateConfirmedPassword} inputType='password' inputTitle={'Confirm Password'} />
            <ErrorBar errorMessage={state.error} />
            <button disabled={!state.buttonEnabled} onClick={function() {
                console.log(`${state.email} & ${state.password}, ${state.confirmedPassword} & ${state.fullName}, ${state.existingPassword}`)
            }}>
                Submit
            </button>
        </div>
    )
}

const Login = ({userLoggedIn}) => {
    let [authMode, setAuthMode] = useState(0)

    const changeAuthMode = (newMode) => {
        setAuthMode(authMode = newMode)
    }

    if(authMode === 1){
        return (
            <div className="login">
                <h1>Sign Up</h1>
                <p onClick={() => changeAuthMode(0)} className='login-link'>Log in</p>
                <p onClick={() => changeAuthMode(2)} className='login-link'>Change password</p>
                <CreateForm />
            </div>
        )
    }
    else if(authMode === 2){
        return (
            <div className="login">
                <h1>Change Password</h1>
                <p onClick={() => changeAuthMode(0)} className='login-link'>Log in</p>
                <p onClick={() => changeAuthMode(1)} className='login-link'>Sign Up</p>
                <ForgotForm />
            </div>
        )
    }
    return (
        <div className="login">
            <h1>Log In</h1>
            <p onClick={() => changeAuthMode(1)} className='login-link'>Sign Up</p>
            <p onClick={() => changeAuthMode(2)} className='login-link'>Change password</p>
            <LoginForm />
        </div>
    )
}

export default Login;