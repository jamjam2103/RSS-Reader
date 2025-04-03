const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }
});

module.exports = mongoose.model("Feed", feedSchema);