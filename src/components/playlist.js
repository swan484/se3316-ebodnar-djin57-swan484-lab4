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

    const searchData = () => {
        console.log("Searching data")
        setState({
            ...state,
            searchResults: [],
            buttonEnabled: false
        })
        fetch(`http://localhost:3001/api/playlists`)
        .then((a) => {
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
                {/* fix styling, change colour of outer table, etc. */}
                {state.searchResults.map(item => (
                    <div className="table-row table-row-2" key={item.list_title} value={item.track_id} >
                        <li onClick={(e) => expandResults(e, item)}>
                            <p className="list-title">{item.list_title || UNKNOWN}</p>
                            <p className="username">{item.username || UNKNOWN}</p>
                            <p className="date-modified">{item.date_modified || UNKNOWN}</p>
                            <p className="playtime">{item.playtime || UNKNOWN}</p>
                            <p className="rating">{item.rating || UNKNOWN}</p>
                        </li>
                        {item.additional_information && <div className="track-details no-pad top-pad">
                            <p>TITLE: {item.list_title}</p>
                            <p>DESCRIPTION: {item.desciption || NO_DESCRIPTION}</p>
                            <SongList searchResults={item.tracks} expandResults={expandResults} cName={"sub-table"}/>
                        </div>}
                    </div>
                    /* */
                ))}
            </ul>
        </div>
    )
}

export default Playlist;

/*
                        {item.additional_information && 
                            <li className="track-details">
                                <p>Title: {item.track_title || UNKNOWN}</p>
                                <p>Artist: {item.artist_name || UNKNOWN}</p>
                                <p>Album: {item.album_title || UNKNOWN}</p>
                                <p>Duration: {item.track_duration || UNKNOWN}</p>
                                <p>Date Created: {item.track_date_created || UNKNOWN}</p>
                                <p>Date Recorded: {item.track_date_recorded || UNKNOWN}</p>
                                <p>Listens: {item.track_listens || UNKNOWN}</p>
                                {item.track_genres.length > 0 && <p>Genres: </p>}
                                    {item.track_genres.length > 0 && item.track_genres.map(g => (
                                        <div className="track-genre" key={g.genre_title}>
                                            <p>- {g.genre_title}</p>
                                        </div>
                                    ))}
                            </li>
                        }
*/