import React, {useEffect, useState} from "react";
import './styles/login.css'

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

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const updateEmail = (email) => {
        setEmail(email)
    }
    const updatePassword = (password) => {
        setPassword(password)
    }

    return (
        <div className="form">
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <button onClick={function() {
                console.log(`${email} & ${password}`)
            }}>
                Submit
            </button>
        </div>
    )
}

const CreateForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const updateEmail = (email) => {
        setEmail(email)
    }
    const updatePassword = (password) => {
        setPassword(password)
    }
    const updateConfirmedPassword = (confirmedPassword => {
        setConfirmedPassword(confirmedPassword)
    })
    const updateFullName = (fullName) => {
        setFullName(fullName)
    }
    
    return (
        <div className="form">
            <FormRow updateInput={updateFullName} inputType='text' inputTitle={'Full Name'} />
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <FormRow updateInput={updateConfirmedPassword} inputType='password' inputTitle={'Confirm Password'} />
            <button onClick={function() {
                console.log(`${email} & ${password}, ${confirmedPassword} & ${fullName}`)
            }}>
                Submit
            </button>
        </div>
    )
}

const ForgotForm = () => {
    const [email, setEmail] = useState('');
    const [existingPassword, setExistingPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const updateEmail = (email) => {
        setEmail(email)
    }
    const updateExistingPassword = (existingPassword) => {
        setExistingPassword(existingPassword)
    }
    const updatePassword = (password) => {
        setPassword(password)
    }
    const updateConfirmedPassword = (password => {
        setConfirmedPassword(password)
    })
    const updateFullName = (fullName) => {
        setFullName(fullName)
    }
    
    return (
        <div className="form">
            <FormRow updateInput={updateFullName} inputType='text' inputTitle={'Full Name'} />
            <FormRow updateInput={updateExistingPassword} inputType='password' inputTitle={'Current Password'} />
            <FormRow updateInput={updateEmail} inputType='email' inputTitle={'Email'} />
            <FormRow updateInput={updatePassword} inputType='password' inputTitle={'Password'} />
            <FormRow updateInput={updateConfirmedPassword} inputType='password' inputTitle={'Confirm Password'} />
            <button onClick={function() {
                console.log(`${email} & ${password}, ${confirmedPassword} & ${fullName}, ${existingPassword}`)
            }}>
                Submit
            </button>
        </div>
    )
}

const Login = () => {
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