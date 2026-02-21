import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js"

dotenv.config({path: "./env"})

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is listening on Port: ${PORT}`);
        });
    })
    .catch(err => console.error("MongoDB Connection Failed!!!"));

















/*
import express from "express";
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERR:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log("App is listening on port", process.env.PORT);
        });
    }
    catch(err) {
        console.error("Error Connecting with MongoDB Atlas", err);
    }
})();
*/