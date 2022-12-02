import React, { useEffect, useState } from "react";
import SongList from "./songlist";
import './styles/playlist.css'
import {BASE_URL} from "./conf"

const UNKNOWN = "Unknown"
const NONE = "None"
const NO_DESCRIPTION = "No Description"
const PLAYLISTS_LIMIT = 10
const HIDE = "Hide Review"
const UNHIDE = "Unhide Review"

const REVIEW_SUCCESS_MESSAGE = "Successfully created review"

const Playlist = ({overrideResults, reviewContent, displayLimit, userLoggedInStatus}) => {
    const [state, setState] = useState({
        searchResults: overrideResults && overrideResults.length > 0 ? overrideResults : [],
        buttonEnabled: true,
        reviews: {},
        globalError: false
    })

    const limit = displayLimit ? displayLimit : PLAYLISTS_LIMIT

    useEffect(() => {
        if(overrideResults && overrideResults.length > 0) return;
        loadAllData()
    }, [])

    useEffect(() => {
        console.log(state.searchResults)
        fillEmptyReviews()
    }, [state.searchResults])

    useEffect(() => {
        if(!overrideResults) return;
        setState({
            ...state,
            searchResults: overrideResults
        })
    }, [overrideResults])

    const searchData = async () => {
        console.log("Searching data")
        setState({
            ...state,
            buttonEnabled: false
        })
        await fetch(`${BASE_URL}/api/playlists/${limit}`)
        .then((a) => {
            return a.json()
        })
        .then(async (a) => {
            console.log(a)
            await setState({
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

    const loadAllData = async () => {
        console.log("Loading reviews")
        if(reviewContent) await loadUserReviews()
        console.log("Searching data")
        await searchData()
        console.log("Complete")
    }

    const updateRating = (r, item) => {
        const rate = r.target.value
        const id = item._id
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
        const id = item._id
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

    const updateButtonDisabled = (item, status) => {
        const id = item._id
        const obj = state.reviews
        if(!(id in obj)){
            obj[id] = {}
        }
        obj[id].disabled = status
        setState({
            ...state,
            reviews: obj
        })
    }

    const updateSuccessMessage = (item, msg) => {
        const id = item._id
        const obj = state.reviews
        if(!(id in obj)){
            obj[id] = {}
        }
        obj[id].successMessage = msg
        setState({
            ...state,
            reviews: obj
        })
    }

    const updateErrorMessage = (item, msg) => {
        const id = item._id
        const obj = state.reviews
        if(!(id in obj)){
            obj[id] = {}
        }
        obj[id].errorMessage = msg
        setState({
            ...state,
            reviews: obj
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

        const id = track._id
        const obj = state.reviews
        if(!(id in obj)){
            obj[id] = {}
        }
        obj[id].successMessage = ""
        obj[id].errorMessage = ""
        setState({
            ...state,
            searchResults: state.searchResults,
            reviews: obj
        })
    }

    const fillReviews = (list) => {
        list.map((item) => {
            const obj = state.reviews
            obj[item.list_id] = {
                comments: item.comments,
                rating: item.rating
            }
            setState({
                ...state,
                reviews: obj
            })
        })
    }

    const fillEmptyReviews = () => {
        state.searchResults.map((item) => {
            if(!(item._id in state.reviews)){
                const obj = state.reviews
                obj[item._id] = {
                    comments: '',
                    rating: ''
                }
                setState({
                    ...state,
                    reviews: obj
                })
            }
        })
    }

    const updateGlobalError = (val) => {
        setState({
            ...state,
            globalError: val
        })
    }

    const submitReview = async (item) => {
        const query = {
            list_id: item._id,
            creator_email: item.email,
            rating: parseInt(state.reviews[item._id].rating),
            comments: state.reviews[item._id].comments
        }
        updateButtonDisabled(item, true)
        await fetch(`${BASE_URL}/api/authenticated/review`, {
            method: "PUT",
            headers: new Headers({ 
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token') 
            }),
            body: JSON.stringify(query),
        })
        .then((a) => {
            console.log(a)
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            console.log("Finished PUT")
        })
        .then(() => {
            updateSuccessMessage(item, REVIEW_SUCCESS_MESSAGE)
        })
        .then(() => {
            searchData()
        })
        .catch((err) => {
            updateErrorMessage(item, err.message)
        })
        updateButtonDisabled(item, false)
    }

    const loadUserReviews = async () => {
        setState({
            ...state,
            buttonEnabled: false
        })
        await fetch(`${BASE_URL}/api/authenticated/reviews`, {
            headers: new Headers({ 
                "Authorization": localStorage.getItem('token') 
            })
        })
        .then((a) => {
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            console.log("Finished POST")
            return a.json()
        })
        .then((data) => {
            console.log(data)
            fillReviews(data)
        })
        .catch((err) => {
            console.log(err.message)
            updateGlobalError(true)
        })

        setState({
            ...state,
            globalError: false,
            buttonEnabled: false
        })
    }

    const hideReview = async (e, r) => {
        console.log("Clicked hide review")
        console.log(r)
        //Fetch with an API call to update this review to set "hidden = true"
        const query = {
            // _id: r._id,
            comments: r.comments,
            hidden: !(r.hidden),
        }

        await fetch(`${BASE_URL}/api/admin/review`, {
            method: "PUT",
            headers: new Headers({ 
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token') 
            }),
            body: JSON.stringify(query),
        })
        .then((a) => {
            console.log(a)
            if(a.status !== 200){
                throw new Error(a.statusText)
            }
            console.log("Finished PUT")
        })
        .then(() => {
            loadAllData()
        })
        .catch(() => {
            setState({
                ...state,
                buttonEnabled: true
            })
        })
    }

    return (
        <div>
            {state.globalError && <p className="error-msg">
                Could not load existing reviews...
            </p>}
            {(!overrideResults || overrideResults.length === 0) && <div>
                <h1>Playlists</h1>
                {!state.buttonEnabled && <p className='playlist-loading-msg'>Getting recent playlists...</p>}
            </div>}
            <ul className="search-table narrow-width table-colour-2" >
                {state.searchResults.length > 0 && 
                    <div className="heading-row table-row table-header-2">
                        <li>
                            <p className="list-title">TITLE</p>
                            <p className="username">CREATOR</p>
                            <p className="date-modified">LAST MODIFIED</p>
                            <p className="playtime">PLAYTIME (HR)</p>
                            <p className="num-tracks"># TRACKS</p>
                            <p className="rating">AVG RATING</p>
                        </li>
                    </div>
                }
                {state.searchResults.map(item => (
                    <div className="table-row table-row-3" key={item.list_title + item.email} >
                        <li onClick={(e) => expandResults(e, item)}>
                            <p className="list-title">{item.list_title || NONE}</p>
                            <p className="username">{item.user_name || NONE}</p>
                            <p className="date-modified">{item.date_modified || UNKNOWN}</p>
                            <p className="playtime">{item.playtime || UNKNOWN}</p>
                            <p className="num-tracks">{item.tracks.length || NONE}</p>
                            <p className="rating">{item.avg_rating || NONE}</p>
                        </li>
                        {item.additional_information && <div className="track-details no-pad top-pad">
                            <p>TITLE: {item.list_title}</p>
                            <p>DESCRIPTION: {item.description || NO_DESCRIPTION}</p>
                            <SongList searchResults={item.tracks} expandResults={expandResults} cName={"sub-table"} disableExpanding={false}/>
                            {!reviewContent && item.reviews.map((r) => <div key={r.user_name}>
                                {!r.hidden && !userLoggedInStatus.admin &&  <div className='view-review-box'>
                                    <p className='review-heading'>{r.user_name}</p>
                                    <p className='review-sub'>Comment: "{r.comments}"</p>
                                    <p className="review-sub">Rating: {r.rating}/10</p>
                                </div>}
                                {userLoggedInStatus && userLoggedInStatus.admin === true && <div className='view-review-box'>
                                    <p className='review-heading'>{r.user_name}</p>
                                    <p className='review-sub'>Comment: "{r.comments}"</p>
                                    <p className="review-sub">Rating: {r.rating}/10</p>
                                    <button className="admin-button" id="hide-button" onClick={(e) => hideReview(e, r)}>{r.hidden ? UNHIDE : HIDE}</button>
                                </div>}
                                {console.log(userLoggedInStatus)}
                            </div>)}
                            {reviewContent && <div className="review-box">
                                <h1>Create Review</h1>
                                <label>Rating (/10)</label>
                                <input autoCorrect="false" value={state.reviews[item._id] ? state.reviews[item._id].rating : ""} onChange={(e) => updateRating(e, item)}></input>
                                <label>Comments</label>
                                <textarea autoCorrect="false" value={state.reviews[item._id] ? state.reviews[item._id].comments : ""} onChange={(e) => updateComment(e, item)}></textarea>
                                <button onClick={() => submitReview(item)} disabled={state.reviews[item._id] ? state.reviews[item._id].disabled : false}>Submit Review</button>
                                {state.reviews[item._id] && state.reviews[item._id].successMessage && <div>
                                    <p className="success-msg">{state.reviews[item._id].successMessage}</p>
                                </div>}
                                {state.reviews[item._id] && state.reviews[item._id].errorMessage && <div>
                                    <p className="error-msg">{state.reviews[item._id].errorMessage}</p>
                                </div>}
                            </div>}
                        </div>}
                    </div>
                ))}
            </ul>
        </div>
    )
}

export default Playlist;