let bookmarkedMovies = JSON.parse(localStorage.getItem("local-bookmarks")) || [];

let elSearchForm = $(".js-search-form");
let elSearchTitleInput = $(".js-search-form__title-input", elSearchForm);
let elSearchRatingInput = $(".js-search-form__rating-input", elSearchForm);
let elSearchGenreSelect = $(".js-search-form__genre-select", elSearchForm);
let elSearchSortSelect = $(".js-searching-form_sort-select", elSearchForm);

let elSearchResult = $(".search-result");
let elBookmarkedMovies = $(".bookmarked-movies");

let elSearchResultTemplate = $("#search-result-template").content;
let elBookmarkedMovieTemplate = $("#bookmarked-movie-template").content;

let elsBookmarkButton = $$(".js-movie-bookmark");

let elMovieInfoModal = $(".movie-info-modal");

let normalizedMovies = movies.map((movie, i) => {
    return {
        id: i + 1,
        title: movie.Title.toString(),
        fulltitle: movie.fulltitle,
        year: movie.movie_year,
        categories: movie.Categories.split("|").join(", "),
        summary: movie.summary,
        imdbRating: movie.imdb_rating,
        imdbId: movie.imdb_id,
        runtime: movie.runtime,
        language: movie.language,
        trailer: `https://www.youtube.com/watch?v=${movie.ytid}`,
        smallPoster: `http://i3.ytimg.com/vi/${movie.ytid}/hqdefault.jpg`,
        bigPoster: `https://i3.ytimg.com/vi/${movie.ytid}/maxresdefault.jpg`,
    }
})

let createGenreSelectOptions = function() {
    let movieCategories = [];

    normalizedMovies.splice(1000).forEach(function(movie) {
        movie.categories.split(", ").forEach(function(category) {
            if (!movieCategories.includes(category)) {
                movieCategories.push(category);
            }
        })
    })

    movieCategories.sort();

    let elOptionsFragment = document.createDocumentFragment();

    movieCategories.forEach(function(category) {
        let elCategoryOption = createElement("option", "", category);
        elCategoryOption.value = category;

        elOptionsFragment.appendChild(elCategoryOption);
        elSearchGenreSelect.appendChild(elOptionsFragment);
    })
}
createGenreSelectOptions();

let renderMovies = function(searchResults) {
    elSearchResult.innerHTML = "";

    let elResultFragment = document.createDocumentFragment();

    searchResults.forEach(function(movie) {
        let elMovie = elSearchResultTemplate.cloneNode(true);

        $(".search-result__item", elMovie).dataset.imdbId = movie.imdbId;

        $(".movie__title", elMovie).textContent = movie.title;
        $(".movie__poster", elMovie).src = movie.smallPoster;
        $(".movie__year", elMovie).textContent = movie.year;
        $(".movie__rating", elMovie).textContent = movie.imdbRating;
        $(".movie__trailer-link", elMovie).href = movie.trailer;

        elResultFragment.appendChild(elMovie);
    })

    elSearchResult.appendChild(elResultFragment);
}

let sortObjectsAZ = function(array) {
    return array.sort(function(a, b) {
        if (a.title > b.title) {
            return 1;
        } else if (a.title < b.title) {
            return -1;
        } else {
            return 0;
        }
    })
}

let sortObjectsHeightToLowRating = function(array) {
    return array.sort(function(a, b) {
        return b.imdbRating - a.imdbRating;
    })
}

let sortObjectsHeightNewToOld = function(array) {
    return array.sort(function(a, b) {
        return b.year - a.year;
    })
}

let sortSearchResults = function(results, sortType) {
    if (sortType === "az") {
        return sortObjectsAZ(results);
    } else if (sortType === "za") {
        return sortObjectsAZ(results).reverse();
    } else if (sortType === "rating_desc") {
        return sortObjectsHeightToLowRating(results);
    } else if (sortType === "rating_asc") {
        return sortObjectsHeightToLowRating(results).reverse();
    } else if (sortType === "year_desc") {
        return sortObjectsHeightNewToOld(results);
    } else if (sortType === "year_asc") {
        return sortObjectsHeightNewToOld(results).reverse();
    }
}

let findMovies = function(title, minRating, genre) {
    return normalizedMovies.filter(function(movie) {
        let doesMatchCategory = genre === "All" || movie.categories.includes(genre);

        return movie.title.match(title) && movie.imdbRating >= minRating && doesMatchCategory;
    });
}

elSearchForm.addEventListener("submit", function(evt) {
    evt.preventDefault();

    let searchTitle = elSearchTitleInput.value.trim();
    let movieTitleRegex = new RegExp(searchTitle, "gi");

    let minimumRating = Number(elSearchRatingInput.value);
    let genre = elSearchGenreSelect.value;
    let sorting = elSearchSortSelect.value;

    let searchResults = findMovies(movieTitleRegex, minimumRating, genre);
    sortSearchResults(searchResults, sorting);

    renderMovies(searchResults);
})

let renderBookmarkedMovie = function() {
    elBookmarkedMovies.innerHTML = "";

    let elBookmarkedMoviesFragment = document.createDocumentFragment();

    bookmarkedMovies.forEach(function(movie) {
        let elBookmarkedMovie = elBookmarkedMovieTemplate.cloneNode(true);

        $(".bookmarked-movie__title", elBookmarkedMovie).textContent = movie.title;
        $(".js-remove-bookmarked-movie-button", elBookmarkedMovie).dataset.imdbId = movie.imdbId;

        elBookmarkedMoviesFragment.appendChild(elBookmarkedMovie);
    })

    elBookmarkedMovies.appendChild(elBookmarkedMoviesFragment);
};
renderBookmarkedMovie();

let updateLocalBookmarks = function() {
    localStorage.setItem("local-bookmarks", JSON.stringify(bookmarkedMovies));
}

let bookmarkMovie = function(movie) {
    bookmarkedMovies.push(movie);
    updateLocalBookmarks();
    renderBookmarkedMovie();
}

elSearchResult.addEventListener("click", function(evt) {
    if (evt.target.matches(".js-movie-bookmark")) {
        let movieImdbId = evt.target.closest(".search-result__item").dataset.imdbId;

        let foundMovie = normalizedMovies.find(function(movie) {
            return movie.imdbId === movieImdbId;
        })

        let isBookmarked = bookmarkedMovies.find(function(movie) {
            return movie.imdbId === movieImdbId;
        })

        if (!isBookmarked) {
            bookmarkMovie(foundMovie);
        }
    }
})

elBookmarkedMovies.addEventListener("click", function(evt) {
    if (evt.target.matches(".js-remove-bookmarked-movie-button")) {
        let movieImdbId = evt.target.dataset.imdbId;

        let kinoIndeksi = bookmarkedMovies.findIndex(function(movie) {
            return movie.imdbId === movieImdbId;
        });

        console.log(kinoIndeksi);
        bookmarkedMovies.splice(kinoIndeksi, 1);

        renderBookmarkedMovie();
    }
});

let updateMovieModalContent = function(movie) {
    $(".movie-info-modal__title", elMovieInfoModal).textContent = movie.title;
    $(".modal-body", elMovieInfoModal).textContent = movie.summary;
}

elSearchResult.addEventListener("click", function(evt) {
    if (evt.target.matches(".js-movie-modal-opener")) {
        let movieImdbId = evt.target.closest(".search-result__item").dataset.imdbId;

        let foundMovie = normalizedMovies.find(function(movie) {
            return movie.imdbId === movieImdbId;
        })
        updateLocalBookmarks();
        updateMovieModalContent(foundMovie);
    }
})