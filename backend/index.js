const {MongoClient, Db, ObjectId} = require('mongodb')
const cors = require('cors');
const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;
app.use("/", express.static("static"));
app.use(cors());

const uri = "mongodb+srv://root:root@cluster0.dklnv6c.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri)

const CryptoJS = require("crypto-js")

const DB_NAME = "music"
const USERS_COLLECTION = "users"
const GENRES_COLLECTION = "genres"
const ALBUMS_COLLECTION = "albums"
const ARTISTS_COLLECTION = "artists"
const TRACKS_COLLECTION = "tracks"
const PLAYLISTS_COLLECTION = "playlists"
const REVIEWS_COLLECTION = "reviews"

const MAX_NUM_PLAYLISTS = 20

const INCORRECT_PASSWORD = "Incorrect password"
const INVALID_EMAIL = "Email not recognized"
const CANNOT_UPDATE = "Cannot update password, try again later"
const EMAIL_EXISTS = "An account with this email already exists"
const CANNOT_INSERT = "Cannot create account, try again later"
const CANNOT_INSERT_PLAYLIST = "Cannot insert playlist, try again later"
const PLAYLIST_EXISTS_ERROR = "You already have a playlist with this title"
const USER_NOT_LOGGED_IN = "You need to be logged in to access this"
const NO_ACCESS_ERROR = "You do not have access to this"
const NO_PLAYLISTS_EXIST = "You do not have any playlists"
const TOO_MANY_PLAYLISTS = `You cannot have more than ${MAX_NUM_PLAYLISTS} playlists`
const MISSING_REQUIRED_FIELDS = "You are missing required fields"
const PLAYLIST_NOT_EXISTS = "This playlist does not exist"
const DELETION_ERROR = "Playlist could not be deleted, try again later"
const EMPTY_PLAYLIST_ERROR = "Playlist cannot be empty"
const EMPTY_TITLE_ERROR = "Playlist must have a title"
const INVALID_TRACK_EXISTS = "Playlist contains an invalid track"
const REVIEW_DOES_NOT_EXIST = "No review exists"
const EMPTY_RATING = "Cannot have an empty rating"
const USER_NOT_EXISTS = "User does not exist"

const SECRET_KEY = "fTjWnZr4u7x!A%D*G-KaNdRgUkXp2s5v8y/B?E(H+MbQeShVmYq3t6w9z$C&F)J@NcRfUjWnZr4u7x!A%D*G-KaPdSgVkYp2s5v8y/B?E(H+MbQeThWmZq4t6w9z$C&F"

app.get("/api/upload", (req, res) => {
    UploadData(DB_NAME, TRACKS_COLLECTION)
})

app.get("/api/user/:object", (req, res) => {
    console.log(`Called into GET user (email) with ${req.params.object}`);
    const search = JSON.parse(req.params.object)
    const query = {
        email: search.email
    }

    getOneFrom(DB_NAME, USERS_COLLECTION, query)
    .then((foundUser) => {
        if(!foundUser){
            throw new Error(INVALID_EMAIL)
        }
        if(search.password != foundUser.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(!foundUser.verified){
            const cypher = CryptoJS.AES.encrypt(JSON.stringify(search), SECRET_KEY).toString()
            return res.status(202).send(cypher)
        }

        return res.status(200).send(foundUser)
    })
    .catch((err) => {
        res.statusMessage = err.message
        res.status(404).send()
    });
});

/*
    body: 
    {email, password, newPassword}
*/
//TODO: fix error messages
app.put("/api/user", async (req, res) => {
    const body = req.body;
    const search = {
        email: body.email
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, search)
    .then((foundUser) => {
        if(!foundUser){
            res.statusMessage = INVALID_EMAIL
            return res.status(404).send(); 
        }
        if(body.password != foundUser.password){
            res.statusMessage = INCORRECT_PASSWORD
            return res.status(404).send()
        }
    })
    .then(() => {
        const key = {
            email: body.email
        }
        const query = { 
            $set: {
                password: body.newPassword 
            } 
        }

        updateOneFrom(DB_NAME, USERS_COLLECTION, key, query)
        .then((result) => {
            if (!result) {
                return res.status(400).send();
            }
    
            console.log("Success In Change")
        })
    })
    .catch(() => {
        res.statusMessage = CANNOT_UPDATE
        res.status(404).send()
    });
    res.status(200).send();
})

app.post('/api/user/encrypt', async (req, res) => {
    const userDetails = {
        email: req.body.email,
        password: req.body.password
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: userDetails.email})
    .then((foundUser) => {
        if(!foundUser){
            res.statusMessage = USER_NOT_EXISTS
            return res.status(404).send(); 
        }
        if(userDetails.password != foundUser.password){
            res.statusMessage = INCORRECT_PASSWORD
            return res.status(404).send()
        }
    }).then(() => {
        const cypher = CryptoJS.AES.encrypt(JSON.stringify(userDetails), SECRET_KEY).toString()
        res.status(200).send(cypher)
    }).catch((err) => {
        res.statusMessage = err.message
        res.status(404).send()
    })
})

app.post("/api/user/decrypt", async (req, res) => {
    const id = req.body.id
    
    const bytes  = CryptoJS.AES.decrypt(id, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: decryptedData.email})
    .then((foundUser) => {
        if(!foundUser){
            res.statusMessage = USER_NOT_EXISTS
            return res.status(404).send(); 
        }
        if(decryptedData.password != foundUser.password){
            res.statusMessage = INCORRECT_PASSWORD
            return res.status(404).send()
        }
    }).then(() => updateOneFrom(
        DB_NAME, USERS_COLLECTION, {email: decryptedData.email}, {
            $set: {
                verified: true
            }
        }
    )).then((result) => {
        if (!result) {
            return res.status(400).send();
        }

        console.log("Successfully Verified User")
        return res.status(200).send(result);
    }).catch((err) => {
        res.statusMessage = err.message
        res.status(404).send()
    })
})

app.post('/api/user/verification', async (req, res) => {
    const body = req.body;
    const search = {
        email: body.email
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, search)
    .then((foundUser) => {
        if(!foundUser){
            res.statusMessage = USER_NOT_EXISTS
            return res.status(404).send(); 
        }
        if(body.password != foundUser.password){
            res.statusMessage = INCORRECT_PASSWORD
            return res.status(404).send()
        }
    }).then(() => updateOneFrom(
        DB_NAME, USERS_COLLECTION, search, {
            $set: {
                verified: true
            }
        }
    )).then((result) => {
        if (!result) {
            return res.status(400).send();
        }

        console.log("Successfully Updated Verification")
        return res.status(200).send(result);
    })
    .catch(() => {
        res.statusMessage = CANNOT_INSERT
        return res.status(404).send()
    });
    return res.status(200).send();
})

app.post("/api/user", async (req, res) => {
    const body = req.body;
    const search = {
        email: body.email
    }
    const userDetails = {
        email: req.body.email,
        password: req.body.password
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, search)
    .then((foundUser) => {
        console.log(foundUser)
        if(foundUser){
            throw new Error(EMAIL_EXISTS)
        }
    }).then(() => insertOne(DB_NAME, USERS_COLLECTION, {
        email: body.email,
        password: body.password,
        fullName: body.fullName,
        deactivated: false,
        verified: false
    })).then((result) => {
        console.log(result)
        if (!result) {
            throw new Error(CANNOT_INSERT)
        }

        console.log("Successfully Inserted")
    }).then(() => {
        const cypher = CryptoJS.AES.encrypt(JSON.stringify(userDetails), SECRET_KEY).toString()
        console.log(cypher)
        return res.status(200).send(cypher)
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });
})

//Create a playlist
app.put('/api/authenticated/playlists', async (req, res) => {
    console.log("Called into PUT authenticated playlists")
    const userInfo = req.body.userInfo
    const tracks = req.body.tracks
    const date = `${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} GMT`

    const modifiedTracks = []
    req.body.tracks.forEach((t) => {
        modifiedTracks.push({
            ...t,
            _id: new ObjectId(t._id)
        })
    })

    if(req.body.tracks.length === 0){
        console.log("Empty tracks")
        res.statusMessage = EMPTY_PLAYLIST_ERROR
        res.status(400).send()
    }
    if(req.body.list_title.length === 0){
        console.log("Empty Title")
        res.statusMessage = EMPTY_TITLE_ERROR
        res.status(400).send()
    }

    await checkTracksExist(modifiedTracks)
    .then((data) => {
        if(data.length != modifiedTracks.length){
            res.statusMessage = INVALID_TRACK_EXISTS
            return res.status(400).send()
        }
    }).then(() => getOneFrom(
        DB_NAME, USERS_COLLECTION, {email: userInfo.email}
    )).then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(data.password !== userInfo.password){
            throw new Error(NO_ACCESS_ERROR)
        }
        if(tracks.length === 0){
            throw new Error(EMPTY_PLAYLIST_ERROR)
        }
        if(req.body.list_title.length === 0){
            throw new Error(EMPTY_TITLE_ERROR)
        }
    }).then(() => getOneFrom(DB_NAME, PLAYLISTS_COLLECTION, {
        list_title: req.body.list_title,
        email: userInfo.email
    })).then((data) => {
        if(data){
            throw new Error(PLAYLIST_EXISTS_ERROR)
        }
    }).then(() => getAllFrom(DB_NAME, PLAYLISTS_COLLECTION, {
        email: userInfo.email
    })).then((data) => {
        if(data.length >= MAX_NUM_PLAYLISTS){
            throw new Error(TOO_MANY_PLAYLISTS)
        }
        if(req.body.list_title.length === 0 || modifiedTracks.length === 0){
            throw new Error(MISSING_REQUIRED_FIELDS)
        }
    }).then(() => insertOne(DB_NAME, PLAYLISTS_COLLECTION, {
        email: userInfo.email,
        list_title: req.body.list_title,
        visibility: req.body.visibility,
        tracks: modifiedTracks,
        description: req.body.description,
        date_modified: date,
        user_name: userInfo.fullName,
    })).then((result) => {
        if (!result) {
            throw new Error(CANNOT_INSERT_PLAYLIST)
        }

        console.log("Successfully Inserted in here")
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    res.status(200).send();
})

app.post('/api/tracks', async (req, res) => {
    console.log(`Called into POST tracks`);
    var result = []
    const query = {
        track_id: {
            $in: req.body.ids
        }
    }
    await getAllFrom(DB_NAME, TRACKS_COLLECTION, query, {})
    .then((data) => {
        console.log("Got data")
        data.forEach(d => {
            result.push(d)
        })
    })
    .catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    })
    return res.status(200).send(result)
})

app.get('/api/playlists/:limit', async (req, res) => {
    const lim = parseInt(req.params.limit)
    console.log(`Called into GET playlists`);
    const query = {
        visibility: 'public'
    }
    const options = {
        tracks: 1,
        date_modified: 1,
        limit: lim,
        sort: {
            date_modified: -1
        }
    }

    const aggQuery = [
        {
            $lookup: {
                from: REVIEWS_COLLECTION,
                localField: "_id",
                foreignField: "list_id",
                as: "PlaylistReviews"
            }
        },
        {
            $project: {
                _id: 1,
                email: 1,
                list_title: 1,
                visibility: 1,
                tracks: 1,
                description: 1,
                date_modified: 1,
                user_name: 1,
                PlaylistReviews: 1
            }
        }
    ]

    const ratings = {}
    await getAggregate(DB_NAME, PLAYLISTS_COLLECTION, aggQuery)
    .then((result) => {
        result.forEach((r) => {
            let sum = 0
            let count = 0
            r.PlaylistReviews.forEach((p) => {
                sum += p.rating
                count++
            })
            ratings[r._id] = (sum/count)
        })
    })

    var result = []
    await getAllFrom(DB_NAME, PLAYLISTS_COLLECTION, query, options)
    .then((data) => {
        data.forEach(d => {
            const avgRating = ratings[d._id]
            result.push({
                ...d,
                avg_rating: avgRating
            })
        })
    })
    return res.status(200).send(result)
})

app.get('/api/search/:query', async (req, res) => {
    console.log("Called into test " + req.params.query)
    const queries = req.params.query.split(",")

    var results = {}
    var it = 0;
    for(var q of queries){
        const queriesList = []
        q = q.trim().toLowerCase()
        for(var component of q.split(' ')){
            queriesList.push(
                {
                    text: {
                        query: component,
                        path: ['artist_name', 'track_title', 'track_genres.genre_title'],
                        fuzzy: {}
                    }
                }
            )
        }

        const agg = [
            {
                $search: {
                    index: 'custom',
                    compound: {
                        must: queriesList
                    }
                }
            }
        ]

        await getAggregate(DB_NAME, TRACKS_COLLECTION, agg)
        .then((data) => {
            data.forEach(d => {
                if(it === 0 && !(d.track_id in results)) {
                    results[d.track_id] = d
                    results[d.track_id].count = 0;
                }
                if(d.track_id in results) results[d.track_id].count++;
            })
        })
        .catch((err) => console.log(`Error: ${err}`))
        it++;
    }
    res.send(Object.values(results).filter((item) => {return item.count === queries.length}))
})

//Get all playlists for a user
    //POST because GET is too complicated for this
app.post('/api/authenticated/playlists', async (req, res) => {
    console.log("Called into POST playlists")

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.body.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(data.password !== req.body.password){
            throw new Error(NO_ACCESS_ERROR)
        }
    }).then(() => getAllFrom(DB_NAME, PLAYLISTS_COLLECTION, {
        email: req.body.email
    })).then((data) => {
        if(!data){
            throw new Error(NO_PLAYLISTS_EXIST)
        }
        console.log("Successfully got playlists")
        return res.status(200).send(data)
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

//Update a user's playlist
    //TODO: can I use PUT to update?
app.put('/api/authenticated/playlist', async (req, res) => {
    console.log("Called into PUT playlist")

    const key = {
        email: req.body.email,
        list_title: req.body.original_title
    }

    const date = `${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} GMT`
    const query = {
        $set: {
            list_title: req.body.list_title,
            tracks: req.body.tracks,
            description: req.body.description,
            visibility: req.body.visibility,
            date_modified: date
        }
    }

    await checkTracksExist(req.body.tracks)
    .then((data) => {
        if(data.length != req.body.tracks.length){
            throw new Error(INVALID_TRACK_EXISTS)
        }
    }).then(() => getOneFrom(
        DB_NAME, USERS_COLLECTION, {email: req.body.email}
    )).then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(data.password !== req.body.password){
            throw new Error(NO_ACCESS_ERROR)
        }
        if(req.body.list_title.length === 0){
            throw new Error(EMPTY_TITLE_ERROR)
        }
    }).then(() => updateOneFrom(
        DB_NAME, PLAYLISTS_COLLECTION, key, query
    )).then((data) => {
        if(!data.value){
            throw new Error(PLAYLIST_NOT_EXISTS)
        }
        console.log("Successfully updated playlists")
        return res.status(200).send()
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

app.delete("/api/authenticated/playlist", async (req, res) => {
    console.log("Called into DELETE playlist")

    const key = {
        email: req.body.email,
        list_title: req.body.list_title
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.body.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(data.password !== req.body.password){
            throw new Error(NO_ACCESS_ERROR)
        }
    }).then(() => deleteOneFrom(
        DB_NAME, PLAYLISTS_COLLECTION, key
    )).then((data) => {
        if(!data){
            throw new Error(PLAYLIST_NOT_EXISTS)
        }
        if(data.deletedCount === 0){
            throw new Error(DELETION_ERROR)
        }
        console.log("Successfully deleted playlist")
        return res.status(200).send()
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

app.put('/api/authenticated/review', async (req, res) => {
    console.log("Called into PUT review")

    const date = `${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} GMT`
    const key = {
        email: req.body.email,
        list_id: ObjectId(req.body.list_id),
        creator_email: req.body.creator_email
    }
    const query = {
        $set: {
            email: req.body.email,
            list_id: ObjectId(req.body.list_id),
            modified_date: date,
            rating: req.body.rating,
            comments: req.body.comments,
            creator_email: req.body.creator_email,
            user_name: req.body.username
        }
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.body.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(data.password !== req.body.password){
            throw new Error(NO_ACCESS_ERROR)
        }
        if(!req.body.rating || req.body.rating.length === 0){
            throw new Error(EMPTY_RATING)
        }
    }).then(() => updateOneFrom(
        DB_NAME, REVIEWS_COLLECTION, key, query, {upsert: true}
    )).then((a) => {
        console.log("Successfully completed review")
        return res.status(200).send()
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

//Get review
app.post('/api/authenticated/reviews', async (req, res) => {
    console.log("Called into POST review")

    const key = {
        email: req.body.email
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.body.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(data.password !== req.body.password){
            throw new Error(NO_ACCESS_ERROR)
        }
    }).then(() => getAllFrom(
        DB_NAME, REVIEWS_COLLECTION, key
    )).then((results) => {
        if(!results){
            throw new Error(REVIEW_DOES_NOT_EXIST)
        }

        console.log("Successfully got reviews")
        return res.status(200).send(results)
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

const getOneFrom = async (dbName, collectionName, query, options={}) => {
    await client.connect()
    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const result = await collection.findOne(query, options);
        return result;
    } 
    finally {
        await client.close();
    }
}

const getAllFrom = async (dbName, collectionName, query, options={}) => {
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const list = []
    const result = await collection.find(query, options);
    await result.forEach((entry) => {
        list.push(entry)
    }).then(async () => {
        await client.close();
    })
    return list;
}

const getAggregate = async (dbName, collectionName, query, options={}) => {
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const list = []
    const result = await collection.aggregate(query, options);
    await result.forEach((entry) => {
        list.push(entry)
    }).then(async () => {
        await client.close();
    })
    return list;
}

const updateOneFrom = async (dbName, collectionName, key, query, additional={}) => {
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    const result = collection.findOneAndUpdate(key, query, additional)
    .catch((e) => {throw new Error(e.message)})

    return result;
}

const insertOne = async (dbName, collectionName, doc) => {
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    const result = collection.insertOne(doc)
    .catch((e) => {throw new Error(e.message)})

    return result;
}

const deleteOneFrom = async (dbName, collectionName, query) => {
    await client.connect()
    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const result = await collection.deleteOne(query);
        return result;
    } 
    finally {
        await client.close();
    }
}

const checkTracksExist = async (tracks) => {
    console.log("Checking if tracks exist")
    await client.connect()
    const database = client.db(DB_NAME);
    const collection = database.collection(TRACKS_COLLECTION);

    if(tracks.length === 0){
        await client.close();
        throw new Error(EMPTY_PLAYLIST_ERROR)
    }

    const list = []
    const query = []
    for(const track of tracks){
        query.push({
            _id: ObjectId(track._id)
        })
    }

    const result = await collection.find({$or: query}, {});
    await result.forEach((entry) => {
        list.push(entry)
    }).then(async () => {
        await client.close();
    })
    return list;
}

//Can delete this after
const UploadData = async (dbName, collectionName) => {
    await client.connect()
    var count = 0
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    await collection.find().forEach(async (c) => {
        if(Array.isArray(c.track_genres) || c.track_genres.length === 0) return;
        let parsedGenres = JSON.parse(c.track_genres.replace(/'/g, '"'))

        await collection.updateOne({track_id: c.track_id},
            { $set: { track_genres: parsedGenres } }
        )
    })
   
    console.log("Finished");
}

/*
Old version of search:
app.get('/api/search/:query', async (req, res) => {
    console.log(`Called into GET search (query) with ${req.params.query}`)
    const queries = req.params.query.split(",")

    var results = []
    const queriesList = []
    for(var q of queries){
        q = q.trim().toLowerCase()
        queriesList.push({
            $or: [
                {artist_name: {$regex: q, $options: "i"}},
                {track_title: {$regex: q, $options: "i"}},
                {track_genres: {$elemMatch: {genre_title: {$regex: q, $options: "i"}}}}
            ]
        })
    }
    const compiledQuery = {$and: queriesList}
    await getAllFrom(DB_NAME, TRACKS_COLLECTION, compiledQuery)
    .then((data) => {
        data.forEach(d => {
            results.push(d)
        })
    })
    .catch((err) => console.log(`Error: ${err}`))
    console.log("Got results")
    res.send(results)
})
*/

app.listen(port, () => console.log(`Listening on port ${port}...`));