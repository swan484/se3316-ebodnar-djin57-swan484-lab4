import React, { useEffect, useState } from "react";
import SongList from "./songlist";
import './styles/search.css'

const TABLE_STYLE = "narrow-width heavy-bottom-pad"

const SearchBar = ({setQuery}) => {
    const [search, setSearch] = useState('');

    useEffect(() => {
        setQuery(search)
    }, [search])

    const updateSearch = (s) => {
        setSearch(s.target.value)
    }

    return (
        <div className='form narrow'>
            <label>Search any combination of artist, genre, and track title</label>
            <label className="sub">Note that tracks must match ALL searches</label>
            <label className="sub sub-bottom">Separate searches by commas</label>
            <input autoCorrect="false" type='text' onChange={updateSearch}/>
        </div>
    )
}

const Search = () => {
    const [state, setState] = useState({
        query: '',
        buttonEnabled: true,
        searchResults: [],
        invokedPreviously: false
    }) 

    useEffect(() => {
        console.log(`Invoked previously: ${state.invokedPreviously}`)
    }, [state.invokedPreviously])

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
            setState({
                ...state,
                searchResults: a,
                invokedPreviously: true,
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

    const updateQuery = (q) => {
        setState({
            ...state,
            query: q
        })
    }

    const expandResults = (e, track) => {
        track.additional_information = !track.additional_information
        setState({
            ...state,
            searchResults: state.searchResults
        })
    }

    return(
        <div>
            <h1>Search</h1>
            <SearchBar setQuery={updateQuery}/>
            <button onClick={() => searchData()} disabled={!state.buttonEnabled} className='pad-bottom'>Search</button>
            <SongList searchResults={state.searchResults} expandResults={expandResults} cName={TABLE_STYLE}/>
            {state.searchResults.length === 0 && state.invokedPreviously && state.buttonEnabled &&
                <h1 className="no-results-container">No Results Found</h1>
            }
        </div>
    )
}

export default Search;