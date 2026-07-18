'use client';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';
import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

export default function MinimalTemplate({ data, theme, isPreview }: { data: any, theme: any, isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const isInPreview = typeof window !== 'undefined' && window.location.search.includes('preview=true');
    const ac = theme.accent;
  const isLight = theme.bg === '#ffffff';
  const textColor = isLight ? '#0a0a0a' : '#f9f9f9';
  const subColor = isLight ? '#666' : '#888';
  const borderColor = isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)';
  const cardBg = isLight ? '#fafafa' : 'rgba(255,255,255,0.03)';

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh' }}>

      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 h-0.5 z-50" style={{ width: progressWidth, backgroundColor: ac }} />

      {/* Navbar minimal */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="fixed top-0 w-full z-40 backdrop-blur-sm border-b"
          style={{ backgroundColor: `${theme.bg}dd`, borderColor }}>
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <motion.span className="font-bold text-lg" style={{ color: ac }}
              whileHover={{ scale: 1.05 }}>
              {about?.name?.split(' ')[0] || 'Portfolio'}
            </motion.span>
            <div className="flex gap-6">
              {['About', 'Work', 'Contact'].map((item, i) => (
                <motion.a key={item} href={`#${item.toLowerCase()}`}
                  className="text-sm transition"
                  style={{ color: subColor }}
                  whileHover={{ color: ac, y: -1 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}>
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.nav>

      <div className={`max-w-3xl mx-auto px-6 ${isInPreview ? "pt-44" : "pt-32"} pb-24 space-y-32`}>

        {/* Hero  -  big typography */}
        <section id="about" className="relative overflow-hidden rounded-xl"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <div className="space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}>
              {about?.photo_url && (
                <motion.img src={about.photo_url} alt={about?.name}
                  className="w-20 h-20 rounded-full object-cover mb-8 border-2"
                  style={{ borderColor: ac }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: 'spring' }} />
              )}
            </motion.div>

            <div>
              <motion.p className="text-sm font-medium mb-3 uppercase tracking-widest"
                style={{ color: ac }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                {hero?.subheadline || ''}
              </motion.p>
              <motion.h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-none mb-6"
                style={{ color: textColor }}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
                {hero?.headline || about?.name || portfolio.title}
              </motion.h1>
              <motion.p className="text-lg leading-relaxed max-w-xl"
                style={{ color: subColor }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                {hero?.description || ''}
              </motion.p>
            </div>

            <motion.div className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <motion.a href={hero?.cta_url || '#work'}
                className="px-6 py-3 rounded-full font-medium text-white text-sm"
                style={{ backgroundColor: ac }}
                whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${ac}60` }}
                whileTap={{ scale: 0.95 }}>
                {hero?.cta_text || 'View Work'}
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank"
                  className="px-6 py-3 rounded-full font-medium text-sm border"
                  style={{ borderColor, color: subColor }}
                  whileHover={{ scale: 1.05, borderColor: ac, color: ac }}
                  whileTap={{ scale: 0.95 }}>
                  Download CV
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank"
                  className="px-6 py-3 rounded-full font-medium text-sm border"
                  style={{ borderColor, color: subColor }}
                  whileHover={{ scale: 1.05, borderColor: ac, color: ac }}
                  whileTap={{ scale: 0.95 }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* Skills  -  animated tags */}
        {skills?.length > 0 && (
          <section>
            <FadeIn>
              <p className="text-xs uppercase tracking-widest mb-8 font-medium" style={{ color: ac }}>Skills</p>
              <div className="space-y-6">
                {skills.map((sk: any, si: number) => (
                  <div key={sk.id}>
                    {sk.title && <p className="text-xs mb-3" style={{ color: subColor }}>{sk.title}</p>}
                    <div className="flex flex-wrap gap-2">
                      {sk.skills?.split(',').map((s: string, i: number) => (
                        <motion.div key={s}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.05 }}>
                          <TechBadge name={s.trim()} accentColor={ac} variant="outline" textColor={textColor} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section>
            <FadeIn>
              <p className="text-xs uppercase tracking-widest mb-8 font-medium" style={{ color: ac }}>Experience</p>
              <div className="space-y-10">
                {experience.map((exp: any, i: number) => (
                  <SlideIn key={exp.id} delay={i * 0.1}>
                    <div className="flex gap-6 group">
                      <div className="w-24 flex-shrink-0 pt-1">
                        <p className="text-xs" style={{ color: subColor }}>{exp.start_date?.slice(0,7)}</p>
                        <p className="text-xs" style={{ color: subColor }}> -  {exp.end_date?.slice(0,7) || 'Now'}</p>
                      </div>
                      <div className="flex-1 pb-10 border-b last:border-0" style={{ borderColor }}>
                        <motion.h3 className="font-bold text-lg mb-1 transition" style={{ color: textColor }}
                          whileHover={{ color: ac }}>{exp.position}</motion.h3>
                        <p className="text-sm font-medium mb-2" style={{ color: ac }}>{exp.company}</p>
                        {exp.description && <div className="text-sm space-y-0.5" style={{ color: subColor }}>{(exp.description.split(/[*-]/).filter((s: string) => s.trim()).length > 1 ? exp.description.split(/[*-]/).filter((s: string) => s.trim()) : exp.description.split(/\.\s+(?=[A-Z])/).filter((s: string) => s.trim())).map((s: string, i: number) => (<div key={i} className="flex gap-1.5 mb-1"><span className="mt-0.5 shrink-0">*</span><span>{s.trim()}</span></div>))}</div>}
                      </div>
                    </div>
                  </SlideIn>
                ))}
              </div>
            </FadeIn>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="work">
            <FadeIn>
              <p className="text-xs uppercase tracking-widest mb-8 font-medium" style={{ color: ac }}>Work</p>
              <div className="space-y-6">
                {projects.map((proj: any, i: number) => (
                  <SlideIn key={proj.id} delay={i * 0.1}>
                    <motion.div className="p-6 rounded-2xl border group cursor-pointer"
                      style={{ backgroundColor: cardBg, borderColor }}
                      whileHover={{ borderColor: ac, y: -3, boxShadow: `0 8px 30px ${ac}15` }}
                      transition={{ duration: 0.2 }}>
                      {proj.image_url && (
                        <motion.img src={proj.image_url} alt={proj.title}
                          className="w-full h-40 object-cover rounded-xl mb-4"
                          whileHover={{ scale: 1.01 }} />
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg" style={{ color: textColor }}>{proj.title}</h3>
                        <div className="flex gap-2">
                          {proj.demo_url && (
                            <motion.a href={proj.demo_url} target="_blank"
                              className="text-xs px-3 py-1 rounded-full border"
                              style={{ borderColor, color: subColor }}
                              whileHover={{ borderColor: ac, color: ac }}> Demo</motion.a>
                          )}
                          {proj.github_url && (
                            <motion.a href={proj.github_url} target="_blank"
                              className="text-xs px-3 py-1 rounded-full border"
                              style={{ borderColor, color: subColor }}
                              whileHover={{ borderColor: ac, color: ac }}> Code</motion.a>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mb-4 text-justify" style={{ color: subColor }}>{proj.description}</p>
                      {proj.tech_stack && (
                        <div className="flex flex-wrap gap-2">
                          {proj.tech_stack.split(',').map((t: string) => (
                            <TechBadge key={t} name={t.trim()} accentColor={ac} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </SlideIn>
                ))}
              </div>
            </FadeIn>
          </section>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <section>
            <FadeIn>
              <p className="text-xs uppercase tracking-widest mb-8 font-medium" style={{ color: ac }}>Services</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((svc: any, i: number) => (
                  <motion.div key={svc.id}
                    className="p-6 rounded-2xl border"
                    style={{ backgroundColor: cardBg, borderColor }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ borderColor: ac, y: -4 }}>
                    <motion.div className="text-3xl mb-3"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: 'spring' }}>{svc.icon || ''}</motion.div>
                    <h3 className="font-bold mb-1 text-sm" style={{ color: textColor }}>{svc.title}</h3>
                    <p className="text-xs text-justify" style={{ color: subColor }}>{svc.description}</p>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </section>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <section>
            <FadeIn>
              <p className="text-xs uppercase tracking-widest mb-8 font-medium" style={{ color: ac }}>Kind Words</p>
              <div className="space-y-6">
                {testimonials.map((tm: any, i: number) => (
                  <motion.div key={tm.id}
                    className="p-6 rounded-2xl border"
                    style={{ backgroundColor: cardBg, borderColor }}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ borderColor: ac }}>
                    <motion.p className="text-lg italic mb-6 leading-relaxed"
                      style={{ color: textColor }}>
                      "{tm.message}"
                    </motion.p>
                    <div className="flex items-center gap-3">
                      {tm.photo_url && (
                        <motion.img src={tm.photo_url} alt={tm.name}
                          className="w-10 h-10 rounded-full object-cover"
                          whileHover={{ scale: 1.1 }} />
                      )}
                      <div>
                        <p className="font-bold text-sm" style={{ color: textColor }}>{tm.name}</p>
                        <p className="text-xs" style={{ color: ac }}>{tm.position}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </section>
        )}

        {/* Custom Sections */}
        {custom?.length > 0 && custom.map((sec: any, si: number) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`}>
            <FadeIn>
              <p className="text-xs uppercase tracking-widest mb-8 font-medium" style={{ color: ac }}>{sec.title}</p>
              {sec.type === 'text' && (
                <p className="text-lg leading-relaxed" style={{ color: subColor }}>{sec.content?.body}</p>
              )}
              {sec.type === 'list' && (
                <ul className="space-y-3">
                  {(sec.content?.items || []).map((item: string, i: number) => (
                    <motion.li key={i} className="flex items-start gap-3 text-sm pb-3 border-b last:border-0"
                      style={{ color: subColor, borderColor }}
                      initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}>
                      <span style={{ color: ac }}></span>{item}
                    </motion.li>
                  ))}
                </ul>
              )}
              {sec.type === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(sec.content?.cards || []).map((card: any, i: number) => (
                    <motion.div key={i} className="p-6 rounded-2xl border"
                      style={{ backgroundColor: cardBg, borderColor }}
                      whileHover={{ borderColor: ac, y: -3 }}>
                      {card.icon && <div className="text-2xl mb-2">{card.icon}</div>}
                      <h3 className="font-bold mb-1" style={{ color: textColor }}>{card.title}</h3>
                      <p className="text-sm" style={{ color: subColor }}>{card.desc}</p>
                    </motion.div>
                  ))}
                </div>
              )}
              {sec.type === 'links' && (
                <div className="flex flex-wrap gap-3">
                  {(sec.content?.links || []).map((link: any, i: number) => (
                    <motion.a key={i} href={link.url} target="_blank"
                      className="px-5 py-2.5 rounded-full text-sm font-medium border"
                      style={{ borderColor, color: subColor }}
                      whileHover={{ borderColor: ac, color: ac }}>
                      {link.label}
                    </motion.a>
                  ))}
                </div>
              )}
              {!['text','list','cards','links'].includes(sec.type) && sec.content && (
                <div className="space-y-4">
                  {(() => {
                    if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(sec.content?.items)) {
                      return <CertificationSection items={sec.content?.items} textColor={textColor} subTextColor={subColor} accentColor={ac} cardBg={cardBg} />;
                    }
                    const c = sec.content;
                    if (c.institution || c.degree || c.field) {
                      return (
                        <div className="p-6 rounded-2xl border" style={{background: cardBg, borderColor: typeof borderColor === 'string' ? borderColor : 'rgba(255,255,255,0.08)'}}>
                          {c.institution && <p className="text-lg font-semibold" style={{color: textColor}}>{c.institution}</p>}
                          {(c.degree || c.field) && <p className="text-sm mt-1" style={{color: subColor}}>{[c.degree, c.field].filter(Boolean).join('  -  ')}</p>}
                          {(c.start_date || c.end_date) && <p className="text-xs mt-1" style={{color: subColor}}>{[c.start_date?.slice(0,7), c.end_date?.slice(0,7)].filter(Boolean).join(' - ')}</p>}
                          {c.gpa && <p className="text-xs mt-1" style={{color: subColor}}>GPA: {c.gpa}</p>}
                        </div>
                      );
                    }
                    if (c.name || c.issuer) {
                      return (
                        <div className="p-6 rounded-2xl border" style={{background: cardBg, borderColor: typeof borderColor === 'string' ? borderColor : 'rgba(255,255,255,0.08)'}}>
                          {c.name && <p className="text-lg font-semibold" style={{color: textColor}}>{c.name}</p>}
                          {c.issuer && <p className="text-sm mt-1" style={{color: subColor}}>{c.issuer}</p>}
                          {c.date && <p className="text-xs mt-1" style={{color: subColor}}>{c.date}</p>}
                          {c.credential_url && <a href={c.credential_url} target="_blank" className="text-sm underline mt-2 inline-block" style={{color: ac}}>View credential</a>}
                        </div>
                      );
                    }
                    if (c.language) {
                      return (
                        <div className="flex items-center gap-3 p-6 rounded-2xl border" style={{background: cardBg, borderColor: typeof borderColor === 'string' ? borderColor : 'rgba(255,255,255,0.08)'}}>
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
            </FadeIn>
          </section>
        ))}

        {/* Certificates */}
        {gallery?.length > 0 && (
          <section>
            <FadeIn>
              <p className="text-xs uppercase tracking-widest mb-8 font-medium" style={{ color: ac }}>Certificates</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gallery.map((cert: any, i: number) => (
                  <SlideIn key={cert.id} delay={i * 0.1}>
                    <motion.div className="p-6 rounded-2xl border group"
                      style={{ backgroundColor: cardBg, borderColor }}
                      whileHover={{ borderColor: ac, y: -3, boxShadow: `0 8px 30px ${ac}15` }}
                      transition={{ duration: 0.2 }}>
                      {(cert.image_url || cert.file_url) && (
                        <div className="w-full h-36 rounded-xl mb-3 overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                          <img src={cert.image_url || cert.file_url} alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.style.display = 'none' }} />
                        </div>
                      )}
                      <h3 className="font-bold text-base mb-1" style={{ color: textColor }}>{cert.title}</h3>
                      {cert.description && <p className="text-sm mb-2" style={{ color: subColor }}>{cert.description}</p>}
                      {cert.issued_date && (
                        <p className="text-xs mb-3" style={{ color: ac }}>
                           {new Date(cert.issued_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {cert.file_url && (
                        <motion.a href={cert.file_url} target="_blank"
                          className="inline-block text-xs px-3 py-1.5 rounded-full border font-medium transition"
                          style={{ borderColor, color: subColor }}
                          whileHover={{ borderColor: ac, color: ac }}>
                           Lihat Certificate
                        </motion.a>
                      )}
                    </motion.div>
                  </SlideIn>
                ))}
              </div>
            </FadeIn>
          </section>
        )}

        {/* Contact */}
        <section id="contact">
          <FadeIn>
            <div className="text-center space-y-6 py-12">
              <motion.p className="text-xs uppercase tracking-widest font-medium" style={{ color: ac }}
                animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                Available for work
              </motion.p>
              <motion.h2 className="text-3xl md:text-6xl font-bold" style={{ color: textColor }}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
                Let's talk.
              </motion.h2>
              {(contact?.email || about?.email) && (
                <motion.a href={`mailto:${contact?.email || about?.email}`}
                  className="inline-block text-xl font-medium border-b-2 pb-1 transition"
                  style={{ color: textColor, borderColor: ac }}
                  whileHover={{ color: ac, scale: 1.02 }}>
                  {contact?.email || about?.email}
                </motion.a>
              )}
              {contact?.phone && (
                <motion.a
                  href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(about?.name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white text-sm mt-2"
                    style={{ backgroundColor: '#25D366' }}
                    whileHover={{ scale: 1.05 }}>
                     Chat WhatsApp
                  </motion.a>
                )}
                {contact?.linkedin_url && (
                  <motion.a href={contact.linkedin_url} target="_blank"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white text-sm mt-2"
                    style={{ backgroundColor: '#0077B5' }}
                    whileHover={{ scale: 1.05 }}>
                     LinkedIn
                  </motion.a>
                )}
                {contact?.github_url && (
                  <motion.a href={contact.github_url} target="_blank"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white text-sm mt-2"
                    style={{ backgroundColor: '#333' }}
                    whileHover={{ scale: 1.05 }}>
                     GitHub
                  </motion.a>
                )}
              {contact?.phone && (
                <p className="text-sm" style={{ color: subColor }}>{contact.phone}</p>
              )}
              <div className="pt-8">
                <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
              </div>
            </div>
          </FadeIn>
        </section>

      </div>

      <footer className="border-t text-center py-6 text-xs" style={{ borderColor, color: subColor }}>
        (c) 2026 {about?.name || portfolio.title}. Built with 
        <p className="mt-1" style={{ color: `${ac}60` }}>Made with PortfolioKit</p>
      </footer>
      </div>
  );
}

