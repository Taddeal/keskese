import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import projects from '../data/projects.json';

const projectColors = ['#1A6B3C', '#1E3A5F', '#D4A843', '#C23B22'];

const categoryBadges = {
  en: ['Cultural & Heritage', 'Community Support', 'Sports & Youth', 'Community Infrastructure'],
  ti: ['ባህላዊ ውርሻ', 'ደገፍ ማሕበረሰብ', 'ስፖርትን መንእሰያትን', 'መሰረተ-ልማት ማሕበረሰብ']
};

export default function Projects() {
  const { t, locale } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProjects = selectedFilter === 'all' 
    ? projects 
    : projects.filter(p => p.id === selectedFilter);

  return (
    <div className="page projects-page">
      {/* Header */}
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <span style={{
            display:'inline-block', padding:'0.35rem 1rem', borderRadius:'50px',
            background:'rgba(255,255,255,0.15)', color:'#FDF6E3', fontWeight:600,
            fontSize:'0.85rem', letterSpacing:'0.05em', marginBottom:'0.75rem',
            backdropFilter: 'blur(4px)',
          }}>
            🚀 {locale === 'ti' ? 'ተበግሶታት ማሕበርና' : 'Community Programs'}
          </span>
          <h1 style={{fontSize:'2.5rem', margin:'0 0 0.5rem'}}>{t('projects.title')}</h1>
          <p style={{maxWidth:'650px', margin:'0 auto', opacity:0.9, fontSize:'1.05rem'}}>
            {t('projects.subtitle')}
          </p>
        </div>
      </header>

      {/* Filter Navigation Tabs */}
      <section style={{background:'#FFFFFF', borderBottom:'1px solid #E5E7EB', padding:'1.25rem 0'}}>
        <div className="container" style={{maxWidth:'950px'}}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            gap:'0.75rem', flexWrap:'wrap'
          }}>
            <button 
              onClick={() => setSelectedFilter('all')}
              style={{
                padding:'0.5rem 1.25rem', borderRadius:'50px', border:'none',
                fontWeight:600, fontSize:'0.9rem', cursor:'pointer', transition:'all 0.2s ease',
                background: selectedFilter === 'all' ? '#1A6B3C' : '#F3F4F6',
                color: selectedFilter === 'all' ? '#FFFFFF' : '#4B5563',
                boxShadow: selectedFilter === 'all' ? '0 4px 12px rgba(26,107,60,0.25)' : 'none'
              }}
            >
              ✨ {locale === 'ti' ? 'ኩሎም' : 'All Projects'}
            </button>
            {projects.map((p, i) => (
              <button 
                key={p.id}
                onClick={() => setSelectedFilter(p.id)}
                style={{
                  padding:'0.5rem 1.25rem', borderRadius:'50px', border:'none',
                  fontWeight:600, fontSize:'0.9rem', cursor:'pointer', transition:'all 0.2s ease',
                  background: selectedFilter === p.id ? projectColors[i % projectColors.length] : '#F3F4F6',
                  color: selectedFilter === p.id ? '#FFFFFF' : '#4B5563',
                  boxShadow: selectedFilter === p.id ? `0 4px 12px ${projectColors[i % projectColors.length]}40` : 'none'
                }}
              >
                {p.icon} {locale === 'ti' && p.title_ti ? p.title_ti : p.title_en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section bg-light" style={{padding:'4rem 0'}}>
        <div className="container" style={{maxWidth:'1100px'}}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))',
            gap:'2rem'
          }}>
            {filteredProjects.map((project, idx) => {
              const origIndex = projects.findIndex(p => p.id === project.id);
              const color = projectColors[origIndex >= 0 ? origIndex : idx % projectColors.length];
              const title = locale === 'ti' && project.title_ti ? project.title_ti : project.title_en;
              const description = locale === 'ti' && project.description_ti ? project.description_ti : project.description_en;
              const badgeText = locale === 'ti' 
                ? (categoryBadges.ti[origIndex] || 'ተበግሶ') 
                : (categoryBadges.en[origIndex] || 'Initiative');

              return (
                <div 
                  key={project.id || idx} 
                  className="card animate-slideUp"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderTop: `5px solid ${color}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    padding: '2.25rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = `0 12px 30px ${color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                  }}
                >
                  <div>
                    {/* Header badge & icon */}
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem'}}>
                      <div style={{
                        width:'56px', height:'56px', borderRadius:'16px',
                        background:`linear-gradient(135deg, ${color}15, ${color}30)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1.8rem', border:`1px solid ${color}30`
                      }}>
                        {project.icon}
                      </div>
                      <span style={{
                        background: '#E8F5EE', color: '#145A30',
                        padding: '0.3rem 0.8rem', borderRadius: '50px',
                        fontSize: '0.78rem', fontWeight: 700, display:'flex', alignItems:'center', gap:'0.3rem'
                      }}>
                        🟢 {locale === 'ti' ? 'ንጡፍ' : 'Ongoing'}
                      </span>
                    </div>

                    {/* Category Tag */}
                    <span style={{
                      display: 'inline-block', color: color, fontSize: '0.82rem',
                      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      marginBottom: '0.4rem'
                    }}>
                      {badgeText}
                    </span>

                    {/* Title & Description */}
                    <h2 style={{fontSize:'1.5rem', color:'#1A1A2E', marginBottom:'0.75rem', fontWeight:700}}>
                      {title}
                    </h2>
                    <p style={{color:'#6B7280', fontSize:'0.95rem', lineHeight:'1.7', marginBottom:'1.5rem'}}>
                      {description}
                    </p>

                    {/* Project Highlights / Items */}
                    <div style={{
                      background: '#FAFAF8',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      border: '1px solid #F0F0F0',
                      marginBottom: '1.5rem'
                    }}>
                      <h4 style={{
                        fontSize:'0.85rem', color:'#374151', textTransform:'uppercase',
                        letterSpacing:'0.06em', fontWeight:700, marginBottom:'0.75rem'
                      }}>
                        {locale === 'ti' ? 'ተበግሶታት' : 'Key Activities & Focus'}
                      </h4>
                      <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.6rem'}}>
                        {project.items?.map((item, i) => {
                          const itemText = locale === 'ti' && item.ti ? item.ti : item.en;
                          return (
                            <li key={i} style={{
                              display:'flex', alignItems:'flex-start', gap:'0.6rem',
                              fontSize:'0.9rem', color:'#4B5563', lineHeight:'1.5'
                            }}>
                              <span style={{
                                color: color, fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3
                              }}>✦</span>
                              <span>{itemText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  {/* Join / Support button */}
                  <a 
                    href="/contact" 
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.75rem', borderRadius: '10px',
                      background: `${color}10`, color: color, fontWeight: 700,
                      fontSize: '0.9rem', textDecoration: 'none', transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${color}25`}
                    onMouseLeave={e => e.currentTarget.style.background = `${color}10`}
                  >
                    {locale === 'ti' ? 'ኣብዚ ፕሮጀክት ተሳተፉ' : 'Support This Project'} →
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Idea Callout Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #1A6B3C 100%)',
        padding: '3.5rem 0', color: '#FFF', textAlign: 'center'
      }}>
        <div className="container" style={{maxWidth:'650px'}}>
          <div style={{fontSize:'3rem', marginBottom:'0.75rem'}}>💡</div>
          <h2 style={{fontSize:'1.8rem', marginBottom:'0.75rem', fontWeight:700}}>
            {locale === 'ti' ? 'ናይ ፕሮጀክት ሓሳብ ኣሎኩም?' : 'Have a Community Project Idea?'}
          </h2>
          <p style={{opacity:0.9, fontSize:'1.05rem', marginBottom:'2rem', lineHeight:'1.6'}}>
            {locale === 'ti'
              ? 'ንማሕበረሰብ ከስከሰ ምላሽ ዝጠቕሙ ሓደስቲ ተበግሶታትን ሓሳባትን ብሓጐስ ንቕበል።'
              : 'We welcome community-led initiatives and proposals. If you have an idea that benefits the Keskese Milash Community in the Netherlands, reach out!'}
          </p>
          <a 
            href="/contact" 
            className="btn" 
            style={{
              background: '#D4A843', color: '#FFF', padding: '0.85rem 2.25rem',
              fontWeight: 700, borderRadius: '10px', textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(212,168,67,0.3)', border: 'none'
            }}
          >
            {locale === 'ti' ? 'ሓሳብኩም ኣካፍሉና' : 'Pitch Your Project'} →
          </a>
        </div>
      </section>
    </div>
  );
}
