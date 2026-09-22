require("dotenv").config({ quiet: false });
const app = require("./app");
const PORT = process.env.PORT || 5000;

const connectDB = require("./config/mongodb");
const startServer = async () => {
    try {
        await connectDB();

  console.log("Database is working") 

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
  
startServer();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});