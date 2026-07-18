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
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function OrganicCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5 }} whileHover={{ y: -4 }}
      className={`rounded-[2rem] border transition-all duration-300 ${className}`}
      style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, ac }: { title: string; subtitle?: string; ac: string }) {
  return (
    <div className="text-center mb-14">
      <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>{subtitle}</motion.span>
      <motion.h2 className="text-3xl sm:text-4xl font-bold mt-2" style={{ color: '#e8f0e8' }}>{title}</motion.h2>
      <motion.div className="mx-auto mt-4 w-16 h-1 rounded-full opacity-60" style={{ backgroundColor: ac }} />
    </div>
  );
}

const textColor = '#e8f0e8';
const subColor = '#8a9a8a';

export default function NatureTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #0a150a 0%, #0f1a0f 30%, #0a150a 100%)' }}>
      {/* Organic background shapes */}
      <motion.div className="fixed top-20 left-10 w-64 h-64 rounded-full pointer-events-none z-0 opacity-[0.03]"
        style={{ background: `radial-gradient(circle, ${ac}, transparent)` }}
        animate={{ scale: [1, 1.5, 1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="fixed bottom-32 right-10 w-80 h-80 rounded-full pointer-events-none z-0 opacity-[0.03]"
        style={{ background: `radial-gradient(circle, ${ac}, transparent)` }}
        animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '50px 50px' }} />

      {/* Navbar */}
      <motion.nav initial={{ y: -60 }} animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-lg border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0a150acc' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: textColor }}>{about?.name || portfolio.title}</span>
          <div className="flex gap-2">
            {['about', 'experience', 'projects', 'contact'].map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ color: ac }}
                className="px-3 py-1.5 text-sm capitalize rounded-full transition-colors" style={{ color: subColor }}>
                {s}
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
          <motion.div className="absolute inset-0 opacity-[0.04]"
            style={{ background: `radial-gradient(ellipse at 50% 100%, ${ac}, transparent)` }}
            animate={{ opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 6, repeat: Infinity }} />
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              className="text-5xl mb-6"></motion.div>
            {hero?.greeting && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="text-xs uppercase tracking-[0.3em] mb-4 font-medium" style={{ color: `${ac}90` }}>
                {hero.greeting}
              </motion.p>
            )}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-5xl sm:text-7xl md:text-8xl font-bold leading-tight mb-6" style={{ color: textColor }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-light mb-10" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.04 }}
                className="px-10 py-4 rounded-[2rem] font-semibold text-white" style={{ backgroundColor: ac }}>
                {hero?.cta_text || 'View My Work'}
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-10 py-4 rounded-[2rem] font-semibold border" style={{ borderColor: `${ac}60`, color: ac }}>
                  Download CV
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-10 py-4 rounded-[2rem] font-semibold border" style={{ borderColor: `${ac}60`, color: ac }}>
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
                <OrganicCard className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    {about.photo_url && (
                      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        <div className="rounded-full overflow-hidden border-2" style={{ borderColor: `${ac}40` }}>
                          <img src={about.photo_url} alt={about.name} className="w-48 h-48 object-cover" />
                        </div>
                      </motion.div>
                    )}
                    <div className="space-y-4 flex-1">
                      <h3 className="text-2xl font-bold" style={{ color: textColor }}>{about.name}</h3>
                      <p className="text-base" style={{ color: ac }}>{about.title}</p>
                      <p className="text-base leading-relaxed" style={{ color: subColor }}>{about.bio}</p>
                    </div>
                  </div>
                </OrganicCard>
              </Section>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Skills" subtitle="My Toolkit" ac={ac} />
              <Section>
                <OrganicCard className="p-8">
                  <div className="space-y-8">
                    {skills.map((skill: any) => (
                      <div key={skill.id}>
                        {skill.title && <h3 className="text-base font-semibold mb-4" style={{ color: textColor }}>{skill.title}</h3>}
                        <div className="flex flex-wrap gap-3">
                          {skill.skills?.split(',').map((s: string) => (
                            <TechBadge key={s} name={s.trim()} accentColor={ac} size="md" variant="pill" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </OrganicCard>
              </Section>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-20 md:py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Experience" subtitle="Journey" ac={ac} />
              <div className="space-y-6">
                {experience.map((exp: any) => (
                  <Section key={exp.id}>
                    <OrganicCard className="p-6 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className="hidden md:flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ac }} />
                          <div className="w-px flex-1 my-1" style={{ backgroundColor: `${ac}30` }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
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
                        </div>
                      </div>
                    </OrganicCard>
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
                    <OrganicCard className="overflow-hidden">
                      {proj.image_url && (
                        <div className="overflow-hidden">
                          <img src={proj.image_url} alt={proj.title} className="w-full h-44 object-cover transition-transform duration-500 hover:scale-105" />
                        </div>
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
                              className="text-xs font-semibold px-4 py-2 rounded-full" style={{ backgroundColor: `${ac}20`, color: ac }}>
                              Live Demo
                            </motion.a>
                          )}
                          {proj.github_url && (
                            <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.04 }}
                              className="text-xs font-semibold px-4 py-2 rounded-full border" style={{ borderColor: `${ac}30`, color: ac }}>
                              Source
                            </motion.a>
                          )}
                        </div>
                      </div>
                    </OrganicCard>
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
                    <OrganicCard className="p-8 text-center">
                      <div className="text-4xl mb-5">{svc.icon || '✦'}</div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>{svc.title}</h3>
                      <p className="text-sm" style={{ color: subColor }}>{svc.description}</p>
                    </OrganicCard>
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
                    <OrganicCard className="p-6">
                      <p className="text-4xl leading-none mb-2" style={{ color: `${ac}30` }}>"</p>
                      <p className="text-sm italic mb-4 leading-relaxed" style={{ color: subColor }}>{t.message}</p>
                      <div className="flex items-center gap-3">
                        {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                        <div>
                          <p className="font-semibold text-sm" style={{ color: textColor }}>{t.name}</p>
                          <p className="text-xs" style={{ color: ac }}>{t.position}</p>
                        </div>
                      </div>
                    </OrganicCard>
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
                    <OrganicCard className="p-5">
                      {(cert.image_url || cert.file_url) && (
                        <div className="w-full h-32 rounded-2xl mb-4 overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                          <img src={cert.image_url || cert.file_url} alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.style.display = 'none' }} />
                        </div>
                      )}
                      <h3 className="font-bold text-base mb-1" style={{ color: textColor }}>{cert.title}</h3>
                      {cert.description && <p className="text-sm mb-2" style={{ color: subColor }}>{cert.description}</p>}
                      {cert.issued_date && <p className="text-xs mb-3" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                      {cert.file_url && (
                        <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.04 }}
                          className="inline-block text-xs font-semibold px-4 py-2 rounded-full" style={{ backgroundColor: `${ac}20`, color: ac }}>
                          View
                        </motion.a>
                      )}
                    </OrganicCard>
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
              {sec.type === 'text' && <Section><OrganicCard className="p-8"><p className="text-base leading-relaxed text-center" style={{ color: subColor }}>{sec.content?.body}</p></OrganicCard></Section>}
              {sec.type === 'list' && (
                <ul className="space-y-3 max-w-2xl mx-auto">
                  {(sec.content?.items || []).map((item: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} className="flex items-start gap-3 text-base" style={{ color: subColor }}>
                      <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: ac }} />{item}
                    </motion.li>
                  ))}
                </ul>
              )}
              {sec.type === 'links' && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {(sec.content?.links || []).map((link: any, i: number) => (
                    <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.04 }}
                      className="px-8 py-3.5 rounded-[2rem] font-semibold text-white" style={{ backgroundColor: ac }}>
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
            <p className="text-base mb-8" style={{ color: subColor }}>I'd love to hear about your project.</p>
            <div className="flex gap-4 justify-center flex-wrap mb-10">
              {(contact?.email || about?.email) && (
                <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-[2rem] font-semibold text-white" style={{ backgroundColor: ac }}>
                  Email Me
                </motion.a>
              )}
              {contact?.phone && (
                <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-[2rem] font-semibold text-white" style={{ backgroundColor: '#25D366' }}>
                  WhatsApp
                </motion.a>
              )}
              {contact?.linkedin_url && (
                <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-[2rem] font-semibold text-white" style={{ backgroundColor: '#0077B5' }}>
                  LinkedIn
                </motion.a>
              )}
              {contact?.github_url && (
                <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-8 py-3.5 rounded-[2rem] font-semibold text-white" style={{ backgroundColor: '#333' }}>
                  GitHub
                </motion.a>
              )}
            </div>
            <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
          </div>
        </section>
      </div>

      <footer className="relative z-10 py-8 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-sm" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title}</p>
        <p className="text-xs mt-1" style={{ color: `${ac}60` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}

