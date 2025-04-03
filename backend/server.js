const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const feedRoutes = require('./routes/feedRoutes');

// Initialize app
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to the database
mongoose.connect('mongodb://localhost/rssreader', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use routes
app.use('/api/feeds', feedRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
