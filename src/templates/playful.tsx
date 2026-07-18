'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function Float({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 100 }}>
      {children}
    </motion.div>
  );
}

const textColor = '#f0eef5';
const subColor = '#a098b0';

export default function PlayfulTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0b1a, #1a0f20, #0f1a20)' }}>
      {/* Decorative shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="fixed pointer-events-none z-0 rounded-full" style={{ backgroundColor: `${ac}${10 + (i % 3) * 5}`, width: 40 + i * 20, height: 40 + i * 20, left: `${10 + i * 15}%`, top: `${20 + i * 12}%` }}
          animate={{ y: [0, -30 - i * 5, 0], rotate: [0, 360], scale: [1, 1.1, 1] }} transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
      <motion.nav initial={{ y: -60 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 200 }}
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b" style={{ borderColor: `${ac}20`, backgroundColor: '#0f0b1add' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.span className="font-black text-lg tracking-tight" style={{ color: textColor }} whileHover={{ scale: 1.1, rotate: -5, color: ac }}>
            {about?.name?.split(' ')[0] || portfolio.title}
          </motion.span>
          <div className="flex gap-2">
            {['about', 'work', 'play', 'talk'].map(s => (
              <motion.a key={s} href={`#${s === 'work' ? 'projects' : s === 'play' ? 'skills' : s === 'talk' ? 'contact' : s}`}
                whileHover={{ scale: 1.15, color: ac, backgroundColor: `${ac}15` }}
                className="px-3 py-1.5 text-sm font-bold capitalize rounded-xl transition-colors" style={{ color: subColor }}>
                {s === 'work' ? ' Work' : s === 'play' ? ' Skills' : s === 'talk' ? ' Talk' : s}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10" style={{ paddingTop: '4rem' }}>
        {/* Hero */}
        <section id="hero" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <motion.div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #fff 1px, transparent 0), radial-gradient(circle at 70% 50%, #fff 1px, transparent 0)', backgroundSize: '60px 60px, 40px 40px' }} />
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.div initial={{ rotate: -10, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
              className="text-6xl mb-6"></motion.div>
            {hero?.greeting && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-white" style={{ backgroundColor: ac }}>{hero.greeting}</motion.span>}
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring' }}
              className="text-5xl sm:text-7xl md:text-8xl font-black leading-none mb-4" style={{ color: textColor }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-light mb-10" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.08, rotate: -3 }}
                className="px-10 py-4 rounded-2xl font-bold text-white text-lg" style={{ backgroundColor: ac }}>
                {hero?.cta_text || 'See My Work'}
              </motion.a>
              {about?.cv_url && <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.08, rotate: 3 }}
                className="px-10 py-4 rounded-2xl font-bold text-lg border-2" style={{ borderColor: ac, color: ac }}>CV</motion.a>}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.08, rotate: 3 }}
                  className="px-10 py-4 rounded-2xl font-bold text-lg border-2" style={{ borderColor: ac, color: ac }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <Float>
                <div className="text-center mb-14">
                  <motion.span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: `${ac}80` }}>About</motion.span>
                  <motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: textColor }}>{about.name}</motion.h2>
                </div>
                <motion.div className="p-8 md:p-10 rounded-[3rem] border-2 relative overflow-hidden" style={{ borderColor: `${ac}30`, backgroundColor: `${ac}06` }}
                  whileHover={{ borderColor: ac }}>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {about.photo_url && <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="shrink-0"><img src={about.photo_url} alt={about.name} className="w-44 h-44 rounded-full object-cover border-4" style={{ borderColor: `${ac}40` }} /></motion.div>}
                    <div className="space-y-4"><p className="text-lg font-bold" style={{ color: ac }}>{about.title}</p><p className="text-base leading-relaxed" style={{ color: subColor }}>{about.bio}</p></div>
                  </div>
                </motion.div>
              </Float>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <Float>
                <div className="text-center mb-14">
                  <motion.span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: `${ac}80` }}>Playground</motion.span>
                  <motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: textColor }}>Skills & Tools</motion.h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {skills.map((skill: any) => (
                    <motion.div key={skill.id} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      whileHover={{ y: -5, boxShadow: `0 20px 40px ${ac}20` }}
                      className="p-6 rounded-[2rem] border-2" style={{ borderColor: `${ac}20`, backgroundColor: `${ac}06` }}>
                      {skill.title && <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}> {skill.title}</h3>}
                      <div className="flex flex-wrap gap-2">{skill.skills?.split(',').map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} size="md" variant="pill" />)}</div>
                    </motion.div>
                  ))}
                </div>
              </Float>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <Float>
                <div className="text-center mb-14">
                  <motion.span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: `${ac}80` }}>Journey</motion.span>
                  <motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: textColor }}>Experience</motion.h2>
                </div>
                <div className="space-y-6">
                  {experience.map((exp: any, i: number) => (
                    <motion.div key={exp.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      whileHover={{ x: 5 }} className="p-6 md:p-8 rounded-[2rem] border-2" style={{ borderColor: `${ac}20`, backgroundColor: `${ac}06` }}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="text-xl font-black" style={{ color: textColor }}>{exp.position}</h3>
                        <motion.span className="text-xs font-bold px-4 py-1.5 rounded-full border-2" style={{ borderColor: ac, color: ac }}>{exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}</motion.span>
                      </div>
                      <p className="text-base font-bold mb-3" style={{ color: ac }}>{exp.company}</p>
                      {exp.description && <div className="text-sm space-y-1.5" style={{ color: subColor }}>{exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (<div key={si} className="flex gap-2"><span className="mt-1.5 shrink-0"></span><span>{s.trim()}</span></div>))}</div>}
                    </motion.div>
                  ))}
                </div>
              </Float>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="projects" className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <Float>
                <div className="text-center mb-14">
                  <motion.span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: `${ac}80` }}>Portfolio</motion.span>
                  <motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: textColor }}>Featured Work</motion.h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((proj: any, i: number) => (
                    <motion.div key={proj.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, type: 'spring' }}
                      whileHover={{ y: -10, rotate: i % 2 === 0 ? 1 : -1 }}
                      className="rounded-[2rem] overflow-hidden border-2" style={{ borderColor: `${ac}20`, backgroundColor: `${ac}06` }}>
                      {proj.image_url && <div className="overflow-hidden"><motion.img src={proj.image_url} alt={proj.title} className="w-full h-44 object-cover" whileHover={{ scale: 1.15 }} /></div>}
                      <div className="p-5">
                        <h3 className="text-xl font-black mb-2" style={{ color: textColor }}>{proj.title}</h3>
                        <p className="text-sm mb-4" style={{ color: subColor }}>{proj.description}</p>
                        {proj.tech_stack && <div className="flex flex-wrap gap-1.5 mb-4">{proj.tech_stack.split(',').map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} />)}</div>}
                        <div className="flex gap-2">
                          {proj.demo_url && <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.1, rotate: -3 }} className="text-xs font-bold px-4 py-2 rounded-2xl text-white" style={{ backgroundColor: ac }}>Demo</motion.a>}
                          {proj.github_url && <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.1, rotate: 3 }} className="text-xs font-bold px-4 py-2 rounded-2xl border-2" style={{ borderColor: ac, color: ac }}>Code</motion.a>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Float>
            </div>
          </section>
        )}

        {/* Services & Testimonials */}
        {services?.length > 0 && (
          <section className="py-24 px-4"><div className="max-w-5xl mx-auto">
            <Float><div className="text-center mb-14"><motion.span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: `${ac}80` }}>Services</motion.span><motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: textColor }}>What I Do</motion.h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{services.map((svc: any) => (
              <motion.div key={svc.id} whileHover={{ y: -8, rotate: 1 }} className="p-8 rounded-[2rem] border-2 text-center" style={{ borderColor: `${ac}20`, backgroundColor: `${ac}06` }}>
                <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="text-5xl mb-5">{svc.icon || ''}</motion.div>
                <h3 className="text-lg font-black mb-2" style={{ color: textColor }}>{svc.title}</h3>
                <p className="text-sm" style={{ color: subColor }}>{svc.description}</p>
              </motion.div>
            ))}</div></Float>
          </div></section>
        )}

        {testimonials?.length > 0 && (
          <section className="py-24 px-4"><div className="max-w-4xl mx-auto">
            <Float><div className="text-center mb-14"><motion.span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: `${ac}80` }}>Love</motion.span><motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: textColor }}>Testimonials</motion.h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{testimonials.map((t: any) => (
              <div key={t.id} className="p-6 rounded-[2rem] border-2" style={{ borderColor: `${ac}20`, backgroundColor: `${ac}06` }}>
                <p className="text-3xl mb-2"></p>
                <p className="text-sm italic mb-4" style={{ color: subColor }}>{t.message}</p>
                <div className="flex items-center gap-3">{t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-2xl object-cover" />}<div><p className="font-bold text-sm" style={{ color: textColor }}>{t.name}</p><p className="text-xs font-bold" style={{ color: ac }}>{t.position}</p></div></div>
              </div>
            ))}</div></Float>
          </div></section>
        )}

        {gallery?.length > 0 && (
          <section className="py-24 px-4"><div className="max-w-6xl mx-auto">
            <Float><div className="text-center mb-14"><motion.span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: `${ac}80` }}>Creds</motion.span><motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: textColor }}>Certificates</motion.h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{gallery.map((cert: any) => (
              <div key={cert.id} className="p-5 rounded-[2rem] border-2" style={{ borderColor: `${ac}20`, backgroundColor: `${ac}06` }}>
                {(cert.image_url || cert.file_url) && (
                  <div className="w-full h-32 rounded-2xl mb-4 overflow-hidden bg-cover bg-center"
                    style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                    <img src={cert.image_url || cert.file_url} alt={cert.title}
                      className="w-full h-full object-cover"
                      onError={(e: any) => { e.target.style.display = 'none' }} />
                  </div>
                )}
                <h3 className="font-bold text-base mb-1" style={{ color: textColor }}>{cert.title}</h3>
                {cert.description && <p className="text-xs mb-2" style={{ color: subColor }}>{cert.description}</p>}
                {cert.issued_date && <p className="text-xs mb-3 font-bold" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                {cert.file_url && <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.1 }} className="inline-block text-xs font-bold px-4 py-2 rounded-2xl text-white" style={{ backgroundColor: ac }}>View</motion.a>}
              </div>
            ))}</div></Float>
          </div></section>
        )}

        {custom?.length > 0 && custom.map((sec: any) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <Float>
                <div className="text-center mb-14"><motion.h2 className="text-4xl sm:text-5xl font-black" style={{ color: textColor }}>{sec.title}</motion.h2></div>
                {sec.type === 'text' && <p className="text-lg text-center" style={{ color: subColor }}>{sec.content?.body}</p>}
                {sec.type === 'list' && <ul className="space-y-3 max-w-2xl mx-auto">{(sec.content?.items || []).map((item: string, i: number) => <motion.li key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex gap-3 text-base" style={{ color: subColor }}><span></span>{item}</motion.li>)}</ul>}
                {sec.type === 'links' && <div className="flex flex-wrap gap-4 justify-center">{(sec.content?.links || []).map((link: any, i: number) => <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.08, rotate: -2 }} className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: ac }}>{link.label}</motion.a>)}</div>}
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
              </Float>
            </div>
          </section>
        ))}

        {/* Contact */}
        <section id="contact" className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Float><div className="text-center mb-14"><motion.span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: `${ac}80` }}>Contact</motion.span><motion.h2 className="text-4xl sm:text-5xl font-black mt-2" style={{ color: textColor }}>Let's Play!</motion.h2></div>
            <p className="text-base mb-8" style={{ color: subColor }}>Got a fun project? Hit me up!</p>
            <div className="flex gap-4 justify-center flex-wrap mb-10">
              {(contact?.email || about?.email) && <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.08, rotate: -3 }} className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: ac }}> Email</motion.a>}
              {contact?.phone && <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.08, rotate: 3 }} className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: '#25D366' }}> WhatsApp</motion.a>}
              {contact?.linkedin_url && <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.08, rotate: -3 }} className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: '#0077B5' }}> LinkedIn</motion.a>}
              {contact?.github_url && <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.08, rotate: 3 }} className="px-8 py-3.5 rounded-2xl font-bold text-white" style={{ backgroundColor: '#333' }}> GitHub</motion.a>}
            </div>
            <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
          </Float></div>
        </section>
      </div>
      <footer className="py-8 text-center border-t-2" style={{ borderColor: `${ac}20` }}>
        <p className="text-sm font-bold" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title} </p>
        <p className="text-xs font-bold mt-1" style={{ color: `${ac}60` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}

