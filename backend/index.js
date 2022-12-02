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
const {SECRET_TOKEN} = require('../middleware/config')
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth')
const Joi = require('joi');

const CryptoJS = require("crypto-js")

const DB_NAME = "music"
const USERS_COLLECTION = "users"
const TRACKS_COLLECTION = "tracks"
const PLAYLISTS_COLLECTION = "playlists"
const REVIEWS_COLLECTION = "reviews"
const POLICIES_COLLECTION = "policies"
const DMCA_POLICIES_COLLECTION = "dmca"

const MAX_NUM_PLAYLISTS = 20

const INCORRECT_PASSWORD = "Incorrect password"
const INVALID_NAME = "Invalid name"
const INVALID_EMAIL = "Invalid email"
const INVALID_PWD = "Password must be minimum 8 characters, at least one upper and lowercase letter, at least one number and special character. Spaces are not allowed."
const INVALID_SEARCH = "Search query is invalid"
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
const USER_INACTIVE = "User is deactivated. Please contact admin@uwo.ca for support."
const NO_USERS_EXIST = "There are no users in the system"
const NO_POLICIES_EXIST = "There are no policies in the system. Please contact admin@uwo.ca for support."
const COULD_NOT_DECRYPT = "Could not decrypt details, try again later"
const COULD_NOT_UPDATE = "Could not update details, try again later"

/*
*   Upload data to the database - NEED TO DELETE
*/
app.get("/api/upload", (req, res) => {
    UploadData(DB_NAME, TRACKS_COLLECTION)
})

const encodeString = (str) => {
    return CryptoJS.AES.encrypt(JSON.stringify(str), SECRET_TOKEN).toString()
}

const decodeString = (str) => {
    const bytes = CryptoJS.AES.decrypt(str, SECRET_TOKEN);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

/**
 * Check a JWT's authorization
 *  Take an encrypted token in the body as {token: 'abcdef...'}
 *  If this token does not exist, is empty, or has timed out then return false
 *  If this token is still valid return true
 */
app.post('/api/checkAuthorization', (req, res) => {
    if(!req.body.token || req.body.token.length === 0 || req.body.token === 'undefined'){
        return res.status(200).send(
            {valid: false}
        )
    }
    const token = req.body.token

    const decodedToken = jwt.decode(token, {complete: true});
    const dateNow = new Date();

    if(decodedToken.payload.exp < dateNow.getTime() / 1000)
        return res.status(200).send(
            {valid: false}
        )

    return res.status(200).send({valid: true})
})

/**
 * Get a User (Login):
 *  Validate request body (email and password)
 *  Query by email (unique in database) - if it does not exist return an error
 *  If the returned user object has a mismatched password (with the user input), then return an error
 *  If the user is not verified, return a new cypher for them to verify with
 *  ** No Auth **
 */
app.post("/api/user/information", (req, res) => {
    console.log(`Called into POST user/information (email)`);
    
    try {
        validateEmailPwd(req.body)
    } catch (e) {
        res.statusMessage = e.message
        return res.status(404).send()
    }
    
    const search = req.body;
    const email = search.email
    const password = search.password

    const query = {
        email: email
    }

    getOneFrom(DB_NAME, USERS_COLLECTION, query)
    .then((foundUser) => {
        if(!foundUser){
            throw new Error(USER_NOT_EXISTS)
        }
        if(foundUser.deactivated){
            throw new Error(USER_INACTIVE)
        }
        if(password !== decodeString(foundUser.password)){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(!foundUser.verified){
            return res.status(202).send(encodeString(search))
        }

        const token = jwt.sign(
            { 
                email: email,
                password: password,
                fullName: foundUser.fullName,
                verified: foundUser.verified,
                deactivated: foundUser.deactivated,
                admin: foundUser.admin
            },
            SECRET_TOKEN,
            {expiresIn: 60 * 60 * 10});

        foundUser = {
            verified: foundUser.verified,
            deactivated: foundUser.deactivated,
            admin: foundUser.admin,
            token: token
        }

        return res.status(200).send(foundUser)
    })
    .catch((err) => {
        res.statusMessage = err.message
        res.status(404).send()
    });
});

/**
 * Update a User in the DB
 *  First check if a user with this email exists - return an error if not
 *  Check if the inputted password matches the existing password in the DB
 *  Then update the user document in the DB, setting the password to the new user inputted password
 *  ** No Auth **
 */
app.put("/api/user", async (req, res) => {
    try {
        validateEmailPwd(req.body)
    } catch (e) {
        res.statusMessage = e.message
        return res.status(404).send()
    }

    const body = req.body;
    const email = body.email

    const search = {
        email: email
    }

    const password = body.password
    const newPassword = encodeString(body.newPassword)

    await getOneFrom(DB_NAME, USERS_COLLECTION, search)
    .then((foundUser) => {
        if(!foundUser){
            throw new Error(USER_NOT_EXISTS)
        }
        if(password !== decodeString(foundUser.password)){
            throw new Error(INCORRECT_PASSWORD)
        }
    })
    .then(() => updateOneFrom(DB_NAME, USERS_COLLECTION, search, { 
        $set: {
            password: newPassword
        } 
    })).then((result) => {
        if (!result) {
            throw new Error(COULD_NOT_UPDATE)
        }

        console.log("Success In Change")
    })
    .catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });
    
    return res.status(200).send();
})

/**
 * Decrypt a User encrypted string in order to verify the User who clicked it
 *  First decrypt the string, then check the resulting data (email exists, password matches record)
 *  Then update the corresponding User document in the DB, setting verified = true
 */
app.post("/api/user/decrypt", async (req, res) => {
    const id = req.body.id
    
    const decryptedData = decodeString(id)
    const email = decryptedData.email

    console.log("Decrypted")
    console.log(decryptedData)

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: email})
    .then((foundUser) => {
        console.log(foundUser)
        if(!foundUser){
            throw new Error(USER_NOT_EXISTS) 
        }
        if(decryptedData.password !== decodeString(foundUser.password)){
            throw new Error(INCORRECT_PASSWORD)
        }
    }).then(() => updateOneFrom(
        DB_NAME, USERS_COLLECTION, {email: email}, {
            $set: {
                verified: true
            }
        }
    )).then((result) => {
        if (!result) {
            throw new Error(COULD_NOT_DECRYPT)
        }

        console.log("Successfully Verified User")
        return res.status(200).send(result);
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    })
})

/**
 * Add a new User to the DB
 *  First check if a user with this email already exists, returning an error if so (no two users can have the same email)
 *  Then insert the (unverified) user object into the DB, returning an error in case of failure
 *  Then generate a cypher for the user to verify their email with and return it to them
 *  ** No Auth **
 */
app.post("/api/user", async (req, res) => {
    try {
        validateRegistration(req.body)
    } catch (e) {
        res.statusMessage = e.message
        return res.status(404).send()
    }

    const body = req.body;
    const email = body.email
    const password = encodeString(body.password)

    const search = {
        email: email
    }
    const userDetails = {
        email: email,
        password: body.password
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, search)
    .then((foundUser) => {
        console.log(foundUser)
        if(foundUser){
            throw new Error(EMAIL_EXISTS)
        }
    }).then(() => insertOne(DB_NAME, USERS_COLLECTION, {
        email: email,
        password: password,
        fullName: body.fullName,
        deactivated: false,
        verified: false
    })).then((result) => {
        if (!result) {
            throw new Error(CANNOT_INSERT)
        }

        console.log("Successfully Inserted")
    }).then(() => {
        const cypher = CryptoJS.AES.encrypt(JSON.stringify(userDetails), SECRET_TOKEN).toString()
        return res.status(200).send(cypher)
    }).catch((err) => {
        console.log(err)
        res.statusMessage = err.message
        return res.status(404).send()
    });
})

/**
 * Create a playlist (for authenticated users)
 *  Modify the input slightly - apply correct IDs for all playlist tracks (for joining with the tracks table) and get the current datetime
 *  Check that all of the tracks that the user wants to add to the playlist exist, returning an error if not
 *  Return errors if the user is not logged in, logged in to the wrong account, the playlist is empty (no tracks), or the playlist has no title
 *  Then check if this playlist title already exists, returning an error if so
 *  Then get all of the user's existing playlists, returining an error if they already have more than the max number of playlists (20)
 *  Then insert the playlist into the playlists DB and return a success message
 */
app.put('/api/authenticated/playlists', auth, async (req, res) => {
    console.log("Called into PUT authenticated playlists")
    const date = `${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} GMT`

    const modifiedTracks = []
    req.body.tracks.forEach((t) => {
        modifiedTracks.push({
            ...t,
            _id: new ObjectId(t._id)
        })
    })

    await checkTracksExist(modifiedTracks)
    .then((data) => {
        if(data.length !== modifiedTracks.length){
            throw new Error(INVALID_TRACK_EXISTS)
        }
    }).then(() => getOneFrom(
        DB_NAME, USERS_COLLECTION, {email: req.user.email}
    )).then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(modifiedTracks.length === 0){
            throw new Error(EMPTY_PLAYLIST_ERROR)
        }
        if(req.body.list_title.length === 0){
            throw new Error(EMPTY_TITLE_ERROR)
        }
    }).then(() => getOneFrom(DB_NAME, PLAYLISTS_COLLECTION, {
        list_title: req.body.list_title,
        email: req.user.email
    })).then((data) => {
        if(data){
            throw new Error(PLAYLIST_EXISTS_ERROR)
        }
    }).then(() => getAllFrom(DB_NAME, PLAYLISTS_COLLECTION, {
        email: req.user.email
    })).then((data) => {
        if(data.length >= MAX_NUM_PLAYLISTS){
            throw new Error(TOO_MANY_PLAYLISTS)
        }
    }).then(() => insertOne(DB_NAME, PLAYLISTS_COLLECTION, {
        email: req.user.email,
        list_title: req.body.list_title,
        visibility: req.body.visibility,
        tracks: modifiedTracks,
        description: req.body.description,
        date_modified: date,
        user_name: req.user.fullName,
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

/**
 * Update hide status of reviews
 * 
 * ** MUST BE ADMIN ** --> TODO: how would we checkfor this is the endpoint
 */
 app.put('/api/admin/review', auth, async (req, res) => {
    console.log("Called into PUT user update")

    // const search = {
    //     _id: req.body._id,
    // }

    const search = {
        comments: req.body.comments,
    }
    
    const newHidden = (req.body.hidden)
    console.log("new hidden: " + newHidden)
    
    const query = {
        $set: {
            hidden: newHidden
        } 
    }

    // Update review
    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.user.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(req.user.admin === false){
            throw new Error(NO_ACCESS_ERROR)
        }
    }).then(() => updateOneFrom(DB_NAME, REVIEWS_COLLECTION, search, query))
    .then(() => getOneFrom(DB_NAME, REVIEWS_COLLECTION, search))
    .then((review) => {  
        console.log(review)
        console.log("Successfully updated review")
        return res.status(200).send(review);
    })
    .catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})


/**
 * Get all tracks with IDs in the user inputted list of IDs
 *  Formulate the user input into a MongoDB query, then return the list of tracks
 *  ** NO AUTH **
 */
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

/**
 * Get a limited number of public playlists
 *  Create the DB queries (limit to only "public" visibilities, only get tracks and date modified (sorted by most recent))
 *  Create an aggregate query, joining the reviews and playlist collections - returns a list of playlists, each containing a list of reviews for that playlist
 *  Run this aggregate and for each playlist record the average rating
 *  Then get all playlists according to the previously defined criteria, returning it to the user
 *  ** NO AUTH **
 */
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
    const reviews = {}
    const trackPlaytimes = {}
    await getAggregate(DB_NAME, PLAYLISTS_COLLECTION, aggQuery)
    .then((result) => {
        result.forEach((r) => {
            let sum = 0
            let count = 0
            r.PlaylistReviews.forEach((p) => {
                sum += p.rating
                count++
            })

            let totalPlaytime = 0;
            r.tracks.forEach((t) => {
                const playtime = parseTime(t.track_duration) * t.track_listens;
                totalPlaytime += playtime
            })

            trackPlaytimes[r._id] = secondsToTime(totalPlaytime)
            reviews[r._id] = r.PlaylistReviews
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
                avg_rating: avgRating,
                reviews: reviews[d._id],
                playtime: trackPlaytimes[d._id]
            })
        })
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    })

    return res.status(200).send(result)
})

const parseTime = (time) => {
    var seconds = 0
    const timeComponents = time.split(":")
    for(var i = 0; i < timeComponents.length; i++){
        seconds = 60 * seconds + parseInt(timeComponents[i])
    }

    return seconds
}

const secondsToTime = (seconds) => {
    let date = new Date(null);
    date.setSeconds(seconds);

    return parseFloat(((date - new Date(null)) / 36e5).toString()).toFixed(1);
}

/**
 * Fuzzy search for tracks, matching user input against the artist name, track title, and genres for each track
 *  Split the user input by comma (ie. "abc, def" -> results need to match both "abc" AND "def")
 *  Perform a search on tracks according to the user queries, recording how many times each track has come up
 *  Return tracks that match ALL of the user's queries
 *  Note: fuzzy searching is applied here (built into MongoDB) - each subquery is searched with double replacement
 *  ** NO AUTH **
 */
app.get('/api/search/:query', async (req, res) => {
    console.log("Called into search " + req.params.query)

    try{
        validateSearch(req.params.query)
    } catch (e) {
        console.log(e.message)
        res.statusMessage = e.message
        return res.status(404).send()
    }
        
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
        .catch((err) => {
            res.statusMessage = err.message
            res.status(404).send()
        })
        it++;
    }
    res.send(Object.values(results).filter((item) => {return item.count === queries.length}))
})

/**
 * Get all of a specific User's playlists
 *  First check if the user is logged into the correct account that they are trying to access (and this account exists)
 *  Then get all of this User's playlists (query by email), retuning them if found and an error if not
 */
app.get('/api/authenticated/playlists', auth, async (req, res) => {
    console.log("Called into GET playlists")

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.user.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
    }).then(() => getAllFrom(DB_NAME, PLAYLISTS_COLLECTION, {
        email: req.user.email
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

/**
 * Update a User's playlist
 *  First set up the queries (key being email, list title pair - this is enforced as unique)
 *  Check if all of the tracks that the user wants to add exist, returning an error if not
 *  Then verify that the user is logged into the correct account that they are trying to modify under
 *  Check that the playlist title is not empty and the playlist contains at least one track
 *  Then update the value, retuning a success code if updated or an error if not
 */
app.put('/api/authenticated/playlist', auth, async (req, res) => {
    console.log("Called into PUT playlist")

    const key = {
        email: req.user.email,
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
        if(data.length !== req.body.tracks.length){
            throw new Error(INVALID_TRACK_EXISTS)
        }
    }).then(() => getOneFrom(
        DB_NAME, USERS_COLLECTION, {email: req.user.email}
    )).then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(req.body.tracks.length === 0){
            throw new Error(EMPTY_PLAYLIST_ERROR)
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

/**
 * Delete a User's playlist
 *  Query by (email, playlist title) pair - enforced as unique
 *  First check that the user is logged into the account that they are deleting from
 *  Then delete the playlist, returning an error if the playlist does not exist or nothing was deleted
 */
app.delete("/api/authenticated/playlist", auth, async (req, res) => {
    console.log("Called into DELETE playlist")

    const key = {
        email: req.user.email,
        list_title: req.body.list_title
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.user.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
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

//TODO: Is it correct to use PUT here?
/**
 * Create a review for a playlist
 *  Query based on (reviewer email, playlist title, creator email) tuple - must be unique (user can only post one review per playlist)
 *  First check that the user is logged into the account that they are trying to review from
 *  Check that the review contains a rating (comment is optional)
 *  Insert the review - if a review already exists for this playlist by this user, then replace it (this is the {upsert: true} option)
 *  Notify the user of success or failure
 */
app.put('/api/authenticated/review', auth, async (req, res) => {
    console.log("Called into PUT review")

    console.log(req.user)
    const date = `${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} GMT`
    const key = {
        email: req.user.email,
        list_id: ObjectId(req.body.list_id),
        creator_email: req.body.creator_email
    }
    const query = {
        $set: {
            email: req.user.email,
            list_id: ObjectId(req.body.list_id),
            modified_date: date,
            rating: req.body.rating,
            comments: req.body.comments,
            creator_email: req.body.creator_email,
            user_name: req.user.fullName,
            hidden: false
        }
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.user.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(!req.body.rating || req.body.rating.length === 0){
            throw new Error(EMPTY_RATING)
        }
    }).then(() => updateOneFrom(
        DB_NAME, REVIEWS_COLLECTION, key, query, {upsert: true}
    )).then(() => {
        console.log("Successfully completed review")
        return res.status(200).send()
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

/**
 * Get reviews for a User (queried by email)
 *  Check that the user is logged into the account they are attempting to query from
 *  Get all of this User's reviews and send them to the client
 */
app.get('/api/authenticated/reviews', auth, async (req, res) => {
    console.log("Called into POST review")

    const key = {
        email: req.user.email
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, key)
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
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

/**
 * Get all users
 *  First check if the requester is an admin and logged in
 *  Then get a list of all users (full name, email, verified status, admin status and deactivated status)
 */
 app.get('/api/admin/users', auth, async (req, res) => {
    console.log("Called into GET users")

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.user.email})
    .then((data) => {
        
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(req.user.admin === false){
            throw new Error(NO_ACCESS_ERROR)
        }
    }).then(() => getAllFrom(DB_NAME, USERS_COLLECTION)).then((data) => {
        if(!data){
            throw new Error(NO_USERS_EXIST)
        }
        console.log("Successfully got users")
        return res.status(200).send(data)
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

/**
 * Admin edit user settings
 *  First check if the requester is an admin and logged in
 *  Then, update admin status and active stat
 */
 app.put('/api/admin/users/:setting', auth, async (req, res) => {
    console.log("Called into PUT user update")

    const toChange = req.params.setting
    const search = {
        email: req.body.email,
    }
    const newAdmin = req.body.admin
    const newDeactivated = req.body.deactivated

    let query = {}

    // Set update query
    if (toChange === "admin"){
        query = {
            $set: {
                admin: newAdmin
            } 
        }
    } else if (toChange === "deactivate"){
        query = {
            $set: {
                deactivated: newDeactivated,
                admin: newAdmin,
            } 
        }
    }

    // Update user info
    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.user.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(req.user.admin === false){
            throw new Error(NO_ACCESS_ERROR)
        }
    }).then(() => updateOneFrom(DB_NAME, USERS_COLLECTION, search, query))
    .then(() => getOneFrom(DB_NAME, USERS_COLLECTION, search))
    .then((user) => {  
        console.log(user)
        console.log("Successfully updated user")
        return res.status(200).send(user);
    })
    .catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

/**
 * Update privacy policy, Admin only
 */
 app.post('/api/admin/policy', auth, async (req, res) => {
    console.log("Called into POST policy")
    const content = req.body.content

    const date = `${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} GMT`
    const message = {
        date_modified: date,
        content: content
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.user.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(req.user.admin === false){
            throw new Error(NO_ACCESS_ERROR)
        }
    }).then(() => insertOne(DB_NAME, POLICIES_COLLECTION, message))
    .then((result) => {
        if (!result) {
            throw new Error(CANNOT_INSERT)
        }

        console.log("Successfully Inserted Privacy Policy")
        return res.status(200).send(message);
    }).catch((err) => {
        console.log(err)
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

/**
 * Get policies
 */
 app.get('/api/policy', async (req, res) => {
    console.log("Called into GET policies")

    await getAllFrom(DB_NAME, POLICIES_COLLECTION).then((data) => {
        if(!data){
            throw new Error(NO_POLICIES_EXIST)
        }
        data.sort((a,b) => (a.date > b.date) ? 1 : -1)
        console.log("Successfully got policy")
        return res.status(200).send(data[0])
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

/**
 * Update privacy policy, Admin only
 */
 app.post('/api/admin/dmca-policy', auth, async (req, res) => {
    console.log("Called into POST DMCA policy")
    const policy = req.body.policy

    const date = `${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} GMT`
    const message = {
        date_modified: date,
        policy: policy
    }

    await getOneFrom(DB_NAME, USERS_COLLECTION, {email: req.user.email})
    .then((data) => {
        if(!data){
            throw new Error(USER_NOT_LOGGED_IN)
        }
        if(decodeString(data.password) !== req.user.password){
            throw new Error(INCORRECT_PASSWORD)
        }
        if(req.user.admin === false){
            throw new Error(NO_ACCESS_ERROR)
        }
    }).then(() => insertOne(DB_NAME, DMCA_POLICIES_COLLECTION, message))
    .then((result) => {
        if (!result) {
            throw new Error(CANNOT_INSERT)
        }

        console.log("Successfully Inserted DMCA Policy")
        return res.status(200).send(message);
    }).catch((err) => {
        console.log(err)
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

/**
 * Get policies
 */
 app.get('/api/dmca-policy', async (req, res) => {
    console.log("Called into GET policies")

    await getAllFrom(DB_NAME, DMCA_POLICIES_COLLECTION).then((data) => {
        if(!data){
            throw new Error(NO_POLICIES_EXIST)
        }
        data.sort((a,b) => (a.date > b.date) ? 1 : -1)
        console.log("Successfully got policy")
        return res.status(200).send(data[0])
    }).catch((err) => {
        res.statusMessage = err.message
        return res.status(404).send()
    });

    return res.status(400).send();
})

/**
 * Helper function: query the MongoDB collection according to the entered query (with optional options) to get a single result
 * @param {string} dbName: name of DB to connect to (we use "music")
 * @param {string} collectionName: name of the collection in the DB to query
 * @param {object} query: object to query the database with
 * @param {object} options: optional options (ie. ordering, include only specific attributes, etc)
 * @returns a single DB response object
 * I think findOne was wrongly deprecated
 */
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

/**
 * Helper function: query the MongoDB collection according to the entered query (with optional options) to get all results
 * @param {string} dbName: name of DB to connect to (we use "music")
 * @param {string} collectionName: name of the collection in the DB to query
 * @param {object} query: object to query the database with
 * @param {object} options: optional options (ie. ordering, include only specific attributes, etc)
* @returns a complex DB response object
 */
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

/**
 * Helper function: query the MongoDB collection according to the entered query (with optional options) as an aggregate function
 * @param {string} dbName: name of DB to connect to (we use "music")
 * @param {string} collectionName: name of the collection in the DB to query
 * @param {object} query: aggregate function to query the database with
 * @param {object} options: optional options (ie. ordering, include only specific attributes, etc)
 * @returns a complex DB response object
 */
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

/**
 * Helper function: query the MongoDB collection according to the entered query (with optional options) to update a single document
 * @param {string} dbName: name of DB to connect to (we use "music")
 * @param {string} collectionName: name of the collection in the DB to query
 * @param {object} key: key for the object - uniquely identifies the object that is to be modified
 * @param {object} query: contains changes to make to the object identified by the key
 * @param {object} additional: optional options (ie. ordering, include only specific attributes, etc)
 * @returns a complex DB response object
 * I think findOneAndUpdate (with options) was wrongly deprecated
 */
const updateOneFrom = async (dbName, collectionName, key, query, additional={}) => {
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    const result = collection.findOneAndUpdate(key, query, additional)
    .catch((e) => {throw new Error(e.message)})

    return result;
}

/**
 * Helper function: query the MongoDB collection according to the entered query (with optional options) to insert a single document
 * @param {string} dbName: name of DB to connect to (we use "music")
 * @param {string} collectionName: name of the collection in the DB to query
 * @param {object} doc: document to insert into the database
 * @returns an object with information about the insertion (success, etc.)
 */
const insertOne = async (dbName, collectionName, doc) => {
    await client.connect()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    
    const result = collection.insertOne(doc)
    .catch((e) => {throw new Error(e.message)})

    return result;
}

/**
 * Helper function: query the MongoDB collection according to the entered query (with optional options) to delete a single document
 * @param {string} dbName: name of DB to connect to (we use "music")
 * @param {string} collectionName: name of the collection in the DB to query
 * @param {object} query: key for the object - uniquely identifies the object that is to be deleted
 * @returns an object with infromation about the deletion
 */
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

/**
 * Helper function: query the MongoDB "tracks" collection according to find if all passed tracks exist in the collection
 * @param {list} tracks: list of tracks to check for existence
 * @returns a list of all tracks that were in the tracks argument that also exist in the "tracks" DB
 */
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

/*
 * Was a helper function for uploading data - should be deleted if not needed anymore
 */
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

function validateRegistration(body){
    var pwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!#%*&^]{8,30}$/;
    var name = /^(?=.*[^{}]+$)(?!.*<[^>]+>).*/;

    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().regex(pwd).required(),
        fullName: Joi.string().min(2).max(40).regex(name).required(),
    })
 
    const result = schema.validate(body)

    if (result.error){
        const key = result.error.details[0].context.key
        if (key === "password") {
            throw new Error(INVALID_PWD)
        } else if (key === "email"){
            throw new Error(INVALID_EMAIL)
        } else if (key === "fullName"){
            throw new Error(INVALID_NAME)
        }
    }
}

function validateSearch(query){
    let queries = [];
    let split = query.split(",")
    split.forEach((q) => {
        queries.push(q.trim())
    })

    var rgex1 = /^(?!.*<[^>]+>).*/;
    var rgex2 = /^[^{}]+$/;

    console.log("This is the query:", queries)

    queries.forEach((q) => {
        if(q === "" || !rgex1.test(q) || !rgex2.test(q)){
            throw new Error(INVALID_SEARCH)
        } 
    })
}

function validateEmailPwd(body){
    // Password must be at least 8 characters, have at least one upper and one lowercase letter, 
    // at least one number, and a special character. No spaces allowed.

    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!#%*&^]{8,30}$/).required()
    })
 
    const result = schema.validate(body)

    if (result.error){
        const key = result.error.details[0].context.key
        if (key === "password") {
            throw new Error(INVALID_PWD)
        } else if (key === "email"){
            throw new Error(INVALID_EMAIL)
        }
    }
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