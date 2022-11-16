import React from "react";
import {Outlet} from "react-router-dom";
import Navbar from "./navbar";

const Layout = ({userLoggedInStatus}) => {
    return (
        <>
            <Navbar userLoggedInStatus={userLoggedInStatus}/>
            <Outlet />
        </>
    )
}

export default Layout;