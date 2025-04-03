import { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedViewer.css';

const API_URL = "http://localhost:3000/api";

const FeedViewer = ({ feedId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedContent, setFeedContent] = useState(null);

  useEffect(() => {
    fetchFeedContent();
  }, [feedId]);

  const fetchFeedContent = async () => {
    if (!feedId) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/feeds/${feedId}/content`);
      console.log("API Response:", response.data);  
      console.log("Full feed content structure:", response.data.content);

      if (!response.data || typeof response.data !== 'object') {
        throw new Error("Invalid API response format.");
      }

      setFeedContent(response.data);
    } catch (error) {
      console.error('Error fetching feed content:', error);
      setError('Failed to load feed content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createMarkup = (htmlContent) => {
    return { __html: typeof htmlContent === 'string' ? htmlContent : '' };
  };

  if (loading) {
    return (
      <div className="feed-viewer">
        <div className="feed-viewer-header">
          <h2>Loading Feed...</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-viewer">
        <div className="feed-viewer-header">
          <h2>Error</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchFeedContent}>
            <i className="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!feedContent || !feedContent.content) {
    return (
      <div className="feed-viewer">
        <div className="feed-viewer-header">
          <h2>No Feed Data Available</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="empty-container">
          <p>There is no content available for this feed.</p>
        </div>
      </div>
    );
  }

  const { content } = feedContent;

  return (
    <div className="feed-viewer">
      <div className="feed-viewer-header">
        <div className="feed-viewer-title">
          {content.image && typeof content.image === 'string' && (
            <img
              src={content.image}
              alt={content.title || "Feed"}
              className="feed-logo"
            />
          )}
          <h2>{typeof content.title === 'string' ? content.title : 'Untitled'}</h2>
        </div>
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="feed-description">
        {typeof content.description === 'string' ? (
          <p>{content.description}</p>
        ) : (
          <p>Description not available</p>
        )}
        {content.link && (
          <a href={content.link} target="_blank" rel="noopener noreferrer" className="feed-website-link">
            <i className="fas fa-external-link-alt"></i> Visit Website
          </a>
        )}
      </div>

      <div className="feed-items">
        {Array.isArray(content.items) && content.items.length > 0 ? (
          content.items.map((item, index) => {
            if (typeof item !== 'object' || !item) {
              console.error(`Skipping invalid item at index ${index}:`, item);
              return null;
            }

            const validTitle = typeof item.title === 'string' ? item.title : 'Untitled';
            const validLink = typeof item.link === 'string' ? item.link : '#';
            const validContent = typeof item.content === 'string' ? item.content : '';
            const validThumbnail = typeof item.thumbnail === 'string' ? item.thumbnail : '';
            const validPubDate = item.pubDate ? formatDate(item.pubDate) : '';
            const validCreator = typeof item.creator === 'string' ? item.creator : '';
            const validCategories = Array.isArray(item.categories) ? item.categories : [];

            return (
              <article key={item.guid || index} className="feed-item-article">
                <header className="feed-item-header">
                  <h3 className="feed-item-title">
                    <a href={validLink} target="_blank" rel="noopener noreferrer">
                      {validTitle}
                    </a>
                  </h3>
                  <div className="feed-item-meta">
                    {validPubDate && <span className="feed-item-date"><i className="far fa-clock"></i> {validPubDate}</span>}
                    {validCreator && <span className="feed-item-author"><i className="far fa-user"></i> {validCreator}</span>}
                  </div>
                </header>

                {validThumbnail && <div className="feed-item-thumbnail"><img src={validThumbnail} alt={validTitle} /></div>}

                {validContent ? (
                  <div className="feed-item-content" dangerouslySetInnerHTML={createMarkup(validContent)} />
                ) : (
                  <p>Invalid article content</p>
                )}

                <div className="feed-item-actions">
                  <a href={validLink} target="_blank" rel="noopener noreferrer" className="btn-read-more">
                    <i className="fas fa-book-open"></i> Read More
                  </a>
                </div>
              </article>
            );
          })
        ) : (
          <p>No articles available.</p>
        )}
      </div>
    </div>
  );
};

export default FeedViewer;