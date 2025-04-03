const axios = require("axios");
const Feed = require("../models/Feed");
const { parseFeed } = require("../utils/rssParser");

// Fetch RSS Feed Data
exports.fetchRSS = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const feedData = await parseFeed(url);
    res.json(feedData);
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    res.status(500).json({ error: "Failed to fetch RSS feed", message: error.message });
  }
};

// Fetch RSS Feed Items by Feed ID
exports.getFeedContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the feed by ID
    const feed = await Feed.findById(id);
    if (!feed) {
      return res.status(404).json({ error: "Feed not found" });
    }
    
    // Parse the feed URL to get content
    const feedData = await parseFeed(feed.url);
    res.json({
      feed: {
        _id: feed._id,
        title: feed.title,
        url: feed.url,
      },
      content: feedData
    });
  } catch (error) {
    console.error("Error getting feed content:", error);
    res.status(500).json({ error: "Failed to fetch feed content", message: error.message });
  }
};

// Save RSS Feed to Database
exports.saveFeed = async (req, res) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) return res.status(400).json({ error: "Title and URL are required" });

    // Validate that the URL is a valid RSS feed
    try {
      await parseFeed(url);
    } catch (error) {
      return res.status(400).json({ error: "Invalid RSS feed URL" });
    }

    const newFeed = new Feed({ title, url });
    await newFeed.save();
    res.json(newFeed);
  } catch (error) {
    res.status(500).json({ error: "Failed to save feed" });
  }
};

// Fetch all saved RSS Feeds from MongoDB
exports.getFeeds = async (req, res) => {
  try {
    const feeds = await Feed.find();
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feeds" });
  }
};

// Delete an RSS Feed
exports.deleteFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Feed.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: "Feed not found" });
    }
    
    res.json({ message: "Feed deleted successfully" });
  } catch (error) {
    console.error("Error deleting feed:", error);
    res.status(500).json({ error: "Failed to delete feed" });
  }
};