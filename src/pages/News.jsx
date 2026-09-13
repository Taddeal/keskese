import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { getNews, fetchNewsRemote } from '../utils/storage';

export default function News() {
  const { t, locale } = useTranslation();
  // 1. Instant 0ms initial load from local/static cache
  const [newsPosts, setNewsPosts] = useState(() => {
    const initial = getNews().filter(post => post.published);
    return initial.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadNews = async () => {
      const allNews = await fetchNewsRemote();
      const published = allNews.filter(post => post.published);
      published.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setNewsPosts(published);
    };
    loadNews();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="page news-page">
      {/* Header */}
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <span style={{
            display:'inline-block', padding:'0.35rem 1rem', borderRadius:'50px',
            background:'rgba(255,255,255,0.15)', color:'#FDF6E3', fontWeight:600,
            fontSize:'0.85rem', letterSpacing:'0.05em', marginBottom:'0.75rem',
            backdropFilter: 'blur(4px)',
          }}>
            📰 {locale === 'ti' ? 'ሓበሬታታትን ፍጻመታትን' : 'Updates & Announcements'}
          </span>
          <h1 style={{fontSize:'2.5rem', margin:'0 0 0.5rem'}}>{t('nav.news')}</h1>
          <p style={{maxWidth:'600px', margin:'0 auto', opacity:0.9, fontSize:'1.05rem'}}>
            {t('news.subtitle')}
          </p>
        </div>
      </header>

      <section className="section bg-light" style={{padding:'4rem 0', minHeight:'60vh'}}>
        <div className="container" style={{maxWidth:'900px'}}>
          {newsPosts.length === 0 ? (
            <div className="card text-center py-12 animate-slideUp" style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.06)',
              padding: '3.5rem 2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              <div style={{fontSize:'3.5rem', marginBottom:'1rem'}}>📢</div>
              <h3 style={{fontSize:'1.35rem', color:'#1A1A2E', marginBottom:'0.5rem', fontWeight:700}}>
                {locale === 'ti' ? 'ዝተሓትመ ዜና የለን' : 'No News Posts Yet'}
              </h3>
              <p style={{color:'#6B7280', fontSize:'1rem', maxWidth:'450px', margin:'0 auto'}}>
                {t('news.noPosts')}
              </p>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
              {newsPosts.map((post, index) => {
                const title = locale === 'ti' && post.title_ti ? post.title_ti : post.title_en;
                const body = locale === 'ti' && post.body_ti ? post.body_ti : post.body_en;
                const date = new Date(post.date || post.createdAt).toLocaleDateString(locale === 'ti' ? 'ti-ER' : 'en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                });
                const isExpanded = expandedId === post.id;
                
                const imageSrc = post.image || post.imageUrl;
                
                return (
                  <article key={post.id} className="card animate-slideUp" style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderLeft: index % 2 === 0 ? '5px solid #1A6B3C' : '5px solid #1E3A5F',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}>
                    {imageSrc && (
                      <div style={{maxHeight: '280px', overflow: 'hidden'}}>
                        <img 
                          src={imageSrc} 
                          alt={title} 
                          style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                        />
                      </div>
                    )}
                    <div className="card-body" style={{padding:'2rem 2.25rem'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem'}}>
                        <span style={{
                          background: index % 2 === 0 ? '#E8F5EE' : '#EBF0F7',
                          color: index % 2 === 0 ? '#1A6B3C' : '#1E3A5F',
                          padding: '0.25rem 0.75rem', borderRadius: '50px',
                          fontSize: '0.8rem', fontWeight: 600,
                        }}>
                          📅 {date}
                        </span>
                      </div>

                      <h2 style={{fontSize:'1.5rem', color:'#1A1A2E', marginBottom:'1rem', fontWeight:700, lineHeight:'1.35'}}>
                        {title}
                      </h2>

                      <div style={{
                        color: '#4B5563', fontSize: '1rem', lineHeight: '1.75',
                        marginBottom: '1.5rem', whitespace: 'pre-wrap'
                      }}>
                        {isExpanded ? body : `${body?.substring(0, 200) || ''}${body?.length > 200 ? '...' : ''}`}
                      </div>

                      {body?.length > 200 && (
                        <button 
                          className="btn" 
                          style={{
                            background: index % 2 === 0 ? '#E8F5EE' : '#EBF0F7',
                            color: index % 2 === 0 ? '#1A6B3C' : '#1E3A5F',
                            border: 'none', padding: '0.5rem 1.25rem',
                            borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                          }} 
                          onClick={() => toggleExpand(post.id)}
                        >
                          {isExpanded ? (
                            <><span>▲</span> {t('news.readLess')}</>
                          ) : (
                            <><span>▼</span> {t('news.readMore')}</>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
