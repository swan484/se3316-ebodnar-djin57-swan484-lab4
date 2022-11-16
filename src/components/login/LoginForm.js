import React, {useEffect, useState} from "react";
import '../styles/login.css'
import FormRow from "./FormRow";
import MessageBar from "./MessageBar";

const EMAIL_REGEX = /[a-zA-Z0-9.-_]{1,}@[a-zA-Z0-9.-]{1,}[.]{1}[a-zA-Z0-9]{1,}/
const EMAIL_FORMAT = "Email is not valid"
const ERROR_CLASS = "error"
const ENTER_EMAIL = "Please enter an email"
const ENTER_PASSWORD = "Please enter a password"

const LoginForm = ({updateParentEmail, updateParentPassword}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

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

export default LoginForm;