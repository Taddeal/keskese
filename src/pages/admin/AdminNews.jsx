import React, { useState, useEffect } from 'react';
import { getNews, fetchNewsRemote, addNewsPost, updateNewsPost, deleteNewsPost, uploadNewsFile } from '../../utils/storage';

const compressImage = (file, maxWidth = 1200, quality = 0.82) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve({ blob: file, dataUrl: e.target.result });
            return;
          }
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ blob, dataUrl: compressedDataUrl });
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve({ blob: file, dataUrl: e.target.result });
      img.src = e.target.result;
    };
    reader.onerror = () => resolve({ blob: file, dataUrl: null });
    reader.readAsDataURL(file);
  });
};

export default function AdminNews() {
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title_en: '', title_ti: '', body_en: '', body_ti: '', date: '', image: '', published: true
  });
  const [feedback, setFeedback] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadPosts = async () => {
    const allPosts = await fetchNewsRemote(true);
    allPosts.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    setPosts(allPosts);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setErrorMessage(null);
    setFormData({
      title_en: '',
      title_ti: '',
      body_en: '',
      body_ti: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      pdf_url: '',
      pdf_name: '',
      pdf_file: '',
      remove_pdf: false,
      published: true
    });
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setErrorMessage(null);
    setFormData({
      title_en: post.title_en || '',
      title_ti: post.title_ti || '',
      body_en: post.body_en || '',
      body_ti: post.body_ti || '',
      image: post.image || post.imageUrl || '',
      pdf_url: post.pdf_url || '',
      pdf_name: post.pdf_name || '',
      pdf_file: '',
      remove_pdf: false,
      date: post.date || post.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      published: post.published ?? true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage(null);
    try {
      // 1. Client-side compress large phone/camera images
      const { blob, dataUrl } = await compressImage(file, 1200, 0.82);

      // 2. Try direct upload to server /uploads/images/
      try {
        const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
        const res = await uploadNewsFile(compressedFile, 'image');
        if (res && res.url) {
          setFormData(prev => ({ ...prev, image: res.url }));
          setUploadingImage(false);
          return;
        }
      } catch (uploadErr) {
        console.warn('Direct image upload failed, using compressed base64 fallback:', uploadErr);
      }

      // Fallback: use compressed data URL (~150KB)
      setFormData(prev => ({ ...prev, image: dataUrl }));
    } catch (err) {
      console.error('Image processing error:', err);
      setErrorMessage('Failed to process image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file (.pdf).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25 MB limit.');
      return;
    }

    setUploadingPdf(true);
    setErrorMessage(null);
    try {
      // Direct upload to server /uploads/documents/
      const res = await uploadNewsFile(file, 'document');
      if (res && res.url) {
        setFormData(prev => ({
          ...prev,
          pdf_url: res.url,
          pdf_name: res.name || file.name,
          pdf_file: '',
          remove_pdf: false
        }));
      }
    } catch (uploadErr) {
      console.warn('Direct PDF upload failed, falling back to base64 encoding:', uploadErr);
      // Fallback to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          pdf_file: reader.result,
          pdf_name: file.name,
          remove_pdf: false
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setFormData(prev => ({
      ...prev,
      pdf_url: '',
      pdf_name: '',
      pdf_file: '',
      remove_pdf: true
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news post?')) {
      try {
        await deleteNewsPost(id);
        setFeedback('Post deleted successfully.');
        setTimeout(() => setFeedback(null), 3000);
        await loadPosts();
        if (editingId === id) resetForm();
      } catch (err) {
        setErrorMessage('Failed to delete post: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingPdf || uploadingImage) {
      alert('Please wait for file upload to finish before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      if (editingId) {
        await updateNewsPost(editingId, formData);
        setFeedback('Post updated successfully in database!');
      } else {
        await addNewsPost(formData);
        setFeedback('New post published successfully to database!');
      }
      setTimeout(() => setFeedback(null), 4000);
      await loadPosts();
      resetForm();
    } catch (err) {
      console.error('Save news post error:', err);
      setErrorMessage(err.message || 'Failed to save news post to database.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const titleEn = String(p.title_en || '').toLowerCase();
    const titleTi = String(p.title_ti || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = titleEn.includes(query) || titleTi.includes(query);
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'published' && p.published) || 
                          (statusFilter === 'draft' && !p.published);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container" style={{maxWidth: '1150px'}}>
      
      {/* Top Page Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem'}}>
            📰 Manage News & Events
          </h1>
          <p style={{color: '#6B7280', margin: 0, fontSize: '0.95rem'}}>
            Publish announcements, upload event images, and manage community posts for Keskese Milash.
          </p>
        </div>
      </div>

      {/* Fast performance notice */}
      <div style={{
        background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px',
        padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: '#1E40AF', fontSize: '0.88rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem'
      }}>
        <span style={{fontSize: '1.25rem'}}>⚡</span>
        <div>
          <strong>Fast-Load Architecture:</strong> The 2 founding launch events on the website load instantly from static cache. Any new announcements published or edited here are saved directly to your MySQL database and updated live on the website.
        </div>
      </div>

      {feedback && (
        <div style={{
          background: '#E8F5EE', color: '#1A6B3C', padding: '0.85rem 1.25rem',
          borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #C8E6C9',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <span>✅</span>
          <span>{feedback}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: '#FEF2F2', color: '#991B1B', padding: '0.85rem 1.25rem',
          borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #FCA5A5',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <span>❌</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start'}}>
        
        {/* Left Form Card */}
        <div style={{
          background: '#FFFFFF', borderRadius: '20px', padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
          borderTop: editingId ? '5px solid #D4A843' : '5px solid #1A6B3C',
          position: 'sticky', top: '90px'
        }}>
          <h2 style={{fontSize: '1.4rem', color: '#1A1A2E', marginBottom: '1.5rem', fontWeight: 700}}>
            {editingId ? '✏️ Edit News Post' : '➕ Create New Post'}
          </h2>

          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            
            {/* Title (English) */}
            <div>
              <label style={{fontWeight: 600, color: '#374151', fontSize: '0.88rem', display: 'block', marginBottom: '0.35rem'}}>
                Title (English) <span style={{color: '#C23B22'}}>*</span>
              </label>
              <input 
                required 
                type="text" 
                style={{
                  width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.92rem', outline: 'none'
                }} 
                placeholder="Title in English"
                value={formData.title_en} 
                onChange={e => setFormData({...formData, title_en: e.target.value})} 
              />
            </div>

            {/* Title (Tigrigna) */}
            <div>
              <label style={{fontWeight: 600, color: '#374151', fontSize: '0.88rem', display: 'block', marginBottom: '0.35rem'}}>
                Title (Tigrigna - ትግርኛ)
              </label>
              <input 
                type="text" 
                style={{
                  width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.92rem', outline: 'none'
                }} 
                placeholder="ኣርእስቲ ብትግርኛ"
                value={formData.title_ti} 
                onChange={e => setFormData({...formData, title_ti: e.target.value})} 
              />
            </div>

            {/* Event / Post Image Upload & URL */}
            <div>
              <label style={{fontWeight: 600, color: '#374151', fontSize: '0.88rem', display: 'block', marginBottom: '0.35rem'}}>
                📷 Event Featured Image (Upload or Paste URL)
              </label>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <input 
                  type="text" 
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                    border: '1.5px solid #E5E7EB', fontSize: '0.88rem', outline: 'none'
                  }} 
                  placeholder="Paste Image URL (e.g. https://...)"
                  value={formData.image} 
                  onChange={e => setFormData({...formData, image: e.target.value})} 
                />

                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{fontSize: '0.8rem', color: '#6B7280'}}>Or upload image:</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    style={{fontSize: '0.82rem'}}
                  />
                </div>
                {uploadingImage && (
                  <div style={{color: '#2563EB', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem'}}>
                    <span>⏳</span>
                    <span>Optimizing & uploading image...</span>
                  </div>
                )}
              </div>

              {formData.image && (
                <div style={{marginTop: '0.75rem', position: 'relative', display: 'inline-block'}}>
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    style={{
                      width: '100%', maxHeight: '160px', objectFit: 'cover',
                      borderRadius: '10px', border: '1px solid #E5E7EB'
                    }} 
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, image: ''})}
                    style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: 'rgba(0,0,0,0.6)', color: '#FFF', border: 'none',
                      borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer',
                      fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Document / Flyer (PDF) Attachment */}
            <div>
              <label style={{fontWeight: 600, color: '#374151', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem'}}>
                <span>📄</span> Attach Document / Flyer (PDF)
                <span style={{fontSize: '0.75rem', color: '#6B7280', fontWeight: 'normal'}}>(Optional)</span>
              </label>
              
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handlePdfUpload}
                disabled={uploadingPdf}
                style={{
                  padding: '0.55rem', borderRadius: '8px', border: '1.5px dashed #CBD5E1',
                  width: '100%', fontSize: '0.82rem', background: '#F8FAFC'
                }}
              />
              {uploadingPdf && (
                <div style={{color: '#2563EB', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem'}}>
                  <span>⏳</span>
                  <span>Uploading PDF document to server...</span>
                </div>
              )}
              <small style={{display: 'block', color: '#6B7280', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                Upload program schedules, event brochures, or reports (stored directly in /uploads/documents/).
              </small>

              {(formData.pdf_name || formData.pdf_url) && !formData.remove_pdf && (
                <div style={{
                  marginTop: '0.65rem', padding: '0.5rem 0.85rem', borderRadius: '8px',
                  background: '#FEF3C7', border: '1px solid #FCD34D',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: '0.82rem', color: '#92400E'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden'}}>
                    <span>📑</span>
                    <span style={{fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                      {formData.pdf_name || 'Attached Document.pdf'}
                    </span>
                    {formData.pdf_url && (
                      <a 
                        href={formData.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{color: '#1D4ED8', textDecoration: 'underline', marginLeft: '0.3rem', fontSize: '0.78rem'}}
                      >
                        View ↗
                      </a>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={handleRemovePdf}
                    style={{
                      background: '#FEE2E2', color: '#991B1B', border: 'none',
                      padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 700
                    }}
                    title="Remove attached PDF"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {/* Content (English) */}
            <div>
              <label style={{fontWeight: 600, color: '#374151', fontSize: '0.88rem', display: 'block', marginBottom: '0.35rem'}}>
                Content (English) <span style={{color: '#C23B22'}}>*</span>
              </label>
              <textarea 
                required 
                rows="4" 
                style={{
                  width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.92rem', outline: 'none', resize: 'vertical'
                }} 
                placeholder="Write news content in English..."
                value={formData.body_en} 
                onChange={e => setFormData({...formData, body_en: e.target.value})}
              ></textarea>
            </div>

            {/* Content (Tigrigna) */}
            <div>
              <label style={{fontWeight: 600, color: '#374151', fontSize: '0.88rem', display: 'block', marginBottom: '0.35rem'}}>
                Content (Tigrigna - ትግርኛ)
              </label>
              <textarea 
                rows="4" 
                style={{
                  width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.92rem', outline: 'none', resize: 'vertical'
                }} 
                placeholder="ትሕዝቶ ብትግርኛ ጽሓፉ..."
                value={formData.body_ti} 
                onChange={e => setFormData({...formData, body_ti: e.target.value})}
              ></textarea>
            </div>

            {/* Date Picker */}
            <div>
              <label style={{fontWeight: 600, color: '#374151', fontSize: '0.88rem', display: 'block', marginBottom: '0.35rem'}}>
                Publication Date
              </label>
              <input 
                type="date" 
                style={{
                  width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.92rem', outline: 'none'
                }} 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
              />
            </div>

            {/* Published Checkbox */}
            <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem'}}>
              <input 
                type="checkbox" 
                id="publishedCheck" 
                style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1A6B3C'}}
                checked={formData.published} 
                onChange={e => setFormData({...formData, published: e.target.checked})} 
              />
              <label htmlFor="publishedCheck" style={{fontWeight: 600, color: '#374151', cursor: 'pointer', fontSize: '0.92rem'}}>
                Publish immediately on live website
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{display: 'flex', gap: '0.75rem', marginTop: '0.5rem'}}>
              <button 
                type="submit" 
                disabled={submitting || uploadingPdf || uploadingImage}
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: '10px',
                  background: (submitting || uploadingPdf || uploadingImage) ? '#9CA3AF' : (editingId ? '#D4A843' : '#1A6B3C'),
                  color: '#FFFFFF',
                  fontWeight: 700, fontSize: '0.95rem', border: 'none',
                  cursor: (submitting || uploadingPdf || uploadingImage) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: (submitting || uploadingPdf || uploadingImage) ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'background 0.2s ease'
                }}
              >
                {submitting ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#FFFFFF',
                      borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>{editingId ? 'Updating...' : 'Publishing...'}</span>
                  </>
                ) : (
                  <span>{editingId ? 'Update Post' : 'Publish Post'}</span>
                )}
              </button>

              {editingId && (
                <button 
                  type="button" 
                  disabled={submitting}
                  onClick={resetForm}
                  style={{
                    padding: '0.85rem 1.25rem', borderRadius: '10px',
                    background: '#F3F4F6', color: '#4B5563', fontWeight: 600,
                    fontSize: '0.95rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Right Posts Listing Card */}
        <div style={{
          background: '#FFFFFF', borderRadius: '20px', padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB'
        }}>
          {/* Header & Filters */}
          <div style={{marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
              <h2 style={{fontSize: '1.4rem', color: '#1A1A2E', margin: 0, fontWeight: 700}}>
                Published & Draft Posts ({filteredPosts.length})
              </h2>
            </div>

            {/* Search Input & Status Filter */}
            <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
              <input 
                type="text" 
                placeholder="🔍 Search posts..."
                style={{
                  flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.9rem', outline: 'none'
                }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              <select 
                style={{
                  padding: '0.65rem 0.85rem', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '0.9rem', outline: 'none',
                  background: '#FFFFFF', fontWeight: 600, color: '#374151'
                }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>
            </div>
          </div>

          {/* Posts List */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            {filteredPosts.map(post => {
              const imageSrc = post.image || post.imageUrl;
              return (
                <div 
                  key={post.id}
                  style={{
                    padding: '1.25rem', borderRadius: '14px', background: '#FAFAF8',
                    border: editingId === post.id ? '2px solid #D4A843' : '1px solid #E5E7EB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'border 0.2s ease',
                    display: 'flex', flexDirection: 'column', gap: '0.85rem'
                  }}
                >
                  {imageSrc && (
                    <img 
                      src={imageSrc} 
                      alt={post.title_en} 
                      style={{
                        width: '100%', height: '150px', objectFit: 'cover',
                        borderRadius: '10px', border: '1px solid #E5E7EB'
                      }} 
                    />
                  )}

                  <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem'}}>
                    <h3 style={{fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', margin: 0}}>
                      {post.title_en}
                    </h3>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
                      background: post.published ? '#E8F5EE' : '#F3F4F6',
                      color: post.published ? '#1A6B3C' : '#6B7280',
                      flexShrink: 0
                    }}>
                      {post.published ? '🟢 Published' : '⚪ Draft'}
                    </span>
                  </div>

                  {post.title_ti && (
                    <div style={{fontSize: '0.95rem', color: '#1E3A5F', fontWeight: 600}}>
                      {post.title_ti}
                    </div>
                  )}

                  <p style={{color: '#6B7280', fontSize: '0.88rem', lineHeight: 1.5, margin: 0}}>
                    {post.body_en?.substring(0, 140)}...
                  </p>

                  {post.pdf_url && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px',
                      padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: '#1E40AF',
                      width: 'fit-content'
                    }}>
                      <span>📄</span>
                      <span style={{fontWeight: 700, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {post.pdf_name || 'Document.pdf'}
                      </span>
                      <a href={post.pdf_url} target="_blank" rel="noopener noreferrer" style={{color: '#2563EB', textDecoration: 'underline', fontWeight: 600}}>
                        View ↗
                      </a>
                    </div>
                  )}

                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #F0F0F0'}}>
                    <span style={{fontSize: '0.8rem', color: '#9CA3AF'}}>
                      📅 {new Date(post.date || post.createdAt).toLocaleDateString()}
                    </span>

                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button 
                        onClick={() => handleEdit(post)}
                        style={{
                          padding: '0.4rem 0.85rem', borderRadius: '6px',
                          background: '#EBF0F7', color: '#1E3A5F', fontWeight: 600,
                          fontSize: '0.82rem', border: 'none', cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        style={{
                          padding: '0.4rem 0.85rem', borderRadius: '6px',
                          background: '#FDE8E8', color: '#C23B22', fontWeight: 600,
                          fontSize: '0.82rem', border: 'none', cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div style={{textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF'}}>
                <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>📭</div>
                <p style={{margin: 0, fontSize: '0.95rem'}}>No news posts matching your filters.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
