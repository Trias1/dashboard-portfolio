'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function BounceSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }} className={className}>
      {children}
    </motion.div>
  );
}

function ColorCard({ children, ac, className }: { children: React.ReactNode; ac: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30, rotateX: 5 }} animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.5, type: 'spring' }} whileHover={{ y: -8, rotate: -1 }}
      className={`rounded-3xl border-2 p-6 ${className}`}
      style={{ borderColor: `${ac}30`, backgroundColor: `${ac}08` }}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, ac }: { title: string; subtitle?: string; ac: string }) {
  return (
    <div className="text-center mb-14">
      <motion.span className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: ac }}>{subtitle}</motion.span>
      <motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: '#f0f0f5' }}>{title}</motion.h2>
      <motion.div className="mx-auto mt-4 flex gap-1.5 justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: ac }}
            animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </motion.div>
    </div>
  );
}

const textColor = '#f0f0f5';
const subColor = '#b0b0c8';

export default function VibrantTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0f0a1a, #1a0f2a, #0f1a2a, #0f0a1a)' }}>
      {/* Colorful floating shapes */}
      <motion.div className="fixed top-20 left-10 w-20 h-20 rounded-2xl pointer-events-none z-0" style={{ backgroundColor: `${ac}20` }}
        animate={{ rotate: 360, x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="fixed bottom-40 right-20 w-16 h-16 rounded-full pointer-events-none z-0" style={{ backgroundColor: `${ac}15` }}
        animate={{ rotate: -360, x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="fixed top-1/3 right-10 w-12 h-12 rotate-45 pointer-events-none z-0" style={{ backgroundColor: `${ac}10` }}
        animate={{ rotate: [45, 405], scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }} />

      {/* Navbar */}
      <motion.nav initial={{ y: -60 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 200 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl border-b-2" style={{ borderColor: `${ac}30`, backgroundColor: '#0f0a1acc' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.span className="font-black text-lg" style={{ color: textColor }} whileHover={{ scale: 1.05, color: ac }}>
            {about?.name || portfolio.title}
          </motion.span>
          <div className="flex gap-2">
            {['about', 'projects', 'skills', 'contact'].map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ scale: 1.1, backgroundColor: `${ac}20` }}
                className="px-4 py-2 text-sm font-bold capitalize rounded-2xl transition-colors" style={{ color: subColor }}>
                {s}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10" style={{ paddingTop: '4.5rem' }}>
        {/* Hero */}
        <section id="hero" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <motion.div className="absolute inset-0 opacity-10"
            animate={{ background: [`radial-gradient(ellipse at 30% 50%, ${ac}, transparent 60%)`, `radial-gradient(ellipse at 70% 50%, ${ac}, transparent 60%)`, `radial-gradient(ellipse at 30% 50%, ${ac}, transparent 60%)`] }}
            transition={{ duration: 6, repeat: Infinity }} />
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {hero?.greeting && (
              <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                className="inline-block px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-white"
                style={{ backgroundColor: ac }}>
                {hero.greeting}
              </motion.span>
            )}
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring' }}
              className="text-6xl sm:text-8xl md:text-9xl font-black leading-none mb-6" style={{ color: textColor }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-medium mb-10" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.08, rotate: -2 }}
                className="px-10 py-4 rounded-2xl font-bold text-white text-lg" style={{ backgroundColor: ac }}>
                {hero?.cta_text || 'See My Work'}
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.08, rotate: 2 }}
                  className="px-10 py-4 rounded-2xl font-bold text-lg border-2" style={{ borderColor: ac, color: ac }}>
                  Download CV
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.08, rotate: 2 }}
                  className="px-10 py-4 rounded-2xl font-bold text-lg border-2" style={{ borderColor: ac, color: ac }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
          <motion.div className="absolute bottom-8" animate={{ y: [0, 15, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div className="text-3xl" style={{ color: ac }}></div>
          </motion.div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="About Me" subtitle="Who I Am" ac={ac} />
              <BounceSection>
                <ColorCard ac={ac} className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    {about.photo_url && (
                      <motion.div whileHover={{ scale: 1.05, rotate: 3 }} transition={{ type: 'spring' }}>
                        <div className="rounded-3xl overflow-hidden border-4" style={{ borderColor: `${ac}50` }}>
                          <img src={about.photo_url} alt={about.name} className="w-48 h-48 object-cover" />
                        </div>
                      </motion.div>
                    )}
                    <div className="space-y-4 flex-1">
                      <motion.h3 className="text-3xl font-black" style={{ color: textColor }} whileHover={{ x: 5 }}>{about.name}</motion.h3>
                      <p className="text-lg font-bold" style={{ color: ac }}>{about.title}</p>
                      <p className="text-base leading-relaxed" style={{ color: subColor }}>{about.bio}</p>
                    </div>
                  </div>
                </ColorCard>
              </BounceSection>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="My Toolkit" subtitle="Skills" ac={ac} />
              <div className="space-y-8">
                {skills.map((skill: any) => (
                  <BounceSection key={skill.id}>
                    <ColorCard ac={ac} className="p-8">
                      {skill.title && <h3 className="text-xl font-black mb-5" style={{ color: textColor }}>{skill.title}</h3>}
                      <div className="flex flex-wrap gap-3">
                        {skill.skills?.split(',').map((s: string) => (
                          <motion.div key={s} whileHover={{ scale: 1.15, rotate: -3 }}>
                            <TechBadge name={s.trim()} accentColor={ac} size="md" variant="filled" />
                          </motion.div>
                        ))}
                      </div>
                    </ColorCard>
                  </BounceSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-20 md:py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Experience" subtitle="My Journey" ac={ac} />
              <div className="space-y-6">
                {experience.map((exp: any, i: number) => (
                  <BounceSection key={exp.id}>
                    <motion.div className="rounded-3xl border-2 p-6 md:p-8" style={{ borderColor: `${ac}30`, backgroundColor: `${ac}06` }}
                      whileHover={{ x: i % 2 === 0 ? 8 : -8 }}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="text-xl font-black" style={{ color: textColor }}>{exp.position}</h3>
                        <motion.span className="text-xs font-bold px-4 py-1.5 rounded-full text-white" style={{ backgroundColor: ac }}
                          whileHover={{ scale: 1.1 }}>
                          {exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}
                        </motion.span>
                      </div>
                      <p className="text-base font-bold mb-3" style={{ color: ac }}>{exp.company}</p>
                      {exp.description && (
                        <div className="text-sm space-y-1.5" style={{ color: subColor }}>
                          {exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (
                            <div key={si} className="flex gap-2">
                              <motion.span className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: ac }}
                                animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: si * 0.2 }} />
                              <span>{s.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </BounceSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="projects" className="py-20 md:py-28 px-4">
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="Projects" subtitle="Featured Work" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj: any, i: number) => (
                  <BounceSection key={proj.id}>
                    <ColorCard ac={ac} className={`overflow-hidden ${i % 2 === 0 ? 'rotate-0' : ''}`}>
                      {proj.image_url && (
                        <div className="overflow-hidden rounded-2xl mb-4">
                          <motion.img src={proj.image_url} alt={proj.title} className="w-full h-44 object-cover"
                            whileHover={{ scale: 1.15 }} transition={{ duration: 0.4 }} />
                        </div>
                      )}
                      <h3 className="text-xl font-black mb-2" style={{ color: textColor }}>{proj.title}</h3>
                      <p className="text-sm mb-4 leading-relaxed" style={{ color: subColor }}>{proj.description}</p>
                      {proj.tech_stack && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {proj.tech_stack.split(',').map((t: string) => (
                            <TechBadge key={t} name={t.trim()} accentColor={ac} />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {proj.demo_url && (
                          <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.1, rotate: -3 }}
                            className="text-xs font-bold px-4 py-2 rounded-2xl text-white" style={{ backgroundColor: ac }}>
                            Demo
                          </motion.a>
                        )}
                        {proj.github_url && (
                          <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.1, rotate: 3 }}
                            className="text-xs font-bold px-4 py-2 rounded-2xl border-2" style={{ borderColor: ac, color: ac }}>
                            Code
                          </motion.a>
                        )}
                      </div>
                    </ColorCard>
                  </BounceSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <section id="services" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Services" subtitle="What I Do" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc: any) => (
                  <BounceSection key={svc.id}>
                    <ColorCard ac={ac} className="p-8 text-center">
                      <motion.div className="text-5xl mb-5" whileHover={{ scale: 1.2, rotate: 10 }}>{svc.icon || '✦'}</motion.div>
                      <h3 className="text-xl font-black mb-2" style={{ color: textColor }}>{svc.title}</h3>
                      <p className="text-sm" style={{ color: subColor }}>{svc.description}</p>
                    </ColorCard>
                  </BounceSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <section id="testimonials" className="py-20 md:py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Testimonials" subtitle="Kind Words" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t: any) => (
                  <BounceSection key={t.id}>
                    <ColorCard ac={ac} className="p-6">
                      <p className="text-5xl leading-none mb-3 font-black" style={{ color: `${ac}40` }}>"</p>
                      <p className="text-sm italic mb-4 leading-relaxed" style={{ color: subColor }}>{t.message}</p>
                      <div className="flex items-center gap-3">
                        {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-2xl object-cover" />}
                        <div>
                          <p className="font-bold text-sm" style={{ color: textColor }}>{t.name}</p>
                          <p className="text-xs font-bold" style={{ color: ac }}>{t.position}</p>
                        </div>
                      </div>
                    </ColorCard>
                  </BounceSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certificates */}
        {gallery?.length > 0 && (
          <section id="gallery" className="py-20 md:py-28 px-4">
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="Certificates" subtitle="Credentials" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((cert: any) => (
                  <BounceSection key={cert.id}>
                    <ColorCard ac={ac} className="p-5">
                      {(cert.image_url || cert.file_url) && (
                        <div className="w-full h-32 rounded-2xl mb-4 overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                          <img src={cert.image_url || cert.file_url} alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.style.display = 'none' }} />
                        </div>
                      )}
                      <h3 className="font-black text-base mb-1" style={{ color: textColor }}>{cert.title}</h3>
                      {cert.description && <p className="text-sm mb-2" style={{ color: subColor }}>{cert.description}</p>}
                      {cert.issued_date && <p className="text-xs font-bold mb-3" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                      {cert.file_url && (
                        <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.1 }}
                          className="inline-block text-xs font-bold px-4 py-2 rounded-2xl text-white" style={{ backgroundColor: ac }}>
                          View
                        </motion.a>
                      )}
                    </ColorCard>
                  </BounceSection>
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
              {sec.type === 'text' && <BounceSection><ColorCard ac={ac} className="p-8"><p className="text-base leading-relaxed text-center" style={{ color: subColor }}>{sec.content?.body}</p></ColorCard></BounceSection>}
              {sec.type === 'list' && (
                <ul className="space-y-3 max-w-2xl mx-auto">
                  {(sec.content?.items || []).map((item: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05, type: 'spring' }}
                      className="flex items-start gap-3 text-base font-medium" style={{ color: subColor }}>
                      <motion.span className="w-2.5 h-2.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: ac }}
                        animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />{item}
                    </motion.li>
                  ))}
                </ul>
              )}
              {sec.type === 'links' && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {(sec.content?.links || []).map((link: any, i: number) => (
                    <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.08, rotate: -2 }}
                      className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: ac }}>
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
        <section id="contact" className="py-20 md:py-28 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <SectionTitle title="Let's Talk" subtitle="Contact" ac={ac} />
            <motion.p className="text-lg font-medium mb-8" style={{ color: subColor }}
              animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              I'm always open to exciting new projects!
            </motion.p>
            <div className="flex gap-4 justify-center flex-wrap mb-10">
              {(contact?.email || about?.email) && (
                <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.08, rotate: -2 }}
                  className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: ac }}>
                  Email Me
                </motion.a>
              )}
              {contact?.phone && (
                <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.08, rotate: 2 }}
                  className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: '#25D366' }}>
                  WhatsApp
                </motion.a>
              )}
              {contact?.linkedin_url && (
                <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.08, rotate: -2 }}
                  className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: '#0077B5' }}>
                  LinkedIn
                </motion.a>
              )}
              {contact?.github_url && (
                <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.08, rotate: 2 }}
                  className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: '#333' }}>
                  GitHub
                </motion.a>
              )}
            </div>
            <ColorCard ac={ac} className="p-6">
              <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
            </ColorCard>
          </div>
        </section>
      </div>

      <footer className="relative z-10 py-8 text-center border-t-2" style={{ borderColor: `${ac}30` }}>
        <motion.p className="text-sm font-bold" style={{ color: subColor }}
          animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          (c) 2026 {about?.name || portfolio.title}
        </motion.p>
        <p className="text-xs font-bold mt-1" style={{ color: `${ac}70` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}

