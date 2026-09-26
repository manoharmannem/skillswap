import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI environment variable is not configured");

  connectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  }).then((connection) => {
    console.log("MongoDB connected successfully");
    return connection;
  }).catch((error) => {
    connectionPromise = null;
    console.error("MongoDB connection failed:", error.message);
    throw error;
  });

  return connectionPromise;
};

export default connectDB;
