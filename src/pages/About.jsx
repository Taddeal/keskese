import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';

const values = [
  { key: 'integrity', icon: '🛡️', color: '#1A6B3C' },
  { key: 'transparency', icon: '🔍', color: '#1E3A5F' },
  { key: 'accountability', icon: '⚖️', color: '#D4A843' },
  { key: 'responsibility', icon: '🤝', color: '#C23B22' },
];

const valueDescriptions = {
  en: {
    integrity: 'We uphold the highest standards of honesty and moral principles in all our actions and decisions.',
    transparency: 'We operate openly and share information freely, ensuring trust within our community.',
    accountability: 'We take ownership of our commitments and are answerable to our members and community.',
    responsibility: 'We act with care and diligence, recognizing our duty to serve and protect our community.',
  },
  ti: {
    integrity: 'ኣብ ኩሉ ተግባራትናን ውሳነታትናን ልዑል ደረጃ ቅንዕናን ስነ-ምግባራዊ መትከላትን ንሕሉ።',
    transparency: 'ብግልጽነት ንሰርሕ ሓበሬታ ብነጻ ንካፈል፣ ኣብ ማሕበረሰብና ምትእምማን ንረጋግጽ።',
    accountability: 'ንቃላትና ሓላፍነት ንወስድ ንኣባላትናን ማሕበረሰብናን ተሓታትነት ኣለና።',
    responsibility: 'ንማሕበረሰብና ናይ ምግልጋልን ምሕላውን ግቡኣትና ብምእንቃቕ ብጥንቃቐን ብህርፋንን ንሰርሕ።',
  },
  nl: {
    integrity: 'Wij hanteren de hoogste normen van eerlijkheid en morele principes in al onze acties en besluiten.',
    transparency: 'Wij werken openlijk en delen informatie vrijelijk, wat zorgt voor vertrouwen binnen onze gemeenschap.',
    accountability: 'Wij nemen verantwoordelijkheid voor onze toezeggingen en leggen verantwoording af aan onze leden en gemeenschap.',
    responsibility: 'Wij handelen met zorg en toewijding, bewust van onze plicht om onze gemeenschap te dienen en te beschermen.',
  }
};

export default function About() {
  const { t, locale } = useTranslation();
  const sectionRefs = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div className="page about-page">
      {/* Page Header */}
      <header className="page-header">
        <div className="container text-center">
          <h1>{t('about.title')}</h1>
          <p style={{maxWidth:'600px', margin:'0 auto'}}>{t('home.heroSubtitle')}</p>
        </div>
      </header>

      {/* Introduction Section */}
      <section className="section">
        <div className="container" style={{maxWidth:'900px'}}>
          <div
            ref={addRef}
            className="about-intro-card reveal-section"
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '3rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              borderLeft: '5px solid #1A6B3C',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '200px', height: '200px',
              background: 'linear-gradient(135deg, rgba(26,107,60,0.06) 0%, transparent 70%)',
              borderRadius: '0 16px 0 200px',
            }} />
            <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem'}}>
              <div style={{
                width:'48px', height:'48px', borderRadius:'12px',
                background:'linear-gradient(135deg, #1A6B3C, #145A30)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.5rem', flexShrink:0,
              }}>🏛️</div>
              <h2 style={{margin:0, color:'#1A6B3C', fontSize:'1.75rem'}}>{t('about.introTitle')}</h2>
            </div>
            <p style={{fontSize:'1.1rem', lineHeight:'1.8', color:'#374151', margin:0}}>
              {t('about.introText')}
            </p>
          </div>
        </div>
      </section>

      {/* Heritage & Mission Section */}
      <section className="section" style={{background:'#F0F7F2', paddingTop:'2rem', paddingBottom:'3rem'}}>
        <div className="container" style={{maxWidth:'900px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem'}}>
            {/* Heritage Card */}
            <div
              ref={addRef}
              className="reveal-section"
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '2.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                borderTop: '4px solid #D4A843',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
            >
              <div style={{fontSize:'2.5rem', marginBottom:'1rem'}}>🏺</div>
              <h2 style={{color:'#D4A843', fontSize:'1.5rem', marginBottom:'1rem'}}>{t('about.heritageTitle')}</h2>
              <p style={{color:'#4B5563', lineHeight:'1.75', margin:0}}>{t('about.heritageText')}</p>
            </div>

            {/* Mission Card */}
            <div
              ref={addRef}
              className="reveal-section"
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '2.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                borderTop: '4px solid #1E3A5F',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
            >
              <div style={{fontSize:'2.5rem', marginBottom:'1rem'}}>🎯</div>
              <h2 style={{color:'#1E3A5F', fontSize:'1.5rem', marginBottom:'1rem'}}>{t('about.missionVisionTitle')}</h2>
              <p style={{color:'#4B5563', lineHeight:'1.75', margin:0}}>{t('about.missionVisionText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="section" style={{paddingTop:'3rem', paddingBottom:'4rem'}}>
        <div className="container" style={{maxWidth:'1000px'}}>
          <div ref={addRef} className="reveal-section text-center" style={{marginBottom:'3rem'}}>
            <span style={{
              display:'inline-block', padding:'0.4rem 1.2rem', borderRadius:'50px',
              background:'linear-gradient(135deg, #E8F5EE, #EBF0F7)',
              color:'#1A6B3C', fontWeight:600, fontSize:'0.85rem', letterSpacing:'0.05em',
              textTransform:'uppercase', marginBottom:'1rem',
            }}>
              {locale === 'ti' ? 'መትከላትና' : (locale === 'nl' ? 'Waar wij voor staan' : 'What We Stand For')}
            </span>
            <h2 style={{fontSize:'2.25rem', color:'#1A1A2E', marginBottom:'0.75rem'}}>{t('about.valuesTitle')}</h2>
            <p style={{color:'#6B7280', maxWidth:'500px', margin:'0 auto', fontSize:'1.05rem'}}>
              {locale === 'ti'
                ? 'ኣብ ኩሉ ስራሕና ዝመርሑና መሰረታውያን መትከላት'
                : (locale === 'nl'
                  ? 'De fundamentele principes die al onze activiteiten leiden'
                  : 'The foundational principles that guide everything we do')}
            </p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.5rem'}}>
            {values.map((value, i) => (
              <div
                key={value.key}
                ref={addRef}
                className="reveal-section"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  borderBottom: `4px solid ${value.color}`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  transitionDelay: `${i * 80}ms`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
              >
                <div style={{
                  width:'64px', height:'64px', borderRadius:'50%',
                  background:`linear-gradient(135deg, ${value.color}15, ${value.color}25)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.75rem', margin:'0 auto 1.25rem',
                  border:`2px solid ${value.color}30`,
                }}>
                  {value.icon}
                </div>
                <h3 style={{color: value.color, fontSize:'1.15rem', marginBottom:'0.75rem', fontWeight:700}}>
                  {t(`about.values.${value.key}`)}
                </h3>
                <p style={{color:'#6B7280', fontSize:'0.9rem', lineHeight:'1.65', margin:0}}>
                  {valueDescriptions[locale]?.[value.key] || valueDescriptions.en[value.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        background:'linear-gradient(135deg, #1E3A5F 0%, #1A6B3C 100%)',
        padding:'3.5rem 0',
        textAlign:'center',
        color:'#FFFFFF',
      }}>
        <div className="container" style={{maxWidth:'600px'}}>
          <h2 style={{fontSize:'1.75rem', marginBottom:'1rem'}}>
            {locale === 'ti' ? 'ተጸንብሩና' : (locale === 'nl' ? 'Word onderdeel van ons verhaal' : 'Be Part of Our Story')}
          </h2>
          <p style={{opacity:0.85, marginBottom:'2rem', fontSize:'1.05rem'}}>
            {locale === 'ti'
              ? 'ኣብዚ ማሕበረሰብ ተጸንቢርኩም ለውጢ ንምምጻእ ሓግዙ።'
              : (locale === 'nl'
                ? 'Sluit je aan bij onze groeiende gemeenschap en help ons ons erfgoed te behouden en samen aan een betere toekomst te bouwen.'
                : 'Join our growing community and help us preserve our heritage and build a brighter future together.')}
          </p>
          <a href="/membership" className="btn" style={{
            background:'#D4A843', color:'#FFFFFF', padding:'0.85rem 2.5rem',
            fontSize:'1.05rem', fontWeight:600, borderRadius:'8px',
            border:'none', textDecoration:'none',
          }}>
            {t('home.joinUs')} →
          </a>
        </div>
      </section>
    </div>
  );
}
