import React, { useEffect, useState } from "react";
import './styles/search.css'

const UNKNOWN = "Unknown"

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
            <label className="sub">Separate searches by commas</label>
            <input autoCorrect="false" type='text' onChange={updateSearch}/>
        </div>
    )
}

const Search = () => {
    const [state, setState] = useState({
        query: '',
        buttonEnabled: true,
        searchResults: []
    }) 

    const searchData = () => {
        console.log("Searching data")
        toggleButtonEnabled(false)
        fetch(`http://localhost:3001/api/search/${state.query}`)
            .then((a) => {
                return a.json()
            })
            .then((a) => {
                setState({
                    ...state,
                    searchResults: a
                })
                console.log("Finished search")
            })
            .catch(() => {
                toggleButtonEnabled(true)
            })
    }

    const updateQuery = (q) => {
        setState({
            ...state,
            query: q
        })
    }
    const toggleButtonEnabled = (val) => {
        setState({
            ...state,
            buttonEnabled: val
        })
    }

    const expandResults = (e, track) => {
        console.log(e)
        console.log(track)
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
            <ul className="search-table" >
                {state.searchResults.length > 0 && 
                    <div className="heading-row table-row">
                        <li>
                            <p className="title">TRACK TITLE</p>
                            <p className="artist">ARTIST</p>
                            <p className="album">ALBUM</p>
                            <p className="duration">TIME</p>
                        </li>
                    </div>
                }
                {state.searchResults.map(item => (
                    <div className="table-row" key={item.track_id} value={item.track_id} onClick={(e) => expandResults(e, item)} >
                        <li>
                            <p className="title">{item.track_title}</p>
                            <p className="artist">{item.artist_name}</p>
                            <p className="album">{item.album_title}</p>
                            <p className="duration">{item.track_duration}</p>
                        </li>
                        {item.additional_information && 
                            <li className="track-details">
                                <p>Date Created: {item.track_date_created || UNKNOWN}</p>
                                <p>Date Recorded: {item.track_date_recorded || UNKNOWN}</p>
                                <p>Listens: {item.track_listens || UNKNOWN}</p>
                                <p>Genres: </p>
                                {item.track_genres.map(g => (
                                    <div className="track-genre">
                                        <p key={g.genre_title}>- {g.genre_title}</p>
                                    </div>
                                ))}
                            </li>
                        }
                    </div>
                ))}
            </ul>
        </div>
    )
}

export default Search;