const Joi = require("joi")
const cors = require('cors')
const express = require("express")
const mongoose = require("mongoose")

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use("/", express.static("static"));
app.use(cors());

app.get("/api/genres", (req, res) => {
  getGenreData()
    .then((data) => res.send(data))
    .catch((error) =>
      res.status(404).send("Error encountered " + error.message)
    );
});

app.get("/api/artist/:id", (req, res) => {
  const id = parseInt(stripHtml(req.params.id));
  console.log(`Called into GET artist (id) with ${id}`);
  if (Number.isNaN(id) || id < 0) {
    res.statusMessage = `Invalid ID '${req.params.id}'`;
    return res.status(400).send();
  }

  getArtistData()
    .then((data) => {
      const filtered = data.filter((item) => item.id === id);
      if (filtered.length === 0) {
        res.statusMessage = `Artist ${id} does not exist`;
        return res.status(404).send();
      }
      res.send(filtered);
    })
    .catch((error) =>
      res.status(404).send("Error encountered " + error.message)
    );
});

app.get("/api/artists/:query", (req, res) => {
  const query = stripHtml(req.params.query.toLowerCase());
  console.log(`Called into GET artists (query) with ${query}`);
  if (query.length === 0) {
    res.statusMessage = `Invalid search criteria`;
    return res.status(400).send();
  }

  getArtistData()
    .then((data) => {
      let filtered = [];
      for (item of data) {
        if (item.name.toLowerCase().includes(query)) filtered.push(item);
      }

      if (filtered.length === 0) {
        res.statusMessage = `No artists match the search`;
        return res.status(404).send();
      }
      res.send(filtered);
    })
    .catch((error) =>
      res.status(404).send("Error encountered " + error.message)
    );
});

app.get("/api/track/:id", (req, res) => {
  const id = parseInt(stripHtml(req.params.id));
  console.log(`Called into GET track (id) with ${id}`);
  if (Number.isNaN(id)) {
    res.statusMessage = `Invalid ID`;
    return res.status(400).send();
  }
  getTrackData()
    .then((data) => {
      const filtered = data.filter((item) => item.id === id);
      if (filtered.length === 0) {
        res.statusMessage = `Track ${id} does not exist`;
        res.status(404).send();
      }
      res.send(filtered);
    })
    .catch((error) =>
      res.status(404).send("Error encountered " + error.message)
    );
});

app.get("/api/tracks/:query/:limit", (req, res) => {
  const query = stripHtml(req.params.query.toLowerCase());
  const limit = parseInt(stripHtml(req.params.limit));
  console.log(`Called into GET tracks (query, limit) with ${query} & ${limit}`);
  if (Number.isNaN(limit)) {
    res.statusMessage = `Invalid limit for results`;
    return res.status(400).send();
  }

  getTrackData()
    .then((data) => {
      let filtered = [];
      for (item of data) {
        if (
          item.track_title.toLowerCase().includes(query) ||
          item.album_title.toLowerCase().includes(query)
        )
          filtered.push(item);
        if (filtered.length === limit) break;
      }

      if (filtered.length === 0) {
        res.statusMessage = `No tracks match the search`;
        return res.status(404).send();
      }
      res.send(filtered);
    })
    .catch((error) =>
      res.status(404).send("Error encountered " + error.message)
    );
});

app.post("/api/playlist", async (req, res) => {
  const { error } = validatePlaylist(req.body);

  if (error) {
    res.statusMessage = error.details[0].message;
    return res.status(400).send();
  }

  await db.read();
  db.data = db.data || { playlists: [] };

  req.body.tracks.forEach((t) => parseInt(stripHtml(t)));
  const playlist = {
    id: db.data.playlists.length + 1,
    title: stripHtml(req.body.list_name),
    tracks: req.body.tracks,
  };

  if (db.data.playlists.find((c) => c.title === playlist.title)) {
    res.statusMessage = "This title is already taken";
    return res.status(400).send();
  }

  db.data.playlists.push(playlist);
  res.send(playlist);
});

app.put("/api/playlist", async (req, res) => {
  const { error } = validatePlaylist(req.body);

  if (error) {
    res.statusMessage = error.details[0].message;
    return res.status(400).send();
  }

  await db.read();
  db.data = db.data || { playlists: [] };

  let title = stripHtml(req.body.list_name);
  let foundPlaylist = db.data.playlists.find((c) => c.title === title);

  if (!foundPlaylist) {
    res.statusMessage = "This playlist does not exist";
    return res.status(404).send();
  }

  req.body.tracks.forEach((t) => parseInt(stripHtml(t)));
  db.data.playlists[foundPlaylist.id - 1].tracks = req.body.tracks;
  res.status(200).send();
});

app.get("/api/playlist/:name", async (req, res) => {
  const name = stripHtml(req.params.name);
  console.log(`Called into GET playlist (name) with ${name}`);

  await db.read();
  db.data = db.data || { playlists: [] };

  db.data.playlists.forEach((e) => {
    if (e.title.toLowerCase() === name.toLowerCase()) res.send(e);
  });

  res.statusMessage = `Playlist "${name}" does not exist`;
  res.status(404).send();
});

app.delete("/api/playlist/:name", async (req, res) => {
  const name = stripHtml(req.params.name);
  console.log(`Called into DELETE playlist (name) with ${name}`);

  await db.read();
  db.data = db.data || { playlists: [] };

  const playlist = db.data.playlists.find((p) => p.title.toLowerCase() === name.toLowerCase());

  if (!playlist) {
    res.statusMessage = `The playlist with name "${name}" was not found`;
    return res.status(404).send();
  }

  const index = db.data.playlists.indexOf(playlist);
  db.data.playlists.splice(index, 1);

  res.send(playlist);
});

app.get("/api/playlists", async (req, res) => {
  console.log(`Called into GET playlists`);

  await db.read();
  db.data = db.data || { playlists: [] };
  if (db.data.playlists.length === 0) {
    res.statusMessage = "No playlists currently exist";
    res.status(404).send();
  }

  let titles = [];
  let trackMap = new Map();
  for (const playlist of db.data.playlists) {
    trackMap.set(playlist.title, new Set());
    titles.push(playlist.title);
    for (const track of playlist.tracks) {
      trackMap.get(playlist.title).add(parseInt(track));
    }
  }

  let playtimes = new Map();
  let songs = new Map();
  for (const title of titles) {
    playtimes.set(title, 0);
    songs.set(title, []);
  }

  let filtered = [];
  getTrackData()
    .then((data) => {
      for (item of data) {
        for (const title of titles) {
          if (trackMap.get(title).has(item.id)) {
            playtimes.set(
              title,
              playtimes.get(title) +
                parseTime(item.track_duration) * item.track_listens
            );
            let song = {
              id: item.id,
              title: item.track_title,
              album: item.album_title,
              playtime: secondsToHours(
                parseTime(item.track_duration) * item.track_listens
              ).toFixed(2),
              artist: item.artist_name,
            };
            songs.get(title).push(song);
          }
        }
      }

      for (const title of titles) {
        var data = {
          title: title,
          playtime: secondsToHours(playtimes.get(title)).toFixed(2),
          count: trackMap.get(title).size,
          songs: songs.get(title),
        };
        filtered.push(data);
      }

      if (filtered.length === 0) {
        res.statusMessage = `Your playlists have no valid tracks`;
        return res.status(404).send();
      }

      res.send(filtered);
    })
    .catch((error) =>
      res.status(404).send("Error encountered " + error.message)
    );
});

function parseTime(time) {
  const portions = time.split(":");
  let t = 0;
  let f = 1;
  for (let i = portions.length - 1; i >= 0; i--) {
    t += parseInt(portions[i]) * f;
    f *= 60;
  }
  return t;
}

function secondsToHours(time) {
  let date = new Date(null);
  date.setSeconds(time);

  return (date - new Date(null)) / 36e5;
}

function validatePlaylist(playlist) {
  const schema = Joi.object({
    list_name: Joi.string().min(1).required().messages({
      "string.base": `Title should be a string`,
      "string.empty": `Title cannot be empty`,
      "string.required": `Title should be a type of text`,
    }),
    tracks: Joi.array()
      .items(Joi.number().integer().min(1))
      .required()
      .messages({
        "number.integer": "Track numbers should be integers",
        "number.base": `Tracks should all be numbers`,
        "array.base": `Tracks should be in a comma separated list`,
        "number.min": `Playlist contains an invalid Track ID`,
      }),
  });
  const result = schema.validate(playlist);
  return result;
}

function getGenres(file) {
  let genreList = [];
  var parser = parse({ columns: true });

  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .on("error", (error) => {
        reject(error);
      })
      .pipe(parser)
      .on("data", function (d) {
        var genre = {
          name: d.title ? d.title : "Unknown",
          id: d.genre_id ? d.genre_id : "Unknown",
          parent_id: d.parent ? d.parent : "Unknown",
        };
        genreList.push(genre);
      })
      .on("end", () => {
        resolve(genreList);
      });
  });
}

function getArtists(file) {
  let artistList = [];
  var parser = parse({ columns: true });

  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .on("error", (error) => {
        reject(error);
      })
      .pipe(parser)
      .on("data", function (artist) {
        var artist = {
          id: parseInt(artist.artist_id)
            ? parseInt(artist.artist_id)
            : "Unknown",
          name: artist.artist_name ? artist.artist_name : "Unknown",
          url: artist.artist_url ? artist.artist_url : "Unavailable",
          image: convertImg(artist.artist_image_file, "artist"),
          location:
            artist.artist_location === "" ? "N/A" : artist.artist_location,
          website: artist.artist_website
            ? artist.artist_website
            : "Unavailable",
        };
        artistList.push(artist);
      })
      .on("end", () => {
        resolve(artistList);
      });
  });
}

function getTracks(file) {
  let trackList = [];
  var parser = parse({ columns: true });
  const regex = /('(?=(,\s*')))|('(?=:))|((?<=([:,]\s*))')|((?<={)')|('(?=}))/g;

  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .on("error", (error) => {
        reject(error);
      })
      .pipe(parser)
      .on("data", function (track) {
        var music = {
          id: parseInt(track.track_id) ? parseInt(track.track_id) : "Unknown",
          album_id: parseInt(track.album_id) ? parseInt(track.album_id) : "N/A",
          album_title:
            track.album_title.length > 0 ? track.album_title : "Unavailable",
          artist_id: parseInt(track.artist_id)
            ? parseInt(track.artist_id)
            : "Unknown",
          artist_name: track.artist_name ? track.artist_name : "Unknown Artist",
          tags: track.tags === "[]" ? "[]" : parseTags(track.tags),
          track_date_created: track.track_date_created
            ? track.track_date_created
            : "Unknown Date",
          track_date_recorded: track.track_date_recorded
            ? track.track_date_recorded
            : "Unknown Date",
          track_duration: track.track_duration
            ? track.track_duration
            : "Unavailable",
          track_genres:
            track.track_genres.length > 0
              ? JSON.parse(track.track_genres.replace(regex, '"'))
              : "",
          track_number: parseInt(track.track_number)
            ? parseInt(track.track_number)
            : "Unknown",
          track_title: track.track_title
            ? track.track_title
            : "Title Unavailable",
          track_listens: parseInt(track.track_listens)
            ? parseInt(track.track_listens)
            : 0,
        };
        trackList.push(music);
      })
      .on("end", () => {
        resolve(trackList);
      });
  });
}

function parseTags(tags) {
  var parsed = [];
  tags = tags.substring(1, tags.length - 1).split(",");
  for (tag of tags) {
    var trimmed = tag.trim();
    parsed.push(" " + trimmed.substring(1, trimmed.length - 1));
  }
  return parsed;
}

function stripHtml(str) {
  console.log(`Original: ${str}`);
  if (str === null || str === "") return false;
  else str = str.toString();

  str = str.replace("(?is)<style.*?>.*?</style>", "");
  str = str.replace(/(<([^>]+)>)/gi, "");
  str = str.replace(/style="[a-zA-Z0-9:;&\."\s\(\)\-\,]*|\\/gi, "");

  console.log(`After: ${str}`);
  return str;
}

function convertImg(img, type) {
  var url = img.split(`${type}s/`)[1];
  if (!url) return "https://i.imgur.com/FZh2rO7.png";
  var fullURL = `https://freemusicarchive.org/image/?file=images%2F${type}s%2F${url}&width=290&height=290&type=${type}`;
  return fullURL;
}

async function getTrackData() {
  try {
    const data = await getTracks("./lab3-data/raw_tracks.csv");
    console.log("Successfully parsed data");
    return data;
  } catch (error) {
    console.error("Got error ", error.message);
    return error;
  }
}

async function getArtistData() {
  try {
    const data = await getArtists("./lab3-data/raw_artists.csv");
    console.log("Successfully parsed data");
    return data;
  } catch (error) {
    console.error("Got error ", error.message);
    return error;
  }
}

async function getGenreData() {
  try {
    const data = await getGenres("./lab3-data/genres.csv");
    console.log("Successfully parsed data");
    return data;
  } catch (error) {
    console.error("Got error ", error.message);
    return error;
  }
}

app.listen(port, () => console.log(`Listening on port ${port}...`));
