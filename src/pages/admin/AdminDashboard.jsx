import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNews, getMembers, exportAllData, importAllData } from '../../utils/storage';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ newsTotal: 0, newsPublished: 0, membersTotal: 0 });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const allNews = getNews();
    const allMembers = getMembers();
    
    setStats({
      newsTotal: allNews.length,
      newsPublished: allNews.filter(n => n.published).length,
      membersTotal: allMembers.length,
    });

    const sortedMembers = [...allMembers].sort((a, b) => new Date(b.dateJoined) - new Date(a.dateJoined));
    setRecentMembers(sortedMembers.slice(0, 3));

    const sortedNews = [...allNews].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    setRecentNews(sortedNews.slice(0, 3));
  }, []);

  const handleExport = () => {
    const dataStr = exportAllData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keskese_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (importAllData(event.target.result)) {
        setImportStatus({ type: 'success', text: 'Backup data imported successfully!' });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportStatus({ type: 'error', text: 'Import failed. File must be valid JSON backup.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container" style={{maxWidth: '1100px'}}>
      
      {/* Top Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #1A6B3C 100%)',
        borderRadius: '20px', padding: '2rem 2.25rem', color: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)', marginBottom: '2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem'
      }}>
        <div>
          <span style={{
            background: 'rgba(255,255,255,0.15)', color: '#FDF6E3', padding: '0.3rem 0.8rem',
            borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em'
          }}>
            🛡️ ADMIN DASHBOARD
          </span>
          <h1 style={{fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0 0.25rem', color: '#FFF'}}>
            Association Control Center
          </h1>
          <p style={{margin: 0, opacity: 0.88, fontSize: '0.95rem'}}>
            Manage announcements, membership applications, and site data backups for Keskese Milash Netherlands & Worldwide.
          </p>
        </div>

        <div style={{display: 'flex', gap: '0.75rem'}}>
          <Link to="/admin/news" className="btn" style={{
            background: '#D4A843', color: '#FFF', padding: '0.7rem 1.25rem',
            borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', border: 'none', textDecoration: 'none'
          }}>
            + Add News Post
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.75rem', marginBottom: '2.5rem'
      }}>
        {/* News Stat Card */}
        <div style={{
          background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderLeft: '5px solid #1A6B3C',
          border: '1px solid #E5E7EB', borderLeftWidth: '5px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
            <span style={{fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              News & Events
            </span>
            <span style={{fontSize: '1.5rem'}}>📰</span>
          </div>
          <div style={{fontSize: '2.5rem', fontWeight: 800, color: '#1A6B3C', marginBottom: '0.25rem'}}>
            {stats.newsTotal}
          </div>
          <p style={{fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem'}}>
            {stats.newsPublished} published • {stats.newsTotal - stats.newsPublished} drafts
          </p>
          <Link to="/admin/news" style={{
            display: 'block', textAlign: 'center', width: '100%', padding: '0.6rem',
            borderRadius: '8px', background: '#E8F5EE', color: '#1A6B3C', fontWeight: 700,
            fontSize: '0.88rem', textDecoration: 'none'
          }}>
            Manage News →
          </Link>
        </div>

        {/* Members Stat Card */}
        <div style={{
          background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderLeft: '5px solid #1E3A5F',
          border: '1px solid #E5E7EB', borderLeftWidth: '5px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
            <span style={{fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              Membership Records
            </span>
            <span style={{fontSize: '1.5rem'}}>👥</span>
          </div>
          <div style={{fontSize: '2.5rem', fontWeight: 800, color: '#1E3A5F', marginBottom: '0.25rem'}}>
            {stats.membersTotal}
          </div>
          <p style={{fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem'}}>
            Registered community submissions
          </p>
          <Link to="/admin/members" style={{
            display: 'block', textAlign: 'center', width: '100%', padding: '0.6rem',
            borderRadius: '8px', background: '#EBF0F7', color: '#1E3A5F', fontWeight: 700,
            fontSize: '0.88rem', textDecoration: 'none'
          }}>
            View Member Directory →
          </Link>
        </div>

        {/* System Health Card */}
        <div style={{
          background: '#FFFFFF', borderRadius: '18px', padding: '1.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderLeft: '5px solid #D4A843',
          border: '1px solid #E5E7EB', borderLeftWidth: '5px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
            <span style={{fontSize: '0.85rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              Data Storage
            </span>
            <span style={{fontSize: '1.5rem'}}>💾</span>
          </div>
          <div style={{fontSize: '1.5rem', fontWeight: 800, color: '#1A1A2E', marginBottom: '0.25rem'}}>
            Browser LocalStorage
          </div>
          <p style={{fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.25rem'}}>
            Instant local persistence active
          </p>
          <button 
            onClick={handleExport}
            style={{
              width: '100%', padding: '0.6rem', borderRadius: '8px',
              background: '#FDF6E3', color: '#B88E30', fontWeight: 700,
              fontSize: '0.88rem', border: 'none', cursor: 'pointer'
            }}
          >
            Quick Backup ⬇️
          </button>
        </div>
      </div>

      {/* Main Bottom Section: Recent Activity + Data Management */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem'}}>
        
        {/* Left: Recent Activity Feed */}
        <div style={{
          background: '#FFFFFF', borderRadius: '20px', padding: '1.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB'
        }}>
          <h3 style={{fontSize: '1.2rem', color: '#1A1A2E', margin: '0 0 1.25rem', fontWeight: 700, borderBottom: '2px solid #F3F4F6', paddingBottom: '0.5rem'}}>
            📌 Recent Signups & Registrations
          </h3>

          {recentMembers.length === 0 ? (
            <p style={{color: '#9CA3AF', fontSize: '0.9rem'}}>No recent member signups found.</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {recentMembers.map(m => (
                <div key={m.id} style={{
                  padding: '0.85rem', borderRadius: '12px', background: '#FAFAF8',
                  border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{fontWeight: 700, color: '#1A1A2E', fontSize: '0.92rem'}}>{m.name}</div>
                    <div style={{color: '#6B7280', fontSize: '0.82rem'}}>{m.email}</div>
                  </div>
                  <span style={{fontSize: '0.78rem', color: '#9CA3AF', background: '#EBF0F7', padding: '0.2rem 0.5rem', borderRadius: '6px'}}>
                    {new Date(m.dateJoined).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Data Management Station */}
        <div style={{
          background: '#FFFFFF', borderRadius: '20px', padding: '1.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB'
        }}>
          <h3 style={{fontSize: '1.2rem', color: '#1A1A2E', margin: '0 0 0.5rem', fontWeight: 700}}>
            📦 System Data Backup & Restore
          </h3>
          <p style={{color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem'}}>
            Export all association news posts and membership records to a local JSON file, or restore from a previous JSON backup file.
          </p>

          {importStatus && (
            <div style={{
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1rem',
              background: importStatus.type === 'success' ? '#E8F5EE' : '#FDE8E8',
              color: importStatus.type === 'success' ? '#1A6B3C' : '#C23B22',
            }}>
              {importStatus.text}
            </div>
          )}

          <div style={{display: 'flex', flexDirection: 'column', gap: '0.85rem'}}>
            <button 
              onClick={handleExport}
              style={{
                width: '100%', padding: '0.85rem', borderRadius: '10px',
                background: '#1A6B3C', color: '#FFFFFF', fontWeight: 700,
                fontSize: '0.92rem', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <span>⬇️</span> Export Complete Data Backup (.json)
            </button>

            <button 
              onClick={() => fileInputRef.current.click()}
              style={{
                width: '100%', padding: '0.85rem', borderRadius: '10px',
                background: '#F3F4F6', color: '#374151', fontWeight: 700,
                fontSize: '0.92rem', border: '1.5px dashed #D1D5DB', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <span>⬆️</span> Restore Data from JSON File
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json"
              onChange={handleImport}
            />
          </div>
        </div>

      </div>

    </div>
  );
}
