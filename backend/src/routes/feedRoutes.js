const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");

// GET all saved feeds
router.get("/feeds", feedController.getFeeds);

// POST a new feed
router.post("/feeds", feedController.saveFeed);

// DELETE a feed
router.delete("/feeds/:id", feedController.deleteFeed);

// GET RSS feed content by feed ID
router.get("/feeds/:id/content", feedController.getFeedContent);

// GET parsed RSS feed from URL (for testing/previewing)
router.get("/parse-rss", feedController.fetchRSS);

module.exports = router;