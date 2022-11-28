import React, { useEffect, useState } from "react";
import SongList from "./songlist";
import './styles/search.css'

const TABLE_STYLE = "narrow-width heavy-bottom-pad"
const INVALID_SEARCH = "Invalid search query"

const SearchBar = ({setQuery, label}) => {
    const [search, setSearch] = useState('');

    useEffect(() => {
        setQuery(search)
    }, [search])

    const updateSearch = (s) => {
        setSearch(s.target.value)
    }

    if(label){
        return (
            <div className='form narrow'>
                <label>Search any combination of artist, genre, and track title</label>
                <label className="sub">Note that tracks must match ALL searches</label>
                <label className="sub sub-bottom">Separate searches by commas</label>
                <input autoCorrect="false" type='text' onChange={updateSearch}/>
            </div>
        )
    }
    return (
        <div className='form narrow'>
            <input autoCorrect="false" type='text' onChange={updateSearch}/>
        </div>
    )
}

const Search = ({updateParentResults, updateParentSet, parentSet, disableExpanding, enableLabel, heading, triggerRefresh}) => {
    const [state, setState] = useState({
        query: '',
        buttonEnabled: true,
        searchResults: [],
        invokedPreviously: false,
        errorMessage: ''
    }) 

    useEffect(() => {
        if(!updateParentResults) return
        updateParentResults(state.searchResults)
    }, [state.searchResults])

    useEffect(() => {
        clearResults()
    }, [triggerRefresh])

    const searchData = () => {
        console.log("Searching data")
        setState({
            ...state,
            searchResults: [],
            buttonEnabled: false
        })
        console.log(state.query)
        fetch(`http://localhost:3001/api/search/${state.query}`, {
            headers: new Headers({ 
                "Authorization": localStorage.getItem('token') 
            }),
        })
        .then((a) => {
            return a.json()
        })
        .then(async (a) => {
            console.log(a)
            await setState({
                ...state,
                searchResults: a,
                invokedPreviously: true,
                buttonEnabled: true
            })
            for(const track of a){
                if(!parentSet) break;
                if(track.track_id in parentSet){
                    track.selected = true;
                }
            }
            console.log("Finished search")
        })
        .catch((err) => {
            setState({
                ...state,
                buttonEnabled: true,
                errorMessage: INVALID_SEARCH,
                searchResults: [],
            })
        })
    }

    const updateQuery = (q) => {
        setState({
            ...state,
            query: q,
            errorMessage: ''
        })
    }

    const expandResults = (e, track, flag) => {
        track.additional_information = !track.additional_information
        if(updateParentSet && !flag){
            if(parseInt(track.track_id) in parentSet){
                delete parentSet[parseInt(track.track_id)]
                updateParentSet(track, parseInt(track.track_id))
                track.selected = false;
                e.target.className = e.target.className.replace('selected-track', '')
            }
            else{
                parentSet[parseInt(track.track_id)] = track
                updateParentSet(track, parseInt(track.track_id))
                track.selected = true;
                e.target.className += ' selected-track'
            }
        }
        setState({
            ...state,
            searchResults: state.searchResults
        })
    }

    const clearResults = () => {
        setState({
            ...state,
            searchResults: [],
            invokedPreviously: false
        })
    }

    const showSelected = () => {
        console.log("Searching data")
        setState({
            ...state,
            searchResults: [],
            buttonEnabled: false
        })
        const payload = {
            ids: Object.keys(parentSet).map(key => {return parseInt(key)})
        }
        fetch(`http://localhost:3001/api/tracks`, {
            method: "POST",
            headers: new Headers({ 
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(payload),
        })
        .then((a) => {
            return a.json()
        })
        .then((a) => {
            setState({
                ...state,
                searchResults: a,
                invokedPreviously: true,
                buttonEnabled: true
            })
            for(const track of a){
                if(track.track_id in parentSet){
                    track.selected = true;
                }
            }
            console.log("Finished search")
        })
        .catch(() => {
            setState({
                ...state,
                buttonEnabled: true
            })
        })
    }

    return(
        <div>
            {heading && <h1>Search</h1>}
            <SearchBar setQuery={updateQuery} label={enableLabel}/>
            {state.errorMessage.length > 0 && <div className="error">{state.errorMessage}</div>}
            <div>
                <button onClick={() => searchData()} disabled={!state.buttonEnabled} className="submit-button">Search</button>
                {!heading && <button className='no-margin submit-button' disabled={!state.buttonEnabled} onClick={clearResults}>Clear Results</button>}
                {!heading && <button className='no-margin submit-button' disabled={!state.buttonEnabled} onClick={showSelected}>Show Selected</button>}
            </div>
            <SongList searchResults={state.searchResults} expandResults={expandResults} cName={TABLE_STYLE} disableExpanding={disableExpanding}/>
            {state.searchResults.length === 0 && state.invokedPreviously && state.buttonEnabled &&
                <h1 className="no-results-container">No Results Found</h1>
            }
            {(!localStorage.getItem('token') || localStorage.getItem('token') === '') && <div>

            </div>}
        </div>
    )
}

export default Search;