import e from "cors";
import React, { startTransition, useEffect, useState } from "react";
import Search from "./search";
import './styles/createPlaylist.css'
import MessageBar from "./login/MessageBar";

const ERROR_CLASS = "error"
const SUCCESS_CLASS = "login-success"
const NO_TITLE = "Please enter a title"
const NO_TRACKS = "A playlist must have at least one track"

const CreatePlaylist = ({userLoggedInStatus}) => {
    const [state, setState] = useState({
        searchResults: [],
        selectedTracks: {},
        creatingPlaylist: true,
        public: false,
        description: '',
        title: '',
        error: '',
        successMessage: '',
        userPlaylists: {},
        selectedPlaylist: '',
        invokeInProgress: false
    })

    useEffect(() => {
        updateErrorMessage()
    }, [state.title, state.selectedTracks])

    useEffect(() => {
        if(!(state.userPlaylists && Object.keys(state.userPlaylists).length > 0)) return;
        const loadedObj = state.userPlaylists[Object.keys(state.userPlaylists)[0]]
        setState({
            ...state,
            selectedPlaylist: loadedObj,
            public: loadedObj.visibility === 'public' ? true : false,
            title: loadedObj.list_title,
            description: loadedObj.description
        })
    }, [state.userPlaylists])

    useEffect(() => {
        if(!(state.selectedPlaylist && Object.keys(state.selectedPlaylist).length > 0)) return;
        updateAllTracks(state.selectedPlaylist.tracks)
    }, [state.selectedPlaylist])

    const updateInvokeInProgress = (val) => {
        setState({
            ...state,
            invokeInProgress: val
        })
    }

    const updateSearchResults = (results) => {
        setState({
            ...state,
            searchResults: results
        })
    }

    const updateAllTracks = () => {
        const obj = {}
        for(const item of state.selectedPlaylist.tracks){
            obj[item.track_id] = item
        }
        setState({
            ...state,
            selectedTracks: obj,
            public: state.selectedPlaylist.visibility === 'public' ? true : false,
            title: state.selectedPlaylist.list_title,
            description: state.selectedPlaylist.description,
        })
    }

    const updateTracksSet = (item, id) => {
        setState(prevState => {
            let prevTracks = {...prevState.selectedTracks}
            if(id in prevTracks){
                delete prevTracks[id]
            }
            else{
                prevTracks[id] = item
            }
            return {...state, selectedTracks: prevTracks}
        })
    }

    const updateUserPlaylists = (item, id) => {
        setState(prevState => {
            let playlists = {...prevState.userPlaylists}
            if(id in playlists){
                delete playlists[id]
            }
            else{
                playlists[id] = item
            }
            return {...prevState, userPlaylists: playlists}
        })
    }

    const getExistingPlaylists = async () => {
        const query = {
            email: userLoggedInStatus.email,
            password: userLoggedInStatus.password
        }
        fetch(`http://localhost:3001/api/authenticated/playlists`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query),
        })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            return a.json()
        }).then((results) => {
            for(const item of results){
                updateUserPlaylists(item, item.list_title)
            }
            console.log("Finished POST")
        })
        .catch((err) => {
            updateErrorMessage(err.message)
        })
    }

    const updateCreatingMode = (val) => {
        val === "false" ? val = false : val = true
        setState({
            ...state,
            creatingPlaylist: val
        })
        if(!val){
            getExistingPlaylists()
        }
    }

    const updateVisibility = (vis) => {
        vis = vis === "false" ? false : true
        setState({
            ...state,
            public: vis
        })
    }

    const updateTitle = (t) => {
        setState({
            ...state,
            title: t.target.value
        })
    }

    const updateDescription = (desc) => {
        setState({
            ...state,
            description: desc.target.value
        })
    }

    const updateErrorMessage = (message) => {
        if(message){
            setState({
                ...state,
                successMessage: '',
                error: message
            })
        }
        else if(state.title.length === 0){
            setState({
                ...state,
                error: NO_TITLE,
                successMessage: ''
            })
        }
        else if(!(state.selectedTracks && Object.keys(state.selectedTracks).length > 0)){
            console.log("SELECTED")
            setState({
                ...state,
                error: NO_TRACKS,
                successMessage: ''
            })
        }
        else {
            setState({
                ...state,
                error: ''
            })
        }
    }

    const handlePlaylistChange = (val) => {
        setState({
            ...state,
            selectedPlaylist: state.userPlaylists[val.target.value]
        })
    }

    const createPlaylist = async () => {
        if(state.error.length > 0) return;
        updateInvokeInProgress(true)
        const query = {
            userInfo: userLoggedInStatus,
            tracks: Object.values(state.selectedTracks),
            list_title: state.title,
            description: state.description,
            visibility: state.public ? "public" : "private"
        }
        await fetch(`http://localhost:3001/api/authenticated/playlists`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query),
        })
        .then((a) => {
            updateInvokeInProgress(true)
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            for(const track of Object.values(state.selectedTracks)){
                track.selected = false;
            }
            setState({
                ...state,
                selectedTracks: {}
            })
            console.log("Finished PUT")
            setState({
                ...state,
                invokeInProgress: false,
                successMessage: "Successfully created playlist"
            })
        })
        .catch((err) => {
            setState({
                ...state,
                invokeInProgress: false,
                error: err.message
            })
        })
    }

    const updatePlaylist = () => {
        if(state.error.length > 0) return;
        updateInvokeInProgress(true)
        const query = {
            email: userLoggedInStatus.email,
            password: userLoggedInStatus.password,
            tracks: Object.values(state.selectedTracks),
            original_title: state.selectedPlaylist.list_title,
            list_title: state.title,
            description: state.description,
            visibility: state.public ? "public" : "private"
        }
        
        fetch(`http://localhost:3001/api/authenticated/playlist`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query)
        })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            for(const track of Object.values(state.selectedTracks)){
                track.selected = false;
            }
            setState({
                ...state,
                selectedTracks: {}
            })
            console.log("Finished PUT")
            setState({
                ...state,
                invokeInProgress: false,
                successMessage: "Successfully updated playlist"
            })
        })
        .catch((err) => {
            setState({
                ...state,
                invokeInProgress: false,
                error: err.message
            })
        })
    }

    const handleSubmit = () => {
        if(state.creatingPlaylist){
            createPlaylist()
        }
        else{
            updatePlaylist()
        }
    }

    if(!(userLoggedInStatus && Object.keys(userLoggedInStatus).length > 0)){
        return (
            <div className="unauthorized">
                <h1>Unavailable</h1>
                <div>You need to be logged in to access this...</div>
            </div>
        )
    }
    return (
        <div className="parent-div">
            <h1>My Playlists</h1>
            <label className='func-label'>Select a functionality</label>
            <select value={state.creatingPlaylist} onChange={(e) => updateCreatingMode(e.target.value)}>
                <option value={true}>Create</option>
                <option value={false}>Edit</option>
            </select>
            {(state.userPlaylists && Object.keys(state.userPlaylists).length > 0) && <div>
                <label className="func-label">Select Playlist</label>
                <select onChange={handlePlaylistChange}> 
                    {Object.keys(state.userPlaylists).map((key) => {return (<option value={state.userPlaylists[key].list_title} key={state.userPlaylists[key].list_title}>{state.userPlaylists[key].list_title}</option>)})}
                </select>
            </div>}
            <label className="func-label">Select Visibility</label>
            <select value={state.public} onChange={(e) => updateVisibility(e.target.value)}>
                <option value={true}>Public</option>
                <option value={false}>Private</option>
            </select>
            <div className="form mod-playlist">
                <label className="pad-label">Playlist Name</label>
                <input type="text" onChange={updateTitle} value={state.title}/>
                <label className="pad-label">Description</label>
                <textarea onChange={updateDescription} autoComplete="false" value={state.description}/>
            </div>
            <div className="form mod-playlist">
                <label>Search Tracks</label>
            </div>
            <Search updateParentResults={updateSearchResults} updateParentSet={updateTracksSet} parentSet={{...state.selectedTracks}} disableExpanding={true} triggerRefresh={state.selectedPlaylist}/>
            <button className="create-playlist" onClick={handleSubmit} disabled={state.invokeInProgress}>
                {state.creatingPlaylist ? "Create" : "Update"} Playlist
            </button>
            {state.successMessage.length > 0 && state.error.length === 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
            {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
        </div>
    )
}

export default CreatePlaylist;