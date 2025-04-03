import { useState, useEffect } from "react";
import axios from "axios";
import FeedViewer from "./components/FeedViewer";
import "./App.css";

const API_URL = "http://localhost:3000/api"; // Change if backend is hosted elsewhere

function App() {
  const [feeds, setFeeds] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    fetchFeeds();
  }, []);

  useEffect(() => {
    // Validate form inputs
    setIsFormValid(title.trim() !== "" && isValidUrl(url));
  }, [title, url]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const fetchFeeds = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/feeds`);
      setFeeds(response.data);
    } catch (error) {
      console.error("Error fetching feeds:", error);
      setError("Failed to load feeds. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/feeds`, { title, url });
      fetchFeeds(); // Refresh feeds
      setTitle("");
      setUrl("");
      setPreviewUrl("");
      setPreviewData(null);
    } catch (error) {
      console.error("Error saving feed:", error);
      setError("Failed to add feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feed?")) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/feeds/${id}`);
      fetchFeeds(); // Refresh feeds
    } catch (error) {
      console.error("Error deleting feed:", error);
      setError("Failed to delete feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchFeeds();
  };

  const openFeedViewer = (id) => {
    setSelectedFeedId(id);
  };

  const closeFeedViewer = () => {
    setSelectedFeedId(null);
  };

  const handlePreview = async () => {
    if (!isValidUrl(url)) return;

    setPreviewLoading(true);
    setPreviewError("");
    
    try {
      const response = await axios.get(`${API_URL}/parse-rss`, {
        params: { url }
      });
      setPreviewData(response.data);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error previewing feed:", error);
      setPreviewError("Failed to preview feed. Please check the URL and try again.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const clearPreview = () => {
    setPreviewData(null);
    setPreviewUrl("");
    setPreviewError("");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <i className="fas fa-rss"></i> RSS Reader
        </h1>
      </header>

      <div className="card">
        <h2 className="card-header">
          <i className="fas fa-plus-circle"></i> Add New Feed
        </h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Feed Title (e.g. TechCrunch)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="url"
              className="form-control"
              placeholder="Feed URL (e.g. https://techcrunch.com/feed/)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-buttons">
            <button 
              type="submit" 
              className="btn-add-feed"
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div> Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i> Add Feed
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="btn-preview-feed"
              onClick={handlePreview}
              disabled={!isValidUrl(url) || previewLoading}
            >
              {previewLoading ? (
                <>
                  <div className="loading-spinner"></div> Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-eye"></i> Preview
                </>
              )}
            </button>
          </div>
        </form>

        {previewError && (
          <div className="preview-error">
            <i className="fas fa-exclamation-circle"></i> {previewError}
          </div>
        )}

        {previewData && (
          <div className="feed-preview">
            <div className="preview-header">
              <h3>
                <i className="fas fa-eye"></i> Feed Preview
              </h3>
              <button 
                className="btn-close-preview"
                onClick={clearPreview}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="preview-info">
              <div className="preview-title">
                {previewData.image && (
                  <img 
                    src={previewData.image} 
                    alt={previewData.title} 
                    className="preview-image"
                  />
                )}
                <h4>{previewData.title}</h4>
              </div>
              {previewData.description && (
                <p className="preview-description">{previewData.description}</p>
              )}
              <div className="preview-meta">
                <span className="preview-item-count">
                  <i className="fas fa-newspaper"></i> {previewData.items.length} articles
                </span>
              </div>
              <div className="preview-actions">
                <button
                  className="btn-use-feed"
                  onClick={() => {
                    if (!title) {
                      setTitle(previewData.title);
                    }
                  }}
                >
                  <i className="fas fa-check"></i> Use this feed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-header">
            <i className="fas fa-bookmark"></i> Saved Feeds
          </h2>
          <button 
            onClick={handleRefresh} 
            className="btn-feed-action"
            disabled={loading}
            title="Refresh feeds"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
        
        {loading && <div className="text-center my-4"><div className="loading-spinner mx-auto"></div></div>}
        
        {!loading && feeds.length === 0 ? (
          <div className="no-feeds">
            <i className="fas fa-info-circle me-2"></i> No feeds added yet. Add your first RSS feed above!
          </div>
        ) : (
          <ul className="feed-list">
            {feeds.map((feed, index) => (
              <li 
                key={feed._id} 
                className="feed-item"
                style={{ "--index": index }}
              >
                <i className="fas fa-rss feed-icon"></i>
                <span className="feed-title">{feed.title}</span>
                <div className="feed-actions">
                  <button 
                    onClick={() => openFeedViewer(feed._id)} 
                    className="btn-feed-action"
                    title="View feed"
                  >
                    <i className="fas fa-newspaper"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(feed._id)} 
                    className="btn-feed-action delete"
                    title="Delete feed"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedFeedId && (
        <FeedViewer 
          feedId={selectedFeedId} 
          onClose={closeFeedViewer} 
        />
      )}
    </div>
  );
}

export default App;