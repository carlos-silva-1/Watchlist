import React, { useState } from 'react'
import formatAsDollarAmount from './../util/formatAsDollar'
import ReactPlayer from 'react-player'
import movieTrailer from 'movie-trailer'

const getIMDBID = async (movie) => {
    const url = `https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${process.env.REACT_APP_TMDB_KEY}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ODJhMjdlM2QxYjU4NjlmNjc1MjQ5MTNjYTlhM2E4NCIsInN1YiI6IjY1ZDZiZGIxNjA5NzUwMDE2MjIzNTY5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.mr2YERxD-URJb64LONU5yXyPxMDtYs3mZr4CVr4yw3I'
      }
    };

    const response = await fetch(url, options)
    const responseJSON = await response.json()

    return responseJSON.imdb_id
}

const goToIMDBPage = async (movie) => {
    const imdb_id = await getIMDBID(movie)

    if(imdb_id){
      const imdbUrl = `https://www.imdb.com/title/${imdb_id}`
      window.open(imdbUrl)
    }
}

const MovieDetails = (props) => {
    const movie = props.movie
    const details = props.details
    const IMDBComponent = props.imdbComponent
    const [trailerURL, setTrailerURL] = useState("")

    movieTrailer(movie.title)
        .then((result) => {
            setTrailerURL(result)
        })
        .catch((error) => {
            console.error("Error:", error);
        });

    return(
        <>
        	<div className="row details-title">
                <div className="col-auto">
        		  <h1>{movie.title}</h1>
                </div>

                <div className="col-auto">
                    <div className="mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#FFC107" class="bi bi-star-fill" viewBox="0 0 16 16" className="mr-2 mb-2 pb-1">
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                        </svg>
                        <h3 className="d-inline mt-2">{details.vote_average} / 10</h3>
                        <h5 className="d-inline ml-3">({details.vote_count} votes)</h5>
                    </div>
                </div>
                
                <IMDBComponent handleIMDBClick={goToIMDBPage} movie={movie}/>
        	</div>

            <div className="row details-body mt-3">
                <div className="col-auto">
                    <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt='poster' className="details-poster"/>
                </div>

                <div className="col">
                    <div id="details-overview">
                        <h2 className="primary-color">Overview</h2>
                        {details.overview}
                    </div>

                    <div id="details-genres" className="mt-4">
                        <h2 className="primary-color">Genres</h2>
                        {details.genres.map( (genre, index) => (
                            <>
                                <span className="mr-4 d-inline">{genre.name}</span>
                            </>
                        ))}
                    </div>

                    <div id="details-release-date" className="mt-4">
                        <h2 className="primary-color">Release Date</h2>
                        {details.release_date}
                    </div>

                    <div id="details-runtime" className="mt-4">
                        <h2 className="primary-color">Runtime</h2>
                        {details.runtime} Minutes
                    </div>

                    <div className="mt-4">
                        <h2 className="primary-color">Budget</h2>
                        {formatAsDollarAmount(details.budget)}
                    </div>

                    <div className="mt-4">
                        <h2 className="primary-color">Revenue</h2>
                        {formatAsDollarAmount(details.revenue)}
                    </div>

                    <div id="details-companies" className="mt-4">
                        <h2 className="primary-color">Production Companies</h2>
                        {details.production_companies.map( (company, index) => (
                            <>
                                <span className="mr-4 d-inline">{company.name}</span>
                            </>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row trailer-wrapper mt-4 mr-3 mb-5">
                    <ReactPlayer className="react-player" width="80%" height="80%" url={trailerURL} controls={true} />
            </div>
        </>
    )
}

export default MovieDetails