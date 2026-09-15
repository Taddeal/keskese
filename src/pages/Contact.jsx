import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { submitForm } from '../utils/formService';

export default function Contact() {
  const { t, locale } = useTranslation();
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
      {/* Header */}
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <span style={{
            display:'inline-block', padding:'0.35rem 1rem', borderRadius:'50px',
            background:'rgba(255,255,255,0.15)', color:'#FDF6E3', fontWeight:600,
            fontSize:'0.85rem', letterSpacing:'0.05em', marginBottom:'0.75rem',
            backdropFilter: 'blur(4px)',
          }}>
            {locale === 'ti' ? 'ተወከሱና' : (locale === 'nl' ? 'Neem contact op' : 'Reach Out To Us')}
          </span>
          <h1 style={{fontSize:'2.5rem', margin:'0 0 0.5rem'}}>{t('contact.title')}</h1>
          <p style={{maxWidth:'600px', margin:'0 auto', opacity:0.9, fontSize:'1.05rem'}}>
            {t('contact.subtitle')}
          </p>
        </div>
      </header>

      <section className="section bg-light" style={{padding:'4rem 0'}}>
        <div className="container" style={{maxWidth:'1100px'}}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))',
            gap:'2.5rem',
            alignItems:'start'
          }}>
            
            {/* Contact Form Card */}
            <div className="card shadow-lg animate-slideUp" style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.06)',
              borderTop: '5px solid #1A6B3C',
              overflow: 'hidden',
            }}>
              <div className="card-body" style={{padding:'2.5rem'}}>
                <div style={{marginBottom:'2rem'}}>
                  <h2 style={{fontSize:'1.6rem', color:'#1A1A2E', marginBottom:'0.5rem', fontWeight:700}}>
                    {t('contact.getInTouch')}
                  </h2>
                  <p style={{color:'#6B7280', fontSize:'0.95rem', margin:0}}>
                    {locale === 'ti' 
                      ? 'መልእኽትኹም ኣእትዉ፡ ኣብ ሓጺር እዋን ክንምልሰልኩም ኢና።' 
                      : (locale === 'nl' 
                        ? 'Stuur ons een bericht en we nemen zo snel mogelijk contact met u op.' 
                        : 'Send us a message and we will get back to you as soon as possible.')}
                  </p>
                </div>

                {status.success ? (
                  <div className="success-message text-center py-10" style={{
                    background: 'linear-gradient(135deg, #E8F5EE 0%, #F4FBF7 100%)',
                    borderRadius: '16px',
                    padding: '2.5rem 1.5rem',
                    border: '1px solid #C8E6C9',
                  }}>
                    <div style={{
                      width:'64px', height:'64px', borderRadius:'50%', background:'#1A6B3C',
                      color:'#FFF', display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'2rem', margin:'0 auto 1rem', boxShadow:'0 6px 16px rgba(26,107,60,0.25)'
                    }}>
                      ✓
                    </div>
                    <h3 style={{color:'#145A30', fontSize:'1.4rem', marginBottom:'0.5rem', fontWeight:700}}>
                      {t('form.successTitle')}
                    </h3>
                    <p style={{color:'#374151', fontSize:'0.95rem', marginBottom:'1.5rem'}}>
                      {t('form.successMessage')}
                    </p>
                    <button 
                      className="btn btn-primary"
                      style={{padding:'0.7rem 1.75rem', borderRadius:'8px'}}
                      onClick={() => setStatus({ ...status, success: false })}
                    >
                      {t('form.submitAnother')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="form flex-column gap-5">
                    {/* Name field */}
                    <div className="form-group">
                      <label className="form-label" style={{fontWeight:600, color:'#374151', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <span>👤</span> {t('form.name')} <span style={{color:'#C23B22'}}>*</span>
                      </label>
                      <input 
                        className="form-input"
                        style={{
                          width:'100%', padding:'0.85rem 1rem', borderRadius:'10px',
                          border:'1.5px solid #E5E7EB', fontSize:'0.95rem',
                          transition:'all 0.2s ease', outline:'none'
                        }} 
                        placeholder={locale === 'ti' ? 'ሽምኩም ኣእትዉ' : (locale === 'nl' ? 'Voer uw volledige naam in' : 'Enter your full name')}
                        required 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                      />
                    </div>

                    {/* Email field */}
                    <div className="form-group">
                      <label className="form-label" style={{fontWeight:600, color:'#374151', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <span>✉️</span> {t('form.email')} <span style={{color:'#C23B22'}}>*</span>
                      </label>
                      <input 
                        className="form-input"
                        style={{
                          width:'100%', padding:'0.85rem 1rem', borderRadius:'10px',
                          border:'1.5px solid #E5E7EB', fontSize:'0.95rem',
                          transition:'all 0.2s ease', outline:'none'
                        }} 
                        placeholder={locale === 'ti' ? 'ኣድራሻ ኢመይልኩም' : (locale === 'nl' ? 'naam@voorbeeld.nl' : 'name@example.com')}
                        required 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                      />
                    </div>

                    {/* Subject field */}
                    <div className="form-group">
                      <label className="form-label" style={{fontWeight:600, color:'#374151', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <span>📌</span> {t('form.subject')}
                      </label>
                      <input 
                        className="form-input"
                        style={{
                          width:'100%', padding:'0.85rem 1rem', borderRadius:'10px',
                          border:'1.5px solid #E5E7EB', fontSize:'0.95rem',
                          transition:'all 0.2s ease', outline:'none'
                        }} 
                        placeholder={locale === 'ti' ? 'ኣርእስቲ መልእኽቲ' : (locale === 'nl' ? 'Hoe kunnen we u helpen?' : 'How can we help?')}
                        type="text" 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange} 
                      />
                    </div>

                    {/* Message field */}
                    <div className="form-group">
                      <label className="form-label" style={{fontWeight:600, color:'#374151', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <span>💬</span> {t('form.message')} <span style={{color:'#C23B22'}}>*</span>
                      </label>
                      <textarea 
                        className="form-textarea"
                        style={{
                          width:'100%', padding:'0.85rem 1rem', borderRadius:'10px',
                          border:'1.5px solid #E5E7EB', fontSize:'0.95rem',
                          transition:'all 0.2s ease', outline:'none', resize:'vertical'
                        }} 
                        placeholder={locale === 'ti' ? 'መልእኽትኹም ኣብዚ ጽሓፉ...' : (locale === 'nl' ? 'Schrijf hier uw bericht...' : 'Write your message here...')}
                        required 
                        name="message" 
                        rows="5" 
                        value={formData.message} 
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {status.error && (
                      <div className="form-error" style={{
                        background:'#FDE8E8', color:'#C23B22', padding:'0.75rem 1rem',
                        borderRadius:'8px', fontSize:'0.9rem', border:'1px solid #F8B4B4'
                      }}>
                        ⚠️ {status.error}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{
                        width:'100%', padding:'0.95rem', fontSize:'1rem', fontWeight:600,
                        borderRadius:'10px', background:'linear-gradient(135deg, #1A6B3C 0%, #145A30 100%)',
                        boxShadow:'0 4px 12px rgba(26,107,60,0.25)', border:'none',
                        cursor: status.loading ? 'not-allowed' : 'pointer',
                        transition:'all 0.3s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'
                      }} 
                      disabled={status.loading}
                    >
                      {status.loading ? (
                        <><span>⌛</span> {t('form.submitting')}</>
                      ) : (
                        <><span>🚀</span> {t('form.submit')}</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
            
            {/* Contact Info Side Card */}
            <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
              
              {/* Primary Info Box */}
              <div className="card shadow-lg animate-slideUp stagger-1" style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid rgba(0,0,0,0.06)',
                borderTop: '5px solid #1E3A5F',
                padding: '2.5rem',
              }}>
                <h2 style={{fontSize:'1.5rem', color:'#1E3A5F', marginBottom:'1.5rem', fontWeight:700, borderBottom:'2px solid #EBF0F7', paddingBottom:'0.75rem'}}>
                  {t('contact.info')}
                </h2>

                <div style={{display:'flex', flexDirection:'column', gap:'1.75rem'}}>
                  {/* Address */}
                  <div style={{display:'flex', alignItems:'flex-start', gap:'1.25rem'}}>
                    <div style={{
                      width:'48px', height:'48px', borderRadius:'14px',
                      background:'linear-gradient(135deg, #1E3A5F15, #1E3A5F25)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'1.5rem', flexShrink:0, color:'#1E3A5F',
                      border:'1px solid #1E3A5F30'
                    }}>
                      📍
                    </div>
                    <div>
                      <h3 style={{fontSize:'1.05rem', fontWeight:700, color:'#1A1A2E', margin:'0 0 0.25rem'}}>
                        {t('contact.address')}
                      </h3>
                      <p style={{color:'#6B7280', margin:0, lineHeight:'1.6', fontSize:'0.95rem'}}>
                        <strong>Association Keskese Milash</strong><br/>
                        Netherlands
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{display:'flex', alignItems:'flex-start', gap:'1.25rem'}}>
                    <div style={{
                      width:'48px', height:'48px', borderRadius:'14px',
                      background:'linear-gradient(135deg, #1A6B3C15, #1A6B3C25)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'1.5rem', flexShrink:0, color:'#1A6B3C',
                      border:'1px solid #1A6B3C30'
                    }}>
                      ✉️
                    </div>
                    <div>
                      <h3 style={{fontSize:'1.05rem', fontWeight:700, color:'#1A1A2E', margin:'0 0 0.25rem'}}>
                        {t('contact.email')}
                      </h3>
                      <a 
                        href="mailto:info@keskesemilash.org" 
                        style={{color:'#1A6B3C', textDecoration:'none', fontWeight:600, fontSize:'0.95rem'}}
                        onMouseEnter={e => e.target.style.textDecoration='underline'}
                        onMouseLeave={e => e.target.style.textDecoration='none'}
                      >
                        info@keskesemilash.org
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{display:'flex', alignItems:'flex-start', gap:'1.25rem'}}>
                    <div style={{
                      width:'48px', height:'48px', borderRadius:'14px',
                      background:'linear-gradient(135deg, #D4A84315, #D4A84325)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'1.5rem', flexShrink:0, color:'#D4A843',
                      border:'1px solid #D4A84330'
                    }}>
                      📞
                    </div>
                    <div>
                      <h3 style={{fontSize:'1.05rem', fontWeight:700, color:'#1A1A2E', margin:'0 0 0.25rem'}}>
                        {t('contact.phone')}
                      </h3>
                      <a 
                        href="tel:+31612345678" 
                        style={{color:'#374151', textDecoration:'none', fontSize:'0.95rem'}}
                      >
                        +31 6 12345678
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Trust / Response Card */}
              <div className="card animate-slideUp stagger-2" style={{
                background: 'linear-gradient(135deg, #E8F5EE 0%, #EBF0F7 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #C8E6C9',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{fontSize:'2rem'}}>⏱️</div>
                <div>
                  <h4 style={{margin:'0 0 0.2rem', color:'#145A30', fontSize:'0.95rem', fontWeight:700}}>
                    {locale === 'ti' ? 'ቀልጣፋ ምላሽ' : (locale === 'nl' ? 'Snelle reactietijd' : 'Quick Response Time')}
                  </h4>
                  <p style={{margin:0, color:'#4B5563', fontSize:'0.85rem'}}>
                    {locale === 'ti'
                      ? 'ንኩሎም ሕቶታት ኣብ ውሽጢ 24 ሰዓታት ምላሽ ንህበሎም።'
                      : (locale === 'nl'
                        ? 'We streven ernaar om alle vragen binnen 24 uur te beantwoorden.'
                        : 'We aim to respond to all inquiries within 24 business hours.')}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
