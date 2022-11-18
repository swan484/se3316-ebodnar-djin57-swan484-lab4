import e from "cors";
import React, { useEffect, useState } from "react";
import Search from "./search";
import './styles/createPlaylist.css'
import MessageBar from "./login/MessageBar";

const ERROR_CLASS = "error"
const SUCCESS_CLASS = "login-success"

const CreatePlaylist = ({userLoggedInStatus}) => {
    const [state, setState] = useState({
        searchResults: [],
        selectedTracks: {},
        creatingPlaylist: true,
        public: true,
        description: '',
        title: '',
        error: '',
        successMessage: ''
    })

    useEffect(() => {
        console.log("Changed selected tracks to ")
        console.log(state.selectedTracks)
    }, [state.selectedTracks])

    const updateSearchResults = (results) => {
        setState({
            ...state,
            searchResults: results
        })
    }

    const updateTracksSet = (add, item, id) => {
        console.log(item)
        setState(prevState => {
            let prevTracks = {...prevState.selectedTracks}
            if(add){
                prevTracks[id] = item
            }
            else{
                delete prevTracks[id]
            }
            return {...state, selectedTracks: prevTracks}
        })
    }

    const updateCreatingMode = (val) => {
        setState({
            ...state,
            creatingPlaylist: val
        })
        if(val === 0){
            //Load in existing tracks
        }
    }

    const updateVisibility = (vis) => {
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

    const updateSuccessMessage = (message) => {
        setState({
            ...state,
            successMessage: message,
            error: ''
        })
    }

    const updateErrorMessage = (message) => {
        setState({
            ...state,
            successMessage: '',
            error: message
        })
    }

    const createPlaylist = () => {
        const query = {
            userInfo: userLoggedInStatus,
            tracks: Object.values(state.selectedTracks),
            list_title: state.title,
            description: state.description,
            visibility: state.public ? "public" : "private"
        }
        console.log(query)
        fetch(`http://localhost:3001/api/authenticated/playlists`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query),
        })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            const list = []
            for(const track of Object.values(state.selectedTracks)){
                console.log(track);
                track.selected = false;
                list.push(track)
            }
            setState({
                ...state,
                selectedTracks: list
            })
            setState({
                ...state,
                selectedTracks: {}
            })
            console.log("Finished PUT")
            updateSuccessMessage("Successfully created playlist")
        })
        .catch((err) => {
            updateErrorMessage(err.message)
        })
    }

    const handleSubmit = () => {
        if(state.creatingPlaylist){
            createPlaylist()
        }
        else{
            console.log("Not creating playlist")
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
                <option value={1}>Create</option>
                <option value={0}>Edit</option>
            </select>
            <label className="func-label">Select Visibility</label>
            <select value={state.creatingPlaylist} onChange={(e) => updateVisibility(e.target.value)}>
                <option value={true}>Public</option>
                <option value={false}>Private</option>
            </select>
            <div className="form mod-playlist">
                <label>Search Tracks</label>
            </div>
            <Search updateParentResults={updateSearchResults} updateParentSet={updateTracksSet} parentSet={{...state.selectedTracks}} disableExpanding={true}/>
            <div className="form mod-playlist">
                <label>Playlist Name</label>
                <input type="text" onChange={updateTitle} />
                <label>Description</label>
                <textarea onChange={updateDescription} autoComplete="false"/>
            </div>
            <button className="create-playlist" onClick={handleSubmit}>Create Playlist</button>
            {state.successMessage.length > 0 && state.error.length === 0 && <MessageBar message={state.successMessage} cName={SUCCESS_CLASS} />}
            {state.error.length > 0 && <MessageBar message={state.error} cName={ERROR_CLASS} />}
        </div>
    )
}

export default CreatePlaylist;