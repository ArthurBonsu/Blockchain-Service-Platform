import { MongoClient } from 'mongodb';

declare global {
  // Ensures this is treated as a module by TypeScript
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Check if the global object has the `_mongoClientPromise` property, if not create it
if (!global._mongoClientPromise) {
  const client = new MongoClient(process.env.MONGODB_URI as string);
  global._mongoClientPromise = client.connect();
}

const clientPromise = global._mongoClientPromise as Promise<MongoClient>;

export default clientPromise;
