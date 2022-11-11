const artistErrorMsg = "Artist Unavailable";
const badInputMsg = "Invalid Input";
const trackErrorMsg = "Track Unavailable";
const artist = "artist";
const artists = "artists";
const track = "track";
const tracks = "tracks";
const playlistCreateError = "Cannot Create Playlist";
const playlistUpdateError = "Cannot Update Playlist";
const updateSuccess = "Successfully Updated playlist";
const errorSignalClass = "error-signal";
const smallErrorClass = "error-signal small-error";
const sortMessage = "Click a header to sort by that parameter";
const playlistViewError = "Cannot View Playlist";
const playlistDeleteError = "Cannot Delete Playlist";
const playlistAllError = "Playlists cannot be found";

//ec2-100-24-157-29.compute-1.amazonaws.com
const baseURL = "http://ec2-100-24-157-29.compute-1.amazonaws.com:3000/api";

document.addEventListener("DOMContentLoaded", function () {
  getGenres = document.querySelector("#getGenres");
  if (getGenres) {
    getGenres.addEventListener("click", async () => {
      let contents = document.getElementById("contents");
      let results = document.getElementById("searchResults");
      showLoadingMessage(results);
      const genres = await fetch(`${baseURL}/genres`);
      const genresData = await genres.json();
      results.textContent = "";

      if (contents.childElementCount > 0) {
        contents.textContent = "";
        getGenres.textContent = "Get All Genres";
      } else {
        fillGenres(genresData, contents);
        getGenres.textContent = "Clear Results";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("navbar");
  if (element) {
    element.addEventListener("click", navbarClick);
  }
});

function navbarClick(event) {
  let activeTabs = document.querySelectorAll(".active");
  if (!event.target.name) return;

  activeTabs.forEach((tab) => {
    tab.className = tab.className.replace("active", "");
  });

  event.target.parentElement.className += " active";
  document.getElementById(event.target.href.split("#")[1]).className +=
    " active";
}

document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector("#submit_search");
  if (button) {
    button.addEventListener("click", delegateSearch);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector("#submit-str");
  if (button) {
    button.addEventListener("click", delegateStringSearch);
  }
});

function delegateSearch() {
  var button = document.querySelector("#submit_search");
  switch (button.name) {
    case "artist_search":
      console.log("Searching for Artist");
      search(artist);
      break;
    case "track_search":
      console.log("Searching for Track");
      search(track);
      break;
  }
}

function delegateStringSearch() {
  var button = document.querySelector("#submit-str");
  switch (button.name) {
    case "artist-str":
      console.log("Searching for Artist by String");
      complexSearch(artists);
      break;
    case "track-str":
      console.log("Searching for Track by String");
      complexSearch(tracks);
      break;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var func = document.querySelector("#func");
  if (func) {
    var searchBar = document.querySelector("#search_id");
    var button = document.querySelector("#submit_search");
    var results = document.querySelector("#searchResults");
    var complexButton = document.querySelector("#submit-str");
    var strSearch = document.querySelector("#str-search");
    var numInput = document.querySelector("#num-limit");
    func.addEventListener("change", (e) => {
      results.textContent = "";
      switch (func.value) {
        case track:
          searchBar.placeholder = "Search by Track ID";
          strSearch.placeholder = "Search Tracks";
          button.name = "track_search";
          complexButton.name = "track-str";
          numInput.disabled = false;
          break;
        case artist:
          searchBar.placeholder = "Search by Artist ID";
          strSearch.placeholder = "Search Artists";
          button.name = "artist_search";
          complexButton.name = "artist-str";
          numInput.disabled = true;
          numInput.value = "";
          break;
      }
    });
    return true;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var id = document.querySelector("#search_id");
  if (id) {
    id.addEventListener("paste", (e) => {
      data = e.clipboardData;
      pastedData = data.getData("Text");
      for (c of pastedData) {
        if (c < "0" || c > "9") {
          e.preventDefault();
          return false;
        }
      }
    });
    return true;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector("#create-playlist");
  if (button) {
    button.addEventListener("click", createPlaylist);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector("#modify-playlist");
  if (button) {
    button.addEventListener("click", modifyPlaylist);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var id = document.querySelector("#search_id");
  if (id) {
    id.addEventListener("keypress", (e) => {
      if (e.keyCode == 13) delegateSearch();
      if (!(e.keyCode >= 48 && e.keyCode <= 57 && !e.shiftKey)) {
        e.preventDefault();
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var id = document.querySelector("#num-limit");
  if (id) {
    id.addEventListener("keypress", (e) => {
      if (e.keyCode == 13) delegateSearch();
      if (!(e.keyCode >= 48 && e.keyCode <= 57 && !e.shiftKey)) {
        e.preventDefault();
      }
    });
  }
});

async function createPlaylist() {
  var parent = document.getElementById("call-results");
  var text = document.querySelector("#playlist");
  showLoadingMessage(parent);

  const parsedText = parseTextArea(text.value);

  var title = document.querySelector("#playlist-title");
  const jsonTitle = title.value;

  var payload = {
    list_name: jsonTitle,
    tracks: parsedText,
  };

  const results = await fetch(`${baseURL}/playlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (results.status === 400 || results.status === 404) {
    getErrorMessage(
      parent,
      results.status,
      results.statusText,
      playlistCreateError,
      smallErrorClass
    );
    return console.log("error 400");
  }

  const data = await results.json();

  showCreateSuccess(data, parent);
  console.log(data);
}

async function modifyPlaylist() {
  var parent = document.getElementById("call-results");
  var text = document.querySelector("#playlist");
  showLoadingMessage(parent);

  const parsedText = parseTextArea(text.value);

  var title = document.querySelector("#playlist-title");
  const jsonTitle = title.value;

  var payload = {
    list_name: jsonTitle,
    tracks: parsedText,
  };

  const results = await fetch(`${baseURL}/playlist`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (results.status === 400 || results.status === 404) {
    getErrorMessage(
      parent,
      results.status,
      results.statusText,
      playlistUpdateError,
      smallErrorClass
    );
    return console.log(`Error ${results.status}`);
  }

  showUpdateSuccess(title.value, parsedText, parent);
}

function parseTextArea(text) {
  const parsedText = [];
  text.split(",").forEach((elem) => {
    parsedText.push(elem.trim());
  });
  return parsedText;
}

async function search(pathname) {
  var id = document.querySelector("#search_id");
  let contents = document.getElementById("searchResults");
  showLoadingMessage(contents);
  var intID = parseInt(id.value);
  if (Number.isNaN(intID)) {
    contents.textContent = "";
    return;
  }
  const results = await fetch(`${baseURL}/${pathname}/${intID}`);
  if (results.status === 404) {
    if (pathname === "track")
      getErrorMessage(
        contents,
        results.status,
        results.statusText,
        trackErrorMsg,
        errorSignalClass
      );
    else
      getErrorMessage(
        contents,
        results.status,
        results.statusText,
        artistErrorMsg,
        errorSignalClass
      );
    return;
  }
  if (results.status === 400) {
    getErrorMessage(
      contents,
      results.status,
      results.statusText,
      badInputMsg,
      errorSignalClass
    );
    return;
  }
  const data = await results.json();

  if (pathname === artist) createArtist(data[0], contents);
  if (pathname === track) createTrack(data[0], contents);
}

async function complexSearch(pathname) {
  var query = document.querySelector("#str-search");
  var num = document.querySelector("#num-limit").value || "None";
  var contents = document.getElementById("searchResults");
  showLoadingMessage(contents);

  var url = `${baseURL}/${pathname}/${query.value}`;
  if (pathname === "tracks") {
    var url = `${baseURL}/${pathname}/${query.value}/${num}`;
  }

  const results = await fetch(url);
  if (results.status === 404) {
    if (pathname === "tracks")
      getErrorMessage(
        contents,
        results.status,
        results.statusText,
        trackErrorMsg,
        errorSignalClass
      );
    else
      getErrorMessage(
        contents,
        results.status,
        results.statusText,
        artistErrorMsg,
        errorSignalClass
      );
    return;
  }
  if (results.status === 400) {
    getErrorMessage(
      contents,
      results.status,
      results.statusText,
      badInputMsg,
      errorSignalClass
    );
    return;
  }
  const data = await results.json();

  if (pathname === artists) {
    const [div, table] = makeArtistHeaders(data, contents);
    showArtists(data, contents, div, table);
  }
  if (pathname === tracks) {
    const [div, table] = makeHeaders(data, contents);
    showTracks(data, contents, div, table);
  }
}

function showCreateSuccess(creation, parentElement) {
  parentElement.textContent = "";
  const head = document.createElement("div");
  head.className = "callResults";

  const title = document.createElement("h3");
  const titleNode = document.createTextNode(
    `Successfully created Playlist ${creation.id}`
  );
  title.appendChild(titleNode);

  const name = document.createElement("p");
  const nameNode = document.createTextNode(`Playlist name: ${creation.title}`);
  name.appendChild(nameNode);

  const songs = document.createElement("p");
  const songsNode = document.createTextNode(`Tracks: ${creation.tracks}`);
  songs.appendChild(songsNode);

  const clear = document.createElement("p");
  clear.className = "clear-popup";
  clear.textContent = "Clear";
  clear.addEventListener("click", () => {
    parentElement.textContent = "";
  });

  head.appendChild(title);
  head.appendChild(name);
  head.appendChild(songs);
  head.appendChild(clear);

  parentElement.appendChild(head);
}

function showUpdateSuccess(playlist, tracks, parentElement) {
  parentElement.textContent = "";
  const head = document.createElement("div");
  head.className = "callResults";

  const title = document.createElement("h3");
  const titleNode = document.createTextNode(`Successfully updated Playlist`);
  title.appendChild(titleNode);

  const songs = document.createElement("p");
  const songsNode = document.createTextNode(`Tracks: ${tracks}`);
  songs.appendChild(songsNode);

  const clear = document.createElement("p");
  clear.className = "clear-popup";
  clear.textContent = "Clear";
  clear.addEventListener("click", () => {
    parentElement.textContent = "";
  });

  head.appendChild(title);
  head.appendChild(songs);
  head.appendChild(clear);

  parentElement.appendChild(head);
}

function fillGenres(genresData, parentElement) {
  for (genre of genresData) {
    var item = document.createElement("li");

    var id = document.createElement("div");
    id.className = "number";
    const idNode = document.createTextNode(genre.id);
    id.appendChild(idNode);

    var pid = document.createElement("p");
    const pidNode = document.createTextNode(`Parent: ${genre.parent_id}`);
    pid.appendChild(pidNode);

    var headDiv = document.createElement("div");
    headDiv.className = "genre-head";
    var name = document.createElement("h3");
    const nameNode = document.createTextNode(genre.name);
    name.appendChild(nameNode);
    headDiv.appendChild(id);
    headDiv.appendChild(name);

    item.appendChild(headDiv);
    item.appendChild(pid);
    parentElement.appendChild(item);
  }
  return parentElement;
}

function createArtist(artistData, parentElement) {
  parentElement.textContent = "";
  var div = document.createElement("div");
  div.className = "artist align-items";

  var infoBlock = document.createElement("div");
  infoBlock.className = "info-block";

  var name = document.createElement("h2");
  var nameNode = document.createTextNode(artistData.name);
  name.appendChild(nameNode);
  name.className = "artist-name";

  var id = document.createElement("h1");
  id.className = "artist-number";
  var idNode = document.createTextNode(`Artist ${artistData.id}`);
  id.appendChild(idNode);

  infoBlock.appendChild(id);
  infoBlock.appendChild(name);

  var expandArea = document.createElement("div");

  var readmore = document.createElement("p");
  readmore.id = "readmore";
  readmore.className = "readmore";
  readmore.textContent = "Read More";
  readmoreEventSetup(artistData, readmore, infoBlock);
  infoBlock.appendChild(readmore);

  var img = document.createElement("img");
  img.src = artistData.image;

  div.appendChild(img);
  div.appendChild(infoBlock);
  div.appendChild(expandArea);

  const clear = document.createElement("p");
  clear.className = "clear-popup";
  clear.textContent = "Clear";
  clear.addEventListener("click", () => {
    parentElement.textContent = "";
  });
  div.appendChild(clear);

  parentElement.appendChild(div);
  return parentElement;
}

function readmoreEventSetup(artistData, readmore, expandArea) {
  if (!readmore) return;
  let elements = [];
  readmore.addEventListener("click", () => {
    if (readmore.textContent === "Read More") {
      readmore.textContent = "Close";
      elements = appendReadmoreData(artistData, expandArea);
    } else {
      readmore.textContent = "Read More";
      for (elem of elements) {
        elem.remove();
      }
    }
  });
}

function appendReadmoreData(artistData, expandArea) {
  var link = document.createElement("a");
  link.href = artistData.url;
  link.textContent = `Link to Free Music Archive page`;
  link.target = "_blank";

  var website = document.createElement("a");
  if (artistData.website.length === 0) {
    website = document.createElement("p");
    website.className = "unavailable";
    website.textContent = "Website unavailable";
  } else {
    website.href = artistData.website;
    website.textContent = `Artist's website`;
    website.target = "_blank";
  }

  var city = document.createElement("p");
  const cityNode = document.createTextNode(
    "Location: " +
      (artistData.location.length > 0 ? artistData.location : "Unknown")
  );
  city.appendChild(cityNode);
  city.className = "city";

  expandArea.appendChild(city);
  expandArea.appendChild(website);
  expandArea.appendChild(link);

  return [city, website, link];
}

function getErrorMessage(location, errorcode, errormsg, errorstr, className) {
  location.textContent = "";

  let div = document.createElement("div");
  div.classList = className;

  let img = document.createElement("img");
  img.src = "https://i.imgur.com/w8FQL2k.png";

  let head = document.createElement("h1");
  head.textContent = errorstr;

  let desc = document.createElement("p");
  desc.textContent = `${errorcode} Error: ${errormsg}`;

  const clear = document.createElement("p");
  clear.className = "clear-popup";
  clear.textContent = "Clear";
  clear.addEventListener("click", () => {
    location.textContent = "";
  });

  div.appendChild(img);
  div.appendChild(head);
  div.appendChild(desc);
  div.appendChild(clear);
  location.appendChild(div);
}

function createTrack(trackData, parentElement) {
  parentElement.textContent = "";
  var div = document.createElement("div");
  div.className = "album align-items";

  var infoBlock = document.createElement("div");
  infoBlock.className = "track-block";

  var name = document.createElement("h1");
  const nameNode = document.createTextNode(
    `${trackData.id}: ${trackData.track_title}`
  );
  name.appendChild(nameNode);

  var artist = document.createElement("p");
  const artistNode = document.createTextNode(
    `Artist: ${trackData.artist_name}`
  );
  artist.appendChild(artistNode);

  var album = document.createElement("p");
  const albumNode = document.createTextNode(`Album: ${trackData.album_title}`);
  album.appendChild(albumNode);

  var leftDiv = document.createElement("div");
  leftDiv.classList = "track-contents";

  var heading = document.createElement("h4");
  heading.textContent = "Song Details";

  var albumId = document.createElement("p");
  const albumIdNode = document.createTextNode(
    `Album ID: ${trackData.album_id}`
  );
  albumId.appendChild(albumIdNode);

  var artistId = document.createElement("p");
  const artistIdNode = document.createTextNode(
    `Artist ID: ${trackData.artist_id}`
  );
  artistId.appendChild(artistIdNode);

  var trackNo = document.createElement("p");
  const trackNoNode = document.createTextNode(
    `Track Number: ${trackData.track_number}`
  );
  trackNo.appendChild(trackNoNode);

  var tags = document.createElement("p");
  const tagsNode = document.createTextNode(
    "Tags: " + (trackData.tags === "[]" ? "None" : trackData.tags)
  );
  tags.appendChild(tagsNode);

  var creDate = trackData.track_date_created;
  var parsedDate = creDate.substring(0, 10) + " at " + creDate.substring(11);
  var cDate = document.createElement("p");
  const cDateNode = document.createTextNode(`Created on ${parsedDate}`);
  cDate.appendChild(cDateNode);

  var recDate = document.createElement("p");
  const recDateNode = document.createTextNode(
    `Recorded on ${trackData.track_date_recorded}`
  );
  recDate.appendChild(recDateNode);

  var duration = document.createElement("p");
  const durationNode = document.createTextNode(
    `Duration: ${trackData.track_duration}`
  );
  duration.appendChild(durationNode);

  leftDiv.appendChild(heading);
  leftDiv.appendChild(albumId);
  leftDiv.appendChild(artistId);
  leftDiv.appendChild(trackNo);
  leftDiv.appendChild(tags);
  leftDiv.appendChild(cDate);
  leftDiv.appendChild(recDate);
  leftDiv.appendChild(duration);

  var rightDiv = document.createElement("div");
  rightDiv.className = "track-contents";

  var genreHeading = document.createElement("h4");
  genreHeading.textContent = "Genre Details";
  rightDiv.appendChild(genreHeading);

  if (trackData.track_genres.length === 0) {
    const noData = document.createElement("p");
    noData.textContent = "No Data Available";
    rightDiv.appendChild(noData);
  }
  for (genre of trackData.track_genres) {
    var id = document.createElement("p");
    const idNode = document.createTextNode(`Genre ID: ${genre.genre_id}`);
    id.appendChild(idNode);

    var title = document.createElement("p");
    const titleNode = document.createTextNode(genre.genre_title);
    title.appendChild(titleNode);

    var url = document.createElement("a");
    url.href = genre.genre_url;
    url.textContent = "FMA genre page";
    url.target = "_blank";

    rightDiv.appendChild(id);
    rightDiv.appendChild(title);
    rightDiv.appendChild(url);
  }

  infoBlock.appendChild(name);
  infoBlock.appendChild(artist);
  infoBlock.appendChild(album);
  infoBlock.appendChild(leftDiv);
  infoBlock.appendChild(rightDiv);

  const clear = document.createElement("p");
  clear.className = "clear-popup";
  clear.textContent = "Clear";
  clear.addEventListener("click", () => {
    parentElement.textContent = "";
  });
  infoBlock.appendChild(clear);

  div.appendChild(infoBlock);
  parentElement.appendChild(div);
  return parentElement;
}

function makeHeaders(trackData, parentElement) {
  var div = document.createElement("div");
  div.className = "align-items";

  var table = document.createElement("table");
  table.className = "tracks-table";

  var heading = document.createElement("h3");
  heading.textContent = sortMessage;
  table.appendChild(heading);

  const headRow = document.createElement("tr");

  const headTrack = document.createElement("th");
  headTrack.textContent = "Track";
  headTrack.name = "track_title";

  const headAlbum = document.createElement("th");
  headAlbum.textContent = "Album";
  headAlbum.name = "album_title";

  const headGenres = document.createElement("th");
  headGenres.textContent = "Genres";

  const headDuration = document.createElement("th");
  headDuration.textContent = "Duration";
  headDuration.name = "track_duration";

  makeSortable(
    [headTrack, headAlbum, headDuration],
    [headTrack, headAlbum, headDuration],
    trackData,
    showTracks,
    parentElement,
    div,
    table
  );

  headRow.appendChild(headTrack);
  headRow.appendChild(headAlbum);
  headRow.appendChild(headGenres);
  headRow.appendChild(headDuration);

  table.appendChild(headRow);

  return [div, table];
}

function showTracks(trackData, parentElement, div, table) {
  parentElement.textContent = "";

  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  for (const track of trackData) {
    const row = document.createElement("tr");
    const head = document.createElement("td");

    const title = document.createElement("h3");
    const titleNode = document.createTextNode(
      `${track.id}: ${track.track_title}`
    );
    title.appendChild(titleNode);

    const artist = document.createElement("h4");
    const artistNode = document.createTextNode(track.artist_name);
    artist.appendChild(artistNode);

    head.appendChild(title);
    head.appendChild(artist);

    const album = document.createElement("td");
    const albumName = document.createElement("p");
    const albumNode = document.createTextNode(track.album_title);
    albumName.appendChild(albumNode);
    album.appendChild(albumName);

    let genreList = "";
    for (const genre of track.track_genres) {
      genreList += genre.genre_title + ", ";
    }
    genreList = genreList.substring(0, genreList.length - 2);

    const genres = document.createElement("td");
    const gen = document.createElement("p");
    const genNode = document.createTextNode(genreList);
    gen.appendChild(genNode);
    genres.appendChild(gen);

    const duration = document.createElement("td");
    const dur = document.createElement("p");
    const durNode = document.createTextNode(track.track_duration);
    dur.appendChild(durNode);
    duration.appendChild(dur);

    row.appendChild(head);
    row.appendChild(album);
    row.appendChild(genres);
    row.appendChild(duration);

    table.appendChild(row);
  }

  div.appendChild(table);
  parentElement.appendChild(div);
}

function makeArtistHeaders(artistData, parentElement) {
  var div = document.createElement("div");
  div.className = "align-items";

  var table = document.createElement("table");
  table.className = "artists-table align-items";
  const headRow = document.createElement("tr");

  var heading = document.createElement("h3");
  const headNode = document.createTextNode(sortMessage);
  heading.appendChild(headNode);
  table.appendChild(heading);

  const headID = document.createElement("th");
  headID.textContent = "ID";
  headID.name = "id";

  const headName = document.createElement("th");
  headName.textContent = "Name";
  headName.name = "name";

  const headLocation = document.createElement("th");
  headLocation.textContent = "Location";
  headLocation.name = "location";



  makeSortable(
    [headName, headLocation, headID],
    [headName, headLocation],
    artistData,
    showArtists,
    parentElement,
    div,
    table
  );
  makeSortableNumbers(
    [headName, headLocation, headID],
    [headID],
    artistData,
    showArtists,
    parentElement,
    div,
    table
  );

  headRow.appendChild(headID);
  headRow.appendChild(headName);
  headRow.appendChild(headLocation);
  table.appendChild(headRow);

  return [div, table];
}

function makeSortable(
  tableHeadersSort,
  tableHeaders,
  trackData,
  callback,
  parentElement,
  div,
  table
) {
  for (const header of tableHeaders) {
    let reverse = 1;
    header.addEventListener("click", () => {
      trackData.sort(
        (a, b) =>
          reverse *
          String(a[header.name])
            .toLowerCase()
            .localeCompare(String(b[header.name]).toLowerCase())
      );
      reverse *= -1;
      callback(trackData, parentElement, div, table);
      for (const head of tableHeadersSort) {
        head.className = "";
      }
      header.className = "ordered";
    });
  }
}

function makeSortableNumbers(
  tableHeaders,
  tableHeadersSort,
  trackData,
  callback,
  parentElement,
  div,
  table
) {
  for (const header of tableHeaders) {
    let reverse = 1;
    header.addEventListener("click", () => {
      trackData.sort((a, b) => reverse * (a[header.name] - b[header.name]));
      reverse *= -1;
      callback(trackData, parentElement, div, table);
      console.log(tableHeaders);
      for (const head of tableHeadersSort) {
        head.className = "";
      }
      header.className = "ordered";
    });
  }
}

function showArtists(artistData, parentElement, div, table) {
  parentElement.textContent = "";

  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  for (const artist of artistData) {
    const row = document.createElement("tr");

    const head = document.createElement("td");
    const title = document.createElement("h3");
    const titleNode = document.createTextNode(artist.id);
    title.appendChild(titleNode);
    head.appendChild(title);

    const name = document.createElement("td");
    const aName = document.createElement("p");
    const nameNode = document.createTextNode(artist.name);
    aName.appendChild(nameNode);
    name.appendChild(aName);

    const location = document.createElement("td");
    const locName = document.createElement("p");
    const locNode = document.createTextNode(artist.location);
    locName.appendChild(locNode);
    location.appendChild(locName);

    row.appendChild(head);
    row.appendChild(name);
    row.appendChild(location);

    table.appendChild(row);
  }

  div.appendChild(table);
  parentElement.appendChild(div);
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("view-playlist");
  if (button) {
    button.addEventListener("click", async () => {
      const parent = document.getElementById("view-results");
      const input = document.getElementById("playlist-title-2");
      const table = document.getElementById("view-tracks");

      if (!input.value) return;
      showLoadingMessage(parent);
      if (table) table.textContent = "";

      const playlistData = await fetch(`${baseURL}/playlist/${input.value}`);

      if (playlistData.status === 404 || playlistData.status === 400) {
        getErrorMessage(
          parent,
          playlistData.status,
          playlistData.statusText,
          playlistViewError,
          smallErrorClass
        );
        return console.log(`Error ${playlistData.status}`);
      }

      const playlist = await playlistData.json();
      playlist.tracks.sort((a, b) => a - b);
      console.log(playlist);
      console.log(playlist.tracks);

      showPlaylistTracks(playlist.tracks, parent, "Playlist Tracks");
    });
  }
});

function showPlaylistTracks(tracks, parentElement, titleText) {
  parentElement.textContent = "";

  const header = document.createElement("h2");
  header.textContent = titleText;
  header.className = "tracks-title";
  parentElement.appendChild(header);

  const list = document.createElement("ul");
  list.className = "track-list";

  for (const track of tracks) {
    const item = document.createElement("li");
    item.className = "playlist-track";

    const text = document.createElement("p");
    const textNode = document.createTextNode(track);
    text.appendChild(textNode);

    item.appendChild(text);
    list.appendChild(item);
  }

  parentElement.appendChild(list);
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("delete-playlist");
  if (button) {
    button.addEventListener("click", async () => {
      const parent = document.getElementById("view-results");
      const input = document.getElementById("playlist-title-2");
      const table = document.getElementById("view-tracks");

      if (!input.value) return;
      showLoadingMessage(parent);
      if (table) table.textContent = "";

      const playlistData = await fetch(`${baseURL}/playlist/${input.value}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (playlistData.status === 404 || playlistData.status === 400) {
        getErrorMessage(
          parent,
          playlistData.status,
          playlistData.statusText,
          playlistDeleteError,
          smallErrorClass
        );
        return console.log(`Error ${playlistData.status}`);
      }

      const playlist = await playlistData.json();
      playlist.tracks.sort((a, b) => a - b);
      console.log(playlist);
      console.log(playlist.tracks);

      const title = `Successfully deleted playlist ${playlist.id} - ${playlist.title}`;
      showPlaylistTracks(playlist.tracks, parent, title);
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("get-playlists");
  if (button) {
    button.addEventListener("click", async () => {
      const parent = document.getElementById("view-results");
      showLoadingMessage(parent);

      const playlistData = await fetch(`${baseURL}/playlists`);

      if (playlistData.status === 404 || playlistData.status === 400) {
        getErrorMessage(
          parent,
          playlistData.status,
          playlistData.statusText,
          playlistAllError,
          smallErrorClass
        );
        return console.log(`Error ${playlistData.status}`);
      }

      const playlist = await playlistData.json();

      const [div, table] = makePlaylistHeaders();
      createPlaylistsTable(playlist, parent, table, div);
    });
  }
});

function createPlaylistsTable(playlistData, parentElement, table, div) {
  parentElement.textContent = "";

  const head = document.createElement("h3");
  head.textContent = "Click on a row to see songs in playlist";
  head.className = "info-title";
  parentElement.appendChild(head);

  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  for (const playlist of playlistData) {
    const row = document.createElement("tr");

    const head = document.createElement("td");
    const title = document.createElement("h3");
    const titleNode = document.createTextNode(playlist.title);
    title.appendChild(titleNode);
    head.appendChild(title);

    const count = document.createElement("td");
    const aCount = document.createElement("p");
    const countNode = document.createTextNode(playlist.count);
    aCount.appendChild(countNode);
    count.appendChild(aCount);

    const playtime = document.createElement("td");
    const pTime = document.createElement("p");
    const ptimeNode = document.createTextNode(playlist.playtime);
    pTime.appendChild(ptimeNode);
    playtime.appendChild(pTime);

    row.appendChild(head);
    row.appendChild(count);
    row.appendChild(playtime);

    row.addEventListener("click", () => {
      createSongDetailsTable(playlist.songs);
    });

    table.appendChild(row);
  }

  div.appendChild(table);
  parentElement.appendChild(div);
}

function makePlaylistHeaders() {
  var div = document.createElement("div");
  div.className = "align-items";

  var table = document.createElement("table");
  table.className = "artists-table align-items";
  const headRow = document.createElement("tr");

  const headTitle = document.createElement("th");
  headTitle.textContent = "Title";
  headTitle.name = "title";

  const headCount = document.createElement("th");
  headCount.textContent = "Number of Tracks";
  headCount.name = "count";

  const headPlaytime = document.createElement("th");
  headPlaytime.textContent = "Playtime (hours)";
  headPlaytime.name = "playtime";

  headRow.appendChild(headTitle);
  headRow.appendChild(headCount);
  headRow.appendChild(headPlaytime);
  table.appendChild(headRow);

  return [div, table];
}

function createSongDetailsTable(songs) {
  const parent = document.getElementById("view-tracks");

  const table = document.createElement("table");
  table.className = "tracks-table";

  const headRow = document.createElement("tr");
  headRow.className = "sub-row";

  const headTitle = document.createElement("th");
  headTitle.textContent = "Track Title";

  const artistName = document.createElement("th");
  artistName.textContent = "Artist";

  const albumName = document.createElement("th");
  albumName.textContent = "Album Title";

  const headPlaytime = document.createElement("th");
  headPlaytime.textContent = "Playtime (hours)";

  headRow.appendChild(headTitle);
  headRow.appendChild(artistName);
  headRow.appendChild(albumName);
  headRow.appendChild(headPlaytime);
  table.appendChild(headRow);

  for (const song of songs) {
    const row = document.createElement("tr");
    row.className = "sub-row";

    const head = document.createElement("td");
    const title = document.createElement("h3");
    const titleNode = document.createTextNode(song.title);
    title.appendChild(titleNode);
    head.appendChild(title);

    const artist = document.createElement("td");
    const ar = document.createElement("p");
    const artistNode = document.createTextNode(song.artist);
    ar.appendChild(artistNode);
    artist.appendChild(ar);

    const album = document.createElement("td");
    const alb = document.createElement("p");
    const albumNode = document.createTextNode(song.album);
    alb.appendChild(albumNode);
    album.appendChild(alb);

    const duration = document.createElement("td");
    const dur = document.createElement("h3");
    const durNode = document.createTextNode(song.playtime);
    dur.appendChild(durNode);
    duration.appendChild(dur);

    row.appendChild(head);
    row.appendChild(artist);
    row.appendChild(album);
    row.appendChild(duration);

    table.appendChild(row);
  }

  const clear = document.createElement("p");
  clear.className = "clear-popup";
  clear.textContent = "Clear Results";
  clear.addEventListener("click", () => {
    parent.textContent = "";
  });

  parent.appendChild(table);
  parent.appendChild(clear);
}

function showLoadingMessage(parent) {
  parent.textContent = "";
  const div = document.createElement("div");
  div.className = "loading-message";

  const head = document.createElement("h3");
  const headNode = document.createTextNode("Loading...");
  head.appendChild(headNode);

  const subtitle = document.createElement("p");
  const subNode = document.createTextNode(
    "Please wait while your results load"
  );
  subtitle.appendChild(subNode);

  div.appendChild(head);
  div.appendChild(subtitle);

  parent.appendChild(div);
}
