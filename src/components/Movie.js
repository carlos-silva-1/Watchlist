import React, { useState } from 'react'
import Drop from './Dropdown';
import Favourite from './Favourite';
import truncateText from './../util/truncate'
import { getIMDBID } from './../util/imdbUtil'

const Movie = ({ movieData, handleMovieClick, handleFavouritesClick, favouriteMovies }) => {
	const [streamOptions, setStreamOptions] = useState({})

	const updateStreamOptions = async (movie) => {
		const imdb_id = await getIMDBID(movie)
		const url = `https://streaming-availability.p.rapidapi.com/v2/get/basic?country=us&imdb_id=${imdb_id}&output_language=en`;
		const options = {
		  method: 'GET',
		  headers: {
		    'X-RapidAPI-Key': process.env.REACT_APP_RAPID_KEY,
		    'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
		  }
		}

		try {
		  const response = await fetch(url, options);
		  const responseJSON = await response.json();
		  const streamingOptions = responseJSON.result.streamingInfo

		  if(Object.keys(streamingOptions).length !== 0){
		    const streamingOptionsUS = streamingOptions.us // The API only provides info for the US region
		    setStreamOptions(streamingOptionsUS)
		  }
		  else{
		    const noStreamingOptions = {}
		    setStreamOptions(noStreamingOptions)
		  }
		} catch (error) {
		  console.error(error);
		}
	}

	return(
        <>
        	<div className='d-flex justify-content-start m-3 image-container'>
                <img src={`https://image.tmdb.org/t/p/w500/${movieData.poster_path}`} alt='movie poster'
                    onClick={() => handleMovieClick(movieData)}></img>

                <div className='overlay stream-overlay d-flex align-items-center justify-content-center'
                     onMouseEnter={() => updateStreamOptions(movieData)}>
                    <Drop streamOptions={streamOptions}/>
                </div>
                
                <div className='overlay favourite-overlay d-flex align-items-center justify-content-center'
                     onClick={() => handleFavouritesClick(movieData)}>
                    <Favourite favouriteMovies={favouriteMovies} movie={movieData}/>
                </div>

                <div className='overlay title-overlay d-flex align-items-center justify-content-center'>
                    {
                        movieData.title !== undefined?
                        <>
                            {truncateText(movieData.title, 30)}
                        </>
                        :
                        <>
                            {truncateText(movieData.name, 30)}
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default Movie