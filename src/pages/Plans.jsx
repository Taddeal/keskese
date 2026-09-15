import React, { useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import plans from '../data/plans.json';

const planColors = ['#1A6B3C', '#1E3A5F', '#D4A843', '#C23B22'];

export default function Plans() {
  const { t, locale } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page plans-page">
      {/* Header */}
      <header className="page-header flex-center py-12 bg-primary text-white">
        <div className="container text-center">
          <span style={{
            display:'inline-block', padding:'0.35rem 1rem', borderRadius:'50px',
            background:'rgba(255,255,255,0.15)', color:'#FDF6E3', fontWeight:600,
            fontSize:'0.85rem', letterSpacing:'0.05em', marginBottom:'0.75rem',
            backdropFilter: 'blur(4px)',
          }}>
            🎯 {locale === 'ti' ? 'ንመጻኢ ዝተነድፉ መደባት' : 'Strategic Roadmap'}
          </span>
          <h1 style={{fontSize:'2.5rem', margin:'0 0 0.5rem'}}>{t('plans.title')}</h1>
          <p style={{maxWidth:'650px', margin:'0 auto', opacity:0.9, fontSize:'1.05rem'}}>
            {t('plans.subtitle')}
          </p>
        </div>
      </header>

      {/* Impact Pillars Summary Bar */}
      <section style={{background:'#FFFFFF', borderBottom:'1px solid #E5E7EB', padding:'2rem 0'}}>
        <div className="container" style={{maxWidth:'1000px'}}>
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',
            gap:'1.5rem', textAlign:'center'
          }}>
            <div style={{padding:'1rem'}}>
              <div style={{fontSize:'2.2rem', fontWeight:800, color:'#1A6B3C', marginBottom:'0.25rem'}}>4</div>
              <div style={{color:'#6B7280', fontSize:'0.9rem', fontWeight:600}}>
                {locale === 'ti' ? 'ስትራተጂካዊ ዓውድታት' : 'Strategic Pillars'}
              </div>
            </div>
            <div style={{padding:'1rem', borderLeft:'1px solid #F0F0F0', borderRight:'1px solid #F0F0F0'}}>
              <div style={{fontSize:'2.2rem', fontWeight:800, color:'#1E3A5F', marginBottom:'0.25rem'}}>NL</div>
              <div style={{color:'#6B7280', fontSize:'0.9rem', fontWeight:600}}>
                {locale === 'ti' ? 'ኣብ መላእ ኔዘርላንድስ' : 'Nationwide Reach'}
              </div>
            </div>
            <div style={{padding:'1rem'}}>
              <div style={{fontSize:'2.2rem', fontWeight:800, color:'#D4A843', marginBottom:'0.25rem'}}>100%</div>
              <div style={{color:'#6B7280', fontSize:'0.9rem', fontWeight:600}}>
                {locale === 'ti' ? 'ብማሕበረሰብ ዝምራሕ' : 'Community Driven'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="section bg-light" style={{padding:'4rem 0'}}>
        <div className="container" style={{maxWidth:'1100px'}}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))',
            gap:'2rem'
          }}>
            {plans.map((plan, idx) => {
              const color = planColors[idx % planColors.length];
              let title = plan.title_en;
              if (locale === 'ti' && plan.title_ti) title = plan.title_ti;
              if (locale === 'nl' && plan.title_nl) title = plan.title_nl;

              let description = plan.description_en;
              if (locale === 'ti' && plan.description_ti) description = plan.description_ti;
              if (locale === 'nl' && plan.description_nl) description = plan.description_nl;

              return (
                <div 
                  key={plan.id || idx} 
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
                    justifyContent: 'space-between',
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
                    {/* Header icon and pill */}
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem'}}>
                      <div style={{
                        width:'56px', height:'56px', borderRadius:'16px',
                        background:`linear-gradient(135deg, ${color}15, ${color}30)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1.8rem', border:`1px solid ${color}30`
                      }}>
                        {plan.icon}
                      </div>
                      <span style={{
                        background: `${color}15`, color: color,
                        padding: '0.3rem 0.8rem', borderRadius: '50px',
                        fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em'
                      }}>
                        {locale === 'ti' ? `ዓውዲ ${idx + 1}` : (locale === 'nl' ? `Pijler ${idx + 1}` : `Pillar ${idx + 1}`)}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h2 style={{fontSize:'1.5rem', color:'#1A1A2E', marginBottom:'0.75rem', fontWeight:700}}>
                      {title}
                    </h2>
                    <p style={{color:'#6B7280', fontSize:'0.95rem', lineHeight:'1.7', marginBottom:'1.5rem'}}>
                      {description}
                    </p>

                    {/* Checkmark Action Items */}
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
                        {locale === 'ti' ? 'ቀንድ ንጥፈታት' : (locale === 'nl' ? 'Belangrijkste acties' : 'Key Action Initiatives')}
                      </h4>
                      <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.6rem'}}>
                        {plan.items?.map((item, i) => {
                          let itemText = item.en;
                          if (locale === 'ti' && item.ti) itemText = item.ti;
                          if (locale === 'nl' && item.nl) itemText = item.nl;
                          return (
                            <li key={i} style={{
                              display:'flex', alignItems:'flex-start', gap:'0.6rem',
                              fontSize:'0.9rem', color:'#4B5563', lineHeight:'1.5'
                            }}>
                              <span style={{
                                color: color, fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3
                              }}>✓</span>
                              <span>{itemText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom link CTA */}
                  <a 
                    href="/membership" 
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.75rem', borderRadius: '10px',
                      background: `${color}10`, color: color, fontWeight: 700,
                      fontSize: '0.9rem', textDecoration: 'none', transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${color}25`}
                    onMouseLeave={e => e.currentTarget.style.background = `${color}10`}
                  >
                    {locale === 'ti' ? 'ተሳተፉ' : (locale === 'nl' ? 'Doe mee' : 'Get Involved')} →
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Engagement Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #1A6B3C 0%, #1E3A5F 100%)',
        padding: '3.5rem 0', color: '#FFF', textAlign: 'center'
      }}>
        <div className="container" style={{maxWidth:'650px'}}>
          <h2 style={{fontSize:'1.8rem', marginBottom:'0.75rem', fontWeight:700}}>
            {locale === 'ti' ? 'ኣብ መደባትና ተሳተፉ' : 'Help Shape Our Future Plans'}
          </h2>
          <p style={{opacity:0.9, fontSize:'1.05rem', marginBottom:'2rem', lineHeight:'1.6'}}>
            {locale === 'ti'
              ? 'ሓሳባትኩምን ክእለትኩምን ንማሕበረሰብና ሓያል መጻኢ ኣብ ምህናጽ ዓብዪ ተራ ኣለዎ።'
              : 'Your ideas, skills, and active involvement drive our association forward. Join us in executing these initiatives.'}
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
            {locale === 'ti' ? 'ሓሳብ ኣቕርቡ' : 'Share Your Ideas'} →
          </a>
        </div>
      </section>
    </div>
  );
}
