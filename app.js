require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const app = express();
// Middleware
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const connectDB = require("./config/mongodb");
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use("/api/users", userRoutes);


app.use("/api/products", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        res.status(503).json({
            success: false,
            message: "Database unavailable"
        });
    }
}, productRoutes);
module.exports = app;
