const express = require("express");
const app = express();
// Middleware
const userRoutes = require("./routes/userRoutes");
app.use(express.json());
// Test route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,

        message: "Node.js MVC API is running At "+Date()
    });
});

app.use("/api/users", userRoutes);

module.exports = app;