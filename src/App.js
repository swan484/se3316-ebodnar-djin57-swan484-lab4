import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from './components/layout';
import Home from './components/home';
import Search from './components/search';
import {useState} from 'react'
import Deactivated from './components/deactivated';

function App() {
  const [state, setState] = useState({
      userLoginLevel: 0
  })

  const updateLoginStatus = (val) => {
    console.log(`Updating global login status to ${val}`)
    setState({
        ...state,
        userLoginLevel: val
    })
}

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Home updateUserLoginStatus={updateLoginStatus}/>}></Route>
            <Route path='search' element={<Search />}></Route>
            <Route path='deactivated' element={<Deactivated />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
