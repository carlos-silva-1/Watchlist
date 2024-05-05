import React, { useState, useEffect, useRef } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import MovieList from './components/MovieList';
import MovieListHeading from './components/MovieListHeading';
import Searchbox from './components/Searchbox';
import MovieDetails from './components/MovieDetails';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Filter from './components/Filter';
import Sort from './components/Sort';
import genres from './resources/genres.json';
import { searchMovie, fetchPopular, getDetails } from './api/api_handler'
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';

function App() {
  const [searchResults, setSearchResults] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [popularSeries, setPopularSeries] = useState([])
  const [favourites, setFavourites] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [selectedMovie, setSelectedMovie] = useState({})
  const [movieHasBeenSelected, setMovieHasBeenSelected] = useState(false)
  const [selectedMovieDetails, setSelectedMovieDetails] = useState({})
  const [showMovies, setShowMovies] = useState(true)
  const [showSeries, setShowSeries] = useState(true)
  const [unselectedGenres, setUnselectedGenres] = useState([])
  const [sortParameter, setSortParameter] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const filterRef = useRef(null)
  const sortRef = useRef(null)

  useEffect(() => {
    const fetchSearchResults = async () => {
      const fetchedMovies = await searchMovie(searchValue)
      setSearchResults(fetchedMovies)
    }

    fetchSearchResults()
  }, [searchValue])

  useEffect(() => {
    getFavouriteMovies()
  }, [])

  useEffect(() => { // Updates popular movies/series once per day
    const lastUpdateDate = localStorage.getItem('lastUpdateDate');
    const currentDate = new Date().toLocaleDateString();

    const fetchPopularMoviesAndSeries = async () => {
      const fetchedMovies = await fetchPopular("movie")
      const fetchedSeries = await fetchPopular("tv")
      setPopularMovies(fetchedMovies)
      setPopularSeries(fetchedSeries)
      localStorage.setItem('react-movie-app-popular-movies', JSON.stringify(fetchedMovies))
      localStorage.setItem('react-movie-app-popular-series', JSON.stringify(fetchedSeries))
      localStorage.setItem('lastUpdateDate', currentDate);
    }
    
    if (lastUpdateDate !== currentDate) {
      fetchPopularMoviesAndSeries()
    }
    else {
      getPopularMovies()
      getPopularSeries()
    }
  }, []);

  const getFavouriteMovies = () => {
    const favouriteList = JSON.parse(localStorage.getItem('react-movie-app-favourites'))
    setFavourites(favouriteList)
  }

  const saveFavouritesToLocalStorage = (items) => {
    localStorage.setItem('react-movie-app-favourites', JSON.stringify(items))
  }

  const handleFavouriteMovie = async (movie) => {
    let favouriteMoviesIDs = []
    if(favourites !== null)
      favouriteMoviesIDs = favourites.map(obj => obj.id);
    
    if(favouriteMoviesIDs.includes(movie.id)) {
      removeFavouriteMovie(movie)
    }
    else {
      addFavouriteMovie(movie)
    }
  }

  const addFavouriteMovie = async (movie) => {
    let newFavouriteList = []

    if(favourites !== null)
      newFavouriteList = [...favourites, movie]
    else
      newFavouriteList = [movie]

    setFavourites(newFavouriteList)
    saveFavouritesToLocalStorage(newFavouriteList)
  }

  const removeFavouriteMovie = (movie) => {
    const newFavouriteList = favourites.filter((favourite) => (
      favourite.id !== movie.id
    ))
    setFavourites(newFavouriteList)
    saveFavouritesToLocalStorage(newFavouriteList)
  }

  const getPopularMovies = () => {
    const popularMoviesList = JSON.parse(localStorage.getItem('react-movie-app-popular-movies'))
    setPopularMovies(popularMoviesList)
  }

  const getPopularSeries = () => {
    const popularSeriesList = JSON.parse(localStorage.getItem('react-movie-app-popular-series'))
    setPopularSeries(popularSeriesList)
  }

  const showMovieDetails = async (movie) => {
    const details = await getDetails(movie)

    setSelectedMovie(movie)
    setSelectedMovieDetails(details)
    setMovieHasBeenSelected(true)
  }

  const handleMoviesCheckboxChange = () => {
    if(showMovies)
      setShowMovies(false)
    else
      setShowMovies(true)
  }

  const handleSeriesCheckboxChange = () => {
    if(showSeries)
      setShowSeries(false)
    else
      setShowSeries(true)
  }

  const handleFilterGenre = (unselectedGenresArray) => {
    setUnselectedGenres(unselectedGenresArray)
  }

  const handleSortClick = (selectedSortParameter) => {
    setSortParameter(selectedSortParameter)
  }

  return (
    <div className="position-relative">

      {/* HEADER */}
      <div id="header" className='d-flex justify-content-between bg-dark-custom z-1'>
        <Navbar expand="lg" variant="dark" className="pl-5">
          <Container>
            <Navbar.Brand href="/index.html" id='brand'>MyMovieQueue</Navbar.Brand>
            <Navbar.Toggle id="navbar-hamburger-icon"/>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav>
                <Nav.Item className="mr-2">
                  <Button id="filter-btn" variant="outline-warning" ref={filterRef} onClick={() => setShowFilter(!showFilter)}>Filter &#x25BC;</Button>
                  <Overlay target={filterRef.current} show={showFilter} placement="bottom">
                    {(props) => (
                      <Tooltip id="tooltip-overlay" {...props}>
                        <Filter showMovies={showMovies} showSeries={showSeries} changeShowMovies={handleMoviesCheckboxChange} changeShowSeries={handleSeriesCheckboxChange}
                          genres={genres} unselectedGenres={unselectedGenres} handleFilterGenre={handleFilterGenre}/>
                      </Tooltip>
                    )}
                  </Overlay>
                </Nav.Item>

                <Nav.Item>
                  <Button id="sort-btn" variant="outline-warning" ref={sortRef} onClick={() => setShowSort(!showSort)}>Sort &#x25BC;</Button>
                  <Overlay target={sortRef.current} show={showSort} placement="bottom">
                    {(props) => (
                      <Tooltip id="tooltip-overlay" {...props}>
                        <Sort sortParameter={sortParameter} handleSortClick={handleSortClick}/>
                      </Tooltip>
                    )}
                  </Overlay>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div className="d-flex justify-content-end pr-4 mr-5">
          <Searchbox searchValue={searchValue} setSearchValue={setSearchValue}/>
          <Button variant="outline-warning" className="m-3" id='login-btn'>Login</Button>
          <Button variant="outline-warning" className="mt-3" id='sign-up-btn'>Sign Up</Button>
        </div>
      </div>

      <div>
        {/* BODY */}
        {
          // If a movie has been clicked, show its details
          movieHasBeenSelected === true?
          <>
            <MovieDetails movie={selectedMovie} details={selectedMovieDetails}/>
          </>
          :
          <>
            {
              // IF A SEARCH IS BEING MADE, ONLY SHOW THE SEARCH RESULTS. ELSE SHOW MOVIE QUEUES
              searchValue !== ''?
              <>
                {/* SEARCH RESULTS */}
                <div className="movie-queue">
                  <div className='d-flex justify-content-center'>
                    <MovieListHeading heading='Search Results'/>
                  </div>

                  <div className="d-flex justify-content-center">
                    <MovieList movies={searchResults} listType={"search"} searchValue={searchValue}
                    sortParameter={sortParameter} unselectedGenres={unselectedGenres}
                    showMovies={showMovies} showSeries={showSeries}
                    handleFavouritesClick={handleFavouriteMovie} favouriteMovies={favourites}
                    handleMovieClick={showMovieDetails} />
                  </div>
                </div>
              </>
              :
              <>
                {/* MY MOVIE QUEUE */}
                {
                  favourites != null && favourites.length !== 0 && 
                  (showMovies === true || showSeries === true)?
                  <>
                    <div className="movie-queue first-movie-list pb-5 mt-5">
                      <div className='d-flex justify-content-center'>
                        <MovieListHeading heading='My Movie Queue'/>
                      </div>

                      <div className="d-flex justify-content-center">
                        <MovieList movies={favourites} listType={"mymoviequeue"}
                        sortParameter={sortParameter} unselectedGenres={unselectedGenres}
                        showMovies={showMovies} showSeries={showSeries}
                        handleFavouritesClick={handleFavouriteMovie} favouriteMovies={favourites} 
                        handleMovieClick={showMovieDetails}/>
                      </div>
                    </div>
                  </>
                  :
                  <>
                  </>
                }

                {/* POPULAR MOVIES QUEUE */}
                {
                  showMovies === true?
                  <>
                    <div className="movie-queue pb-5 mt-5">
                      <div className='d-flex justify-content-center'>
                        <MovieListHeading heading='Popular Movies'/>
                      </div>

                      <div className="d-flex justify-content-center">
                        <MovieList movies={popularMovies} listType={"movie"}
                        sortParameter={sortParameter} unselectedGenres={unselectedGenres}
                        showMovies={showMovies} showSeries={showSeries} 
                        handleFavouritesClick={handleFavouriteMovie} favouriteMovies={favourites} 
                        handleMovieClick={showMovieDetails}/>
                      </div>
                    </div>
                  </>
                  :
                  <>
                  </>
                }

                {/* POPULAR SERIES QUEUE */}
                {
                  showSeries === true?
                  <>
                    <div className="movie-queue mt-5">
                      <div className='d-flex justify-content-center'>
                        <MovieListHeading heading='Popular Series'/>
                      </div>

                      <div className="d-flex justify-content-center">
                        <MovieList movies={popularSeries} listType={"tv"}
                        sortParameter={sortParameter} unselectedGenres={unselectedGenres}
                        showMovies={showMovies} showSeries={showSeries}
                        handleFavouritesClick={handleFavouriteMovie} favouriteMovies={favourites}
                        handleMovieClick={showMovieDetails}/>
                      </div>
                    </div>
                  </>
                  :
                  <>
                  </>
                }
              </>
            }
          </>
        }
      </div>
    </div>
  );
}

export default App;
