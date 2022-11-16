import React from "react";
import '../styles/login.css'

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

export default MessageBar;