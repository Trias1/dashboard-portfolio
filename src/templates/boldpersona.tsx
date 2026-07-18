'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function PopIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 150 }}>
      {children}
    </motion.div>
  );
}

const textColor = '#f0eef5';
const subColor = '#a098b0';

export default function BoldPersonaTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f', color: textColor }}>
      {/* Diagonal split bg */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-1/2 -right-1/4 w-[80%] h-[150%] skew-x-12 origin-top-right opacity-[0.04]"
          style={{ background: `linear-gradient(180deg, ${ac} 0%, transparent 100%)` }}
          animate={{ skewX: [10, 14, 10] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* Bold header  -  minimal, just name */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }}
        className="fixed top-0 w-full z-50" style={{ backgroundColor: '#0a0a0fdd' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <motion.span className="text-2xl font-black tracking-tight" style={{ color: textColor }}
            whileHover={{ color: ac, scale: 1.02 }}>
            {about?.name?.split(' ')[0]?.[0] || portfolio.title?.[0] || 'P'}
          </motion.span>
          <nav className="flex gap-8 text-sm font-bold uppercase tracking-widest">
            {['Work', 'About', 'Connect'].map(s => (
              <motion.a key={s} href={`#${s.toLowerCase()}`} whileHover={{ color: ac, letterSpacing: '0.2em' }}
                className="transition-all" style={{ color: subColor }}>
                {s}
              </motion.a>
            ))}
          </nav>
        </div>
      </motion.header>

      <div className="relative z-10">
        {/* Hero  -  giant typography */}
        <section id="hero" className="min-h-screen flex items-center px-6 md:px-20 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {hero?.greeting && <span className="inline-block text-xs font-bold uppercase tracking-[0.4em] mb-8" style={{ color: ac }}>{hero.greeting}</span>}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.85] tracking-[-0.05em] mb-4">
              {hero?.headline?.split(' ').map((w: string, i: number) => (
                <motion.span key={i} className="block" whileHover={{ x: i % 2 === 0 ? 10 : -10, color: ac }}
                  transition={{ type: 'spring' }}>
                  {w}
                </motion.span>
              )) || (
                <>
                  <motion.span className="block" whileHover={{ x: 10, color: ac }}>{about?.name?.split(' ')[0] || 'Your'}</motion.span>
                  <motion.span className="block" style={{ color: ac }} whileHover={{ x: -10 }}>{about?.name?.split(' ')[1] || 'Name'}</motion.span>
                </>
              )}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="text-xl sm:text-2xl max-w-xl font-light mt-4 mb-10" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex gap-6 flex-wrap">
              <motion.a href={hero?.cta_url || '#work'} whileHover={{ scale: 1.05, letterSpacing: '0.1em' }}
                className="px-12 py-5 text-sm font-black uppercase tracking-widest" style={{ backgroundColor: ac, color: '#0a0a0f' }}>
                View Work
              </motion.a>
              {about?.cv_url && <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.05, letterSpacing: '0.1em' }}
                className="px-12 py-5 text-sm font-black uppercase tracking-widest border-2" style={{ borderColor: textColor, color: textColor }}>
                Resume
              </motion.a>}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.05, letterSpacing: '0.1em' }}
                  className="px-12 py-5 text-sm font-black uppercase tracking-widest border-2" style={{ borderColor: textColor, color: textColor }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* Work  -  bold, image heavy */}
        {projects?.length > 0 && (
          <section id="work" className="py-32 px-6 md:px-20">
            <div className="max-w-7xl mx-auto">
              <PopIn>
                <div className="mb-16">
                  <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ac }}>Selected Work</span>
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] mt-2" style={{ color: textColor }}>Projects</h2>
                </div>
              </PopIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((proj: any, i: number) => (
                  <motion.div key={proj.id} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, type: 'spring' }}
                    whileHover={{ y: -12 }}
                    className="group relative overflow-hidden" style={{ backgroundColor: '#12121a' }}>
                    {proj.image_url && <div className="overflow-hidden"><motion.img whileHover={{ scale: 1.08 }} src={proj.image_url} alt={proj.title} className="w-full h-72 object-cover opacity-80 group-hover:opacity-100 transition-opacity" /></div>}
                    <div className="p-8">
                      <h3 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: textColor }}>{proj.title}</h3>
                      <p className="text-sm mb-4 text-justify" style={{ color: subColor }}>{proj.description}</p>
                      {proj.tech_stack && <div className="flex flex-wrap gap-2 mb-5">{proj.tech_stack.split(',').map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} size="md" variant="pill" />)}</div>}
                      <div className="flex gap-4">
                        {proj.demo_url && <motion.a href={proj.demo_url} target="_blank" whileHover={{ x: 5 }}
                          className="text-sm font-black uppercase tracking-widest" style={{ color: ac }}>Live to </motion.a>}
                        {proj.github_url && <motion.a href={proj.github_url} target="_blank" whileHover={{ x: 5 }}
                          className="text-sm font-black uppercase tracking-widest" style={{ color: subColor }}>Code to </motion.a>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About  -  bold split */}
        {about?.name && (
          <section id="about" className="py-32 px-6 md:px-20" style={{ backgroundColor: '#12121a' }}>
            <div className="max-w-7xl mx-auto">
              <PopIn>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ac }}>About</span>
                    <h2 className="text-5xl sm:text-7xl font-black tracking-[-0.04em] mt-2 mb-6" style={{ color: textColor }}>{about.name}</h2>
                    <p className="text-lg font-bold mb-4" style={{ color: ac }}>{about.title}</p>
                    <p className="text-base leading-relaxed text-justify whitespace-pre-line" style={{ color: subColor }}>{about.bio}</p>
                  </div>
                  {about.photo_url && <motion.div whileHover={{ scale: 1.03 }} className="relative shrink-0">
                    <div className="absolute -top-6 -right-6 w-56 h-56 border-2" style={{ borderColor: ac }} />
                    <img src={about.photo_url} alt={about.name} className="relative w-56 h-56 rounded-full object-cover" />
                  </motion.div>}
                </div>
              </PopIn>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-32 px-6 md:px-20">
            <div className="max-w-5xl mx-auto">
              <PopIn>
                <div className="mb-16">
                  <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ac }}>Timeline</span>
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] mt-2">Experience</h2>
                </div>
              </PopIn>
              <div className="space-y-8">
                {experience.map((exp: any, i: number) => (
                  <motion.div key={exp.id} initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: 'spring' }}
                    className="border-l-4 pl-8 py-4" style={{ borderColor: ac }}>
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: ac }}>{exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}</span>
                    <h3 className="text-2xl sm:text-3xl font-black mt-1" style={{ color: textColor }}>{exp.position}</h3>
                    <p className="text-base font-bold uppercase tracking-wider mt-1 mb-4" style={{ color: subColor }}>{exp.company}</p>
                    {exp.description && <div className="text-sm space-y-2" style={{ color: subColor }}>{exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (<div key={si} className="flex gap-3"><span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ac }} /><span>{s.trim()}</span></div>))}</div>}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-32 px-6 md:px-20" style={{ backgroundColor: '#12121a' }}>
            <div className="max-w-5xl mx-auto">
              <PopIn>
                <div className="mb-16">
                  <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ac }}>Expertise</span>
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] mt-2">Skills</h2>
                </div>
              </PopIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill: any) => (
                  <motion.div key={skill.id} whileHover={{ x: 8 }} className="p-8 border-l-4" style={{ borderColor: ac, backgroundColor: '#0a0a0f' }}>
                    <h3 className="text-lg font-black uppercase tracking-wider mb-5" style={{ color: textColor }}>{skill.title}</h3>
                    <div className="flex flex-wrap gap-3">{skill.skills?.split(',').map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} size="md" />)}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <section id="services" className="py-32 px-6 md:px-20">
            <div className="max-w-6xl mx-auto"><PopIn>
              <div className="mb-16"><span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ac }}>Services</span><h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] mt-2">Services</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{services.map((svc: any) => (
                <motion.div key={svc.id} whileHover={{ y: -8 }} className="p-8 border-l-4" style={{ borderColor: ac, backgroundColor: '#12121a' }}>
                  <p className="text-4xl mb-5">{svc.icon || '✦'}</p>
                  <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{ color: textColor }}>{svc.title}</h3>
                  <p className="text-sm text-justify" style={{ color: subColor }}>{svc.description}</p>
                </motion.div>
              ))}</div>
            </PopIn></div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <section id="testimonials" className="py-32 px-6 md:px-20" style={{ backgroundColor: '#12121a' }}>
            <div className="max-w-4xl mx-auto"><PopIn>
              <div className="mb-16"><span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ac }}>Testimonials</span><h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] mt-2">Kind Words</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{testimonials.map((t: any) => (
                <div key={t.id} className="p-8" style={{ backgroundColor: '#0a0a0f' }}>
                  <p className="text-6xl font-black leading-none mb-4" style={{ color: ac }}>"</p>
                  <p className="text-sm italic leading-relaxed mb-6 text-justify" style={{ color: subColor }}>{t.message}</p>
                  <div className="flex items-center gap-4">
                    {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: ac }} />}
                    <div><p className="text-base font-black uppercase tracking-wider" style={{ color: textColor }}>{t.name}</p><p className="text-xs font-bold uppercase tracking-wider" style={{ color: ac }}>{t.position}</p></div>
                  </div>
                </div>
              ))}</div>
            </PopIn></div>
          </section>
        )}

        {gallery?.length > 0 && (
          <section id="gallery" className="py-32 px-6 md:px-20">
            <div className="max-w-6xl mx-auto"><PopIn>
              <div className="mb-16"><span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ac }}>Credentials</span><h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] mt-2">Certificates</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{gallery.map((cert: any) => (
                <div key={cert.id} className="p-6" style={{ backgroundColor: '#12121a' }}>
                  {(cert.image_url || cert.file_url) && (
                    <div className="w-full h-36 mb-5 overflow-hidden bg-cover bg-center"
                      style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                      <img src={cert.image_url || cert.file_url} alt={cert.title}
                        className="w-full h-full object-cover"
                        onError={(e: any) => { e.target.style.display = 'none' }} />
                    </div>
                  )}
                  <h3 className="text-base font-black uppercase tracking-wider mb-1" style={{ color: textColor }}>{cert.title}</h3>
                  {cert.description && <p className="text-xs mb-2" style={{ color: subColor }}>{cert.description}</p>}
                  {cert.issued_date && <p className="text-xs font-bold mb-4 uppercase tracking-wider" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                  {cert.file_url && <motion.a href={cert.file_url} target="_blank" whileHover={{ x: 5 }} className="text-xs font-black uppercase tracking-widest" style={{ color: ac }}>View to </motion.a>}
                </div>
              ))}</div>
            </PopIn></div>
          </section>
        )}

        {custom?.length > 0 && custom.map((sec: any) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-32 px-6 md:px-20" style={{ backgroundColor: '#12121a' }}>
            <div className="max-w-5xl mx-auto"><PopIn>
              <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] mb-10">{sec.title}</h2>
              {sec.type === 'text' && <p className="text-base leading-relaxed" style={{ color: subColor }}>{sec.content?.body}</p>}
              {sec.type === 'list' && <div className="space-y-4">{(sec.content?.items || []).map((item: string, i: number) => <div key={i} className="flex gap-4 text-base" style={{ color: subColor }}><span className="w-2 h-2 mt-2 rounded-full shrink-0" style={{ backgroundColor: ac }} />{item}</div>)}</div>}
              {sec.type === 'links' && <div className="flex flex-wrap gap-4">{(sec.content?.links || []).map((link: any, i: number) => <motion.a key={i} href={link.url} target="_blank" whileHover={{ x: 5 }} className="text-sm font-black uppercase tracking-widest px-8 py-4" style={{ backgroundColor: ac, color: '#0a0a0f' }}>{link.label}</motion.a>)}</div>}
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
            </PopIn></div>
          </section>
        ))}

        {/* Contact */}
        <section id="connect" className="py-32 px-6 md:px-20">
          <div className="max-w-4xl mx-auto">
            <PopIn>
              <div className="mb-16">
                <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: ac }}>Connect</span>
                <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] mt-2">Let's Talk</h2>
              </div>
              <div className="flex gap-6 mb-12 flex-wrap">
                {(contact?.email || about?.email) && <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.05, letterSpacing: '0.1em' }}
                  className="px-10 py-5 text-sm font-black uppercase tracking-widest" style={{ backgroundColor: ac, color: '#0a0a0f' }}>Email Me</motion.a>}
                {contact?.phone && <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.05, letterSpacing: '0.1em' }}
                  className="px-10 py-5 text-sm font-black uppercase tracking-widest border-2" style={{ borderColor: textColor, color: textColor }}>WhatsApp</motion.a>}
                {contact?.linkedin_url && <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.05, letterSpacing: '0.1em' }}
                  className="px-10 py-5 text-sm font-black uppercase tracking-widest border-2" style={{ borderColor: textColor, color: textColor }}>LinkedIn</motion.a>}
                {contact?.github_url && <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.05, letterSpacing: '0.1em' }}
                  className="px-10 py-5 text-sm font-black uppercase tracking-widest border-2" style={{ borderColor: textColor, color: textColor }}>GitHub</motion.a>}
              </div>
              <div style={{ backgroundColor: '#12121a' }} className="p-8 md:p-12">
                <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
              </div>
            </PopIn>
          </div>
        </section>
      </div>

      <footer className="py-10 text-center border-t-2" style={{ borderColor: `${ac}20`, backgroundColor: '#0a0a0f' }}>
        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title}</p>
        <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: `${ac}60}` }}>Built with PortfolioKit</p>
      </footer>
    </div>
  );
}

