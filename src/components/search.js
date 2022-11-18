import React, { useEffect, useState } from "react";
import SongList from "./songlist";
import './styles/search.css'

const TABLE_STYLE = "narrow-width heavy-bottom-pad"

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

const Search = ({updateParentResults, updateParentSet, parentSet, disableExpanding, enableLabel, heading}) => {
    const [state, setState] = useState({
        query: '',
        buttonEnabled: true,
        searchResults: [],
        invokedPreviously: false
    }) 

    useEffect(() => {
        if(!updateParentResults) return
        updateParentResults(state.searchResults)
    }, [state.searchResults])

    const searchData = () => {
        console.log("Searching data")
        setState({
            ...state,
            searchResults: [],
            buttonEnabled: false
        })
        fetch(`http://localhost:3001/api/search/${state.query}`)
        .then((a) => {
            return a.json()
        })
        .then((a) => {
            console.log(a)
            setState({
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
        .catch(() => {
            setState({
                ...state,
                buttonEnabled: true
            })
        })
    }

    const updateQuery = (q) => {
        setState({
            ...state,
            query: q
        })
    }

    const expandResults = (e, track, flag) => {
        track.additional_information = !track.additional_information
        if(updateParentSet && !flag){
            if(parseInt(track.track_id) in parentSet){
                delete parentSet[parseInt(track.track_id)]
                updateParentSet(false, track, parseInt(track.track_id))
                track.selected = false;
                e.target.className = e.target.className.replace('selected-track', '')
            }
            else{
                parentSet[parseInt(track.track_id)] = track
                updateParentSet(true, track, parseInt(track.track_id))
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
            headers: { "Content-Type": "application/json" },
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
            <div>
                <button onClick={() => searchData()} disabled={!state.buttonEnabled} className='pad-bottom'>Search</button>
                {!heading && <button className='pad-bottom no-margin' disabled={!state.buttonEnabled} onClick={clearResults}>Clear Results</button>}
                {!heading && <button className='pad-bottom no-margin' disabled={!state.buttonEnabled} onClick={showSelected}>Show Selected</button>}
            </div>
            <SongList searchResults={state.searchResults} expandResults={expandResults} cName={TABLE_STYLE} disableExpanding={disableExpanding}/>
            {state.searchResults.length === 0 && state.invokedPreviously && state.buttonEnabled &&
                <h1 className="no-results-container">No Results Found</h1>
            }
        </div>
    )
}

export default Search;