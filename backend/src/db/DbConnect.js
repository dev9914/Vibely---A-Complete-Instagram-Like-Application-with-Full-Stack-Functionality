import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import "../config/env.js";

let connectionPromise = null;

const buildMongoUri = () => {
    const baseUri = process.env.MONGODB_URI;
    if (!baseUri) {
        throw new Error("MONGODB_URI is not defined");
    }

    return `${baseUri}/${DB_NAME}`;
};

const connectDb = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    const mongoUri = buildMongoUri();

    connectionPromise = mongoose
        .connect(mongoUri, {
            maxPoolSize: 20,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            autoIndex: true,
        })
        .then(() => {
            console.log("✓ Mongo connected");
            return mongoose.connection;
        })
        .catch((error) => {
            connectionPromise = null;
            console.error("❌ Mongo connection error:", error);
            throw error;
        });

    return connectionPromise;
};

export const disconnectDb = async () => {
    if (mongoose.connection.readyState === 0) {
        return;
    }

    await mongoose.disconnect();
    connectionPromise = null;
    console.log("✓ Mongo disconnected");
};

export default connectDb