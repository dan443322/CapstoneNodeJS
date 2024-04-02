const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://arlu143:arlu143@cluster0.7ypc7uv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToMongoDB() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrow the error to handle it in the caller function
  }
}
async function closeMongoDBConnection() {
  try {
    // if (client.isConnected()) {
    await client.close();
    console.log("MongoDB connection closed.");
    // }
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}

module.exports = { connectToMongoDB, closeMongoDBConnection };
