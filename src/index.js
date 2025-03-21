import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import job from "./lib/cron.js";
import connectToDb from "./lib/db.js";
const app = express();


// Port
const PORT = process.env.PORT || 5000;

// Middleware
job.start();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Express Server" });
});



// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToDb();
});
