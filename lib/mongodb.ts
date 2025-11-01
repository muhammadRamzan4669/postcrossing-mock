import { MongoClient } from "mongodb";
import { cache } from "react";

const uri = process.env.MONGODB_URI;

//check if uri not exists
if (!uri) throw new Error("MONGODB_URI is not defined");

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export const getMongoClient = cache(async () => {
  return await clientPromise;
});

export default clientPromise;
