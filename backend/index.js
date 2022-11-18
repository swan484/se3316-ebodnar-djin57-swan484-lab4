const {MongoClient, Db} = require('mongodb')
const cors = require('cors');
const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;
app.use("/", express.static("static"));
app.use(cors());

const uri = "mongodb+srv://root:root@cluster0.dklnv6c.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri)

const DB_NAME = "music"
const USERS_COLLECTION = "users"
const GENRES_COLLECTION = "genres"
const ALBUMS_COLLECTION = "albums"
const ARTISTS_COLLECTION = "artists"
const TRACKS_COLLECTION = "tracks"
const PLAYLISTS_COLLECTION = "playlists"

const INCORRECT_PASSWORD = "Incorrect password"
const INVALID_EMAIL = "Email not recognized"
const CANNOT_UPDATE = "Cannot update password, try again later"
const EMAIL_EXISTS = "An account with this email already exists"
const CANNOT_INSERT = "Cannot create account, try again later"
const CANNOT_INSERT_PLAYLIST = "Cannot insert playlist, try again later"

app.get("/api/upload", (req, res) => {
    UploadData(DB_NAME, TRACKS_COLLECTION)
})

app.get("/api/user/:email", (req, res) => {
    console.log(`Called into GET user (email) with ${req.params.email}`);
    const query = {
        email: req.params.email
    }

    getOneFrom(DB_NAME, USERS_COLLECTION, query)
    .then((data) => res.send(data))
    .catch((err) => res.status(404).send(err));
});

/*
    body: 
    {email, password, newPassword}
*/
//TODO: fix error messages
app.put("/api/user", async (req, res) => {
    const body = req.body;
    console.log(body)
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

app.post("/api/user", async (req, res) => {
    const body = req.body;
    console.log(body)
    const search = {
        email: body.email
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, search)
    .then((foundUser) => {
        if(foundUser){
            res.statusMessage = EMAIL_EXISTS
            return res.status(404).send(); 
        }
    })
    .then(() => {
        const doc = {
            email: body.email,
            password: body.password,
            fullName: body.fullName,
            deactivated: false
        }

        insertOne(DB_NAME, USERS_COLLECTION, doc)
        .then((result) => {
            if (!result) {
                return res.status(400).send();
            }
    
            console.log("Successfully Inserted")
        })
    })
    .catch(() => {
        res.statusMessage = CANNOT_INSERT
        res.status(404).send()
    });
    res.status(200).send();
})

/*
Display tracks to users and allow them to filter/click to select?

request:
{
    userInfo: {
        email, password, fullname
    },
    tracks: {
        ...tracks
    }
    title,
    visibility,
    description
    ADD date now
}

Join on Users and see if passwords match -> this is the authentication
    If no match then return an unauthorization error
Check if the playlist with this title and email already exists
    If so, return an error saying so
Then add the playlist data to the database
*/
app.put('/api/authenticated/playlists', async (req, res) => {
    const userInfo = req.body.userInfo
    const tracks = req.body.tracks
    const date = new Date(Date.now()).toLocaleDateString()

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: userInfo.email})
    .then((data) => {
        if(!data){
            res.statusMessage = "You need to be logged in to access this"
            return res.status(404).send()
        }
        if(data.password !== userInfo.password){
            res.statusMessage = "You do not have access to this"
            return res.status(1).send()
        }
    }).catch((err) => {
        console.log(`Error: ${err}`)
    })

    await getOneFrom(DB_NAME, PLAYLISTS_COLLECTION, {
        list_title: req.body.list_title,
        email: userInfo.email
    }).then((data) => {
        if(data){
            res.statusMessage = "You already have a playlist with this title"
            return res.status(404).send()
        }
    }).catch((err) => {
        console.log(`Error: ${err}`)
    })

    const postData = {
        email: userInfo.email,
        list_title: req.body.list_title,
        visibility: req.body.visibility,
        tracks: tracks,
        description: req.body.description,
        date_modified: date,
        user_name: userInfo.fullName,
    }
    insertOne(DB_NAME, PLAYLISTS_COLLECTION, postData)
    .then((result) => {
        if (!result) {
            return res.status(400).send();
        }

        console.log("Successfully Inserted")
    })
    .catch(() => {
        res.statusMessage = CANNOT_INSERT_PLAYLIST
        return res.status(404).send()
    });
    res.status(200).send();
})

app.post('/api/tracks', async (req, res) => {
    console.log(`Called into GET tracks`);
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
        console.log(err.message)
        res.statusMessage = err.message
        return res.status(404).send()
    })
    res.status(200).send(result)
})

app.get('/api/playlists', async (req, res) => {
    console.log(`Called into GET playlists`);
    const query = {
        visibility: "public"
    }
    const options = {
        tracks: 1,
        date_modified: 1,
        limit: 10,
        sort: {
            date_modified: -1
        }
    }
    var result = []
    await getAllFrom(DB_NAME, PLAYLISTS_COLLECTION, query, options)
    .then((data) => {
        data.forEach(d => {
            result.push(d)
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
                console.log(`Iteration ${it} and ID ${d.track_id}`)
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

const getOneFrom = async (dbName, collectionName, query, options={}) => {
    await client.connect()
    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const result = await collection.findOne(query, options);
        // since this method returns the matched document, not a cursor, print it directly
        console.log(result)
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

const updateOneFrom = async (dbName, collectionName, key, query) => {
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    await collection.updateOne(key, query)
    .then(() => console.log("Success In Update"))
    .catch((e) => console.log(`Encountered error ${e}`))

    return true;
}

const insertOne = async (dbName, collectionName, doc) => {
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    await collection.insertOne(doc)
    .then(() => console.log("Successfully Inserted"))
    .catch((e) => console.log(`Encountered error ${e}`))

    return true;
}

const UploadData = async (dbName, collectionName) => {
    await client.connect()
    var count = 0
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    await collection.find().forEach(async (c) => {
        console.log(`Count ${++count} for ${c.track_title}`)
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