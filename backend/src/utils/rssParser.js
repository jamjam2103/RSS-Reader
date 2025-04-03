const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ],
  },
});

/**
 * Parses an RSS feed URL and returns structured data
 * @param {string} url - The URL of the RSS feed
 * @returns {Promise<Object>} - Parsed feed data
 */
const parseFeed = async (url) => {
  try {
    const feed = await parser.parseURL(url);
    
    // Process feed items to ensure consistent data structure
    const items = feed.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || '',
      creator: item.creator || item.author || '',
      content: item.contentEncoded || item.content || item.description || '',
      categories: item.categories || [],
      guid: item.guid || item.id || item.link || '',
      thumbnail: extractThumbnail(item),
      isoDate: item.isoDate || '',
    }));

    return {
      title: feed.title,
      description: feed.description || '',
      link: feed.link || '',
      feedUrl: feed.feedUrl || url,
      image: feed.image?.url || null,
      lastBuildDate: feed.lastBuildDate || '',
      items
    };
  } catch (error) {
    console.error(`Error parsing RSS feed: ${error.message}`);
    throw new Error(`Failed to parse RSS feed: ${error.message}`);
  }
};

/**
 * Extract thumbnail URL from feed item
 * @param {Object} item - The feed item
 * @returns {string|null} - Thumbnail URL or null if not found
 */
const extractThumbnail = (item) => {
  // Try to get thumbnail from media
  if (item.media && item.media.$ && item.media.$.url) {
    return item.media.$.url;
  }
  
  // Try to get thumbnail from enclosures
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try to get first image from content
  const content = item.contentEncoded || item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  return null;
};

module.exports = { parseFeed }; 