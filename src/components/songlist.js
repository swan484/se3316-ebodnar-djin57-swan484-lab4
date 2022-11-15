import React, { useEffect, useState } from "react";
import './styles/songlist.css'

const UNKNOWN = "Unknown"
const YOUTUBE_URL = "https://www.youtube.com/results?search_query="

const SongList = ({searchResults, expandResults, cName}) => {
    const getYoutubeLink = (title, artist) => {
        var mappedTitle = title || ""
        if(title.toString().includes(" ")) mappedTitle = title.replace(" ", "+")
        var mappedArtist = artist || ""
        if(artist.toString().includes(" ")) mappedArtist = artist.replace(" ", "+")
        return `${YOUTUBE_URL}${mappedTitle}+by+${mappedArtist}`
    }

    return (
        <ul className={"search-table " + cName} >
            {searchResults.length > 0 && 
                <div className="heading-row table-row">
                    <li>
                        <p className="title">TRACK TITLE</p>
                        <p className="artist">ARTIST</p>
                        <p className="album">ALBUM</p>
                        <p className="duration">TIME</p>
                    </li>
                </div>
            }
            {searchResults.map(item => (
                <div className="table-row" key={item.track_id} value={item.track_id} >
                    <li onClick={(e) => expandResults(e, item)}>
                        <p className="title">{item.track_title || UNKNOWN}</p>
                        <p className="artist">{item.artist_name || UNKNOWN}</p>
                        <p className="album">{item.album_title || UNKNOWN}</p>
                        <p className="duration">{item.track_duration || 'N/A'}</p>
                    </li>
                    {item.additional_information && 
                        <li className="track-details">
                            <p><a href={getYoutubeLink(item.track_title, item.artist_name)} target='_blank'>Play on YouTube</a></p>
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
                </div>
            ))}
        </ul>
    )
}

export default SongList;