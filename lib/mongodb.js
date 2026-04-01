const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

let cachedClient = global._mongoClient;
let cachedPromise = global._mongoClientPromise;

async function getDatabase() {
  if (!cachedPromise) {
    const client = new MongoClient(uri);
    cachedClient = client;
    cachedPromise = client.connect();
    global._mongoClient = client;
    global._mongoClientPromise = cachedPromise;
  }

  const client = await cachedPromise;
  return client.db("neomotion");
}

module.exports = {
  getDatabase
};
