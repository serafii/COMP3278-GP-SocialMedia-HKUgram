import { useState } from 'react';

interface CreatePostFormProps {
  onPostCreated: () => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('');  // Changed from textContent
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some text');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,  // Changed from text_content to content
          image_url: imageUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create post');
      }

      setContent('');  // Changed from setTextContent
      setImageUrl('');
      onPostCreated();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Create New Post</h3>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          placeholder="What's on your mind?"
          value={content}  // Changed from textContent
          onChange={(e) => setContent(e.target.value)}  // Changed from setTextContent
          rows={3}
          style={styles.textarea}
          required
        />
        
        <input
          type="url"
          placeholder="Image URL (optional) - e.g., https://picsum.photos/300/200"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={styles.input}
        />
        
        {imageUrl && (
          <div style={styles.previewContainer}>
            <img 
              src={imageUrl} 
              alt="Preview" 
              style={styles.preview}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                setError('Invalid image URL - image could not be loaded');
              }}
            />
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {})
          }}
        >
          {isSubmitting ? 'Posting...' : '📝 Post'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    marginTop: 0,
    marginBottom: '15px',
    color: '#333',
    fontSize: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  textarea: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  previewContainer: {
    marginTop: '10px',
    textAlign: 'center' as const,
  },
  preview: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    objectFit: 'contain' as const,
  },
  button: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#1877f2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'backgroundColor 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    color: '#d32f2f',
    fontSize: '14px',
    marginBottom: '10px',
    padding: '8px',
    backgroundColor: '#ffebee',
    borderRadius: '6px',
  },
};
