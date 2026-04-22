import { useState } from 'react';
import { Image as ImageIcon, Send } from 'lucide-react';

interface CreatePostFormProps {
  onPostCreated: () => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          image_url: imageUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create post');
      }

      setContent('');
      setImageUrl('');
      onPostCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-dark-800 rounded-2xl p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Textbox - Styled to match Login/Signup */}
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="w-full bg-dark-900 border border-dark-600 text-white rounded-xl p-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-gray-600 resize-none"
          required
        />
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Image URL Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <ImageIcon className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-brand-500 transition-colors placeholder:text-gray-600 text-sm"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all w-full sm:w-auto ${
              isSubmitting || !content.trim() 
              ? 'bg-dark-600 text-gray-500 cursor-not-allowed' 
              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.3)]'
            }`}
          >
            {isSubmitting ? 'Posting...' : (
              <>
                <Send className="w-4 h-4" />
                Post
              </>
            )}
          </button>
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="mt-2 rounded-xl overflow-hidden border border-dark-600 max-h-40 bg-dark-900">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                setError('Invalid image URL');
              }}
            />
          </div>
        )}
      </form>
    </div>
  );
}