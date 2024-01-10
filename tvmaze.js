"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  try {
    const response = await $.ajax({
      url: `http://api.tvmaze.com/search/shows?q=${term}`,
      method: "GET",
    });

    return response.map((result) => ({
      id: result.show.id,
      name: result.show.name,
      summary: result.show.summary,
      image: result.show.image
        ? result.show.image.medium
        : "https://tinyurl.com/tv-missing",
    }));
  } catch (error) {
    console.error("Error fetching data: ", error);
    return [];
  }
}

/** Given list of shows, create markup for each and append to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>`
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  try {
    const response = await $.ajax({
      url: `http://api.tvmaze.com/shows/${id}/episodes`,
      method: "GET",
    });

    return response.map((episode) => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    }));
  } catch (error) {
    console.error("Error fetching episodes: ", error);
    return [];
  }
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $episodesArea.empty().show();

  const $episodeList = $("<ul>");

  episodes.forEach((episode) => {
    const $episodeItem = $(`<li>${episode.name} (Season ${episode.season}, Episode ${episode.number})</li>`);
    $episodeList.append($episodeItem);
  });

  $episodesArea.append($episodeList);
}

// Add click handler for "Episodes" button
$showsList.on("click", ".Show-getEpisodes", async function () {
  const showId = $(this).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});
