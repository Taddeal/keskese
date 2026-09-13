import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';

export default function Header() {
  const { locale, t, toggleLanguage } = useTranslation();
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

        <div className="header-actions flex items-center gap-4">
          <button className="language-toggle btn btn-secondary btn-sm" onClick={toggleLanguage}>
            {locale === 'en' ? 'ትግ' : 'EN'}
          </button>
          <button className="mobile-menu-btn btn" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
