const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const feedRoutes = require("./routes/feedRoutes"); // Import feed routes

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());  // Ensures Express parses JSON requests

// Routes
app.use("/api", feedRoutes);  // Registers the feed routes correctly
//console.log("Feed Routes Loaded:", feedRoutes);

// Default route (optional for testing)
app.get("/", (req, res) => {
  res.send("RSS Reader API is running...");
  //console.log("test")
});

// Database Connection
mongoose.connect("mongodb://localhost:27017/rssreader", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});