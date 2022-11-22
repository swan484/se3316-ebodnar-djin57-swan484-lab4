import React, { useEffect, useState } from "react";
import SongList from "./songlist";
import './styles/playlist.css'

const UNKNOWN = "Unknown"
const NO_DESCRIPTION = "No Description"
const PLAYLISTS_LIMIT = 10

const Playlist = ({overrideResults, reviewContent, displayLimit}) => {
    const [state, setState] = useState({
        searchResults: overrideResults && overrideResults.length > 0 ? overrideResults : [],
        buttonEnabled: true,
        reviews: {}
    })

    const limit = displayLimit ? displayLimit : PLAYLISTS_LIMIT

    useEffect(() => {
        if(overrideResults && overrideResults.length > 0) return;
        searchData()
    }, [])

    useEffect(() => {
        if(state.searchResults.length === 0) return;
        state.searchResults.map((item) => {
            const obj = state.reviews
            obj[item.list_title] = {
                comments: '',
                rating: ''
            }
            setState({
                ...state,
                reviews: obj
            })
        })
    }, [state.searchResults])

    useEffect(() => {
        if(!overrideResults) return;
        setState({
            ...state,
            searchResults: overrideResults
        })
    }, [overrideResults])

    const searchData = () => {
        console.log("Searching data")
        setState({
            ...state,
            searchResults: [],
            buttonEnabled: false
        })
        fetch(`http://localhost:3001/api/playlists/${limit}`)
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
            console.log("Finished search")
        })
        .catch(() => {
            setState({
                ...state,
                buttonEnabled: true
            })
        })
    }

    const updateRating = (r, item) => {
        const rate = r.target.value
        const id = item.list_title
        if(rate.length > 0 && (!parseInt(rate) || rate > 10 || rate < 0)) return;
        const obj = state.reviews
        if(!(id in obj)){
            obj[id] = {}
        }
        obj[id].rating = rate
        setState({
            ...state,
            reviews: obj
        })
    }

    const updateComment = (c, item) => {
        const comment = c.target.value
        const id = item.list_title
        const obj = state.reviews
        if(!(id in obj)){
            obj[id] = {}
        }
        obj[id].comments = comment
        setState({
            ...state,
            reviews: obj
        })
    }

    const expandResults = (e, track) => {
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

    const submitReview = (item) => {
        console.log("Submit")
        console.log(item)
        console.log(state.reviews)
        console.log(state.reviews[item.list_title])
    }

    return (
        <div>
            {(!overrideResults || overrideResults.length === 0) && <div>
                <h1>Playlists</h1>
                <button onClick={searchData} className="submit-button">Search</button>
            </div>}
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
                            {reviewContent && <div className="review-box">
                                {console.log(state.reviews[item.list_title])}
                                <h1>Create Review</h1>
                                <label>Rating (/10)</label>
                                <input autoCorrect="false" value={state.reviews[item.list_title] ? state.reviews[item.list_title].rating : ""} onChange={(e) => updateRating(e, item)}></input>
                                <label>Comments</label>
                                <textarea autoCorrect="false" value={state.reviews[item.list_title] ? state.reviews[item.list_title].comments : ""} onChange={(e) => updateComment(e, item)}></textarea>
                                <button onClick={() => submitReview(item)}>Submit Review</button>
                            </div>}
                        </div>}
                    </div>
                ))}
            </ul>
        </div>
    )
}

export default Playlist;