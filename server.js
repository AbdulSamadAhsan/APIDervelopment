const app = require("./app");
const PORT = process.env.PORT || 5000;

const connectDB = require("./config/mongodb");
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
  
startServer();
