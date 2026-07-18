'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}>
      {children}
    </motion.div>
  );
}

export default function WhiteTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="min-h-screen bg-white" style={{ color: '#111' }}>
      {/* Subtle texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.span className="text-lg font-light tracking-tight" style={{ color: '#111' }}
            whileHover={{ letterSpacing: '0.1em', color: ac }}>
            {about?.name?.split(' ')[0] || portfolio.title}
          </motion.span>
          <nav className="flex gap-6">
            {['About', 'Projects', 'Contact'].map(s => (
              <motion.a key={s} href={`#${s.toLowerCase()}`} whileHover={{ color: ac }}
                className="text-sm font-medium tracking-wide transition-colors" style={{ color: '#666' }}>
                {s}
              </motion.a>
            ))}
          </nav>
        </div>
      </motion.nav>

      <div className="relative z-10">
        {/* Hero  -  clean minimal */}
        <section id="hero" className="min-h-screen flex items-center px-6 md:px-16 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center', paddingTop: '5rem' } : { paddingTop: '5rem' }}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <div className="max-w-4xl mx-auto w-full relative z-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {hero?.greeting && <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-6" style={{ color: ac }}>{hero.greeting}</span>}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl md:text-8xl font-light leading-[0.95] tracking-[-0.03em] mb-6" style={{ color: '#111' }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="text-lg sm:text-xl font-light max-w-xl mb-10" style={{ color: '#888' }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex gap-4 flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ y: -2 }}
                className="px-8 py-3.5 text-sm font-medium tracking-wide text-white" style={{ backgroundColor: ac }}>
                See Work
              </motion.a>
              {about?.cv_url && <motion.a href={about.cv_url} target="_blank" whileHover={{ y: -2 }}
                className="px-8 py-3.5 text-sm font-medium tracking-wide border-2" style={{ borderColor: '#111', color: '#111' }}>
                Resume
              </motion.a>}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ y: -2 }}
                  className="px-8 py-3.5 text-sm font-medium tracking-wide border-2" style={{ borderColor: '#111', color: '#111' }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-24 px-6 md:px-16 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <FadeIn>
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  {about.photo_url && <motion.div whileHover={{ scale: 1.02 }} className="shrink-0">
                    <img src={about.photo_url} alt={about.name} className="w-48 h-48 rounded-full object-cover" style={{ filter: 'grayscale(30%)' }} />
                  </motion.div>}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ac }}>About</span>
                    <h2 className="text-3xl sm:text-4xl font-light mt-1 mb-4" style={{ color: '#111' }}>{about.name}</h2>
                    <p className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: ac }}>{about.title}</p>
                    <p className="text-base leading-relaxed" style={{ color: '#888' }}>{about.bio}</p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="projects" className="py-24 px-6 md:px-16 bg-white">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <div className="mb-14">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ac }}>Portfolio</span>
                  <h2 className="text-3xl sm:text-4xl font-light mt-1" style={{ color: '#111' }}>Selected Work</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((proj: any, i: number) => (
                    <motion.div key={proj.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -8 }} className="group">
                      {proj.image_url && <div className="overflow-hidden mb-5"><motion.img whileHover={{ scale: 1.05 }} src={proj.image_url} alt={proj.title} className="w-full h-56 object-cover" /></div>}
                      <h3 className="text-xl font-light mb-2" style={{ color: '#111' }}>{proj.title}</h3>
                      <p className="text-sm mb-4" style={{ color: '#888' }}>{proj.description}</p>
                      {proj.tech_stack && <div className="flex flex-wrap gap-1.5 mb-4">{proj.tech_stack.split(',').map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} size="sm" variant="pill" />)}</div>}
                      <div className="flex gap-3">
                        {proj.demo_url && <motion.a href={proj.demo_url} target="_blank" whileHover={{ x: 3 }} className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: ac }}>Live to </motion.a>}
                        {proj.github_url && <motion.a href={proj.github_url} target="_blank" whileHover={{ x: 3 }} className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: '#666' }}>Source to </motion.a>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section className="py-24 px-6 md:px-16 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <div className="mb-14">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ac }}>Career</span>
                  <h2 className="text-3xl sm:text-4xl font-light mt-1" style={{ color: '#111' }}>Experience</h2>
                </div>
                <div className="space-y-8">
                  {experience.map((exp: any, i: number) => (
                    <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                      className="flex gap-4">
                      <div className="w-px bg-gray-200 shrink-0 mt-2" />
                      <div className="pb-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: ac }}>{exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}</span>
                        <h3 className="text-xl font-light mt-1" style={{ color: '#111' }}>{exp.position}</h3>
                        <p className="text-sm font-medium mb-3" style={{ color: ac }}>{exp.company}</p>
                        {exp.description && <div className="text-sm space-y-1.5" style={{ color: '#888' }}>{exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (<div key={si} className="flex gap-2"><span> - </span><span>{s.trim()}</span></div>))}</div>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section className="py-24 px-6 md:px-16 bg-white">
            <div className="max-w-5xl mx-auto">
              <FadeIn>
                <div className="mb-14">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ac }}>Tools</span>
                  <h2 className="text-3xl sm:text-4xl font-light mt-1" style={{ color: '#111' }}>Skills</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {skills.map((skill: any) => (
                    <motion.div key={skill.id} whileHover={{ x: 4 }}>
                      <h3 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: '#333' }}>{skill.title}</h3>
                      <div className="flex flex-wrap gap-2">{skill.skills?.split(',').map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} />)}</div>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* Services & Testimonials */}
        {services?.length > 0 && (
          <section className="py-24 px-6 md:px-16 bg-gray-50">
            <div className="max-w-5xl mx-auto"><FadeIn>
              <div className="mb-14"><span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ac }}>Services</span><h2 className="text-3xl sm:text-4xl font-light mt-1" style={{ color: '#111' }}>What I Do</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{services.map((svc: any) => (
                <motion.div key={svc.id} whileHover={{ y: -4 }}>
                  <p className="text-3xl mb-4">{svc.icon || 'o'}</p>
                  <h3 className="text-lg font-light mb-2" style={{ color: '#111' }}>{svc.title}</h3>
                  <p className="text-sm" style={{ color: '#888' }}>{svc.description}</p>
                </motion.div>
              ))}</div>
            </FadeIn></div>
          </section>
        )}

        {testimonials?.length > 0 && (
          <section className="py-24 px-6 md:px-16 bg-white">
            <div className="max-w-4xl mx-auto"><FadeIn>
              <div className="mb-14"><span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ac }}>Kind Words</span><h2 className="text-3xl sm:text-4xl font-light mt-1" style={{ color: '#111' }}>Testimonials</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{testimonials.map((t: any) => (
                <div key={t.id}>
                  <p className="text-5xl font-thin leading-none mb-2" style={{ color: ac }}>"</p>
                  <p className="text-sm leading-relaxed italic mb-4" style={{ color: '#888' }}>{t.message}</p>
                  <div className="flex items-center gap-3">
                    {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                    <div><p className="text-sm font-medium" style={{ color: '#111' }}>{t.name}</p><p className="text-xs" style={{ color: ac }}>{t.position}</p></div>
                  </div>
                </div>
              ))}</div>
            </FadeIn></div>
          </section>
        )}

        {gallery?.length > 0 && (
          <section className="py-24 px-6 md:px-16 bg-gray-50">
            <div className="max-w-6xl mx-auto"><FadeIn>
              <div className="mb-14"><span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ac }}>Credentials</span><h2 className="text-3xl sm:text-4xl font-light mt-1" style={{ color: '#111' }}>Certificates</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{gallery.map((cert: any) => (
                <div key={cert.id}>
                  {(cert.image_url || cert.file_url) && (
                    <div className="w-full h-40 mb-4 overflow-hidden bg-cover bg-center"
                      style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                      <img src={cert.image_url || cert.file_url} alt={cert.title}
                        className="w-full h-full object-cover"
                        onError={(e: any) => { e.target.style.display = 'none' }} />
                    </div>
                  )}
                  <h3 className="text-base font-light mb-1" style={{ color: '#111' }}>{cert.title}</h3>
                  {cert.description && <p className="text-xs mb-2" style={{ color: '#888' }}>{cert.description}</p>}
                  {cert.issued_date && <p className="text-xs font-medium mb-3" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                  {cert.file_url && <motion.a href={cert.file_url} target="_blank" whileHover={{ x: 3 }} className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: ac }}>View to </motion.a>}
                </div>
              ))}</div>
            </FadeIn></div>
          </section>
        )}

        {custom?.length > 0 && custom.map((sec: any) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-24 px-6 md:px-16 bg-white">
            <div className="max-w-5xl mx-auto"><FadeIn>
              <h2 className="text-3xl sm:text-4xl font-light mb-8" style={{ color: '#111' }}>{sec.title}</h2>
              {sec.type === 'text' && <p className="text-base leading-relaxed" style={{ color: '#888' }}>{sec.content?.body}</p>}
              {sec.type === 'list' && <div className="space-y-3">{(sec.content?.items || []).map((item: string, i: number) => <div key={i} className="flex gap-3 text-base" style={{ color: '#888' }}><span style={{ color: ac }}> - </span>{item}</div>)}</div>}
              {sec.type === 'links' && <div className="flex flex-wrap gap-3">{(sec.content?.links || []).map((link: any, i: number) => <motion.a key={i} href={link.url} target="_blank" whileHover={{ y: -2 }} className="text-sm font-medium tracking-wide px-6 py-3 text-white" style={{ backgroundColor: ac }}>{link.label}</motion.a>)}</div>}
              {!['text','list','cards','links'].includes(sec.type) && sec.content && (
                <div className="space-y-4">
                  {(() => {
                    if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(sec.content?.items)) {
                      return <CertificationSection items={sec.content?.items} textColor="#111" subTextColor="#888" accentColor={ac} cardBg="" />;
                    }
                    const c = sec.content;
                    if (c.institution || c.degree || c.field) {
                      return (
                        <div className="p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          {c.institution && <p className="text-lg font-semibold" style={{color: '#111'}}>{c.institution}</p>}
                          {(c.degree || c.field) && <p className="text-sm mt-1" style={{color: '#888'}}>{[c.degree, c.field].filter(Boolean).join('  -  ')}</p>}
                          {(c.start_date || c.end_date) && <p className="text-xs mt-1" style={{color: '#888'}}>{[c.start_date?.slice(0,7), c.end_date?.slice(0,7)].filter(Boolean).join(' - ')}</p>}
                          {c.gpa && <p className="text-xs mt-1" style={{color: '#888'}}>GPA: {c.gpa}</p>}
                        </div>
                      );
                    }
                    if (c.name || c.issuer) {
                      return (
                        <div className="p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          {c.name && <p className="text-lg font-semibold" style={{color: '#111'}}>{c.name}</p>}
                          {c.issuer && <p className="text-sm mt-1" style={{color: '#888'}}>{c.issuer}</p>}
                          {c.date && <p className="text-xs mt-1" style={{color: '#888'}}>{c.date}</p>}
                          {c.credential_url && <a href={c.credential_url} target="_blank" className="text-sm underline mt-2 inline-block" style={{color: ac}}>View credential</a>}
                        </div>
                      );
                    }
                    if (c.language) {
                      return (
                        <div className="flex items-center gap-3 p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          <p className="text-lg font-semibold" style={{color: '#111'}}>{c.language}</p>
                          {c.proficiency && <span className="text-xs px-3 py-1 rounded-full" style={{backgroundColor: ac+'30', color: ac}}>{c.proficiency}</span>}
                        </div>
                      );
                    }
                    if (c.body) {
                      return <p className="text-base leading-relaxed" style={{color: '#888'}}>{c.body}</p>;
                    }
                    return null;
                  })()}
                </div>
              )}
            </FadeIn></div>
          </section>
        ))}

        {/* Contact */}
        <section id="contact" className="py-24 px-6 md:px-16 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <div className="mb-10">
                <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: ac }}>Contact</span>
                <h2 className="text-3xl sm:text-4xl font-light mt-1" style={{ color: '#111' }}>Let's Talk</h2>
              </div>
              <div className="flex gap-4 mb-10 flex-wrap">
                {(contact?.email || about?.email) && <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ y: -2 }}
                  className="text-sm font-medium tracking-wide px-8 py-3.5 text-white" style={{ backgroundColor: ac }}>Email Me</motion.a>}
                {contact?.phone && <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ y: -2 }}
                  className="text-sm font-medium tracking-wide px-8 py-3.5 border-2" style={{ borderColor: '#111', color: '#111' }}>WhatsApp</motion.a>}
                {contact?.linkedin_url && <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ y: -2 }}
                  className="text-sm font-medium tracking-wide px-8 py-3.5 border-2" style={{ borderColor: '#0077B5', color: '#0077B5' }}>LinkedIn</motion.a>}
                {contact?.github_url && <motion.a href={contact.github_url} target="_blank" whileHover={{ y: -2 }}
                  className="text-sm font-medium tracking-wide px-8 py-3.5 border-2" style={{ borderColor: '#333', color: '#333' }}>GitHub</motion.a>}
              </div>
              <ContactForm slug={portfolio.slug} accentColor={ac} textColor="#111" subColor="#888" />
            </FadeIn>
          </div>
        </section>
      </div>

      <footer className="py-8 text-center border-t border-gray-100 bg-white">
        <p className="text-xs tracking-wide" style={{ color: '#aaa' }}>(c) 2026 {about?.name || portfolio.title}</p>
        <p className="text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: `${ac}80` }}>Built with PortfolioKit</p>
      </footer>
    </div>
  );
}
