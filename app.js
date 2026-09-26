const express = require("express");
const cors = require("cors");
const app = express();
// Middleware
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const helmet = require("helmet");

app.use(express.json());
// Test route
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use("/api/users", userRoutes);

app.use("/api/products", productRoutes);
module.exports = app;