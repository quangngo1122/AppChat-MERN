import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
// dotenv.config({ quiet: true }); // nếu muốn tắt log dotenv khỏi terminal
dotenv.config();
import authRoute from "./routes/authRoute.js";

const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use(express.json()); // giup hiểu và đọc req body dưới dạng json

//public routes
app.use("/api/auth", authRoute);
// private routes

//connect DB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server bat dau tren cong ${PORT}`);
  });
});
