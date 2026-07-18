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
      transition={{ duration: 0.5, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.4 }} whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
      className={`bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm ${className}`}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, ac }: { title: string; subtitle?: string; ac: string }) {
  return (
    <div className="text-center mb-14">
      <motion.span className="text-xs uppercase tracking-[0.25em] font-medium" style={{ color: `${ac}90` }}>{subtitle}</motion.span>
      <motion.h2 className="text-3xl sm:text-4xl font-bold mt-2" style={{ color: '#f1f5f9' }}>{title}</motion.h2>
      <motion.div className="mx-auto mt-4 w-16 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${ac}, transparent)` }} />
    </div>
  );
}

export default function ClassicTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;
  const textColor = '#f1f5f9';
  const subColor = '#94a3b8';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0b0b1a 0%, #0f0f2a 50%, #0b0b1a 100%)' }}>
      {/* Navbar */}
      <motion.nav initial={{ y: -60 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}
        className="fixed top-0 w-full z-50 backdrop-blur-lg border-b" style={{ borderColor: `${ac}15`, backgroundColor: '#0b0b1acc' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: textColor }}>{about?.name || portfolio.title}</span>
          <div className="flex gap-1">
            {['about', 'experience', 'projects', 'skills', 'contact'].map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ color: ac }}
                className="px-3 py-1.5 text-sm font-medium capitalize rounded-lg transition-colors" style={{ color: subColor }}>
                {s}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      <div style={{ paddingTop: '4rem' }}>
        {/* Hero */}
        <section id="hero" className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${ac}10 0%, transparent 60%)` }} />
          <motion.div className="absolute top-20 left-10 w-72 h-72 border border-white/5 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute bottom-20 right-10 w-48 h-48 border border-white/5 rounded-full" animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6" style={{ color: textColor }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-light mb-8" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.04 }}
                className="px-8 py-3.5 rounded-xl font-semibold text-white" style={{ backgroundColor: ac }}>
                {hero?.cta_text || 'View My Work'}
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-xl font-semibold border" style={{ borderColor: `${ac}50`, color: ac }}>
                  Download CV
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-xl font-semibold border" style={{ borderColor: `${ac}50`, color: ac }}>
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
              <Section>
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  {about.photo_url && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                      <img src={about.photo_url} alt={about.name} className="w-52 h-52 rounded-full object-cover border-2" style={{ borderColor: `${ac}40` }} />
                    </motion.div>
                  )}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold" style={{ color: textColor }}>{about.name}</h3>
                    <p className="text-base" style={{ color: ac }}>{about.title}</p>
                    <p className="text-base leading-relaxed" style={{ color: subColor }}>{about.bio}</p>
                  </div>
                </div>
              </Section>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Skills" subtitle="My Expertise" ac={ac} />
              <div className="space-y-8">
                {skills.map((skill: any) => (
                  <Section key={skill.id}>
                    {skill.title && <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>{skill.title}</h3>}
                    <div className="flex flex-wrap gap-2.5">
                      {skill.skills?.split(',').map((s: string) => (
                        <TechBadge key={s} name={s.trim()} accentColor={ac} size="md" variant="pill" />
                      ))}
                    </div>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-20 md:py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Experience" subtitle="Career Journey" ac={ac} />
              <div className="space-y-6">
                {experience.map((exp: any) => (
                  <Section key={exp.id}>
                    <Card className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="text-lg font-bold" style={{ color: textColor }}>{exp.position}</h3>
                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${ac}15`, color: ac }}>
                          {exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-3" style={{ color: ac }}>{exp.company}</p>
                      {exp.description && (
                        <div className="text-sm space-y-1.5" style={{ color: subColor }}>
                          {exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, i: number) => (
                            <div key={i} className="flex gap-2">
                              <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} />
                              <span>{s.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="projects" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="Projects" subtitle="Featured Work" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj: any) => (
                  <Section key={proj.id}>
                    <Card className="overflow-hidden">
                      {proj.image_url && (
                        <img src={proj.image_url} alt={proj.title} className="w-full h-44 object-cover" />
                      )}
                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>{proj.title}</h3>
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
                            <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.04 }}
                              className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ backgroundColor: `${ac}18`, color: ac }}>
                              Live Demo
                            </motion.a>
                          )}
                          {proj.github_url && (
                            <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.04 }}
                              className="text-xs font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: `${ac}30`, color: ac }}>
                              Source
                            </motion.a>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <section id="services" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Services" subtitle="What I Offer" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc: any) => (
                  <Section key={svc.id}>
                    <Card className="p-6 text-center">
                      <div className="text-3xl mb-4">{svc.icon || ''}</div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>{svc.title}</h3>
                      <p className="text-sm" style={{ color: subColor }}>{svc.description}</p>
                    </Card>
                  </Section>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <section id="testimonials" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Testimonials" subtitle="Kind Words" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t: any) => (
                  <Section key={t.id}>
                    <Card className="p-6">
                      <p className="text-4xl leading-none mb-2" style={{ color: `${ac}30` }}>"</p>
                      <p className="text-sm italic mb-4 leading-relaxed" style={{ color: subColor }}>{t.message}</p>
                      <div className="flex items-center gap-3">
                        {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                        <div>
                          <p className="font-semibold text-sm" style={{ color: textColor }}>{t.name}</p>
                          <p className="text-xs" style={{ color: ac }}>{t.position}</p>
                        </div>
                      </div>
                    </Card>
                  </Section>
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
                  <Section key={cert.id}>
                    <Card className="p-5">
                      {(cert.image_url || cert.file_url) && (
                        <div className="w-full h-32 rounded-lg mb-4 overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                          <img src={cert.image_url || cert.file_url} alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.style.display = 'none' }} />
                        </div>
                      )}
                      <h3 className="text-base font-bold mb-1" style={{ color: textColor }}>{cert.title}</h3>
                      {cert.description && <p className="text-sm mb-2" style={{ color: subColor }}>{cert.description}</p>}
                      {cert.issued_date && <p className="text-xs mb-3" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                      {cert.file_url && (
                        <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.04 }}
                          className="inline-block text-xs font-semibold px-4 py-2 rounded-lg" style={{ backgroundColor: `${ac}18`, color: ac }}>
                          View Certificate
                        </motion.a>
                      )}
                    </Card>
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
              {sec.type === 'text' && (
                <Section><p className="text-lg leading-relaxed text-center max-w-3xl mx-auto" style={{ color: subColor }}>{sec.content?.body}</p></Section>
              )}
              {sec.type === 'list' && (
                <ul className="space-y-3 max-w-2xl mx-auto">
                  {(sec.content?.items || []).map((item: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 text-base" style={{ color: subColor }}>
                      <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: ac }} />{item}
                    </motion.li>
                  ))}
                </ul>
              )}
              {sec.type === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(sec.content?.cards || []).map((card: any, i: number) => (
                    <Section key={i}><Card className="p-6 text-center">
                      {card.icon && <div className="text-3xl mb-3">{card.icon}</div>}
                      <h3 className="font-bold text-lg mb-2" style={{ color: textColor }}>{card.title}</h3>
                      <p className="text-sm" style={{ color: subColor }}>{card.desc}</p>
                    </Card></Section>
                  ))}
                </div>
              )}
              {sec.type === 'links' && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {(sec.content?.links || []).map((link: any, i: number) => (
                    <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.04 }}
                      className="px-8 py-3.5 rounded-xl font-semibold text-white" style={{ backgroundColor: ac }}>
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
        <section id="contact" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
          <div className="max-w-3xl mx-auto text-center">
            <SectionTitle title="Get In Touch" subtitle="Contact" ac={ac} />
            <p className="text-base mb-8" style={{ color: subColor }}>Have a project or just want to say hi? I'd love to hear from you.</p>
            <div className="flex gap-4 justify-center flex-wrap mb-10">
              {(contact?.email || about?.email) && (
                <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-xl font-semibold text-white" style={{ backgroundColor: ac }}>
                  Email Me
                </motion.a>
              )}
              {contact?.phone && (
                <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-xl font-semibold text-white" style={{ backgroundColor: '#25D366' }}>
                  WhatsApp
                </motion.a>
              )}
              {contact?.linkedin_url && (
                <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-xl font-semibold text-white" style={{ backgroundColor: '#0077B5' }}>
                  LinkedIn
                </motion.a>
              )}
              {contact?.github_url && (
                <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-xl font-semibold text-white" style={{ backgroundColor: '#333' }}>
                  GitHub
                </motion.a>
              )}
            </div>
            <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
          </div>
        </section>
      </div>

      <footer className="py-8 text-center border-t" style={{ borderColor: `${ac}15` }}>
        <p className="text-sm" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title}. All rights reserved.</p>
        <p className="text-xs mt-1" style={{ color: `${ac}60` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}
