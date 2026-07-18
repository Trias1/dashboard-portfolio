'use client';
import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function ParallaxSection({ children, speed = 0.2, className, id }: { children: React.ReactNode; speed?: number; className?: string; id?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div ref={ref} style={{ y }} id={id} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }} className={className}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, ac }: { title: string; subtitle?: string; ac: string }) {
  return (
    <div className="text-center mb-16">
      <motion.span className="text-xs uppercase tracking-[0.3em] font-light" style={{ color: `${ac}70` }}>{subtitle}</motion.span>
      <motion.h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-3" style={{ color: '#f0f0f5' }}>{title}</motion.h2>
    </div>
  );
}

const textColor = '#f0f0f5';
const subColor = '#9090a8';

export default function ImmersiveTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#08080f' }}>
      {/* Hero  -  fullscreen */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden"
        style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
        <motion.div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${ac}20 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity }} />
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full border" style={{ borderColor: `${ac}15`, width: 200 + i * 100, height: 200 + i * 100 }}
            animate={{ rotate: 360 }} transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }} />
        ))}
        <div className="relative z-10 text-center max-w-5xl px-4">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm uppercase tracking-[0.4em] mb-6 font-light" style={{ color: `${ac}80` }}>
            {hero?.greeting || 'Welcome'}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl sm:text-8xl md:text-9xl font-black leading-none mb-6" style={{ color: textColor }}>
            {hero?.headline || about?.name || portfolio.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-light max-w-2xl mx-auto mb-10" style={{ color: subColor }}>
            {hero?.subheadline || ''}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.05 }}
              className="inline-block px-10 py-4 rounded-full font-medium text-white tracking-wide backdrop-blur-sm border"
              style={{ backgroundColor: `${ac}30`, borderColor: `${ac}60` }}>
              {hero?.cta_text || 'Explore Work'}
            </motion.a>
            {hero?.cta_secondary_text && hero?.cta_secondary_url && (
              <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.05 }}
                className="inline-block px-10 py-4 rounded-full font-medium text-white tracking-wide backdrop-blur-sm border ml-4"
                style={{ backgroundColor: `${ac}30`, borderColor: `${ac}60` }}>
                {hero.cta_secondary_text}
              </motion.a>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: `${ac}40` }}>
            <motion.div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      <div className="relative z-10">
        {/* About */}
        {about?.name && (
          <ParallaxSection speed={0.15} className="py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="About" subtitle="Who I Am" ac={ac} />
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex flex-col md:flex-row gap-12 items-center backdrop-blur-sm rounded-3xl p-8 md:p-12 border" style={{ borderColor: `${ac}15`, backgroundColor: `${ac}06` }}>
                {about.photo_url && (
                  <div className="relative flex-shrink-0">
                    <motion.div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: ac }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity }} />
                    <img src={about.photo_url} alt={about.name} className="w-48 h-48 rounded-full object-cover relative z-10" />
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold" style={{ color: textColor }}>{about.name}</h3>
                  <p className="text-lg font-light" style={{ color: ac }}>{about.title}</p>
                  <p className="text-base leading-relaxed font-light" style={{ color: subColor }}>{about.bio}</p>
                </div>
              </motion.div>
            </div>
          </ParallaxSection>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <ParallaxSection speed={-0.1} className="py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Skills" subtitle="Expertise" ac={ac} />
              <div className="space-y-8">
                {skills.map((skill: any) => (
                  <div key={skill.id}>
                    {skill.title && <h3 className="text-lg font-semibold mb-5" style={{ color: textColor }}>{skill.title}</h3>}
                    <div className="flex flex-wrap gap-3">
                      {skill.skills?.split(',').map((s: string) => (
                        <motion.span key={s} whileHover={{ scale: 1.1, y: -3 }}
                          className="px-4 py-2 rounded-full text-sm backdrop-blur-sm border" style={{ borderColor: `${ac}30`, color: textColor, backgroundColor: `${ac}10` }}>
                          {s.trim()}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ParallaxSection>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <ParallaxSection speed={0.1} className="py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Experience" subtitle="Timeline" ac={ac} />
              <div className="space-y-8">
                {experience.map((exp: any, i: number) => (
                  <motion.div key={exp.id} initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    className={`flex flex-col md:flex-row gap-6 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                    <div className="flex-1">
                      <div className="p-6 md:p-8 rounded-2xl backdrop-blur-sm border" style={{ borderColor: `${ac}15`, backgroundColor: `${ac}06` }}>
                        <span className="text-xs font-light px-3 py-1 rounded-full" style={{ backgroundColor: `${ac}15`, color: ac }}>
                          {exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}
                        </span>
                        <h3 className="text-xl font-bold mt-3 mb-1" style={{ color: textColor }}>{exp.position}</h3>
                        <p className="text-sm font-light mb-3" style={{ color: ac }}>{exp.company}</p>
                        {exp.description && (
                          <div className="text-sm space-y-1.5 font-light" style={{ color: subColor }}>
                            {exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (
                              <div key={si} className="flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ac }} /><span>{s.trim()}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:flex w-16 justify-center">
                      <div className="w-3 h-3 rounded-full mt-8" style={{ backgroundColor: ac, boxShadow: `0 0 20px ${ac}` }} />
                    </div>
                    <div className="flex-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          </ParallaxSection>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <ParallaxSection speed={-0.15} className="py-28 px-4">
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="Projects" subtitle="Featured" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj: any) => (
                  <motion.div key={proj.id} whileHover={{ y: -10, scale: 1.02 }}
                    className="group rounded-2xl overflow-hidden backdrop-blur-sm border" style={{ borderColor: `${ac}15`, backgroundColor: `${ac}06` }}>
                    {proj.image_url && <div className="overflow-hidden"><img src={proj.image_url} alt={proj.title} className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-110" /></div>}
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>{proj.title}</h3>
                      <p className="text-sm mb-4 font-light" style={{ color: subColor }}>{proj.description}</p>
                      {proj.tech_stack && <div className="flex flex-wrap gap-1.5 mb-4">{proj.tech_stack.split(',').map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} />)}</div>}
                      <div className="flex gap-2">
                        {proj.demo_url && <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.05 }} className="text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm border" style={{ borderColor: ac, color: ac }}>Live</motion.a>}
                        {proj.github_url && <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.05 }} className="text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm border" style={{ borderColor: `${ac}30`, color: subColor }}>Code</motion.a>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ParallaxSection>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <ParallaxSection speed={0.1} className="py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Services" subtitle="What I Do" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((svc: any) => (
                  <motion.div key={svc.id} whileHover={{ y: -8 }} className="p-8 rounded-2xl backdrop-blur-sm border text-center" style={{ borderColor: `${ac}15`, backgroundColor: `${ac}06` }}>
                    <div className="text-4xl mb-5">{svc.icon || ''}</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>{svc.title}</h3>
                    <p className="text-sm font-light" style={{ color: subColor }}>{svc.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </ParallaxSection>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <ParallaxSection speed={-0.1} className="py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Testimonials" subtitle="Kind Words" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t: any) => (
                  <div key={t.id} className="p-6 rounded-2xl backdrop-blur-sm border" style={{ borderColor: `${ac}15`, backgroundColor: `${ac}06` }}>
                    <p className="text-4xl font-thin leading-none mb-2" style={{ color: `${ac}30` }}>"</p>
                    <p className="text-sm italic mb-4 font-light" style={{ color: subColor }}>{t.message}</p>
                    <div className="flex items-center gap-3">
                      {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                      <div><p className="font-semibold text-sm" style={{ color: textColor }}>{t.name}</p><p className="text-xs font-light" style={{ color: ac }}>{t.position}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ParallaxSection>
        )}

        {/* Certificate */}
        {gallery?.length > 0 && (
          <ParallaxSection speed={0.1} className="py-28 px-4">
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="Certificates" subtitle="Credentials" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gallery.map((cert: any) => (
                  <div key={cert.id} className="p-5 rounded-2xl backdrop-blur-sm border" style={{ borderColor: `${ac}15`, backgroundColor: `${ac}06` }}>
                    {(cert.image_url || cert.file_url) && (
                      <div className="w-full h-32 rounded-xl mb-4 overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                        <img src={cert.image_url || cert.file_url} alt={cert.title}
                          className="w-full h-full object-cover"
                          onError={(e: any) => { e.target.style.display = 'none' }} />
                      </div>
                    )}
                    <h3 className="font-bold mb-1" style={{ color: textColor }}>{cert.title}</h3>
                    {cert.description && <p className="text-xs mb-2 font-light" style={{ color: subColor }}>{cert.description}</p>}
                    {cert.issued_date && <p className="text-xs mb-3 font-light" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                    {cert.file_url && <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.05 }} className="inline-block text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm border" style={{ borderColor: ac, color: ac }}>View</motion.a>}
                  </div>
                ))}
              </div>
            </div>
          </ParallaxSection>
        )}

        {/* Custom Sections */}
        {custom?.length > 0 && custom.map((sec: any) => (
          <ParallaxSection key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} speed={0.1} className="py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title={sec.title} ac={ac} />
              {sec.type === 'text' && <p className="text-lg text-center font-light max-w-3xl mx-auto" style={{ color: subColor }}>{sec.content?.body}</p>}
              {sec.type === 'list' && <ul className="space-y-3 max-w-2xl mx-auto">{(sec.content?.items || []).map((item: string, i: number) => <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex gap-3 text-sm font-light" style={{ color: subColor }}><span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ac }} />{item}</motion.li>)}</ul>}
              {sec.type === 'links' && <div className="flex flex-wrap gap-4 justify-center">{(sec.content?.links || []).map((link: any, i: number) => <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.05 }} className="px-8 py-3.5 rounded-full font-medium backdrop-blur-sm border" style={{ borderColor: ac, color: ac }}>{link.label}</motion.a>)}</div>}
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
          </ParallaxSection>
        ))}

        {/* Contact */}
        <ParallaxSection speed={-0.1} className="py-28 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <SectionTitle title="Contact" subtitle="Get In Touch" ac={ac} />
            <p className="text-base font-light mb-8" style={{ color: subColor }}>Let's create something amazing together.</p>
            <div className="flex gap-4 justify-center flex-wrap mb-10">
              {(contact?.email || about?.email) && <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.05 }} className="px-8 py-3.5 rounded-full font-medium backdrop-blur-sm border text-white" style={{ backgroundColor: `${ac}40`, borderColor: ac }}>Email</motion.a>}
              {contact?.phone && <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.05 }} className="px-8 py-3.5 rounded-full font-medium backdrop-blur-sm border" style={{ borderColor: '#25D36680', color: '#25D366' }}>WhatsApp</motion.a>}
              {contact?.linkedin_url && <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.05 }} className="px-8 py-3.5 rounded-full font-medium backdrop-blur-sm border" style={{ borderColor: '#0077B580', color: '#0077B5' }}>LinkedIn</motion.a>}
              {contact?.github_url && <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.05 }} className="px-8 py-3.5 rounded-full font-medium backdrop-blur-sm border" style={{ borderColor: '#33333380', color: '#333' }}>GitHub</motion.a>}
            </div>
            <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
          </div>
        </ParallaxSection>
      </div>

      <footer className="py-8 text-center border-t" style={{ borderColor: `${ac}15` }}>
        <p className="text-sm font-light" style={{ color: subColor }}>(c) 2026 {about?.name || portfolio.title}</p>
        <p className="text-xs font-light mt-1" style={{ color: `${ac}60` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}
