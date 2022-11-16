import React, {useEffect, useState} from "react";
import '../styles/login.css'
import FormRow from "./FormRow";
import MessageBar from "./MessageBar";

const PASSWORD_MISMATCH = "Passwords do not match!"
const EMAIL_REGEX = /[a-zA-Z0-9.-_]{1,}@[a-zA-Z0-9.-]{1,}[.]{1}[a-zA-Z0-9]{1,}/
const EMAIL_FORMAT = "Email is not valid"
const ERROR_CLASS = "error"
const ENTER_EMAIL = "Please enter an email"
const ENTER_PASSWORD = "Please enter a password"
const ENTER_CONFIRM_PASSWORD = "Please confirm your password"
const ENTER_FULL_NAME = "Please enter your full name"

const CreateForm = ({updateParentEmail, updateParentPassword, updateParentFullName, updateParentConfirmedPassword}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [confirmedPassword, setConfirmedPassword] = useState('')
    const [error, setError] = useState('')

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

export default CreateForm;