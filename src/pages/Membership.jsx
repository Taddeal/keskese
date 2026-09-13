import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { addMember } from '../utils/storage';
import { submitForm } from '../utils/formService';

const benefits = [
  {
    icon: '🤝',
    titleEn: 'Supportive Network',
    titleTi: 'ደጋፊ መርበብ',
    descEn: 'Connect with Eritrean families and individuals across the Netherlands for guidance and mutual help.',
    descTi: 'ምስ ኣብ ኔዘርላንድስ ዝርከቡ ኤርትራውያን ስድራቤታትን ውልቀሰባትን ንምስናይን ሓድሕዳዊ ደገፍን ተራኸቡ።',
    color: '#1A6B3C',
  },
  {
    icon: '🏺',
    titleEn: 'Cultural Heritage',
    titleTi: 'ባህላዊ ውርሻ',
    descEn: 'Participate in cultural celebrations, language programs, and community traditions.',
    descTi: 'ኣብ ባህላዊ በዓላት፡ ናይ ቋንቋ መደባትን ማሕበረሰባዊ ልምድታትን ተሳተፉ።',
    color: '#D4A843',
  },
  {
    icon: '🌱',
    titleEn: 'Youth & Family Programs',
    titleTi: 'መደባት መንእሰያትን ስድራቤታትን',
    descEn: 'Educational workshops, sports activities, and mentorship for the younger generation.',
    descTi: 'ንመጻኢ  my ማሕበረሰብና ዝሕግዙ ትምህርታዊ ዎርክሾፓት፡ ስፖርታውን ናይ ምኽሪ መደባትን።',
    color: '#1E3A5F',
  },
  {
    icon: '⚖️',
    titleEn: 'Advocacy & Social Justice',
    titleTi: 'ማሕበራዊ ፍትሕን ወኪልነትን',
    descEn: 'Upholding accountability, equality, and representing our community interests.',
    descTi: 'ተሓታትነትን ማዕርነትን ብምኽባር ንረብሓታት ማሕበረሰብና ምውካልን ምጉስጓስን።',
    color: '#C23B22',
  },
];

export default function Membership() {
  const { t, locale } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('form.required');
    if (!formData.email.trim()) {
      newErrors.email = t('form.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('form.invalidEmail');
    }
    if (!formData.phone.trim()) newErrors.phone = t('form.required');
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
      {/* Header */}
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <span style={{
            display:'inline-block', padding:'0.35rem 1rem', borderRadius:'50px',
            background:'rgba(255,255,255,0.15)', color:'#FDF6E3', fontWeight:600,
            fontSize:'0.85rem', letterSpacing:'0.05em', marginBottom:'0.75rem',
            backdropFilter: 'blur(4px)',
          }}>
            {locale === 'ti' ? 'ኣባልነት ማሕበር' : 'Association Membership'}
          </span>
          <h1 style={{fontSize:'2.5rem', margin:'0 0 0.5rem'}}>{t('membership.title')}</h1>
          <p style={{maxWidth:'650px', margin:'0 auto', opacity:0.9, fontSize:'1.05rem'}}>
            {t('membership.subtitle')}
          </p>
        </div>
      </header>

      <section className="section bg-light" style={{padding:'4rem 0'}}>
        <div className="container" style={{maxWidth:'1150px'}}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))',
            gap:'3rem',
            alignItems:'start'
          }}>

            {/* Left Side: Membership Benefits */}
            <div className="animate-slideUp" style={{display:'flex', flexDirection:'column', gap:'1.75rem'}}>
              <div>
                <span style={{
                  color:'#1A6B3C', fontWeight:700, fontSize:'0.85rem',
                  letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:'0.4rem'
                }}>
                  {locale === 'ti' ? 'ስለምንታይ ኣባል ትኾኑ?' : 'Why Join Keskese Milash?'}
                </span>
                <h2 style={{fontSize:'1.85rem', color:'#1A1A2E', fontWeight:700, margin:'0 0 0.75rem'}}>
                  {locale === 'ti' ? 'ናይ ኣባልነት ረብሓታት' : 'Member Benefits & Opportunities'}
                </h2>
                <p style={{color:'#6B7280', fontSize:'0.98rem', lineHeight:'1.75', margin:0}}>
                  {locale === 'ti'
                    ? 'ኣብ ማሕበርና ብምጽንባር፡ ንሓድነት ማሕበረሰብና ኣብ ምድልዳል ኣበርክቶ እናገበርኩም፡ ኣብ ዝተፈላለዩ ደገፋትን መደባትን ተሳተፍቲ ትኾኑ።'
                    : 'By joining Association Keskese Milash, you become an active partner in strengthening our community while accessing support networks and cultural programs.'}
                </p>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'1.25rem'}}>
                {benefits.map((b, idx) => (
                  <div key={idx} style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    borderLeft: `4px solid ${b.color}`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; }}
                  >
                    <div style={{
                      width:'44px', height:'44px', borderRadius:'12px',
                      background:`${b.color}15`, display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:'1.4rem', flexShrink:0,
                      border:`1px solid ${b.color}30`
                    }}>
                      {b.icon}
                    </div>
                    <div>
                      <h3 style={{fontSize:'1.05rem', fontWeight:700, color:'#1A1A2E', margin:'0 0 0.25rem'}}>
                        {locale === 'ti' ? b.titleTi : b.titleEn}
                      </h3>
                      <p style={{color:'#6B7280', fontSize:'0.9rem', lineHeight:'1.6', margin:0}}>
                        {locale === 'ti' ? b.descTi : b.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Callout box */}
              <div style={{
                background:'linear-gradient(135deg, #1E3A5F 0%, #145A30 100%)',
                borderRadius:'16px', padding:'1.5rem', color:'#FFF',
                display:'flex', alignItems:'center', gap:'1.25rem', marginTop:'0.5rem'
              }}>
                <div style={{fontSize:'2.2rem'}}>🌍</div>
                <div>
                  <h4 style={{margin:'0 0 0.25rem', fontSize:'1.05rem', fontWeight:700}}>
                    {locale === 'ti' ? 'ኣብ መላእ ኔዘርላንድስ' : 'Open to All Community Members'}
                  </h4>
                  <p style={{margin:0, opacity:0.88, fontSize:'0.88rem', lineHeight:'1.5'}}>
                    {locale === 'ti'
                      ? 'ኣብ ዝኾነ ክፍሊ ኔዘርላንድስ ዝነብሩ ኤርትራውያንን ፈተውቲ ማሕበረሰብናን ኣባላት ክኾኑ ይኽእሉ።'
                      : 'Whether you recently moved or have resided in the Netherlands for years, everyone is welcome.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Side: Registration Form */}
            <div className="card shadow-lg animate-slideUp stagger-1" style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.06)',
              borderTop: '5px solid #D4A843',
              overflow: 'hidden',
            }}>
              <div className="card-body" style={{padding:'2.5rem'}}>
                <div style={{marginBottom:'2rem', borderBottom:'2px solid #FDF6E3', pb:'1rem'}}>
                  <h2 style={{fontSize:'1.6rem', color:'#1A1A2E', marginBottom:'0.5rem', fontWeight:700}}>
                    {locale === 'ti' ? 'ናይ ኣባልነት ፎርም' : 'Membership Registration'}
                  </h2>
                  <p style={{color:'#6B7280', fontSize:'0.95rem', margin:0}}>
                    {locale === 'ti'
                      ? 'ሓበሬታኹም ብምምላእ ምስ ማሕበርና ተጸንበሩ።'
                      : 'Fill in your details below to submit your membership application.'}
                  </p>
                </div>

                {status.success ? (
                  <div className="success-message text-center py-10" style={{
                    background: 'linear-gradient(135deg, #E8F5EE 0%, #FDF6E3 100%)',
                    borderRadius: '16px',
                    padding: '2.5rem 1.5rem',
                    border: '1px solid #D4A84350',
                  }}>
                    <div style={{
                      width:'64px', height:'64px', borderRadius:'50%', background:'#D4A843',
                      color:'#FFF', display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'2rem', margin:'0 auto 1rem', boxShadow:'0 6px 16px rgba(212,168,67,0.3)'
                    }}>
                      🎉
                    </div>
                    <h3 style={{color:'#1A1A2E', fontSize:'1.4rem', marginBottom:'0.5rem', fontWeight:700}}>
                      {t('form.successTitle')}
                    </h3>
                    <p style={{color:'#374151', fontSize:'0.95rem', marginBottom:'1.5rem'}}>
                      {locale === 'ti' 
                        ? 'ብዕዉት ተመዝጊብኩም ኣለኹም። ቀልጢፍና ክንራኸበኩም ኢና።' 
                        : 'Your membership application has been received! Our team will contact you shortly.'}
                    </p>
                    <button 
                      className="btn btn-primary"
                      style={{padding:'0.7rem 1.75rem', borderRadius:'8px', background:'#1A6B3C'}}
                      onClick={() => setStatus({ ...status, success: false })}
                    >
                      {t('form.submitAnother')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="form flex-column gap-5">
                    {/* Full Name */}
                    <div className="form-group">
                      <label className="form-label" style={{fontWeight:600, color:'#374151', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <span>👤</span> {t('form.name')} <span style={{color:'#C23B22'}}>*</span>
                      </label>
                      <input 
                        className="form-input"
                        style={{
                          width:'100%', padding:'0.85rem 1rem', borderRadius:'10px',
                          border: errors.name ? '1.5px solid #C23B22' : '1.5px solid #E5E7EB',
                          fontSize:'0.95rem', transition:'all 0.2s ease', outline:'none'
                        }} 
                        placeholder={locale === 'ti' ? 'ምሉእ ሽምኩም ኣእትዉ' : 'First and Last Name'}
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                      />
                      {errors.name && <span style={{color:'#C23B22', fontSize:'0.85rem', marginTop:'0.3rem', display:'block'}}>⚠️ {errors.name}</span>}
                    </div>

                    {/* Email Address */}
                    <div className="form-group">
                      <label className="form-label" style={{fontWeight:600, color:'#374151', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <span>✉️</span> {t('form.email')} <span style={{color:'#C23B22'}}>*</span>
                      </label>
                      <input 
                        className="form-input"
                        style={{
                          width:'100%', padding:'0.85rem 1rem', borderRadius:'10px',
                          border: errors.email ? '1.5px solid #C23B22' : '1.5px solid #E5E7EB',
                          fontSize:'0.95rem', transition:'all 0.2s ease', outline:'none'
                        }} 
                        placeholder={locale === 'ti' ? 'ኢመይል ኣድራሻ' : 'email@example.com'}
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                      />
                      {errors.email && <span style={{color:'#C23B22', fontSize:'0.85rem', marginTop:'0.3rem', display:'block'}}>⚠️ {errors.email}</span>}
                    </div>

                    {/* Phone Number */}
                    <div className="form-group">
                      <label className="form-label" style={{fontWeight:600, color:'#374151', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <span>📞</span> {t('form.phone')} <span style={{color:'#C23B22'}}>*</span>
                      </label>
                      <input 
                        className="form-input"
                        style={{
                          width:'100%', padding:'0.85rem 1rem', borderRadius:'10px',
                          border: errors.phone ? '1.5px solid #C23B22' : '1.5px solid #E5E7EB',
                          fontSize:'0.95rem', transition:'all 0.2s ease', outline:'none'
                        }} 
                        placeholder={locale === 'ti' ? 'ቁጽሪ ስልኪ (+31...)' : '+31 6 12345678'}
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                      />
                      {errors.phone && <span style={{color:'#C23B22', fontSize:'0.85rem', marginTop:'0.3rem', display:'block'}}>⚠️ {errors.phone}</span>}
                    </div>

                    {/* Message / Areas of Interest */}
                    <div className="form-group">
                      <label className="form-label" style={{fontWeight:600, color:'#374151', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <span>📝</span> {locale === 'ti' ? 'ተወሳኺ ሓበሬታ / ድልየታት (እግረ-መንገዲ)' : 'Additional Notes / Interests (Optional)'}
                      </label>
                      <textarea 
                        className="form-textarea"
                        style={{
                          width:'100%', padding:'0.85rem 1rem', borderRadius:'10px',
                          border:'1.5px solid #E5E7EB', fontSize:'0.95rem',
                          transition:'all 0.2s ease', outline:'none', resize:'vertical'
                        }} 
                        placeholder={locale === 'ti' 
                          ? 'ብኸመይ ክትሳተፉ ከምትደልዩ ё ብዛዕባኹም ሓጺር መግለጺ...' 
                          : 'Tell us how you would like to participate or any specific areas of interest...'}
                        name="message" 
                        rows="4" 
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
                      className="btn btn-accent"
                      style={{
                        width:'100%', padding:'0.95rem', fontSize:'1.05rem', fontWeight:700,
                        borderRadius:'10px', background:'linear-gradient(135deg, #D4A843 0%, #B88E30 100%)',
                        color:'#FFFFFF', boxShadow:'0 4px 14px rgba(212,168,67,0.3)', border:'none',
                        cursor: status.loading ? 'not-allowed' : 'pointer',
                        transition:'all 0.3s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'
                      }} 
                      disabled={status.loading}
                    >
                      {status.loading ? (
                        <><span>⌛</span> {t('form.submitting')}</>
                      ) : (
                        <><span>🤝</span> {locale === 'ti' ? 'ኣባልነተይ ኣረጋግጽ' : 'Complete Registration'}</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
