// import sequelize
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
// create connection
const db = new Sequelize(
 process.env.DB_DATABASE,
 process.env.DB_USERNAME,
 process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION,
    pool: {
        max: 5, // max nr con
        min: 0, // min nr con
        acquire: 30000, //time out
        idle: 10000 //release time
    },
    define: {        
        freezeTableName: true,
        createdAt:false,
        updatedAt:false
    },
  }
);
 
// export connection
export default db;