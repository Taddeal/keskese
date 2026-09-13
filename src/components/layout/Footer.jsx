import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';

export default function Footer() {
  const { t, locale } = useTranslation();

  return (
    <footer className="footer" style={{
      background: '#112236',
      color: '#E5E7EB',
      paddingTop: '4rem',
      paddingBottom: '2rem',
      position: 'relative',
      borderTop: '1px solid rgba(255,255,255,0.08)'
    }}>

      {/* Top Flag Color Stripe Accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: 'linear-gradient(90deg, #1A6B3C 0%, #1A6B3C 33%, #D4A843 33%, #D4A843 50%, #1E3A5F 50%, #1E3A5F 80%, #C23B22 80%, #C23B22 100%)'
      }} />

      <div className="container" style={{maxWidth: '1150px'}}>
        
        {/* Main Footer Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          
          {/* Column 1: Brand & Identity */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <img 
                src="/logo.png" 
                alt="Keskese Milash" 
                style={{height: '42px', width: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #D4A843'}} 
              />
              <h3 style={{margin: 0, color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 700}}>
                Keskese Milash
              </h3>
            </div>

            <p style={{color: '#9CA3AF', fontSize: '0.9rem', lineHeight: 1.65, margin: 0}}>
              {t('footer.about')}
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
              fontSize: '0.78rem', color: '#D4A843', border: '1px solid rgba(212,168,67,0.2)'
            }}>
              ⚖️ {locale === 'ti' ? 'ቅንዕና • ግልጽነት • ተሓታትነት • ሓላፍነት' : 'Integrity • Transparency • Accountability'}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{
              color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700,
              marginBottom: '1.25rem', borderBottom: '2px solid #1A6B3C', paddingBottom: '0.5rem',
              display: 'inline-block'
            }}>
              {t('footer.quickLinks')}
            </h4>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem'}}>
              <li>
                <Link to="/" style={{color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease'}}
                  onMouseEnter={e => e.target.style.color = '#D4A843'}
                  onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" style={{color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease'}}
                  onMouseEnter={e => e.target.style.color = '#D4A843'}
                  onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                >
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/plans" style={{color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease'}}
                  onMouseEnter={e => e.target.style.color = '#D4A843'}
                  onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                >
                  {t('nav.plans')}
                </Link>
              </li>
              <li>
                <Link to="/projects" style={{color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease'}}
                  onMouseEnter={e => e.target.style.color = '#D4A843'}
                  onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                >
                  {t('nav.projects')}
                </Link>
              </li>
              <li>
                <Link to="/news" style={{color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease'}}
                  onMouseEnter={e => e.target.style.color = '#D4A843'}
                  onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                >
                  {t('nav.news')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Focus & Get Involved */}
          <div>
            <h4 style={{
              color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700,
              marginBottom: '1.25rem', borderBottom: '2px solid #D4A843', paddingBottom: '0.5rem',
              display: 'inline-block'
            }}>
              {locale === 'ti' ? 'ተሳተፉ' : 'Get Involved'}
            </h4>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem'}}>
              <li>
                <Link to="/membership" style={{color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease'}}
                  onMouseEnter={e => e.target.style.color = '#D4A843'}
                  onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                >
                  🤝 {t('nav.membership')}
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease'}}
                  onMouseEnter={e => e.target.style.color = '#D4A843'}
                  onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                >
                  📩 {t('nav.contact')}
                </Link>
              </li>
              <li>
                <span style={{color: '#6B7280', fontSize: '0.88rem'}}>
                  📍 {locale === 'ti' ? 'ኣብ ኔዘርላንድስ' : 'Based in the Netherlands'}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Contact Info */}
          <div>
            <h4 style={{
              color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700,
              marginBottom: '1.25rem', borderBottom: '2px solid #1E3A5F', paddingBottom: '0.5rem',
              display: 'inline-block'
            }}>
              {t('footer.contact')}
            </h4>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#9CA3AF'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                <span>📍</span>
                <span>Association Keskese Milash, Netherlands</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                <span>✉️</span>
                <a href="mailto:info@keskesemilash.org" style={{color: '#D4A843', textDecoration: 'none'}}>
                  info@keskesemilash.org
                </a>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                <span>📞</span>
                <span>+31 6 12345678</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Divider Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#6B7280'
        }}>
          <div>
            &copy; {new Date().getFullYear()} Association Keskese Milash Netherlands. {t('footer.rights')}
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <Link 
              to="/admin/login" 
              style={{color: '#4B5563', textDecoration: 'none', fontSize: '0.8rem'}}
              onMouseEnter={e => e.target.style.color = '#9CA3AF'}
              onMouseLeave={e => e.target.style.color = '#4B5563'}
            >
              🔐 Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
