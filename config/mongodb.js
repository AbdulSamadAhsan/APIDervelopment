const mongoose = require("mongoose");

let connectionPromise;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        }).finally(() => {
            connectionPromise = undefined;
        });
    }

    return connectionPromise;
}

module.exports = connectDB;