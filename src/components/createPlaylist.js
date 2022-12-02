import React, { startTransition, useEffect, useState } from "react";
import Search from "./search";
import './styles/createPlaylist.css'
import MessageBar from "./login/MessageBar";
import Playlist from "./playlist";
import {BASE_URL} from "./conf"

const ERROR_CLASS = "error"
const SUCCESS_CLASS = "login-success"

const CreatePlaylist = ({userLoggedInStatus}) => {
    const [state, setState] = useState({
        searchResults: [],
        selectedTracks: {},
        creatingPlaylist: 0,
        public: false,
        description: '',
        title: '',
        error: '',
        successMessage: '',
        userPlaylists: {},
        selectedPlaylist: '',
        invokeInProgress: false,
        deletingPlaylist: false,
        confirmDelete: false
    })

    useEffect(() => {
        updateErrorMessage()
    }, [state.title, state.selectedTracks, state.deletingPlaylist, state.creatingPlaylist])

    useEffect(() => {
        if(!(state.userPlaylists && Object.keys(state.userPlaylists).length > 0)){
            setState({
                ...state,
                selectedPlaylist: {}
            })
            return;
        }
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
        if(!(state.selectedPlaylist && Object.keys(state.selectedPlaylist).length > 0)){
            setState({
                ...state,
                title: '',
                description: '',
                public: false,
                selectedTracks: {}
            })
            return;
        }
        updateAllTracks(state.selectedPlaylist.tracks)
    }, [state.selectedPlaylist])

    const updateInvokeInProgress = (val) => {
        setState({
            ...state,
            invokeInProgress: val,
            error: '',
            successMessage: ''
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
            playlists[id] = item
            return {...prevState, userPlaylists: playlists}
        })
    }

    const getExistingPlaylists = async () => {
        await fetch(`${BASE_URL}/api/authenticated/playlists`, {
            headers: new Headers({ 
                "Authorization": localStorage.getItem('token') 
            })
        })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            return a.json()
        })
        .then((results) => {
            for(const item of results){
                updateUserPlaylists(item, item.list_title)
            }
            console.log("Finished POST")
        })
        .catch((err) => {
            updateErrorMessage(err.message)
        })
    }

    const updateCreatingMode = async (val) => {
        val = parseInt(val)
        if(val === 0){
            await setState({
                ...state,
                creatingPlaylist: val,
                deletingPlaylist: false,
                confirmDelete: false,
                userPlaylists: {},
                selectedPlaylist: {}
            })
        }
        if(val === 1){
            await setState({
                ...state,
                creatingPlaylist: val,
                deletingPlaylist: false,
                confirmDelete: false
            })
        }
        if(val === 2){
            await setState({
                ...state,
                creatingPlaylist: val,
                deletingPlaylist: true,
                confirmDelete: false
            })
        }
        if(val === 1 || val === 2){
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
            selectedPlaylist: state.userPlaylists[val.target.value],
            confirmDelete: false
        })
    }

    const createPlaylist = async () => {
        if(state.error.length > 0) return;
        updateInvokeInProgress(true)
        const query = {
            tracks: Object.values(state.selectedTracks),
            list_title: state.title,
            description: state.description,
            visibility: state.public ? "public" : "private"
        }
        await fetch(`${BASE_URL}/api/authenticated/playlists`, {
            method: "PUT",
            headers: new Headers({ 
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token') 
            }),
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
            console.log("Finished PUT")
            setState({
                ...state,
                invokeInProgress: false,
                successMessage: "Successfully created playlist",
                selectedTracks: {}
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
            tracks: Object.values(state.selectedTracks),
            original_title: state.selectedPlaylist.list_title,
            list_title: state.title,
            description: state.description,
            visibility: state.public ? "public" : "private"
        }
        
        fetch(`${BASE_URL}/api/authenticated/playlist`, {
            method: "PUT",
            headers: new Headers({ 
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token') 
            }),
            body: JSON.stringify(query)
        })
        .then((a) => {
            console.log(a)
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            for(const track of Object.values(state.selectedTracks)){
                track.selected = false;
            }
            console.log("Finished PUT")
            setState({
                ...state,
                invokeInProgress: false,
                selectedTracks: {},
                successMessage: "Successfully updated playlist",
                userPlaylists: {},
                error: ''
            })
        })
        .then(() => getExistingPlaylists())
        .catch((err) => {
            setState({
                ...state,
                invokeInProgress: false,
                error: err.message,
                successMessage: ''
            })
        })
    }

    const deletePlaylist = () => {
        updateInvokeInProgress(true)
        const query = {
            list_title: state.title
        }
        
        fetch(`${BASE_URL}/api/authenticated/playlist`, {
            method: "DELETE",
            headers: new Headers({ 
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token') 
            }),
            body: JSON.stringify(query)
        })
        .then(async (a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            console.log("Finished PUT")
            await setState({
                ...state,
                invokeInProgress: false,
                successMessage: "Successfully deleted playlist",
                userPlaylists: {},
                confirmDelete: false
            })
        })
        .then(() => getExistingPlaylists())
        .catch((err) => {
            setState({
                ...state,
                invokeInProgress: false,
                error: err.message
            })
        })
    }

    const handleSubmit = () => {
        if(state.creatingPlaylist === 0){
            createPlaylist()
        }
        else if(state.creatingPlaylist === 1){
            updatePlaylist()
        }
    }

    const handleDelete = () => {
        if(state.confirmDelete){
            console.log("DELETING")
            deletePlaylist()
        }
        if(state.deletingPlaylist && !state.confirmDelete){
            setState({
                ...state,
                confirmDelete: true
            })
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
                <option value={0}>Create</option>
                <option value={1}>Edit</option>
                <option value={2}>Delete</option>
            </select>
            {(state.creatingPlaylist === 1 || state.creatingPlaylist === 2) && <div>
                <label className="func-label">Select Playlist</label>
                <select onChange={handlePlaylistChange} disabled={!(state.userPlaylists && Object.keys(state.userPlaylists).length > 0)}> 
                    {!(state.userPlaylists && Object.keys(state.userPlaylists).length > 0) && <option disabled={true}>No Results</option>}
                    {Object.keys(state.userPlaylists).map((key) => {return (<option value={state.userPlaylists[key].list_title} key={state.userPlaylists[key].list_title}>{state.userPlaylists[key].list_title}</option>)})}
                </select>
            </div>}
            {!state.deletingPlaylist && <div>
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
            </div>}
            {!state.deletingPlaylist && <button className="create-playlist submit-button" onClick={handleSubmit} disabled={state.invokeInProgress}>
                {state.creatingPlaylist === 0 ? "Create" : "Update"} Playlist
            </button>}
            {state.deletingPlaylist && state.selectedPlaylist && Object.keys(state.selectedPlaylist).length > 0 && <div>
                <Playlist overrideResults={[state.selectedPlaylist]} />
                <button className={"create-playlist pad-above" + (state.confirmDelete ? " confirm-delete" : " delete-playlist")} onClick={handleDelete} disabled={state.invokeInProgress}>
                    {!state.confirmDelete ? "Delete Playlist" : "Confirm Delete"}    
                </button>
            </div>}
            {state.successMessage.length > 0 && state.error.length === 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
            {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
        </div>
    )
}

export default CreatePlaylist;