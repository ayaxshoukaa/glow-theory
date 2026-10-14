import mongoose, { type Mongoose } from "mongoose";

type MongooseCache = {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var glowTheoryMongoose: MongooseCache | undefined;
}

const cache =
  global.glowTheoryMongoose ??
  (global.glowTheoryMongoose = { connection: null, promise: null });

export async function connectToDatabase(): Promise<Mongoose> {
  if (cache.connection) return cache.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10_000,
      })
      .then((connection) => connection)
      .catch((error: unknown) => {
        cache.promise = null;
        throw error;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
