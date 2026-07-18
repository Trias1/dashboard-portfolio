'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function Rise({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

const textColor = '#1a0a0a';
const subColor = '#3f3333';

export default function AgencyTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;
  return (
    <div className="min-h-screen bg-white" style={{ color: textColor, backgroundColor: '#ffffff' }}>
      {/* Dynamic gradient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${ac}30 0%, ${ac}10 50%, #fff 100%)` }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 0%, transparent 70%), radial-gradient(circle at 75% 75%, #fff 0%, transparent 70%)' }} />
      </div>

      {/* Navigation */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b" style={{ borderColor: `${ac}15` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: ac }}>{about?.name?.charAt(0) || 'A'}</div>
            <span className="text-lg font-bold tracking-tight">{about?.name?.split(' ')[0] || portfolio.title}</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-8">
            {['Work', 'Services', 'Team', 'Contact'].map(s => (
              <motion.a key={s} href={`#${s.toLowerCase()}`} whileHover={{ color: ac }}
                className="text-sm font-semibold tracking-wide transition-colors" style={{ color: subColor }}>
                {s}
              </motion.a>
            ))}
            <motion.a href="#contact" whileHover={{ scale: 1.04 }}
              className="text-sm font-bold px-6 py-2.5 rounded-lg text-white" style={{ backgroundColor: ac }}>
              Get in Touch
            </motion.a>
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10">
        {/* Hero  -  bold agency style */}
        <section id="hero" className="min-h-screen flex items-center px-6 md:px-20 overflow-hidden relative"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <motion.div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: ac }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="max-w-6xl mx-auto w-full relative z-10">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
              {hero?.greeting && <span className="inline-block px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 text-white" style={{ backgroundColor: ac }}>{hero.greeting}</span>}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring' }}
              className="text-5xl sm:text-7xl md:text-8xl font-black leading-[0.9] tracking-[-0.03em] mb-6">
              {hero?.headline ? (
                hero.headline.split(' ').map((w: string, i: number) => (
                  <motion.span key={i} className="inline-block mr-[0.05em]" whileHover={{ scale: 1.05, color: ac }}>
                    {i === hero.headline.split(' ').length - 1 ? <span style={{ color: ac }}>{w}</span> : w}{' '}
                  </motion.span>
                ))
              ) : <><span>{about?.name || portfolio.title}</span></>}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl max-w-2xl font-normal mb-10" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex gap-4 flex-wrap">
              <motion.a href={hero?.cta_url || '#work'} whileHover={{ scale: 1.04, boxShadow: `0 20px 40px ${ac}40` }}
                className="px-10 py-4 rounded-xl text-sm font-bold tracking-wide text-white" style={{ backgroundColor: ac }}>
                See Our Work
              </motion.a>
              {about?.cv_url && <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.04 }}
                className="px-10 py-4 rounded-xl text-sm font-bold tracking-wide border-2" style={{ borderColor: textColor, color: textColor }}>
                Download Deck
              </motion.a>}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-10 py-4 rounded-xl text-sm font-bold tracking-wide border-2" style={{ borderColor: textColor, color: textColor }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-24 px-6 md:px-20">
            <div className="max-w-6xl mx-auto">
              <Rise>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  {about.photo_url && <motion.div whileHover={{ scale: 1.02 }} className="relative shrink-0">
                    <div className="absolute -top-4 -left-4 w-56 h-56 rounded-full" style={{ backgroundColor: `${ac}20` }} />
                    <img src={about.photo_url} alt={about.name} className="relative w-56 h-56 rounded-full object-cover" />
                  </motion.div>}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ac }}>About</span>
                    <h2 className="text-4xl sm:text-5xl font-black mt-2 mb-4">{about.name}</h2>
                    <p className="text-base font-semibold mb-4" style={{ color: ac }}>{about.title}</p>
                    <p className="text-base leading-relaxed text-justify whitespace-pre-line" style={{ color: subColor }}>{about.bio}</p>
                  </div>
                </div>
              </Rise>
            </div>
          </section>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <section id="services" className="py-24 px-6 md:px-20" style={{ backgroundColor: '#fafafa' }}>
            <div className="max-w-6xl mx-auto">
              <Rise>
                <div className="text-center mb-14">
                  <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ac }}>What We Do</span>
                  <h2 className="text-4xl sm:text-5xl font-black mt-2">Services</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.map((svc: any, i: number) => (
                    <motion.div key={svc.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -8, boxShadow: `0 30px 60px ${ac}20` }}
                      className="p-8 rounded-2xl bg-white border-2" style={{ borderColor: `${ac}10` }}>
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5 text-white" style={{ backgroundColor: ac }}>
                        {svc.icon || '✦'}
                      </div>
                      <h3 className="text-xl font-black mb-3">{svc.title}</h3>
                      <p className="text-sm leading-relaxed text-justify" style={{ color: subColor }}>{svc.description}</p>
                    </motion.div>
                  ))}
                </div>
              </Rise>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="projects" className="py-24 px-6 md:px-20">
            <div className="max-w-6xl mx-auto">
              <Rise>
                <div className="mb-14">
                  <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ac }}>Portfolio</span>
                  <h2 className="text-4xl sm:text-5xl font-black mt-2">Featured Work</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((proj: any, i: number) => (
                    <motion.div key={proj.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -6 }} className="group rounded-2xl overflow-hidden bg-white border-2" style={{ borderColor: `${ac}10` }}>
                      {proj.image_url && <div className="overflow-hidden"><motion.img whileHover={{ scale: 1.1 }} src={proj.image_url} alt={proj.title} className="w-full h-48 object-cover" /></div>}
                      <div className="p-6">
                        <h3 className="text-lg font-black mb-2">{proj.title}</h3>
                        <p className="text-sm mb-4 text-justify" style={{ color: subColor }}>{proj.description}</p>
                        {proj.tech_stack && <div className="flex flex-wrap gap-1.5 mb-4">{proj.tech_stack.split(',').map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} variant="pill" />)}</div>}
                        <div className="flex gap-2">
                          {proj.demo_url && <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.05 }}
                            className="text-xs font-bold px-5 py-2.5 rounded-lg text-white" style={{ backgroundColor: ac }}>Live Demo</motion.a>}
                          {proj.github_url && <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.05 }}
                            className="text-xs font-bold px-5 py-2.5 rounded-lg border-2" style={{ borderColor: textColor, color: textColor }}>Source</motion.a>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Rise>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-24 px-6 md:px-20" style={{ backgroundColor: '#fafafa' }}>
            <div className="max-w-4xl mx-auto">
              <Rise>
                <div className="mb-14 text-center">
                  <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ac }}>Timeline</span>
                  <h2 className="text-4xl sm:text-5xl font-black mt-2">Experience</h2>
                </div>
                <div className="space-y-6">
                  {experience.map((exp: any, i: number) => (
                    <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                      className="p-6 md:p-8 rounded-2xl bg-white border-2" style={{ borderColor: `${ac}10` }}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="text-lg font-black">{exp.position}</h3>
                        <span className="text-xs font-bold px-4 py-1.5 rounded-full" style={{ backgroundColor: `${ac}15`, color: ac }}>{exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}</span>
                      </div>
                      <p className="text-sm font-bold mb-3" style={{ color: ac }}>{exp.company}</p>
                      {exp.description && <div className="text-sm space-y-1.5" style={{ color: subColor }}>{exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (<div key={si} className="flex gap-2"><span className="text-lg leading-none" style={{ color: ac }}>*</span><span>{s.trim()}</span></div>))}</div>}
                    </motion.div>
                  ))}
                </div>
              </Rise>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-24 px-6 md:px-20">
            <div className="max-w-5xl mx-auto">
              <Rise>
                <div className="mb-14 text-center">
                  <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ac }}>Expertise</span>
                  <h2 className="text-4xl sm:text-5xl font-black mt-2">Skills</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {skills.map((skill: any) => (
                    <motion.div key={skill.id} whileHover={{ x: 5 }} className="p-6 rounded-2xl bg-white border-2" style={{ borderColor: `${ac}10` }}>
                      <h3 className="text-base font-black mb-4">{skill.title}</h3>
                      <div className="flex flex-wrap gap-2">{skill.skills?.split(',').map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} size="md" />)}</div>
                    </motion.div>
                  ))}
                </div>
              </Rise>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <section id="testimonials" className="py-24 px-6 md:px-20" style={{ backgroundColor: '#fafafa' }}>
            <div className="max-w-4xl mx-auto"><Rise>
              <div className="text-center mb-14"><span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ac }}>Testimonials</span><h2 className="text-4xl sm:text-5xl font-black mt-2">Kind Words</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{testimonials.map((t: any) => (
                <div key={t.id} className="p-6 rounded-2xl bg-white border-2" style={{ borderColor: `${ac}10` }}>
                  <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <span key={i} style={{ color: ac }}></span>)}</div>
                  <p className="text-sm italic mb-4" style={{ color: subColor }}>{t.message}</p>
                  <div className="flex items-center gap-3">
                    {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                    <div><p className="text-sm font-bold">{t.name}</p><p className="text-xs font-semibold" style={{ color: ac }}>{t.position}</p></div>
                  </div>
                </div>
              ))}</div>
            </Rise></div>
          </section>
        )}

        {/* Gallery */}
        {gallery?.length > 0 && (
          <section id="gallery" className="py-24 px-6 md:px-20">
            <div className="max-w-6xl mx-auto"><Rise>
              <div className="mb-14 text-center"><span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ac }}>Credentials</span><h2 className="text-4xl sm:text-5xl font-black mt-2">Certificates</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{gallery.map((cert: any) => (
                <div key={cert.id} className="p-5 rounded-2xl bg-white border-2" style={{ borderColor: `${ac}10` }}>
                  {(cert.image_url || cert.file_url) && (
                    <div className="w-full h-36 rounded-xl mb-4 overflow-hidden bg-cover bg-center"
                      style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                      <img src={cert.image_url || cert.file_url} alt={cert.title}
                        className="w-full h-full object-cover"
                        onError={(e: any) => { e.target.style.display = 'none' }} />
                    </div>
                  )}
                  <h3 className="font-bold text-base mb-1">{cert.title}</h3>
                  {cert.description && <p className="text-xs mb-2" style={{ color: subColor }}>{cert.description}</p>}
                  {cert.issued_date && <p className="text-xs font-bold mb-3" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                  {cert.file_url && <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.05 }} className="inline-block text-xs font-bold px-5 py-2 rounded-lg text-white" style={{ backgroundColor: ac }}>View</motion.a>}
                </div>
              ))}</div>
            </Rise></div>
          </section>
        )}

        {custom?.length > 0 && custom.map((sec: any) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-24 px-6 md:px-20">
            <div className="max-w-5xl mx-auto"><Rise>
              <h2 className="text-4xl sm:text-5xl font-black mb-8 text-center">{sec.title}</h2>
              {sec.type === 'text' && <p className="text-base leading-relaxed text-center text-justify" style={{ color: subColor }}>{sec.content?.body}</p>}
              {sec.type === 'list' && <div className="space-y-3 max-w-2xl mx-auto">{(sec.content?.items || []).map((item: string, i: number) => <div key={i} className="flex gap-3 text-base" style={{ color: subColor }}><span className="text-lg" style={{ color: ac }}>*</span>{item}</div>)}</div>}
              {sec.type === 'links' && <div className="flex flex-wrap gap-4 justify-center">{(sec.content?.links || []).map((link: any, i: number) => <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.05 }} className="text-sm font-bold px-8 py-3.5 rounded-lg text-white" style={{ backgroundColor: ac }}>{link.label}</motion.a>)}</div>}
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
            </Rise></div>
          </section>
        ))}

        {/* Contact */}
        <section id="contact" className="py-24 px-6 md:px-20" style={{ backgroundColor: '#fafafa' }}>
          <div className="max-w-3xl mx-auto">
            <Rise>
              <div className="text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ac }}>Contact</span>
                <h2 className="text-4xl sm:text-5xl font-black mt-2">Let's Work Together</h2>
              </div>
              <div className="flex gap-4 justify-center mb-10 flex-wrap">
                {(contact?.email || about?.email) && <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.04, boxShadow: `0 20px 40px ${ac}40` }}
                  className="text-sm font-bold px-10 py-4 rounded-xl text-white" style={{ backgroundColor: ac }}>Start a Project</motion.a>}
                {contact?.phone && <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.04 }}
                  className="text-sm font-bold px-10 py-4 rounded-xl border-2" style={{ borderColor: textColor, color: textColor }}>WhatsApp</motion.a>}
                {contact?.linkedin_url && <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="text-sm font-bold px-10 py-4 rounded-xl border-2" style={{ borderColor: textColor, color: textColor }}>LinkedIn</motion.a>}
                {contact?.github_url && <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="text-sm font-bold px-10 py-4 rounded-xl border-2" style={{ borderColor: textColor, color: textColor }}>GitHub</motion.a>}
              </div>
              <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
            </Rise>
          </div>
        </section>
      </div>

      <footer className="py-10 text-center border-t-2" style={{ borderColor: `${ac}15`, backgroundColor: '#fff' }}>
        <p className="text-sm font-bold" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title} Agency</p>
        <p className="text-xs font-bold mt-1" style={{ color: `${ac}60` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}

