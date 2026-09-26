const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {

    if (isConnected) {
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }

    try {

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        isConnected = true;

        console.log("MongoDB connected successfully");
        console.log("Database:", mongoose.connection.name);

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        throw error;
    }
};

module.exports = connectDB;