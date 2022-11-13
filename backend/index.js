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

app.get("/api/user/:email", (req, res) => {
    console.log(`Called into GET artist (id) with ${req.params.email}`);
    getUser(req.params.email)
    .then((data) => res.send(data))
    .catch((err) => res.status(404).send(err));
});

async function getUser(userEmail){
    await client.connect()
    try {
        const database = client.db("music");
        const users = database.collection("users");
        // Query for a movie that has the title 'The Room'
        const query = { email: userEmail };
        const options = {
        // sort matched documents in descending order by rating
        sort: { },
        // Include only the `title` and `imdb` fields in the returned document
        //projection: { _id: 0, title: 1, imdb: 1 },
        };
        const user = await users.findOne(query, options);
        // since this method returns the matched document, not a cursor, print it directly
        console.log(user);
        return user;
    } 
    finally {
        await client.close();
    }
}

app.listen(port, () => console.log(`Listening on port ${port}...`));