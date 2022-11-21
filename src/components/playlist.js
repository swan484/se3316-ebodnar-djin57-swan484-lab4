import React, { useEffect, useState } from "react";
import SongList from "./songlist";
import './styles/playlist.css'

const UNKNOWN = "Unknown"
const NO_DESCRIPTION = "No Description"

const Playlist = () => {
    const [state, setState] = useState({
        searchResults: [],
        buttonEnabled: true
    })

    useEffect(() => {
        console.log("Searching data for playlists")
        searchData()
    }, [])

    const searchData = () => {
        console.log("Searching data")
        setState({
            ...state,
            searchResults: [],
            buttonEnabled: false
        })
        fetch(`http://localhost:3001/api/playlists`)
        .then((a) => {
            console.log(a)
            return a.json()
        })
        .then((a) => {
            setState({
                ...state,
                searchResults: a,
                buttonEnabled: true
            })
            console.log(a)
            console.log("Finished search")
        })
        .catch(() => {
            setState({
                ...state,
                buttonEnabled: true
            })
        })
    }

    const expandResults = (e, track) => {
        console.log(track)
        if("tracks" in track){
            for(const tr of track.tracks){
                tr.additional_information = false
            }
        }
        track.additional_information = !track.additional_information
        setState({
            ...state,
            searchResults: state.searchResults
        })
    }

    return (
        <div>
            <h1>Playlists</h1>
            <button onClick={searchData}>Search</button>
            <ul className="search-table narrow-width table-colour-2" >
                {state.searchResults.length > 0 && 
                    <div className="heading-row table-row table-header-2">
                        <li>
                            <p className="list-title">TITLE</p>
                            <p className="username">CREATOR</p>
                            <p className="date-modified">LAST MODIFIED</p>
                            <p className="playtime">PLAYTIME</p>
                            <p className="rating">AVG RATING</p>
                        </li>
                    </div>
                }
                {state.searchResults.map(item => (
                    <div className="table-row table-row-2" key={item.list_title + item.email} value={item.track_id} >
                        <li onClick={(e) => expandResults(e, item)}>
                            <p className="list-title">{item.list_title || UNKNOWN}</p>
                            <p className="username">{item.user_name || UNKNOWN}</p>
                            <p className="date-modified">{item.date_modified || UNKNOWN}</p>
                            <p className="playtime">{item.playtime || UNKNOWN}</p>
                            <p className="rating">{item.rating || UNKNOWN}</p>
                        </li>
                        {item.additional_information && <div className="track-details no-pad top-pad">
                            <p>TITLE: {item.list_title}</p>
                            <p>DESCRIPTION: {item.description || NO_DESCRIPTION}</p>
                            <SongList searchResults={item.tracks} expandResults={expandResults} cName={"sub-table"} disableExpanding={false}/>
                        </div>}
                    </div>
                    /* */
                ))}
            </ul>
        </div>
    )
}

export default Playlist;