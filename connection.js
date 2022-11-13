const {MongoClient} = require('mongodb')

require("dotenv").config()

const uri = "mongodb+srv://root:root@cluster0.dklnv6c.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri)

// Connect to mongoDB
async function main() {
    try {
        
      await client.connect()
      await listDatabases(client)
    } catch (e) {
      console.error(e)
    } finally {
      await client.close()
    }
  }
  
main().catch(console.error)

async function listDatabases(client){
  databasesList = await client.db().admin().listDatabases();
  console.log("Databases:")
  databasesList.databases.forEach(db => console.log(` - ${db.name}`))
}

async function getUsers(userEmail){
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
  } finally {
    await client.close();
  }
}

getUsers("ebodnar@uwo.ca").catch(console.error);