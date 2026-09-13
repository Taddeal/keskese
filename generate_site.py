import os
import shutil

project_root = r"c:\Users\anteneh\Music\KesKese"

files = {
    r"src\utils\storage.js": """export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getNews = () => {
  const news = localStorage.getItem('keskese_news');
  return news ? JSON.parse(news) : [];
};

export const saveNews = (posts) => {
  localStorage.setItem('keskese_news', JSON.stringify(posts));
};

export const addNewsPost = (post) => {
  const posts = getNews();
  posts.push({ ...post, id: generateId(), createdAt: new Date().toISOString() });
  saveNews(posts);
};

export const updateNewsPost = (id, data) => {
  const posts = getNews();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...data, updatedAt: new Date().toISOString() };
    saveNews(posts);
  }
};

export const deleteNewsPost = (id) => {
  const posts = getNews();
  saveNews(posts.filter(p => p.id !== id));
};

export const getMembers = () => {
  const members = localStorage.getItem('keskese_members');
  return members ? JSON.parse(members) : [];
};

export const addMember = (member) => {
  const members = getMembers();
  members.push({ ...member, id: generateId(), dateJoined: new Date().toISOString() });
  localStorage.setItem('keskese_members', JSON.stringify(members));
};

export const deleteMember = (id) => {
  const members = getMembers();
  localStorage.setItem('keskese_members', JSON.stringify(members.filter(m => m.id !== id)));
};

export const exportAllData = () => {
  const data = {
    keskese_news: getNews(),
    keskese_members: getMembers()
  };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.keskese_news) localStorage.setItem('keskese_news', JSON.stringify(data.keskese_news));
    if (data.keskese_members) localStorage.setItem('keskese_members', JSON.stringify(data.keskese_members));
    return true;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
};
""",
    
    r"src\utils\formService.js": """export const submitForm = async (data, formType) => {
  const apiKey = import.meta.env.VITE_WEB3FORMS_KEY;
  if (apiKey) {
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: apiKey,
          subject: `New ${formType} Submission`,
          ...data
        })
      });
      return response.json();
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }
  
  // Simulate API call if no key
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, message: 'Form submitted successfully (simulated).' });
    }, 1000);
  });
};
""",

    r"src\components\layout\Header.jsx": """import React, { useState } from 'react';
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
        <NavLink to="/" className="logo nav-link" onClick={closeMobileMenu}>
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
""",

    r"src\components\layout\Footer.jsx": """import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container footer-grid grid-3">
        <div className="footer-col">
          <h3>Keskese Milash</h3>
          <p>{t('footer.about')}</p>
        </div>
        <div className="footer-col">
          <h3>{t('footer.quickLinks')}</h3>
          <div className="footer-links flex-column">
            <Link to="/about">{t('nav.about')}</Link>
            <Link to="/projects">{t('nav.projects')}</Link>
            <Link to="/membership">{t('nav.membership')}</Link>
            <Link to="/contact">{t('nav.contact')}</Link>
          </div>
        </div>
        <div className="footer-col">
          <h3>{t('footer.contact')}</h3>
          <p>{t('contact.address')}</p>
          <p>{t('contact.email')}</p>
          <p>{t('contact.phone')}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container flex-center">
          <p>&copy; {new Date().getFullYear()} Keskese Milash Association. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
""",

    r"src\components\layout\Layout.jsx": """import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
""",

    r"src\pages\Home.jsx": """import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

export default function Home() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page home-page">
      <section className="hero flex-center">
        <div className="hero-content container animate-slideUp text-center">
          <h1 className="title">{t('home.heroTitle')}</h1>
          <p className="subtitle">{t('home.heroSubtitle')}</p>
          <div className="hero-buttons flex-center gap-4 mt-6">
            <Link to="/membership" className="btn btn-primary">{t('home.joinUs')} &rarr;</Link>
            <Link to="/about" className="btn btn-secondary">{t('home.learnMore')} &rarr;</Link>
          </div>
        </div>
      </section>

      <section className="section mission-section">
        <div className="container">
          <div className="card animate-slideUp stagger-1">
            <div className="card-body text-center">
              <h2>{t('home.missionTitle')}</h2>
              <p className="mt-4">{t('home.missionText')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section quick-links-section bg-light">
        <div className="container grid-3">
          <div className="card animate-slideUp stagger-1">
            <div className="card-body text-center">
              <div className="icon text-3xl mb-4">📋</div>
              <h3>{t('nav.plans')}</h3>
              <p className="mt-4">{t('home.plansDesc')}</p>
              <Link to="/plans" className="btn btn-secondary mt-4 inline-block">{t('home.viewPlans')}</Link>
            </div>
          </div>
          <div className="card animate-slideUp stagger-2">
            <div className="card-body text-center">
              <div className="icon text-3xl mb-4">🏗️</div>
              <h3>{t('nav.projects')}</h3>
              <p className="mt-4">{t('home.projectsDesc')}</p>
              <Link to="/projects" className="btn btn-secondary mt-4 inline-block">{t('home.viewProjects')}</Link>
            </div>
          </div>
          <div className="card animate-slideUp stagger-3">
            <div className="card-body text-center">
              <div className="icon text-3xl mb-4">🤝</div>
              <h3>{t('nav.membership')}</h3>
              <p className="mt-4">{t('home.membershipDesc')}</p>
              <Link to="/membership" className="btn btn-secondary mt-4 inline-block">{t('home.joinUs')}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
""",

    r"src\pages\About.jsx": """import React, { useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';

export default function About() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page about-page">
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <h1>{t('nav.about')}</h1>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="card animate-slideUp mb-8">
            <div className="card-body">
              <h2>{t('about.introTitle')}</h2>
              <p className="mt-4">{t('about.introText')}</p>
            </div>
          </div>

          <div className="grid-2">
            <div className="card animate-slideUp stagger-1">
              <div className="card-body">
                <h2>{t('about.heritageTitle')}</h2>
                <p className="mt-4">{t('about.heritageText')}</p>
              </div>
            </div>
            <div className="card animate-slideUp stagger-2">
              <div className="card-body">
                <h2>{t('about.missionVisionTitle')}</h2>
                <p className="mt-4">{t('about.missionVisionText')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <h2 className="text-center mb-8">{t('about.valuesTitle')}</h2>
          <div className="grid-4">
            {['Integrity', 'Transparency', 'Accountability', 'Responsibility'].map((value, i) => (
              <div key={value} className={`card animate-slideUp stagger-${(i % 3) + 1}`}>
                <div className="card-body text-center py-8">
                  <h3 className="text-primary">{t(`about.values.${value.toLowerCase()}`)}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
""",

    r"src\pages\Plans.jsx": """import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import plansData from '../data/plans.json';

export default function Plans() {
  const { t, locale } = useTranslation();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPlans(plansData.plans || []);
  }, []);

  return (
    <div className="page plans-page">
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <h1>{t('nav.plans')}</h1>
        </div>
      </header>

      <section className="section">
        <div className="container grid-2">
          {plans.map((plan, idx) => (
            <div key={idx} className="card animate-slideUp">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{plan.icon}</span>
                  <h2>{locale === 'ti' && plan.title_ti ? plan.title_ti : plan.title_en}</h2>
                </div>
                <p className="mb-4">{locale === 'ti' && plan.description_ti ? plan.description_ti : plan.description_en}</p>
                <ul className="list-disc pl-6 space-y-2">
                  {plan.items?.map((item, i) => {
                    const itemText = locale === 'ti' && item.ti ? item.ti : item.en;
                    return <li key={i}>{itemText}</li>;
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
""",

    r"src\pages\Projects.jsx": """import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import projectsData from '../data/projects.json';

export default function Projects() {
  const { t, locale } = useTranslation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setProjects(projectsData.projects || []);
  }, []);

  return (
    <div className="page projects-page">
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <h1>{t('nav.projects')}</h1>
        </div>
      </header>

      <section className="section">
        <div className="container grid-2">
          {projects.map((project, idx) => (
            <div key={idx} className="card animate-slideUp">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{project.icon}</span>
                  <h2>{locale === 'ti' && project.title_ti ? project.title_ti : project.title_en}</h2>
                </div>
                <p className="mb-4">{locale === 'ti' && project.description_ti ? project.description_ti : project.description_en}</p>
                <ul className="list-disc pl-6 space-y-2">
                  {project.items?.map((item, i) => {
                    const itemText = locale === 'ti' && item.ti ? item.ti : item.en;
                    return <li key={i}>{itemText}</li>;
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
""",

    r"src\pages\News.jsx": """import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { getNews } from '../utils/storage';

export default function News() {
  const { t, locale } = useTranslation();
  const [newsPosts, setNewsPosts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const allNews = getNews();
    const published = allNews.filter(post => post.published);
    published.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    setNewsPosts(published);
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="page news-page">
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <h1>{t('nav.news')}</h1>
        </div>
      </header>

      <section className="section bg-light min-h-screen">
        <div className="container">
          {newsPosts.length === 0 ? (
            <div className="card max-w-2xl mx-auto text-center py-12">
              <div className="card-body">
                <p className="text-xl text-gray">{t('news.noPosts')}</p>
              </div>
            </div>
          ) : (
            <div className="grid-1 md-grid-2 max-w-4xl mx-auto">
              {newsPosts.map((post) => {
                const title = locale === 'ti' && post.title_ti ? post.title_ti : post.title_en;
                const body = locale === 'ti' && post.body_ti ? post.body_ti : post.body_en;
                const date = new Date(post.date || post.createdAt).toLocaleDateString(locale === 'ti' ? 'ti-ER' : 'en-US');
                const isExpanded = expandedId === post.id;
                
                return (
                  <div key={post.id} className="card animate-slideUp mb-6">
                    <div className="card-body">
                      <div className="text-sm text-gray mb-2">{date}</div>
                      <h2 className="mb-4">{title}</h2>
                      <div className="mb-6 whitespace-pre-wrap text-gray-dark leading-relaxed">
                        {isExpanded ? body : `${body?.substring(0, 150) || ''}...`}
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleExpand(post.id)}>
                        {isExpanded ? t('news.readLess') : t('news.readMore')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
""",

    r"src\pages\Membership.jsx": """import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { addMember } from '../utils/storage';
import { submitForm } from '../utils/formService';

export default function Membership() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t('form.required');
    if (!formData.email) {
      newErrors.email = t('form.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('form.invalidEmail');
    }
    if (!formData.phone) newErrors.phone = t('form.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ loading: true, success: false, error: null });
    
    try {
      addMember(formData);
      await submitForm(formData, 'Membership');
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus({ loading: false, success: false, error: t('form.submitError') });
    }
  };

  return (
    <div className="page membership-page">
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <h1>{t('nav.membership')}</h1>
        </div>
      </header>

      <section className="section bg-light min-h-screen">
        <div className="container max-w-md mx-auto">
          <div className="card animate-slideUp shadow-lg">
            <div className="card-body p-8">
              {status.success ? (
                <div className="success-message text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h2 className="mb-4">{t('form.successTitle')}</h2>
                  <p className="text-gray">{t('form.successMessage')}</p>
                  <button className="btn btn-primary mt-8 w-full" onClick={() => setStatus({ ...status, success: false })}>
                    {t('form.submitAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="form flex-column gap-4">
                  <div className="form-group">
                    <label className="form-label font-bold mb-2 block">{t('form.name')} *</label>
                    <input className="form-input w-full p-3 border rounded focus:border-primary" type="text" name="name" value={formData.name} onChange={handleChange} />
                    {errors.name && <span className="form-error text-red text-sm mt-1 block">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold mb-2 block">{t('form.email')} *</label>
                    <input className="form-input w-full p-3 border rounded focus:border-primary" type="email" name="email" value={formData.email} onChange={handleChange} />
                    {errors.email && <span className="form-error text-red text-sm mt-1 block">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold mb-2 block">{t('form.phone')} *</label>
                    <input className="form-input w-full p-3 border rounded focus:border-primary" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                    {errors.phone && <span className="form-error text-red text-sm mt-1 block">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold mb-2 block">{t('form.message')}</label>
                    <textarea className="form-textarea w-full p-3 border rounded focus:border-primary" name="message" rows="4" value={formData.message} onChange={handleChange}></textarea>
                  </div>
                  
                  {status.error && <div className="form-error text-red bg-red-light p-3 rounded">{status.error}</div>}
                  
                  <button type="submit" className="btn btn-primary w-full py-3 mt-4" disabled={status.loading}>
                    {status.loading ? t('form.submitting') : t('form.submit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
""",

    r"src\pages\Contact.jsx": """import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { submitForm } from '../utils/formService';

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    
    try {
      await submitForm(formData, 'Contact');
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ loading: false, success: false, error: t('form.submitError') });
    }
  };

  return (
    <div className="page contact-page">
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <h1>{t('nav.contact')}</h1>
        </div>
      </header>

      <section className="section bg-light">
        <div className="container grid-2 gap-8 max-w-5xl mx-auto">
          <div className="card animate-slideUp shadow-lg">
            <div className="card-body p-8">
              <h2 className="mb-6">{t('contact.getInTouch')}</h2>
              {status.success ? (
                <div className="success-message text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-lg">{t('form.successMessage')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="form flex-column gap-4">
                  <div className="form-group">
                    <label className="form-label font-bold mb-2 block">{t('form.name')} *</label>
                    <input className="form-input w-full p-3 border rounded focus:border-primary" required type="text" name="name" value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold mb-2 block">{t('form.email')} *</label>
                    <input className="form-input w-full p-3 border rounded focus:border-primary" required type="email" name="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold mb-2 block">{t('form.subject')}</label>
                    <input className="form-input w-full p-3 border rounded focus:border-primary" type="text" name="subject" value={formData.subject} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label font-bold mb-2 block">{t('form.message')} *</label>
                    <textarea className="form-textarea w-full p-3 border rounded focus:border-primary" required name="message" rows="5" value={formData.message} onChange={handleChange}></textarea>
                  </div>
                  {status.error && <div className="form-error text-red bg-red-light p-3 rounded">{status.error}</div>}
                  <button type="submit" className="btn btn-primary w-full py-3 mt-4" disabled={status.loading}>
                    {status.loading ? t('form.submitting') : t('form.submit')}
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className="card animate-slideUp stagger-1 h-fit shadow-lg">
            <div className="card-body p-8 bg-white">
              <h2 className="mb-8 border-b pb-4">{t('contact.info')}</h2>
              <div className="flex-column gap-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl text-primary mt-1">📍</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{t('contact.address')}</h3>
                    <p className="text-gray leading-relaxed">Keskese Milash Association<br/>Netherlands</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl text-primary mt-1">✉️</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{t('contact.email')}</h3>
                    <p className="text-gray">info@keskesemilash.org</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl text-primary mt-1">📞</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{t('contact.phone')}</h3>
                    <p className="text-gray">+31 6 12345678</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
""",

    r"src\pages\admin\AdminLogin.jsx": """import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (password === correctPassword) {
      sessionStorage.setItem('keskese_admin', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="page flex-center min-h-screen bg-light">
      <div className="card max-w-sm w-full shadow-lg">
        <div className="card-body p-8">
          <h2 className="text-center mb-8 text-2xl font-bold">Admin Login</h2>
          <form onSubmit={handleLogin} className="form flex-column gap-6">
            <div className="form-group">
              <label className="form-label font-bold mb-2 block">Password</label>
              <input 
                type="password" 
                className="form-input w-full p-3 border rounded focus:border-primary" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <span className="form-error mt-2 block text-red text-sm">{error}</span>}
            </div>
            <button type="submit" className="btn btn-primary w-full py-3">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}
""",

    r"src\pages\admin\ProtectedRoute.jsx": """import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';

export default function ProtectedRoute() {
  const isAuthenticated = sessionStorage.getItem('keskese_admin') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('keskese_admin');
    window.location.href = '/admin/login';
  };

  return (
    <div className="admin-layout min-h-screen bg-light flex flex-col">
      <header className="header bg-white shadow-sm py-4">
        <div className="container flex-between items-center flex-wrap gap-4">
          <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
          <nav className="nav flex gap-4 items-center flex-wrap">
            <Link to="/admin/dashboard" className="nav-link font-medium">Dashboard</Link>
            <Link to="/admin/news" className="nav-link font-medium">News</Link>
            <Link to="/admin/members" className="nav-link font-medium">Members</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm ml-4">Logout</button>
          </nav>
        </div>
      </header>
      <main className="admin-content container py-8 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
""",

    r"src\pages\admin\AdminDashboard.jsx": """import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNews, getMembers, exportAllData, importAllData } from '../../utils/storage';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ news: 0, members: 0 });
  const fileInputRef = useRef(null);

  useEffect(() => {
    setStats({
      news: getNews().length,
      members: getMembers().length
    });
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
        alert('Import successful!');
        window.location.reload();
      } else {
        alert('Import failed. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="mb-8 text-3xl font-bold border-b pb-4">Dashboard</h1>
      
      <div className="grid-2 gap-6 mb-8">
        <div className="card admin-stat-card shadow-sm border-l-4 border-primary">
          <div className="card-body p-6">
            <h3 className="text-gray text-lg mb-2">Total News Posts</h3>
            <p className="text-5xl font-bold text-primary mb-6">{stats.news}</p>
            <Link to="/admin/news" className="btn btn-secondary w-full block text-center py-2">Manage News</Link>
          </div>
        </div>
        <div className="card admin-stat-card shadow-sm border-l-4 border-accent">
          <div className="card-body p-6">
            <h3 className="text-gray text-lg mb-2">Total Members</h3>
            <p className="text-5xl font-bold text-primary mb-6">{stats.members}</p>
            <Link to="/admin/members" className="btn btn-secondary w-full block text-center py-2">View Members</Link>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-6">
          <h3 className="mb-6 text-xl font-bold">Data Management</h3>
          <p className="text-gray mb-6">Export all local data as a JSON file, or restore from a previous backup.</p>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleExport} className="btn btn-primary px-6 py-2">⬇️ Export Data Backup</button>
            <button onClick={() => fileInputRef.current.click()} className="btn btn-secondary px-6 py-2">⬆️ Import Data</button>
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
""",

    r"src\pages\admin\AdminNews.jsx": """import React, { useState, useEffect } from 'react';
import { getNews, addNewsPost, updateNewsPost, deleteNewsPost } from '../../utils/storage';

export default function AdminNews() {
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '', title_ti: '', body_en: '', body_ti: '', date: '', published: true
  });

  const loadPosts = () => {
    const allPosts = getNews();
    allPosts.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    setPosts(allPosts);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title_en: '', title_ti: '', body_en: '', body_ti: '', date: '', published: true });
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      title_en: post.title_en || '',
      title_ti: post.title_ti || '',
      body_en: post.body_en || '',
      body_ti: post.body_ti || '',
      date: post.date || post.createdAt?.split('T')[0] || '',
      published: post.published ?? true
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteNewsPost(id);
      loadPosts();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateNewsPost(editingId, formData);
    } else {
      addNewsPost(formData);
    }
    loadPosts();
    resetForm();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="mb-8 text-3xl font-bold border-b pb-4">Manage News</h1>
      
      <div className="grid-2 gap-8 items-start">
        <div className="card admin-form shadow-sm sticky top-6">
          <div className="card-body p-6">
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Post' : 'Create New Post'}</h3>
            <form onSubmit={handleSubmit} className="form flex-column gap-4">
              <div className="form-group">
                <label className="form-label font-bold mb-1 block">Title (English) *</label>
                <input required className="form-input w-full p-2 border rounded" type="text" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label font-bold mb-1 block">Title (Tigrinya)</label>
                <input className="form-input w-full p-2 border rounded" type="text" value={formData.title_ti} onChange={e => setFormData({...formData, title_ti: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label font-bold mb-1 block">Body (English) *</label>
                <textarea required className="form-textarea w-full p-2 border rounded" rows="5" value={formData.body_en} onChange={e => setFormData({...formData, body_en: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label font-bold mb-1 block">Body (Tigrinya)</label>
                <textarea className="form-textarea w-full p-2 border rounded" rows="5" value={formData.body_ti} onChange={e => setFormData({...formData, body_ti: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label font-bold mb-1 block">Date</label>
                <input className="form-input w-full p-2 border rounded" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-group flex items-center gap-3 mt-2">
                <input type="checkbox" id="published" className="w-5 h-5" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} />
                <label htmlFor="published" className="font-bold cursor-pointer">Published</label>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn btn-primary px-6 py-2">{editingId ? 'Update Post' : 'Create Post'}</button>
                {editingId && <button type="button" className="btn btn-secondary px-6 py-2" onClick={resetForm}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-6">
            <h3 className="text-xl font-bold mb-6">Posts List ({posts.length})</h3>
            <div className="flex-column gap-4">
              {posts.map(post => (
                <div key={post.id} className="border border-gray-light p-4 rounded bg-white hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-lg mb-1">{post.title_en}</h4>
                  <p className="text-sm text-gray mb-4">
                    {new Date(post.date || post.createdAt).toLocaleDateString()} &bull; 
                    <span className={post.published ? 'text-primary ml-2 font-medium' : 'text-gray ml-2 italic'}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(post)} className="btn btn-secondary btn-sm px-4">Edit</button>
                    <button onClick={() => handleDelete(post.id)} className="btn btn-secondary btn-sm px-4 text-red border-red hover:bg-red-light">Delete</button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-gray text-center py-8">No news posts found. Create one!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
""",

    r"src\pages\admin\AdminMembers.jsx": """import React, { useState, useEffect } from 'react';
import { getMembers, deleteMember } from '../../utils/storage';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);

  const loadMembers = () => {
    const allMembers = getMembers();
    allMembers.sort((a, b) => new Date(b.dateJoined) - new Date(a.dateJoined));
    setMembers(allMembers);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this membership record? This action cannot be undone.')) {
      deleteMember(id);
      loadMembers();
    }
  };

  const handleExportCSV = () => {
    if (members.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Date Joined', 'Message'];
    const rows = members.map(m => [
      `"${m.name || ''}"`,
      `"${m.email || ''}"`,
      `"${m.phone || ''}"`,
      `"${new Date(m.dateJoined).toLocaleDateString()}"`,
      `"${(m.message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">Membership Submissions</h1>
        <button onClick={handleExportCSV} className="btn btn-primary px-6 py-2 flex items-center gap-2">
          <span>⬇️</span> Export CSV
        </button>
      </div>

      <div className="card admin-table-container overflow-x-auto shadow-sm">
        <table className="admin-table w-full text-left bg-white" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="bg-light border-b-2 border-gray-light">
              <th className="p-4 font-bold text-gray-dark">Name</th>
              <th className="p-4 font-bold text-gray-dark">Email</th>
              <th className="p-4 font-bold text-gray-dark">Phone</th>
              <th className="p-4 font-bold text-gray-dark">Date Joined</th>
              <th className="p-4 font-bold text-gray-dark text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="border-b border-gray-light hover:bg-light transition-colors">
                <td className="p-4 font-medium">{member.name}</td>
                <td className="p-4"><a href={`mailto:${member.email}`} className="text-primary hover:underline">{member.email}</a></td>
                <td className="p-4"><a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a></td>
                <td className="p-4 text-gray">{new Date(member.dateJoined).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(member.id)} className="text-red font-medium hover:underline py-1 px-2 rounded hover:bg-red-light">Delete</button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray text-lg">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
""",

    r"src\App.jsx": """import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import About from './pages/About';
import Plans from './pages/Plans';
import Projects from './pages/Projects';
import News from './pages/News';
import Contact from './pages/Contact';
import Membership from './pages/Membership';

import AdminLogin from './pages/admin/AdminLogin';
import ProtectedRoute from './pages/admin/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminMembers from './pages/admin/AdminMembers';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="plans" element={<Plans />} />
            <Route path="projects" element={<Projects />} />
            <Route path="news" element={<News />} />
            <Route path="contact" element={<Contact />} />
            <Route path="membership" element={<Membership />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="members" element={<AdminMembers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
""",

    r"src\main.jsx": """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
""",

    r"vercel.json": """{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
"""
}

for rel_path, content in files.items():
    abs_path = os.path.join(project_root, rel_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    with open(abs_path, "w", encoding="utf-8") as f:
        f.write(content)

# Delete unwanted files
app_css = os.path.join(project_root, r"src\App.css")
react_svg = os.path.join(project_root, r"src\assets\react.svg")

if os.path.exists(app_css):
    os.remove(app_css)
if os.path.exists(react_svg):
    os.remove(react_svg)

print("Site generation complete!")
