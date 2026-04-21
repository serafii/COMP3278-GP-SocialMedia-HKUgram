import { useState, useEffect } from 'react';
import CreatePostForm from '../components/CreatePostForm';

interface Post {
  id: number;
  user_id: number;
  username: string;
  text_content: string;
  image_url: string | null;
  like_count: number;
  created_at: string;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/posts/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📱 HKgram</h1>
        <p style={styles.subtitle}>Share your moments</p>
      </div>
      
      <CreatePostForm onPostCreated={handlePostCreated} />
      
      <div style={styles.feed}>
        <h3 style={styles.feedTitle}>Recent Posts</h3>
        
        {error && <div style={styles.error}>{error}</div>}
        
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={styles.emptyState}>
            <p>✨ No posts yet. Be the first to create a post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={styles.postCard}>
              <div style={styles.postHeader}>
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>
                    {post.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={styles.username}>{post.username}</strong>
                    <span style={styles.timestamp}>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <p style={styles.postText}>{post.text_content}</p>
              
              {post.image_url && (
                <div style={styles.imageContainer}>
                  <img 
                    src={post.image_url} 
                    alt="Post content" 
                    style={styles.postImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div style={styles.postFooter}>
                <button style={styles.likeButton}>
                  ❤️ {post.like_count} likes
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#fafafa',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    margin: 0,
    color: '#1877f2',
    fontSize: '32px',
  },
  subtitle: {
    margin: '5px 0 0',
    color: '#666',
    fontSize: '14px',
  },
  feed: {
    marginTop: '20px',
  },
  feedTitle: {
    marginBottom: '15px',
    color: '#333',
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  postHeader: {
    marginBottom: '12px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1877f2',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  username: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
  },
  timestamp: {
    display: 'block',
    fontSize: '11px',
    color: '#999',
    marginTop: '2px',
  },
  postText: {
    margin: '10px 0',
    fontSize: '15px',
    lineHeight: '1.4',
    color: '#333',
  },
  imageContainer: {
    marginTop: '10px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover' as const,
  },
  postFooter: {
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
  },
  likeButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666',
  },
  spinner: {
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #1877f2',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 10px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '12px',
    color: '#666',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
};

// Add spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
