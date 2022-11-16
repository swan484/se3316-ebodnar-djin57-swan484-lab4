import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from './components/layout';
import Home from './components/home';
import Search from './components/search';
import {useState} from 'react'
import Deactivated from './components/deactivated';
import Playlist from './components/playlist';
import CreatePlaylist from './components/createPlaylist';

function App() {
  const [state, setState] = useState({
      userLoginLevel: 0
  })

  const updateLoginStatus = (val) => {
    setState({
        ...state,
        userLoginLevel: val
    })
}

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout userLoggedInStatus={state.userLoginLevel}/>}>
            <Route index element={<Home updateUserLoginStatus={updateLoginStatus}/>}></Route>
            <Route path='search' element={<Search />}></Route>
            <Route path='playlists' element={<Playlist />}></Route>
            <Route path='deactivated' element={<Deactivated />}></Route>
            <Route path='create' element={<CreatePlaylist userLoggedInStatus={state.userLoginLevel}/>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
