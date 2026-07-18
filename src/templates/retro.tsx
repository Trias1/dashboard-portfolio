'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }} className={className}>
      {children}
    </motion.div>
  );
}

function RetroCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className={`border-2 rounded-[4px] ${className}`}
      style={{ borderColor: 'rgba(255,200,100,0.2)', backgroundColor: 'rgba(255,200,100,0.04)' }}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, ac }: { title: string; subtitle?: string; ac: string }) {
  return (
    <div className="text-center mb-14">
      <motion.span className="text-xs uppercase tracking-[0.35em] font-mono" style={{ color: `${ac}80` }}>{subtitle}</motion.span>
      <motion.h2 className="text-3xl sm:text-4xl font-bold mt-2 uppercase tracking-wide" style={{ color: '#f0e8d8' }}>{title}</motion.h2>
      <motion.div className="mx-auto mt-4 w-24 h-[2px]" style={{ backgroundColor: ac }} />
    </div>
  );
}

const textColor = '#f0e8d8';
const subColor = '#a09078';

export default function RetroTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="relative min-h-screen overflow-x-hidden font-mono" style={{ backgroundColor: '#1a150e', backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,200,100,0.03) 1px, transparent 0)', backgroundSize: '30px 30px' }}>
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px)' }} />

      {/* Navbar */}
      <motion.nav initial={{ y: -60 }} animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 border-b-2" style={{ borderColor: 'rgba(255,200,100,0.15)', backgroundColor: '#1a150e' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm uppercase tracking-widest" style={{ color: textColor }}>{about?.name || portfolio.title}</span>
          <div className="flex gap-4">
            {['about', 'projects', 'contact'].map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ color: ac }}
                className="text-xs uppercase tracking-widest font-bold" style={{ color: subColor }}>
                {s}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10" style={{ paddingTop: '4rem' }}>
        {/* Hero */}
        <section id="hero" className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ac}08 0%, transparent 60%)` }} />
          <motion.div className="absolute top-16 left-8 text-6xl opacity-5 select-none" style={{ color: ac }}>{'{ }'}</motion.div>
          <motion.div className="absolute bottom-20 right-12 text-5xl opacity-5 select-none" style={{ color: ac }}>{'</>'}</motion.div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-xs uppercase tracking-[0.5em] mb-4 font-bold" style={{ color: `${ac}80` }}>
              {hero?.greeting || 'Hello World'}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-5xl sm:text-7xl md:text-8xl font-bold leading-none mb-4 uppercase tracking-tight" style={{ color: textColor }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.div className="w-32 h-[2px] mx-auto mb-6" style={{ backgroundColor: ac }} />
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl font-light mb-10 uppercase tracking-wider" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ backgroundColor: ac, color: '#1a150e' }}
                className="px-8 py-3.5 border-2 text-sm font-bold uppercase tracking-wider transition-colors"
                style={{ borderColor: ac, color: ac }}>
                {hero?.cta_text || 'View Work'}
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank" whileHover={{ backgroundColor: ac, color: '#1a150e' }}
                  className="px-8 py-3.5 border-2 text-sm font-bold uppercase tracking-wider transition-colors"
                  style={{ borderColor: subColor, color: subColor }}>
                  Resume
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ backgroundColor: ac, color: '#1a150e' }}
                  className="px-8 py-3.5 border-2 text-sm font-bold uppercase tracking-wider transition-colors"
                  style={{ borderColor: subColor, color: subColor }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-20 md:py-28 px-4 border-t-2" style={{ borderColor: 'rgba(255,200,100,0.08)' }}>
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="About" subtitle="Who I Am" ac={ac} />
              <Section>
                <RetroCard className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    {about.photo_url && (
                      <div className="border-2 p-1 rounded-full shrink-0" style={{ borderColor: `${ac}40` }}>
                        <img src={about.photo_url} alt={about.name} className="w-44 h-44 rounded-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-4 flex-1">
                      <p className="text-xs uppercase tracking-widest font-bold" style={{ color: ac }}>// profile</p>
                      <h3 className="text-2xl font-bold uppercase tracking-wide" style={{ color: textColor }}>{about.name}</h3>
                      <p className="text-sm font-bold uppercase tracking-wider" style={{ color: ac }}>{about.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: subColor }}>{about.bio}</p>
                    </div>
                  </div>
                </RetroCard>
              </Section>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Skills" subtitle="Expertise" ac={ac} />
              <div className="space-y-8">
                {skills.map((skill: any) => (
                  <Section key={skill.id}>
                    <RetroCard className="p-6 md:p-8">
                      {skill.title && <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: textColor }}>{skill.title}</h3>}
                      <div className="flex flex-wrap gap-2">
                        {skill.skills?.split(',').map((s: string) => (
                          <span key={s} className="text-xs font-bold px-3 py-1.5 border-2 uppercase tracking-wider"
                            style={{ borderColor: `${ac}40`, color: ac }}>
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </RetroCard>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-20 md:py-28 px-4 border-t-2" style={{ borderColor: 'rgba(255,200,100,0.08)' }}>
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Experience" subtitle="Timeline" ac={ac} />
              <div className="space-y-6">
                {experience.map((exp: any, i: number) => (
                  <Section key={exp.id}>
                    <RetroCard className="p-6 md:p-8">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-xs font-bold px-3 py-1 uppercase tracking-wider" style={{ backgroundColor: `${ac}15`, color: ac }}>
                          {exp.start_date?.slice(0, 4)}  -  {exp.end_date?.slice(0, 4) || 'Now'}
                        </span>
                        <span className="text-xs uppercase tracking-wider font-bold" style={{ color: ac }}>[{exp.company}]</span>
                      </div>
                      <h3 className="text-lg font-bold uppercase tracking-wide mb-3" style={{ color: textColor }}>{exp.position}</h3>
                      {exp.description && (
                        <div className="text-sm space-y-1.5" style={{ color: subColor }}>
                          {exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (
                            <div key={si} className="flex gap-2">
                              <span style={{ color: ac }}> to </span>
                              <span>{s.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </RetroCard>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="projects" className="py-20 md:py-28 px-4">
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="Projects" subtitle="Selected Work" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj: any) => (
                  <Section key={proj.id}>
                    <RetroCard className="overflow-hidden">
                      {proj.image_url && (
                        <div className="border-b-2" style={{ borderColor: 'rgba(255,200,100,0.15)' }}>
                          <img src={proj.image_url} alt={proj.title} className="w-full h-40 object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold uppercase tracking-wide mb-2" style={{ color: textColor }}>{proj.title}</h3>
                        <p className="text-xs mb-4 leading-relaxed" style={{ color: subColor }}>{proj.description}</p>
                        {proj.tech_stack && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {proj.tech_stack.split(',').map((t: string) => (
                              <TechBadge key={t} name={t.trim()} accentColor={ac} />
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {proj.demo_url && (
                            <motion.a href={proj.demo_url} target="_blank" whileHover={{ backgroundColor: ac, color: '#1a150e' }}
                              className="text-xs font-bold px-4 py-2 border-2 uppercase tracking-wider transition-colors"
                              style={{ borderColor: ac, color: ac }}>
                              Live
                            </motion.a>
                          )}
                          {proj.github_url && (
                            <motion.a href={proj.github_url} target="_blank" whileHover={{ borderColor: ac, color: ac }}
                              className="text-xs font-bold px-4 py-2 border-2 uppercase tracking-wider transition-colors"
                              style={{ borderColor: subColor, color: subColor }}>
                              Code
                            </motion.a>
                          )}
                        </div>
                      </div>
                    </RetroCard>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <section id="services" className="py-20 md:py-28 px-4 border-t-2" style={{ borderColor: 'rgba(255,200,100,0.08)' }}>
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Services" subtitle="What I Offer" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc: any) => (
                  <Section key={svc.id}>
                    <RetroCard className="p-8 text-center">
                      <div className="text-4xl mb-5 font-bold" style={{ color: ac }}>{svc.icon || '✦'}</div>
                      <h3 className="font-bold uppercase tracking-wide mb-2" style={{ color: textColor }}>{svc.title}</h3>
                      <p className="text-xs" style={{ color: subColor }}>{svc.description}</p>
                    </RetroCard>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <section id="testimonials" className="py-20 md:py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Testimonials" subtitle="Feedback" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t: any) => (
                  <Section key={t.id}>
                    <RetroCard className="p-6">
                      <p className="text-3xl leading-none mb-2 font-bold" style={{ color: `${ac}30` }}>&ldquo;</p>
                      <p className="text-sm italic mb-4 leading-relaxed" style={{ color: subColor }}>{t.message}</p>
                      <div className="flex items-center gap-3">
                        {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 object-cover border-2" style={{ borderColor: `${ac}30` }} />}
                        <div>
                          <p className="font-bold text-xs uppercase tracking-wider" style={{ color: textColor }}>{t.name}</p>
                          <p className="text-xs uppercase tracking-wider" style={{ color: ac }}>{t.position}</p>
                        </div>
                      </div>
                    </RetroCard>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certificates */}
        {gallery?.length > 0 && (
          <section id="gallery" className="py-20 md:py-28 px-4 border-t-2" style={{ borderColor: 'rgba(255,200,100,0.08)' }}>
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="Certificates" subtitle="Credentials" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((cert: any) => (
                  <Section key={cert.id}>
                    <RetroCard className="p-5">
                      {(cert.image_url || cert.file_url) && (
                        <div className="w-full h-32 mb-4 overflow-hidden bg-cover bg-center border-2"
                          style={{ backgroundImage: `url(${cert.image_url || cert.file_url})`, borderColor: `${ac}20` }}>
                          <img src={cert.image_url || cert.file_url} alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.style.display = 'none' }} />
                        </div>
                      )}
                      <h3 className="font-bold text-sm uppercase tracking-wide mb-1" style={{ color: textColor }}>{cert.title}</h3>
                      {cert.description && <p className="text-xs mb-2" style={{ color: subColor }}>{cert.description}</p>}
                      {cert.issued_date && <p className="text-xs mb-3 uppercase tracking-wider" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                      {cert.file_url && (
                        <motion.a href={cert.file_url} target="_blank" whileHover={{ backgroundColor: ac, color: '#1a150e' }}
                          className="inline-block text-xs font-bold px-4 py-2 border-2 uppercase tracking-wider transition-colors"
                          style={{ borderColor: ac, color: ac }}>
                          View
                        </motion.a>
                      )}
                    </RetroCard>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {custom?.length > 0 && custom.map((sec: any) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title={sec.title} ac={ac} />
              {sec.type === 'text' && <Section><RetroCard className="p-8"><p className="text-sm leading-relaxed text-center" style={{ color: subColor }}>{sec.content?.body}</p></RetroCard></Section>}
              {sec.type === 'list' && (
                <ul className="space-y-3 max-w-2xl mx-auto">
                  {(sec.content?.items || []).map((item: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} className="flex items-start gap-3 text-sm" style={{ color: subColor }}>
                      <span style={{ color: ac }}> to </span>{item}
                    </motion.li>
                  ))}
                </ul>
              )}
              {sec.type === 'links' && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {(sec.content?.links || []).map((link: any, i: number) => (
                    <motion.a key={i} href={link.url} target="_blank" whileHover={{ backgroundColor: ac, color: '#1a150e' }}
                      className="px-8 py-3.5 border-2 text-sm font-bold uppercase tracking-wider transition-colors"
                      style={{ borderColor: ac, color: ac }}>
                      {link.label}
                    </motion.a>
                  ))}
                </div>
              )}
              {!['text','list','cards','links'].includes(sec.type) && sec.content && (
                <div className="space-y-4">
                  {(() => {
                    if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(sec.content?.items)) {
                      return <CertificationSection items={sec.content?.items} textColor={textColor} subTextColor={subColor} accentColor={ac} cardBg="" />;
                    }
                    const c = sec.content;
                    if (c.institution || c.degree || c.field) {
                      return (
                        <div className="p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          {c.institution && <p className="text-lg font-semibold" style={{color: textColor}}>{c.institution}</p>}
                          {(c.degree || c.field) && <p className="text-sm mt-1" style={{color: subColor}}>{[c.degree, c.field].filter(Boolean).join('  -  ')}</p>}
                          {(c.start_date || c.end_date) && <p className="text-xs mt-1" style={{color: subColor}}>{[c.start_date?.slice(0,7), c.end_date?.slice(0,7)].filter(Boolean).join(' - ')}</p>}
                          {c.gpa && <p className="text-xs mt-1" style={{color: subColor}}>GPA: {c.gpa}</p>}
                        </div>
                      );
                    }
                    if (c.name || c.issuer) {
                      return (
                        <div className="p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          {c.name && <p className="text-lg font-semibold" style={{color: textColor}}>{c.name}</p>}
                          {c.issuer && <p className="text-sm mt-1" style={{color: subColor}}>{c.issuer}</p>}
                          {c.date && <p className="text-xs mt-1" style={{color: subColor}}>{c.date}</p>}
                          {c.credential_url && <a href={c.credential_url} target="_blank" className="text-sm underline mt-2 inline-block" style={{color: ac}}>View credential</a>}
                        </div>
                      );
                    }
                    if (c.language) {
                      return (
                        <div className="flex items-center gap-3 p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          <p className="text-lg font-semibold" style={{color: textColor}}>{c.language}</p>
                          {c.proficiency && <span className="text-xs px-3 py-1 rounded-full" style={{backgroundColor: ac+'30', color: ac}}>{c.proficiency}</span>}
                        </div>
                      );
                    }
                    if (c.body) {
                      return <p className="text-base leading-relaxed" style={{color: subColor}}>{c.body}</p>;
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Contact */}
        <section id="contact" className="py-20 md:py-28 px-4 border-t-2" style={{ borderColor: 'rgba(255,200,100,0.08)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <SectionTitle title="Contact" subtitle="Get In Touch" ac={ac} />
            <p className="text-sm uppercase tracking-wider mb-8" style={{ color: subColor }}>Let's work together.</p>
            <div className="flex gap-4 justify-center flex-wrap mb-10">
              {(contact?.email || about?.email) && (
                <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ backgroundColor: ac, color: '#1a150e' }}
                  className="px-8 py-3.5 border-2 text-sm font-bold uppercase tracking-wider transition-colors"
                  style={{ borderColor: ac, color: ac }}>
                  Email
                </motion.a>
              )}
              {contact?.phone && (
                <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ backgroundColor: '#25D366', color: '#1a150e', borderColor: '#25D366' }}
                  className="px-8 py-3.5 border-2 text-sm font-bold uppercase tracking-wider transition-colors"
                    style={{ borderColor: '#25D36680', color: '#25D366' }}>
                    WhatsApp
                  </motion.a>
                )}
                {contact?.linkedin_url && (
                  <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ backgroundColor: '#0077B5', color: '#1a150e', borderColor: '#0077B5' }}
                    className="px-8 py-3.5 border-2 text-sm font-bold uppercase tracking-wider transition-colors"
                    style={{ borderColor: '#0077B580', color: '#0077B5' }}>
                    LinkedIn
                  </motion.a>
                )}
                {contact?.github_url && (
                  <motion.a href={contact.github_url} target="_blank" whileHover={{ backgroundColor: '#333', color: '#1a150e', borderColor: '#333' }}
                    className="px-8 py-3.5 border-2 text-sm font-bold uppercase tracking-wider transition-colors"
                    style={{ borderColor: '#33333380', color: '#333' }}>
                    GitHub
                  </motion.a>
                )}
              </div>
            <RetroCard className="p-6">
              <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
            </RetroCard>
          </div>
        </section>
      </div>

      <footer className="relative z-10 py-8 text-center border-t-2" style={{ borderColor: 'rgba(255,200,100,0.1)' }}>
        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title}</p>
        <p className="text-xs uppercase tracking-widest mt-1" style={{ color: `${ac}60` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}

