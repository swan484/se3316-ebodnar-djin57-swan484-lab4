import './App.css';
import React  from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from './components/layout';
import Home from './components/home';
import Search from './components/search';
import {useEffect, useState} from 'react'
import Deactivated from './components/deactivated';
import Playlist from './components/playlist';
import CreatePlaylist from './components/createPlaylist';
import ReviewPlaylist from './components/reviewPlaylist';
import VerifyAccount from './components/verifyAccount';
import Manage from './components/manage';
import React, { Component }  from 'react';
import Policy from './components/policy';

function App() {
  const [state, setState] = useState({
      loggedUser: {}
  })

  const MINUTE_MS = 20000;

  const checkJWTExpiry = () => {
    fetch('http://localhost:3001/api/checkAuthorization', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({token: localStorage.getItem('token')})
    })
    .then((res) => {
      return res.json()
    })
    .then((r) => {
      if(!r.valid){
        localStorage.setItem('token', '')
        setState({
          loggedUser: {}
        })
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }
  
  const updateLoginStatus = (obj) => {
    console.log("UPDATING")
    console.log(obj)
    setState({
        ...state,
        loggedUser: obj
    })
  }

  useEffect(() => {
    localStorage.setItem('token', '')
  }, [])

  //Every 20 seconds, check if the JWT is still valid
  useEffect(() => {
    console.log(state.loggedUser)
    const interval = setInterval(() => {
      console.log("Checking expiry")
      checkJWTExpiry()
    }, MINUTE_MS);

    return () => clearInterval(interval);
  }, [])

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout userLoggedInStatus={state.loggedUser}/>}>
            <Route index element={<Home updateUserLoginStatus={updateLoginStatus} loginStatus={state.loggedUser}/>}></Route>
            <Route path='search' element={<Search enableLabel={true} heading={true}/>}></Route>
            <Route path='playlists' element={<Playlist userLoggedInStatus={state.loggedUser}/>}></Route>
            <Route path='deactivated' element={<Deactivated />}></Route>
            <Route path='create' element={<CreatePlaylist userLoggedInStatus={state.loggedUser}/>}></Route>
            <Route path='review' element={<ReviewPlaylist userLoggedInStatus={state.loggedUser}/>}></Route>
            <Route path='verify' element={<VerifyAccount userDetails={state.loggedUser}/>}></Route>
            <Route path='manage' element={<Manage loginStatus={state.loggedUser}/>}></Route>
            <Route path='policy' element={<Policy loginStatus={state.loggedUser}/>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
