import express from "express";
import cors from "cors";
import db from "./config/db.config.js";
import dotenv from "dotenv";
import bodyPar from "body-parser";
import router from "./routes/api.js"

dotenv.config()
const app = express();
app.use(bodyPar.json());
app.use(cors());

//Testing database connection 
try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
 
// use router
app.use(router);
 
// listen on port
const APP_PORT = process.env.APP_PORT
app.listen(APP_PORT, () => console.log(`Server running at port ${APP_PORT}`))