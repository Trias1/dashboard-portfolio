'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={`backdrop-blur-xl border border-white/10 rounded-2xl ${className}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.04)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, ac }: { title: string; subtitle?: string; ac: string }) {
  return (
    <div className="text-center mb-14">
      <motion.span className="text-xs uppercase tracking-[0.25em] font-light" style={{ color: `${ac}80` }}>{subtitle}</motion.span>
      <motion.h2 className="text-3xl sm:text-4xl font-light mt-2" style={{ color: '#f0f0f5' }}>{title}</motion.h2>
      <motion.div className="mx-auto mt-4 w-12 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${ac}, transparent)` }} />
    </div>
  );
}

const textColor = '#f0f0f5';
const subColor = '#a0a0b8';

export default function GlassTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 30%, #0d1a2e 60%, #0d0d1a 100%)' }}>
      {/* Animated gradient blobs */}
      <motion.div className="fixed top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0"
        style={{ background: `${ac}20` }} animate={{ scale: [1, 1.3, 1], x: [0, 60, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="fixed bottom-1/4 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0"
        style={{ background: `${ac}15` }} animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Navbar */}
      <motion.nav initial={{ y: -60 }} animate={{ y: 0 }} transition={{ duration: 0.4 }}
        className="fixed top-0 w-full z-50 backdrop-blur-2xl border-b border-white/[0.06]"
        style={{ backgroundColor: 'rgba(13,13,26,0.7)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight" style={{ color: textColor }}>{about?.name || portfolio.title}</span>
          <div className="flex gap-1">
            {['about', 'experience', 'projects', 'contact'].map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                className="px-4 py-2 text-sm font-light capitalize rounded-xl transition-colors" style={{ color: subColor }}>
                {s}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      <div className="relative z-10" style={{ paddingTop: '5rem' }}>
        {/* Hero */}
        <section id="hero" className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <motion.div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-block px-5 py-2 backdrop-blur-xl rounded-full text-xs font-light tracking-widest mb-6 border border-white/10"
              style={{ color: ac, backgroundColor: `${ac}15` }}>
              {hero?.greeting || 'Welcome'}
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
              className="text-5xl sm:text-7xl md:text-8xl font-light leading-tight mb-6" style={{ color: textColor }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-light mb-10" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.03 }}
                className="px-10 py-4 rounded-xl font-medium text-white backdrop-blur-xl border border-white/20"
                style={{ backgroundColor: `${ac}40` }}>
                {hero?.cta_text || 'View Work'}
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.03 }}
                  className="px-10 py-4 rounded-xl font-medium backdrop-blur-xl border border-white/20" style={{ color: textColor }}>
                  Download CV
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.03 }}
                  className="px-10 py-4 rounded-xl font-medium backdrop-blur-xl border border-white/20" style={{ color: textColor }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="About Me" subtitle="Who I Am" ac={ac} />
              <GlassCard className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  {about.photo_url && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full blur-xl opacity-40" style={{ background: ac }} />
                        <img src={about.photo_url} alt={about.name} className="w-48 h-48 rounded-full object-cover relative z-10" />
                      </div>
                    </motion.div>
                  )}
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-semibold" style={{ color: textColor }}>{about.name}</h3>
                    <p className="text-sm font-light" style={{ color: ac }}>{about.title}</p>
                    <p className="text-sm leading-relaxed font-light" style={{ color: subColor }}>{about.bio}</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Skills & Tools" subtitle="Expertise" ac={ac} />
              <GlassCard className="p-8">
                <div className="space-y-8">
                  {skills.map((skill: any) => (
                    <div key={skill.id}>
                      {skill.title && <h3 className="text-base font-medium mb-4" style={{ color: textColor }}>{skill.title}</h3>}
                      <div className="flex flex-wrap gap-3">
                        {skill.skills?.split(',').map((s: string) => (
                          <TechBadge key={s} name={s.trim()} accentColor={ac} size="md" variant="outline" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-20 md:py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Experience" subtitle="Career" ac={ac} />
              <div className="space-y-6">
                {experience.map((exp: any) => (
                  <GlassCard key={exp.id} className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="text-lg font-semibold" style={{ color: textColor }}>{exp.position}</h3>
                      <span className="text-xs font-light px-3 py-1 backdrop-blur-sm rounded-lg border border-white/10"
                        style={{ color: ac, backgroundColor: `${ac}10` }}>
                        {exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}
                      </span>
                    </div>
                    <p className="text-sm font-light mb-3" style={{ color: ac }}>{exp.company}</p>
                    {exp.description && (
                      <div className="text-sm space-y-1.5 font-light" style={{ color: subColor }}>
                        {exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, i: number) => (
                          <div key={i} className="flex gap-2">
                            <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full" style={{ backgroundColor: ac }} />
                            <span>{s.trim()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
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
                {projects.map((proj: any) => (
                  <GlassCard key={proj.id} className="overflow-hidden">
                    {proj.image_url && <img src={proj.image_url} alt={proj.title} className="w-full h-44 object-cover" />}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>{proj.title}</h3>
                      <p className="text-sm font-light mb-4 leading-relaxed" style={{ color: subColor }}>{proj.description}</p>
                      {proj.tech_stack && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {proj.tech_stack.split(',').map((t: string) => (
                            <TechBadge key={t} name={t.trim()} accentColor={ac} />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {proj.demo_url && (
                          <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.03 }}
                            className="text-xs font-medium px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20"
                            style={{ backgroundColor: `${ac}30`, color: textColor }}>
                            Live Demo
                          </motion.a>
                        )}
                        {proj.github_url && (
                          <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.03 }}
                            className="text-xs font-medium px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20" style={{ color: subColor }}>
                            Source
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </GlassCard>
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
                  <GlassCard key={svc.id} className="p-8 text-center">
                    <div className="text-4xl mb-5 opacity-70">{svc.icon || ''}</div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>{svc.title}</h3>
                    <p className="text-sm font-light" style={{ color: subColor }}>{svc.description}</p>
                  </GlassCard>
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
                  <GlassCard key={t.id} className="p-6">
                    <p className="text-4xl font-thin leading-none mb-2 opacity-30" style={{ color: ac }}>"</p>
                    <p className="text-sm font-light italic mb-4 leading-relaxed" style={{ color: subColor }}>{t.message}</p>
                    <div className="flex items-center gap-3">
                      {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                      <div>
                        <p className="font-medium text-sm" style={{ color: textColor }}>{t.name}</p>
                        <p className="text-xs font-light" style={{ color: ac }}>{t.position}</p>
                      </div>
                    </div>
                  </GlassCard>
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
                  <GlassCard key={cert.id} className="p-6">
                    {(cert.image_url || cert.file_url) && (
                      <div className="w-full h-32 rounded-xl mb-4 overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                        <img src={cert.image_url || cert.file_url} alt={cert.title}
                          className="w-full h-full object-cover"
                          onError={(e: any) => { e.target.style.display = 'none' }} />
                      </div>
                    )}
                    <h3 className="text-base font-semibold mb-1" style={{ color: textColor }}>{cert.title}</h3>
                    {cert.description && <p className="text-xs font-light mb-2" style={{ color: subColor }}>{cert.description}</p>}
                    {cert.issued_date && <p className="text-xs mb-3 font-light" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                    {cert.file_url && (
                      <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.03 }}
                        className="inline-block text-xs font-medium px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20" style={{ color: ac }}>
                        View Certificate
                      </motion.a>
                    )}
                  </GlassCard>
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
              {sec.type === 'text' && <GlassCard className="p-8"><p className="text-base font-light leading-relaxed text-center" style={{ color: subColor }}>{sec.content?.body}</p></GlassCard>}
              {sec.type === 'list' && (
                <ul className="space-y-3 max-w-2xl mx-auto">
                  {(sec.content?.items || []).map((item: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 text-sm font-light" style={{ color: subColor }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ac }} />{item}
                    </motion.li>
                  ))}
                </ul>
              )}
              {sec.type === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(sec.content?.cards || []).map((card: any, i: number) => (
                    <GlassCard key={i} className="p-6 text-center">
                      {card.icon && <div className="text-3xl mb-3 opacity-70">{card.icon}</div>}
                      <h3 className="font-semibold text-lg mb-2" style={{ color: textColor }}>{card.title}</h3>
                      <p className="text-sm font-light" style={{ color: subColor }}>{card.desc}</p>
                    </GlassCard>
                  ))}
                </div>
              )}
              {sec.type === 'links' && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {(sec.content?.links || []).map((link: any, i: number) => (
                    <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.03 }}
                      className="px-8 py-3.5 rounded-xl font-medium backdrop-blur-xl border border-white/20 text-white"
                      style={{ backgroundColor: `${ac}50` }}>
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
            <SectionTitle title="Get In Touch" subtitle="Contact" ac={ac} />
            <p className="text-sm font-light mb-8" style={{ color: subColor }}>I'm always open to new projects and collaborations.</p>
            <div className="flex gap-4 justify-center flex-wrap mb-10">
              {(contact?.email || about?.email) && (
                <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.03 }}
                  className="px-8 py-3.5 rounded-xl font-medium backdrop-blur-xl border border-white/20 text-white"
                  style={{ backgroundColor: `${ac}50` }}>
                  Email Me
                </motion.a>
              )}
              {contact?.phone && (
                <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.03 }}
                  className="px-8 py-3.5 rounded-xl font-medium backdrop-blur-xl border border-white/20 text-white"
                    style={{ backgroundColor: '#25D36680' }}>
                    WhatsApp
                  </motion.a>
                )}
                {contact?.linkedin_url && (
                  <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.03 }}
                    className="px-8 py-3.5 rounded-xl font-medium backdrop-blur-xl border border-white/20 text-white"
                    style={{ backgroundColor: '#0077B580' }}>
                    LinkedIn
                  </motion.a>
                )}
                {contact?.github_url && (
                  <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.03 }}
                    className="px-8 py-3.5 rounded-xl font-medium backdrop-blur-xl border border-white/20 text-white"
                    style={{ backgroundColor: '#33333380' }}>
                    GitHub
                  </motion.a>
                )}
              </div>
            <GlassCard className="p-6">
              <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
            </GlassCard>
          </div>
        </section>
      </div>

      <footer className="relative z-10 py-8 text-center border-t border-white/[0.06] backdrop-blur-2xl" style={{ backgroundColor: 'rgba(13,13,26,0.5)' }}>
        <p className="text-sm font-light" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title}</p>
        <p className="text-xs font-light mt-1" style={{ color: `${ac}70` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}
