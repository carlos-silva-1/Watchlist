import React, { useState, useEffect, useRef } from 'react'
import Pagination from 'react-bootstrap/Pagination';
import Movie from './Movie'
import hasIntersection from './../util/hasIntersection'
import { sortMoviesAlphabetically, sortMoviesByRanking, sortMoviesByPopularity, sortMoviesByDate } from './Sort'
import { searchMovie, fetchPopular } from './../api/api_handler'

const MovieList = ({ favouriteMovies, movies, handleMovieClick, handleFavouritesClick, showMovies, showSeries, unselectedGenres, sortParameter, listType, searchValue, numMoviesPerPage = 5 }) => {
    const [pageNumber, setPageNumber] = useState(1)
    const [maxPageNumberReached, setMaxPageNumberReached] = useState(1)
    const [shouldFetchNextPage, setShouldFetchNextPage] = useState(false)
    const [shouldUpdateMovies, setShouldUpdateMovies] = useState(false)
    const updatedMovies = useRef()

    // fetches next page from API if 'Next' pagination button is clicked
    useEffect(() => {
        const fetchNextPage = async () => {
            if(listType === "search") {
                let searchResults = await searchMovie(searchValue, pageNumber)
                updatedMovies.current = movies.concat(searchResults)
            }
            else if (listType === "movie") {
                let fetchedPopularMovies = await fetchPopular("movie", pageNumber)
                updatedMovies.current = movies.concat(fetchedPopularMovies)
                localStorage.setItem('react-movie-app-popular-movies', JSON.stringify(updatedMovies.current))
            }
            else if (listType === "tv") {
                let fetchedPopularSeries = await fetchPopular("tv", pageNumber)
                updatedMovies.current = movies.concat(fetchedPopularSeries)
                localStorage.setItem('react-movie-app-popular-series', JSON.stringify(updatedMovies.current))
            }
            setShouldUpdateMovies(true)
        }

        if(shouldFetchNextPage) {
            fetchNextPage()
            setShouldFetchNextPage(false)
        }
    }, [shouldFetchNextPage])

    // rerenders the component so that a conditional that updates 'movies' can be executed
    useEffect(() => {
        if(shouldUpdateMovies === true)
            setShouldUpdateMovies(false)
    }, [shouldUpdateMovies])

    if(updatedMovies.current != null)
        movies = updatedMovies.current

    if(movies != null) {
        if(sortParameter.toLowerCase() === "alphabetically")
            sortMoviesAlphabetically(movies)
        else if(sortParameter.toLowerCase() === "ranking")
            sortMoviesByRanking(movies)
        else if(sortParameter.toLowerCase() === "popularity")
            sortMoviesByPopularity(movies)
        else if(sortParameter.toLowerCase() === "release date")
            sortMoviesByDate(movies)
    }

    const startIndex = pageNumber === 1? 0 : numMoviesPerPage*(pageNumber-1) // avoids negative index if at the start of array
    const endIndex = (numMoviesPerPage*pageNumber-1) > movies.length? movies.length-1 : (numMoviesPerPage*pageNumber-1) // avoids array out of bounds if at the end of array
    const pageOfMovies = movies.slice(startIndex, endIndex+1)

    if(pageOfMovies != null){
        return(
            <>
                <div>
                    <div className="row">
                        {pageOfMovies.map( (movie, index) => (
                            <>
                                {
                                    // renders the item if its a movie and 'showMovies' is checked, or if its a series and 'showSeries' is checked &&
                                    // renders the item if none of its genres are in 'unselectedGenres'
                                    ((showMovies && "release_date" in movie) || (showSeries && "first_air_date" in movie)) &&
                                    !hasIntersection(movie.genre_ids, unselectedGenres)? 
                                    <>
                                        <Movie movieData={movie} handleMovieClick={handleMovieClick} handleFavouritesClick={handleFavouritesClick} favouriteMovies={favouriteMovies} />
                                    </>
                                    :
                                    <>
                                    </>
                                }
                            </>
                        ))}
                    </div>
                
                    <div className="row d-flex justify-content-center mt-3 mr-5 mb-5 pb-3">
                        <Pagination className="mr-5 horizontal-center">
                            {
                                movies.length <= numMoviesPerPage?
                                <>
                                    <Pagination.Prev disabled id="pagination-disabled"/>
                                    <Pagination.Next disabled id="pagination-disabled"/>
                                </>
                                :
                                <>
                                    {
                                        pageNumber === 1?
                                        <>
                                            <Pagination.Prev disabled id="pagination"/>
                                        </>
                                        :
                                        <>
                                            <Pagination.Prev id="pagination" onClick={() => {setPageNumber(pageNumber - 1)}}/>
                                        </>
                                    }
                                    {
                                        listType === "mymoviequeue" &&
                                        endIndex + 1 >= movies.length?
                                        <>
                                            <Pagination.Next disabled id="pagination" />
                                        </>
                                        :
                                        <>
                                            <Pagination.Next id="pagination" 
                                                onClick={
                                                    () => {
                                                        let newPageNumber = pageNumber + 1 // used for the next if conditional because the value of the state 'pageNumber' updates asynchronously
                                                        setPageNumber(newPageNumber)
                                                        if((newPageNumber % 2 === 1) && (newPageNumber > maxPageNumberReached)) {
                                                            setMaxPageNumberReached(newPageNumber)
                                                            setShouldFetchNextPage(true)
                                                        }
                                                    }
                                                }
                                            />
                                        </>
                                    }
                                </>
                            }
                        </Pagination>
                    </div>
                </div>
            </>
        )
    }
    else{
        return(
            <>
            </>
        )
    }

}

export default MovieList