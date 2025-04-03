const Feed = require('../models/feed');
const RSSParser = require('rss-parser');

// Fetch and save RSS feed
const addFeed = async (req, res) => {
  const { url } = req.body;
  const parser = new RSSParser();

  try {
    const feed = await parser.parseURL(url);
    const feedItems = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet,
      pubDate: item.pubDate,
    }));

    await Feed.insertMany(feedItems);
    res.json({ message: 'Feed added successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid RSS Feed URL or unable to fetch feed' });
  }
};

// Get all feeds with pagination
const getFeeds = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const feeds = await Feed.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a feed
const deleteFeed = async (req, res) => {
  try {
    await Feed.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feed deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search feeds by query
const searchFeeds = async (req, res) => {
  const { query } = req.query;
  try {
    const results = await Feed.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Refresh feed (not fully implemented but should update feed)
const refreshFeed = async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    const parser = new RSSParser();
    const updatedFeed = await parser.parseURL(feed.link);

    const updatedFeedItems = updatedFeed.items.map(item => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet,
      pubDate: item.pubDate,
    }));

    await Feed.updateOne(
      { _id: req.params.id },
      { $set: { ...updatedFeedItems[0] } }
    );

    res.json({ message: 'Feed refreshed successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addFeed,
  getFeeds,
  deleteFeed,
  searchFeeds,
  refreshFeed,
};
