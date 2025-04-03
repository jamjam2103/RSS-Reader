const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  title: String,
  link: String,
  description: String,
  pubDate: Date,
});

module.exports = mongoose.model('Feed', feedSchema);