const {MongoClient} = require('mongodb')
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

app.get("/api/upload", (req, res) => {
    UploadData(DB_NAME, TRACKS_COLLECTION)
})

app.get("/api/user/:email", (req, res) => {
    console.log(`Called into GET user (email) with ${req.params.email}`);
    getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.params.email})
    .then((data) => res.send(data))
    .catch((err) => res.status(404).send(err));
});

/*
    artist_name, track_genres > genre_title, track_title
*/
app.get('/api/search/:query', async (req, res) => {
    console.log(`Called into GET search (query) with ${req.params.query}`)
    const queries = req.params.query.split(",")

    var results = []
    var trackMap = {}
    for(var q of queries){
        q = q.trim()
        console.log(q)
        const compiledQuery = {
            $or: [
                {artist_name: {$regex: q}},
                {track_title: {$regex: q}},
                {track_genres: {$elemMatch: {genre_title: {$regex: q}}}}
            ]
        }
        await getAllFrom(DB_NAME, TRACKS_COLLECTION, compiledQuery)
        .then((data) => {
            data.forEach(d => {
                if(!(d.track_id in trackMap)){
                    trackMap[d.track_id] = 0
                }
                trackMap[d.track_id]++;
                d.count = trackMap[d.track_id];
                if(trackMap[d.track_id] > 1){
                    updateCount(results, d.track_id, trackMap[d.track_id])
                }
                results.push(d)
            })
        })
        .catch((err) => console.log(`Error: ${err}`))
    }
    console.log("Got all results")
    results.sort((a, b) => parseInt(b.count) - parseInt(a.count))
    res.send(results)
})

async function getOneFrom(dbName, collectionName, query){
    await client.connect()
    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const result = await collection.findOne(query, {});
        // since this method returns the matched document, not a cursor, print it directly
        console.log(`Result: ${result}`);
        return result;
    } 
    finally {
        await client.close();
    }
}

const updateCount = (list, id, count) => {
    index = 0;
    for(var e of list){
        if(e.track_id === id){
            e.count = count;
            list.splice(index, 1)
            return e;
        }
        index++;
    }
}

async function getAllFrom(dbName, collectionName, query){
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const list = []
    const result = await collection.find(query);
    await result.forEach((entry) => {
        list.push(entry)
    }).then(async () => {
        await client.close();
    })
    return list;
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

app.listen(port, () => console.log(`Listening on port ${port}...`));