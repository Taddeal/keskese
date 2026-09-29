import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';

export default function Header() {
  const { locale, setLocale, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header" style={{padding: '0.85rem 0'}}>
      <div className="container flex-between" style={{maxWidth:'1320px', padding: '0 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
        {/* Brand Logo & Name */}
        <NavLink to="/" className="logo nav-link" onClick={closeMobileMenu} style={{display:'flex',alignItems:'center',gap:'0.65rem',flexShrink:0,marginRight:'2.5rem'}}>
          <img src="/logo.png" alt="Keskese Milash" style={{height:'44px',width:'44px',borderRadius:'50%',objectFit:'cover'}} />
          <h2 style={{fontSize:'1.35rem', margin:0, whiteSpace:'nowrap', fontWeight:700, color:'#1A6B3C'}}>Keskese Milash</h2>
        </NavLink>
        
        {/* Main Nav Links (Moved right from logo, increased size) */}
        <nav className={`nav ${mobileMenuOpen ? 'mobile-menu-open' : ''}`} style={{display:'flex', alignItems:'center'}}>
          <div className="nav-links" style={{gap: '1.4rem'}}>
            <NavLink to="/" className="nav-link" onClick={closeMobileMenu}>{t('nav.home')}</NavLink>
            <NavLink to="/about" className="nav-link" onClick={closeMobileMenu}>{t('nav.about')}</NavLink>
            <NavLink to="/plans" className="nav-link" onClick={closeMobileMenu}>{t('nav.plans')}</NavLink>
            <NavLink to="/projects" className="nav-link" onClick={closeMobileMenu}>{t('nav.projects')}</NavLink>
            <NavLink to="/news" className="nav-link" onClick={closeMobileMenu}>{t('nav.news')}</NavLink>
            <NavLink to="/membership" className="nav-link" onClick={closeMobileMenu}>{t('nav.membership')}</NavLink>
            <NavLink to="/contact" className="nav-link" onClick={closeMobileMenu}>{t('nav.contact')}</NavLink>
          </div>
        </nav>

        {/* Language Selector (Pushed right with clean spacing from border) */}
        <div className="header-actions flex items-center gap-3" style={{flexShrink:0, marginLeft:'auto'}}>
          <div className="language-selector" style={{
            display:'flex', gap:'3px', background:'rgba(0,0,0,0.06)', padding:'4px', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.08)'
          }}>
            <button 
              type="button"
              style={{
                padding:'0.3rem 0.65rem', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'0.88rem', fontWeight:700,
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
                padding:'0.3rem 0.65rem', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'0.88rem', fontWeight:700,
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
                padding:'0.3rem 0.65rem', borderRadius:'7px', border:'none', cursor:'pointer', fontSize:'0.88rem', fontWeight:700,
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
