const express = require('express');
const router = express.Router();

const feedController = require('../controllers/feedController');

// Routes for feeds
router.post('/addFeed', feedController.addFeed);
router.get('/', feedController.getFeeds);
router.delete('/deleteFeed/:id', feedController.deleteFeed);
router.get('/searchFeeds', feedController.searchFeeds);
router.post('/refreshFeed/:id', feedController.refreshFeed);

module.exports = router;
