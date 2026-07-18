'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function SlideUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

const textColor = '#1a1a1a';
const subColor = '#6b6b6b';

export default function SwissTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;
  const dark = '#1a1a1a';
  const light = '#f5f5f5';

  return (
    <div className="min-h-screen" style={{ backgroundColor: light, color: textColor }}>
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 0), linear-gradient(90deg, #1a1a1a 1px, transparent 0)', backgroundSize: '64px 64px' }} />

      {/* Bold header bar */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 200 }}
        className="fixed top-0 w-full z-50" style={{ backgroundColor: dark }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <motion.span className="text-sm font-black tracking-[0.2em] uppercase" style={{ color: light }} whileHover={{ color: ac }}>{about?.name?.split(' ')[0] || portfolio.title}</motion.span>
          <nav className="flex gap-1">
            {['About', 'Work', 'Skills', 'Contact'].map(s => (
              <motion.a key={s} href={`#${s.toLowerCase()}`} whileHover={{ backgroundColor: `${ac}20` }}
                className="px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors" style={{ color: light }}>
                {s}
              </motion.a>
            ))}
          </nav>
        </div>
      </motion.header>

      <div className="relative z-10">
        {/* Hero  -  fullscreen bold typography */}
        <section id="hero" className="min-h-screen flex items-center px-6 md:px-16 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: dark }}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <div className="max-w-6xl mx-auto w-full relative z-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {hero?.greeting && <span className="inline-block text-xs font-black tracking-[0.3em] uppercase mb-6" style={{ color: ac }}>{hero.greeting}</span>}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
              className="text-6xl sm:text-8xl md:text-9xl font-black leading-[0.9] tracking-[-0.04em] mb-4" style={{ color: light }}>
              {hero?.headline?.split(' ').map((w: string, i: number) => (
                <span key={i} className="inline-block mr-[0.1em]"><span style={{ color: i % 2 === 0 ? light : ac }}>{w}</span> </span>
              )) || <><span>{about?.name || 'Portfolio'}</span></>}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl max-w-2xl font-medium mb-10" style={{ color: `${light}bb` }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex gap-4 flex-wrap">
              <motion.a href={hero?.cta_url || '#work'} whileHover={{ scale: 1.02 }}
                className="px-8 py-3.5 text-xs font-black tracking-[0.15em] uppercase" style={{ backgroundColor: ac, color: light }}>
                View Projects
              </motion.a>
              {about?.cv_url && <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.02 }}
                className="px-8 py-3.5 text-xs font-black tracking-[0.15em] uppercase border-2" style={{ borderColor: light, color: light }}>
                Download CV
              </motion.a>}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.02 }}
                  className="px-8 py-3.5 text-xs font-black tracking-[0.15em] uppercase border-2" style={{ borderColor: light, color: light }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-24 px-6 md:px-16" style={{ backgroundColor: light }}>
            <div className="max-w-5xl mx-auto">
              <SlideUp>
                <div className="border-t-4 pt-6 mb-10" style={{ borderColor: dark }}>
                  <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: ac }}>About</span>
                  <h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em] mt-1" style={{ color: dark }}>{about.name}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {about.photo_url && <div className="flex items-center"><motion.div whileHover={{ scale: 1.02 }}><img src={about.photo_url} alt={about.name} className="w-56 h-56 rounded-full object-cover" style={{ filter: 'grayscale(100%)' }} /></motion.div></div>}
                  <div className="md:col-span-3 flex flex-col justify-center">
                    <p className="text-lg font-bold mb-2 uppercase tracking-wider" style={{ color: ac }}>{about.title}</p>
                    <p className="text-base leading-relaxed" style={{ color: subColor }}>{about.bio}</p>
                  </div>
                </div>
              </SlideUp>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="work" className="py-24 px-6 md:px-16" style={{ backgroundColor: dark }}>
            <div className="max-w-6xl mx-auto">
              <SlideUp>
                <div className="border-t-4 pt-6 mb-14" style={{ borderColor: ac }}>
                  <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: ac }}>Selected Work</span>
                  <h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em] mt-1" style={{ color: light }}>Projects</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-4">
                  {projects.map((proj: any, i: number) => (
                    <motion.div key={proj.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -6 }} className="group" style={{ backgroundColor: light }}>
                      {proj.image_url && <div className="overflow-hidden"><motion.img whileHover={{ scale: 1.08 }} src={proj.image_url} alt={proj.title} className="w-full h-52 object-cover" /></div>}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <div style={{ backgroundColor: ac }} className="w-2 h-2" />
                          <span className="text-xs font-black tracking-widest uppercase" style={{ color: ac }}>Project</span>
                        </div>
                        <h3 className="text-xl font-black mb-1" style={{ color: dark }}>{proj.title}</h3>
                        <p className="text-sm mb-4" style={{ color: subColor }}>{proj.description}</p>
                        {proj.tech_stack && <div className="flex flex-wrap gap-1.5 mb-4">{proj.tech_stack.split(',').map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} size="sm" variant="pill" />)}</div>}
                        <div className="flex gap-2">
                          {proj.demo_url && <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.05 }}
                            className="text-xs font-black tracking-widest uppercase px-4 py-2 text-white" style={{ backgroundColor: dark }}>Demo</motion.a>}
                          {proj.github_url && <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.05 }}
                            className="text-xs font-black tracking-widest uppercase px-4 py-2 border-2" style={{ borderColor: dark, color: dark }}>Code</motion.a>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SlideUp>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section className="py-24 px-6 md:px-16" style={{ backgroundColor: light }}>
            <div className="max-w-5xl mx-auto">
              <SlideUp>
                <div className="border-t-4 pt-6 mb-14" style={{ borderColor: dark }}>
                  <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: ac }}>Timeline</span>
                  <h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em] mt-1" style={{ color: dark }}>Experience</h2>
                </div>
                <div className="space-y-6">
                  {experience.map((exp: any, i: number) => (
                    <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                      className="border-l-4 pl-6 py-4" style={{ borderColor: ac }}>
                      <span className="text-xs font-black tracking-widest uppercase" style={{ color: ac }}>{exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}</span>
                      <h3 className="text-2xl font-black mt-1" style={{ color: dark }}>{exp.position}</h3>
                      <p className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: subColor }}>{exp.company}</p>
                      {exp.description && <div className="text-sm space-y-1" style={{ color: subColor }}>{exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (<div key={si} className="flex gap-2"><span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} /><span>{s.trim()}</span></div>))}</div>}
                    </motion.div>
                  ))}
                </div>
              </SlideUp>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-24 px-6 md:px-16" style={{ backgroundColor: dark }}>
            <div className="max-w-5xl mx-auto">
              <SlideUp>
                <div className="border-t-4 pt-6 mb-14" style={{ borderColor: ac }}>
                  <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: ac }}>Expertise</span>
                  <h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em] mt-1" style={{ color: light }}>Skills</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill: any) => (
                    <motion.div key={skill.id} whileHover={{ x: 4 }} className="p-6" style={{ backgroundColor: light }}>
                      <h3 className="text-base font-black uppercase tracking-wider mb-4" style={{ color: dark }}>{skill.title}</h3>
                      <div className="flex flex-wrap gap-2">{skill.skills?.split(',').map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} size="sm" variant="pill" />)}</div>
                    </motion.div>
                  ))}
                </div>
              </SlideUp>
            </div>
          </section>
        )}

        {/* Services & Testimonials */}
        {services?.length > 0 && (
          <section className="py-24 px-6 md:px-16" style={{ backgroundColor: light }}>
            <div className="max-w-5xl mx-auto"><SlideUp>
              <div className="border-t-4 pt-6 mb-14" style={{ borderColor: dark }}><span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: ac }}>Services</span><h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em] mt-1" style={{ color: dark }}>Services</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{services.map((svc: any) => (
                <motion.div key={svc.id} whileHover={{ y: -4 }} className="p-6 border-t-4" style={{ borderColor: ac, backgroundColor: '#fff' }}>
                  <p className="text-2xl mb-3">{svc.icon || '✦'}</p>
                  <h3 className="text-base font-black uppercase tracking-wider mb-2" style={{ color: dark }}>{svc.title}</h3>
                  <p className="text-sm" style={{ color: subColor }}>{svc.description}</p>
                </motion.div>
              ))}</div>
            </SlideUp></div>
          </section>
        )}

        {testimonials?.length > 0 && (
          <section className="py-24 px-6 md:px-16" style={{ backgroundColor: dark }}>
            <div className="max-w-4xl mx-auto"><SlideUp>
              <div className="border-t-4 pt-6 mb-14" style={{ borderColor: ac }}><span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: ac }}>Kind Words</span><h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em] mt-1" style={{ color: light }}>Testimonials</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{testimonials.map((t: any) => (
                <div key={t.id} className="p-6" style={{ backgroundColor: light }}>
                  <p className="text-3xl mb-2" style={{ color: ac }}>"</p>
                  <p className="text-sm leading-relaxed italic mb-4" style={{ color: subColor }}>{t.message}</p>
                  <div className="flex items-center gap-3">
                    {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                    <div><p className="text-sm font-black uppercase tracking-wider" style={{ color: dark }}>{t.name}</p><p className="text-xs uppercase tracking-wider" style={{ color: ac }}>{t.position}</p></div>
                  </div>
                </div>
              ))}</div>
            </SlideUp></div>
          </section>
        )}

        {gallery?.length > 0 && (
          <section className="py-24 px-6 md:px-16" style={{ backgroundColor: light }}>
            <div className="max-w-6xl mx-auto"><SlideUp>
              <div className="border-t-4 pt-6 mb-14" style={{ borderColor: dark }}><span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: ac }}>Credential</span><h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em] mt-1" style={{ color: dark }}>Certificates</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{gallery.map((cert: any) => (
                <div key={cert.id} className="p-5" style={{ backgroundColor: '#fff' }}>
                  {(cert.image_url || cert.file_url) && (
                    <div className="w-full h-36 mb-4 overflow-hidden bg-cover bg-center"
                      style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                      <img src={cert.image_url || cert.file_url} alt={cert.title}
                        className="w-full h-full object-cover"
                        onError={(e: any) => { e.target.style.display = 'none' }} />
                    </div>
                  )}
                  <h3 className="font-black text-sm uppercase tracking-wider mb-1" style={{ color: dark }}>{cert.title}</h3>
                  {cert.description && <p className="text-xs mb-2" style={{ color: subColor }}>{cert.description}</p>}
                  {cert.issued_date && <p className="text-xs font-black mb-3 tracking-wide" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                  {cert.file_url && <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.05 }} className="inline-block text-xs font-black tracking-widest uppercase px-4 py-2 text-white" style={{ backgroundColor: dark }}>View</motion.a>}
                </div>
              ))}</div>
            </SlideUp></div>
          </section>
        )}

        {custom?.length > 0 && custom.map((sec: any) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-24 px-6 md:px-16" style={{ backgroundColor: light }}>
            <div className="max-w-5xl mx-auto"><SlideUp>
              <div className="border-t-4 pt-6 mb-10" style={{ borderColor: dark }}><h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em]" style={{ color: dark }}>{sec.title}</h2></div>
              {sec.type === 'text' && <p className="text-base leading-relaxed" style={{ color: subColor }}>{sec.content?.body}</p>}
              {sec.type === 'list' && <div className="space-y-3">{(sec.content?.items || []).map((item: string, i: number) => <div key={i} className="flex gap-3 text-base" style={{ color: subColor }}><span className="text-lg" style={{ color: ac }}></span>{item}</div>)}</div>}
              {sec.type === 'links' && <div className="flex flex-wrap gap-3">{(sec.content?.links || []).map((link: any, i: number) => <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.05 }} className="text-xs font-black tracking-widest uppercase px-6 py-3 text-white" style={{ backgroundColor: dark }}>{link.label}</motion.a>)}</div>}
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
            </SlideUp></div>
          </section>
        ))}

        {/* Contact */}
        <section id="contact" className="py-24 px-6 md:px-16" style={{ backgroundColor: dark }}>
          <div className="max-w-3xl mx-auto">
            <SlideUp>
              <div className="border-t-4 pt-6 mb-10" style={{ borderColor: ac }}>
                <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: ac }}>Contact</span>
                <h2 className="text-4xl sm:text-6xl font-black tracking-[-0.03em] mt-1" style={{ color: light }}>Get in Touch</h2>
              </div>
              <div className="flex gap-4 mb-10 flex-wrap">
                {(contact?.email || about?.email) && <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.02 }}
                  className="text-xs font-black tracking-widest uppercase px-8 py-3.5" style={{ backgroundColor: ac, color: light }}>Send Email</motion.a>}
                {contact?.phone && <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.02 }}
                  className="text-xs font-black tracking-widest uppercase px-8 py-3.5 border-2" style={{ borderColor: light, color: light }}>WhatsApp</motion.a>}
                {contact?.linkedin_url && <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.02 }}
                  className="text-xs font-black tracking-widest uppercase px-8 py-3.5 border-2" style={{ borderColor: light, color: light }}>LinkedIn</motion.a>}
                {contact?.github_url && <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.02 }}
                  className="text-xs font-black tracking-widest uppercase px-8 py-3.5 border-2" style={{ borderColor: light, color: light }}>GitHub</motion.a>}
              </div>
              <div className="p-8" style={{ backgroundColor: light }}>
                <ContactForm slug={portfolio.slug} accentColor={ac} textColor={dark} subColor={subColor} />
              </div>
            </SlideUp>
          </div>
        </section>
      </div>

      <footer className="py-8 text-center" style={{ backgroundColor: light, borderTop: `1px solid ${dark}20` }}>
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title}</p>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-1" style={{ color: `${ac}80` }}>Built with PortfolioKit</p>
      </footer>
    </div>
  );
}

