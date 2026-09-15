import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';

export default function Header() {
  const { locale, setLocale, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="container flex-between">
        <NavLink to="/" className="logo nav-link" onClick={closeMobileMenu} style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <img src="/logo.png" alt="Keskese Milash" style={{height:'40px',width:'40px',borderRadius:'50%',objectFit:'cover'}} />
          <h2>Keskese Milash</h2>
        </NavLink>
        
        <nav className={`nav ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <div className="nav-links">
            <NavLink to="/" className="nav-link" onClick={closeMobileMenu}>{t('nav.home')}</NavLink>
            <NavLink to="/about" className="nav-link" onClick={closeMobileMenu}>{t('nav.about')}</NavLink>
            <NavLink to="/plans" className="nav-link" onClick={closeMobileMenu}>{t('nav.plans')}</NavLink>
            <NavLink to="/projects" className="nav-link" onClick={closeMobileMenu}>{t('nav.projects')}</NavLink>
            <NavLink to="/news" className="nav-link" onClick={closeMobileMenu}>{t('nav.news')}</NavLink>
            <NavLink to="/membership" className="nav-link" onClick={closeMobileMenu}>{t('nav.membership')}</NavLink>
            <NavLink to="/contact" className="nav-link" onClick={closeMobileMenu}>{t('nav.contact')}</NavLink>
          </div>
        </nav>

        <div className="header-actions flex items-center gap-3">
          <div className="language-selector" style={{
            display:'flex', gap:'2px', background:'rgba(0,0,0,0.06)', padding:'3px', borderRadius:'8px', border:'1px solid rgba(0,0,0,0.08)'
          }}>
            <button 
              type="button"
              style={{
                padding:'0.25rem 0.55rem', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
                background: locale === 'en' ? '#1A6B3C' : 'transparent', color: locale === 'en' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
            <button 
              type="button"
              style={{
                padding:'0.25rem 0.55rem', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
                background: locale === 'ti' ? '#1A6B3C' : 'transparent', color: locale === 'ti' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setLocale('ti')}
            >
              ትግ
            </button>
            <button 
              type="button"
              style={{
                padding:'0.25rem 0.55rem', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
                background: locale === 'nl' ? '#1A6B3C' : 'transparent', color: locale === 'nl' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setLocale('nl')}
            >
              NL
            </button>
          </div>

          <button className="mobile-menu-btn btn" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
