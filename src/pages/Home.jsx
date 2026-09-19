import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { getNews } from '../utils/storage';

const valuesList = [
  { key: 'integrity', icon: '🛡️', color: '#1A6B3C' },
  { key: 'transparency', icon: '🔍', color: '#1E3A5F' },
  { key: 'accountability', icon: '⚖️', color: '#D4A843' },
  { key: 'responsibility', icon: '🤝', color: '#C23B22' },
];

export default function Home() {
  const { t, locale } = useTranslation();
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const news = getNews();
    const published = news.filter(n => n.published);
    published.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    setLatestNews(published.slice(0, 2));
  }, []);

  return (
    <div className="page home-page">
      
      {/* ===== HERO SECTION WITH CANVA BANNER IMAGE ===== */}
      <section style={{
        position: 'relative',
        backgroundImage: 'url(/hero-large.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
        padding: '6rem 0 6rem',
        overflow: 'hidden',
      }}>
        {/* Canva Green Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(27, 107, 74, 0.88), rgba(20, 80, 58, 0.78))',
          backdropFilter: 'blur(2px)',
          zIndex: 1
        }} />

        <div className="container text-center animate-slideUp" style={{position: 'relative', zIndex: 2, maxWidth: '900px'}}>
          {/* Top Pill */}
          <div style={{marginBottom: '1.25rem'}}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.45rem 1.35rem', borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em',
              backdropFilter: 'blur(6px)',
            }}>
              ✨ {locale === 'ti' ? 'ማሕበር ከስከሰ ምላሽ ኔዘርላንድስ' : (locale === 'nl' ? 'VERENIGING KESKESE MELASH NEDERLAND' : 'ASSOCIATION KESKESE MILASH NETHERLANDS')}
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800,
            lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em',
            textShadow: '0 3px 12px rgba(0,0,0,0.3)',
          }}>
            {t('home.heroTitle')}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.15rem, 2.2vw, 1.35rem)', opacity: 0.95,
            maxWidth: '740px', margin: '0 auto 2.5rem', lineHeight: 1.6, fontWeight: 400,
            textShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            {t('home.heroSubtitle')}
          </p>

          {/* Buttons */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '1.2rem', flexWrap: 'wrap', marginBottom: '3.5rem'
          }}>
            <Link to="/membership" style={{
              background: '#E8913A',
              color: '#FFFFFF', padding: '0.9rem 2.5rem', borderRadius: '9999px',
              fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(232,145,58,0.4)', transition: 'all 0.3s ease',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {t('home.joinUs')} <span>→</span>
            </Link>

            <Link to="/about" style={{
              background: 'transparent', color: '#FFFFFF',
              padding: '0.85rem 2.25rem', borderRadius: '9999px', fontWeight: 600,
              fontSize: '1.05rem', textDecoration: 'none', border: '2px solid #FFFFFF',
              backdropFilter: 'blur(4px)', transition: 'all 0.3s ease',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#1B6B4A'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}
            >
              {t('home.learnMore')} <span>→</span>
            </Link>
          </div>

          {/* Quick Stat Highlights Bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem', background: 'rgba(255, 255, 255, 0.12)',
            padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)', textAlign: 'left'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.85rem'}}>
              <div style={{fontSize: '1.8rem'}}>🇳🇱</div>
              <div>
                <div style={{fontSize: '0.95rem', fontWeight: 700}}>{locale === 'ti' ? 'ኔዘርላንድስ' : (locale === 'nl' ? 'Nederland' : 'Netherlands')}</div>
                <div style={{fontSize: '0.8rem', opacity: 0.9}}>{locale === 'ti' ? 'ኣብ ኔዘርላንድስ ዝርከብ ማሕበር' : (locale === 'nl' ? 'Landelijke gemeenschap' : 'Serving Nationwide')}</div>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1rem'}}>
              <div style={{fontSize: '1.8rem'}}>🏛️</div>
              <div>
                <div style={{fontSize: '0.95rem', fontWeight: 700}}>{locale === 'ti' ? 'ታሪኻዊ ስም' : (locale === 'nl' ? 'Historische wortels' : 'Historic Roots')}</div>
                <div style={{fontSize: '0.8rem', opacity: 0.9}}>{locale === 'ti' ? 'ታሪኻዊ ስም ከስከሰ' : (locale === 'nl' ? 'Oud erfgoed' : 'Ancient Heritage')}</div>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.85rem', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1rem'}}>
              <div style={{fontSize: '1.8rem'}}>🤝</div>
              <div>
                <div style={{fontSize: '0.95rem', fontWeight: 700}}>{locale === 'ti' ? 'ማሕበረሰብ ቀዳምነት' : (locale === 'nl' ? 'Gemeenschap eerst' : 'Community First')}</div>
                <div style={{fontSize: '0.8rem', opacity: 0.9}}>{locale === 'ti' ? 'ማሕበራዊ ፍትሕን ድሕነትን' : (locale === 'nl' ? 'Eenheid & Rechtvaardigheid' : 'Unity & Social Justice')}</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===== MISSION STATEMENT CARD ===== */}
      <section className="section" style={{padding: '4rem 0', background: '#FAFAF8'}}>
        <div className="container" style={{maxWidth: '1000px'}}>
          <div className="animate-slideUp" style={{
            background: '#FFFFFF', borderRadius: '24px', padding: '3rem 2.5rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)', borderLeft: '6px solid #1A6B3C',
            display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2.5rem', alignItems: 'center'
          }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: '#E8F5EE', display: 'flex', alignItems: 'center',
              justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 16px rgba(26,107,60,0.15)',
              border: '3px solid #1A6B3C', flexShrink: 0
            }}>
              <img src="/logo.png" alt="Keskese Milash Logo" style={{width: '90px', height: '90px', objectFit: 'cover', borderRadius: '50%'}} />
            </div>

            <div>
              <span style={{
                color: '#1A6B3C', fontWeight: 700, fontSize: '0.85rem',
                letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem'
              }}>
                {t('home.missionTitle')}
              </span>
              <h2 style={{fontSize: '1.85rem', color: '#1A1A2E', fontWeight: 700, margin: '0 0 1rem', lineHeight: 1.3}}>
                {t('home.missionText')}
              </h2>
              <p style={{color: '#6B7280', margin: 0, fontSize: '1rem', lineHeight: 1.7}}>
                {t('about.introText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE PILLARS / EXPLORE SECTION ===== */}
      <section className="section" style={{padding: '3rem 0 5rem', background: '#F3F4F6'}}>
        <div className="container" style={{maxWidth: '1150px'}}>
          
          <div className="text-center" style={{marginBottom: '3rem'}}>
            <span style={{
              display: 'inline-block', padding: '0.4rem 1.2rem', borderRadius: '50px',
              background: 'linear-gradient(135deg, #E8F5EE, #EBF0F7)',
              color: '#1A6B3C', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em',
              textTransform: 'uppercase', marginBottom: '0.75rem',
            }}>
              {t('home.quickLinksTitle')}
            </span>
            <h2 style={{fontSize: '2.25rem', color: '#1A1A2E', fontWeight: 700, margin: 0}}>
              {locale === 'ti' ? 'ዓውድታት ስራሕና' : (locale === 'nl' ? 'Ontdek onze belangrijkste initiatieven' : 'Explore Our Key Initiatives')}
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem'
          }}>
            
            {/* Card 1: Plans */}
            <div className="animate-slideUp stagger-1" style={{
              background: '#FFFFFF', borderRadius: '20px', padding: '2rem 1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderTop: '5px solid #1A6B3C',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(26,107,60,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'; }}
            >
              <div>
                <div style={{
                  width: '54px', height: '54px', borderRadius: '14px', background: '#E8F5EE',
                  color: '#1A6B3C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', marginBottom: '1.25rem', border: '1px solid #1A6B3C30'
                }}>
                  🎯
                </div>
                <h3 style={{fontSize: '1.3rem', color: '#1A1A2E', marginBottom: '0.75rem', fontWeight: 700}}>
                  {t('nav.plans')}
                </h3>
                <p style={{color: '#6B7280', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem'}}>
                  {t('home.plansDesc')}
                </p>
              </div>
              <Link to="/plans" style={{
                color: '#1A6B3C', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
              }}>
                {t('home.viewPlans')} <span>→</span>
              </Link>
            </div>

            {/* Card 2: Projects */}
            <div className="animate-slideUp stagger-2" style={{
              background: '#FFFFFF', borderRadius: '20px', padding: '2rem 1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderTop: '5px solid #1E3A5F',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(30,58,95,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'; }}
            >
              <div>
                <div style={{
                  width: '54px', height: '54px', borderRadius: '14px', background: '#EBF0F7',
                  color: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', marginBottom: '1.25rem', border: '1px solid #1E3A5F30'
                }}>
                  🚀
                </div>
                <h3 style={{fontSize: '1.3rem', color: '#1A1A2E', marginBottom: '0.75rem', fontWeight: 700}}>
                  {t('nav.projects')}
                </h3>
                <p style={{color: '#6B7280', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem'}}>
                  {t('home.projectsDesc')}
                </p>
              </div>
              <Link to="/projects" style={{
                color: '#1E3A5F', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
              }}>
                {t('home.viewProjects')} <span>→</span>
              </Link>
            </div>

            {/* Card 3: News & Events */}
            <div className="animate-slideUp stagger-3" style={{
              background: '#FFFFFF', borderRadius: '20px', padding: '2rem 1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderTop: '5px solid #D4A843',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(212,168,67,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'; }}
            >
              <div>
                <div style={{
                  width: '54px', height: '54px', borderRadius: '14px', background: '#FDF6E3',
                  color: '#D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', marginBottom: '1.25rem', border: '1px solid #D4A84330'
                }}>
                  📰
                </div>
                <h3 style={{fontSize: '1.3rem', color: '#1A1A2E', marginBottom: '0.75rem', fontWeight: 700}}>
                  {t('nav.news')}
                </h3>
                <p style={{color: '#6B7280', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem'}}>
                  {t('news.subtitle')}
                </p>
              </div>
              <Link to="/news" style={{
                color: '#D4A843', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
              }}>
                {t('news.readMore')} <span>→</span>
              </Link>
            </div>

            {/* Card 4: Membership */}
            <div className="animate-slideUp stagger-3" style={{
              background: '#FFFFFF', borderRadius: '20px', padding: '2rem 1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderTop: '5px solid #C23B22',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(194,59,34,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'; }}
            >
              <div>
                <div style={{
                  width: '54px', height: '54px', borderRadius: '14px', background: '#FDE8E8',
                  color: '#C23B22', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', marginBottom: '1.25rem', border: '1px solid #C23B2230'
                }}>
                  🤝
                </div>
                <h3 style={{fontSize: '1.3rem', color: '#1A1A2E', marginBottom: '0.75rem', fontWeight: 700}}>
                  {t('nav.membership')}
                </h3>
                <p style={{color: '#6B7280', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem'}}>
                  {t('home.membershipDesc')}
                </p>
              </div>
              <Link to="/membership" style={{
                color: '#C23B22', fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
              }}>
                {t('home.joinUs')} <span>→</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ===== FOUNDATIONAL VALUES GRID ===== */}
      <section className="section" style={{padding: '4rem 0', background: '#FFFFFF'}}>
        <div className="container" style={{maxWidth: '1050px'}}>
          <div className="text-center" style={{marginBottom: '3rem'}}>
            <span style={{
              color: '#1A6B3C', fontWeight: 700, fontSize: '0.85rem',
              letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem'
            }}>
              {t('about.valuesTitle')}
            </span>
            <h2 style={{fontSize: '2rem', color: '#1A1A2E', fontWeight: 700, margin: 0}}>
              {locale === 'ti' ? 'መሰረታውያን መትከላትና' : (locale === 'nl' ? 'Pijlers van ons bestuur' : 'Guiding Pillars of Governance')}
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.5rem'
          }}>
            {valuesList.map((val) => (
              <div key={val.key} style={{
                background: '#FAFAF8', borderRadius: '16px', padding: '1.75rem 1.25rem',
                textAlign: 'center', border: '1px solid #F0F0F0', borderBottom: `4px solid ${val.color}`,
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%', background: `${val.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  margin: '0 auto 1rem', border: `1.5px solid ${val.color}30`
                }}>
                  {val.icon}
                </div>
                <h4 style={{fontSize: '1.1rem', color: val.color, fontWeight: 700, margin: 0}}>
                  {t(`about.values.${val.key}`)}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST NEWS TEASER (IF ANY) ===== */}
      {latestNews.length > 0 && (
        <section className="section" style={{padding: '4rem 0', background: '#F0F7F2'}}>
          <div className="container" style={{maxWidth: '900px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
              <div>
                <h2 style={{fontSize: '1.85rem', color: '#1A1A2E', margin: 0, fontWeight: 700}}>
                  {t('nav.news')}
                </h2>
                <p style={{color: '#6B7280', margin: 0, fontSize: '0.95rem'}}>
                  {locale === 'ti' ? 'ሓደስቲ ሓበሬታታትን ፍጻመታትን' : (locale === 'nl' ? 'Laatste aankondigingen en nieuws' : 'Latest announcements and community news')}
                </p>
              </div>
              <Link to="/news" className="btn btn-secondary" style={{borderRadius: '8px'}}>
                {locale === 'ti' ? 'ኩሎም ዜናታት ርኣዩ' : (locale === 'nl' ? 'Bekijk al het nieuws' : 'View All News')} &rarr;
              </Link>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem'}}>
              {latestNews.map(item => {
                let title = item.title_en;
                if (locale === 'ti' && item.title_ti) title = item.title_ti;
                if (locale === 'nl' && item.title_nl) title = item.title_nl;

                let body = item.body_en;
                if (locale === 'ti' && item.body_ti) body = item.body_ti;
                if (locale === 'nl' && item.body_nl) body = item.body_nl;
                const imageSrc = item.image || item.imageUrl;
                return (
                  <div key={item.id} style={{
                    background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)', borderLeft: '4px solid #1A6B3C',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}>
                    {imageSrc && (
                      <div style={{height: '220px', overflow: 'hidden'}}>
                        <img src={imageSrc} alt={title} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.imagePosition || 'center top'}} />
                      </div>
                    )}
                    <div style={{padding: '1.5rem'}}>
                      <h3 style={{fontSize: '1.2rem', color: '#1A1A2E', marginBottom: '0.5rem', fontWeight: 700}}>{title}</h3>
                      <p style={{color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem'}}>
                        {body?.substring(0, 110)}...
                      </p>
                      <Link to="/news" style={{color: '#1A6B3C', fontWeight: 600, fontSize: '0.88rem'}}>
                        {t('news.readMore')} &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== BOTTOM CTA CALLOUT BANNER ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #1A6B3C 100%)',
        padding: '4.5rem 0', color: '#FFFFFF', textAlign: 'center'
      }}>
        <div className="container" style={{maxWidth: '700px'}}>
          <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>🤝</div>
          <h2 style={{fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.85rem'}}>
            {locale === 'ti' ? 'ንሓደስቲ ኣባላት ዕድመ' : (locale === 'nl' ? 'Samen bouwen we aan onze gemeenschap' : 'Together We Build Our Community')}
          </h2>
          <p style={{opacity: 0.9, fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.25rem'}}>
            {locale === 'ti'
              ? 'ኣብ ኔዘርላንድስ ንዝርከቡ ኣባላት ማሕበረሰብ ከስከሰ ምላሽ ዝያዳ ሓያልን ዝተጠርነፈን ማሕበረሰብ ንምህናጽ ተጸንብሩና።'
              : (locale === 'nl'
                ? 'Sluit je vandaag nog aan bij de Keskese Melash Vereniging in Nederland en help mee sociale rechtvaardigheid, gelijkheid en veiligheid te bevorderen.'
                : 'Join Association Keskese Milash in the Netherlands today and help foster social justice, equality, and well-being.')}
          </p>
          <Link to="/membership" style={{
            background: '#D4A843', color: '#FFFFFF', padding: '0.95rem 2.5rem',
            borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem',
            textDecoration: 'none', boxShadow: '0 6px 20px rgba(212,168,67,0.35)',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
          }}>
            {t('home.joinUs')} <span>→</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
