import './App.css';
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

function App() {
  const [state, setState] = useState({
      loggedUser: {}
  })
  
  const updateLoginStatus = (obj) => {
    setState({
        ...state,
        loggedUser: obj
    })
}

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout userLoggedInStatus={state.loggedUser}/>}>
            <Route index element={<Home updateUserLoginStatus={updateLoginStatus} loginStatus={state.loggedUser}/>}></Route>
            <Route path='search' element={<Search enableLabel={true} heading={true}/>}></Route>
            <Route path='playlists' element={<Playlist />}></Route>
            <Route path='deactivated' element={<Deactivated />}></Route>
            <Route path='create' element={<CreatePlaylist userLoggedInStatus={state.loggedUser}/>}></Route>
            <Route path='review' element={<ReviewPlaylist userLoggedInStatus={state.loggedUser}/>}></Route>
            <Route path='verify' element={<VerifyAccount userDetails={state.loggedUser}/>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
