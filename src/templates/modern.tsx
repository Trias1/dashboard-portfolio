'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { themes } from '@/lib/sections';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } }
};
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

function AnimatedSection({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

export default function ModernTemplate({ data, theme: initialTheme, isPreview }: { data: any, theme: any, isPreview?: boolean }) {
  const [theme, setTheme] = useState(initialTheme || themes[0]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isInPreview, setIsInPreview] = useState(false);
  useEffect(() => {
    const inIframe = window.self !== window.top;
    const hasPreview = window.location.search.includes('preview=true');
    setIsInPreview(inIframe || hasPreview);
  }, []);
  const searchParams = useSearchParams();
  const hiddenSections = (searchParams.get('hidden') || '').split(',').filter(Boolean);
  const isVisible = (type: string) => !hiddenSections.includes(type);

  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const accentColor = theme.accent;
  const isLight = theme.bg === '#ffffff';
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const subTextColor = isLight ? 'text-gray-600' : 'text-gray-400';
  const cardBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10';

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', scrollPaddingTop: '5rem' }}>
      <motion.div className="fixed top-0 left-0 h-1 z-[100]" style={{ width: progressWidth, backgroundColor: accentColor }} />

      {/* Navbar */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b" style={{ borderColor: `${accentColor}20`, backgroundColor: `${theme.bg}cc` }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: accentColor }}>{about?.name || portfolio.title}</span>
          {/* Desktop nav */}
          <div className="hidden md:flex gap-6">
            {['about','experience','projects','services','contact'].map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ scale: 1.1, color: accentColor }}
                className={`text-sm capitalize transition ${subTextColor}`}>{s}</motion.a>
            ))}
          </div>
          {/* Hamburger mobile */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden flex flex-col gap-1.5 p-2">
            <span className="w-6 h-0.5 block transition-all" style={{ backgroundColor: accentColor }} />
            <span className="w-6 h-0.5 block transition-all" style={{ backgroundColor: accentColor }} />
            <span className="w-6 h-0.5 block transition-all" style={{ backgroundColor: accentColor }} />
          </button>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenu && (
          <div className="md:hidden border-t px-4 py-3 flex flex-col gap-3" style={{ borderColor: `${accentColor}20`, backgroundColor: `${theme.bg}ee` }}>
            {['about','experience','projects','services','contact'].map(s => (
              <a key={s} href={`#${s}`} onClick={() => setMobileMenu(false)}
                className={`text-sm capitalize py-1 ${subTextColor}`}
                style={{ borderBottom: `1px solid ${accentColor}15` }}>{s}</a>
            ))}
          </div>
        )}
      </motion.nav>

      <div style={{ paddingTop: "4rem" }}>
        {/* Hero */}
        <section id="hero" className="min-h-screen flex items-center justify-center text-center px-4 relative overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <motion.div className="absolute inset-0 opacity-30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ background: `radial-gradient(ellipse at center, ${accentColor} 0%, transparent 65%)` }} />
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute w-2 h-2 rounded-full opacity-40"
              style={{ backgroundColor: accentColor, left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 20}%` }}
              animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }} />
          ))}
          <div className="relative z-10 max-w-4xl mx-auto">
            {hero?.greeting && (
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-lg mb-4" style={{ color: accentColor }}>{hero.greeting}</motion.p>
            )}
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
              className={`text-4xl sm:text-6xl md:text-8xl font-bold mb-4 ${textColor}`}
              style={{ textShadow: `0 0 60px ${accentColor}40` }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="text-xl md:text-3xl mb-6" style={{ color: accentColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${accentColor}60` }}
                className="px-8 py-3 rounded-full font-semibold text-white" style={{ backgroundColor: accentColor }}>
                {hero?.cta_text || 'View My Work'}
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.05 }}
                  className={`px-8 py-3 rounded-full font-semibold border ${textColor}`} style={{ borderColor: accentColor }}>
                  Download CV
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.05 }}
                  className={`px-8 py-3 rounded-full font-semibold border ${textColor}`} style={{ borderColor: accentColor }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>
          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div className="w-6 h-10 border-2 rounded-full flex justify-center pt-2" style={{ borderColor: `${accentColor}60` }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }}
                animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </div>
          </motion.div>
        </section>

        {/* About */}
        {isVisible('about') && about?.name && (
          <section id="about" className="py-16 md:py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-16 text-center ${textColor}`}>
                  About <span style={{ color: accentColor }}>Me</span>
                </motion.h2>
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                  {about.photo_url && (
                    <motion.img src={about.photo_url} alt={about.name} variants={fadeUp}
                      className="w-48 h-48 rounded-full object-cover border-4 flex-shrink-0" style={{ borderColor: accentColor }} />
                  )}
                  <div>
                    <motion.h3 variants={fadeUp} className={`text-2xl font-bold mb-2 ${textColor}`}>{about.name}</motion.h3>
                    <motion.p variants={fadeUp} className="text-lg mb-4" style={{ color: accentColor }}>{about.title}</motion.p>
                    <motion.p variants={fadeUp} className={`${subTextColor} text-justify`}>{about.bio}</motion.p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Skills */}
        {isVisible('skills') && skills?.length > 0 && (
          <section id="skills" className="py-16 md:py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-16 text-center ${textColor}`}>
                  My <span style={{ color: accentColor }}>Skills</span>
                </motion.h2>
                {skills.map((skill: any) => (
                  <motion.div key={skill.id} variants={fadeUp} className="mb-8">
                    {skill.title && <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>{skill.title}</h3>}
                    <div className="flex flex-wrap gap-3">
                      {skill.skills?.split(',').map((s: string, i: number) => (
                        <motion.span key={s} whileHover={{ scale: 1.1 }} transition={{ delay: i * 0.05 }}>
                          <TechBadge name={s.trim()} accentColor={accentColor} size="md" variant="filled" />
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Experience */}
        {isVisible('experience') && experience?.length > 0 && (
          <section id="experience" className="py-16 md:py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-16 text-center ${textColor}`}>
                  Work <span style={{ color: accentColor }}>Experience</span>
                </motion.h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: `${accentColor}30` }} />
                  <div className="space-y-8 pl-12">
                    {experience.map((exp: any, i: number) => (
                      <motion.div key={exp.id} variants={fadeUp} whileHover={{ x: 8 }}
                        className={`relative p-6 rounded-2xl border ${cardBg}`}>
                        <motion.div className="absolute -left-9 w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: accentColor }}
                          initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: i * 0.1 }} />
                        <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                          <div>
                            <h3 className={`text-xl font-bold ${textColor}`}>{exp.position}</h3>
                            <p style={{ color: accentColor }}>{exp.company}</p>
                          </div>
                          <span className={`text-sm ${subTextColor}`}>
                            {exp.start_date?.slice(0,7)}  -  {exp.end_date?.slice(0,7) || 'Present'}
                          </span>
                        </div>
                        {exp.description && <div className={`text-sm ${subTextColor} space-y-0.5`}>{(exp.description.split(/[*-]/).filter((s: string) => s.trim()).length > 1 ? exp.description.split(/[*-]/).filter((s: string) => s.trim()) : exp.description.split(/\.\s+(?=[A-Z])/).filter((s: string) => s.trim())).map((s: string, i: number) => (<div key={i} className="flex gap-1.5 mb-1"><span className="mt-0.5 shrink-0">*</span><span>{s.trim()}</span></div>))}</div>}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Projects */}
        {isVisible('projects') && projects?.length > 0 && (
          <section id="projects" className="py-16 md:py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <AnimatedSection>
                <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-16 text-center ${textColor}`}>
                  My <span style={{ color: accentColor }}>Projects</span>
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((proj: any) => (
                    <motion.div key={proj.id} variants={fadeUp} whileHover={{ y: -8, boxShadow: `0 20px 40px ${accentColor}20` }}
                      className={`p-6 rounded-2xl border flex flex-col ${cardBg}`}>
                      {proj.image_url && <motion.img src={proj.image_url} alt={proj.title} className="w-full h-40 object-cover rounded-lg mb-4" />}
                      <h3 className={`text-lg font-bold mb-2 ${textColor}`}>{proj.title}</h3>
                      <p className={`text-sm mb-3 flex-1 text-justify ${subTextColor}`}>{proj.description}</p>
                      {proj.tech_stack && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {proj.tech_stack.split(',').map((t: string) => (
                            <TechBadge key={t} name={t.trim()} accentColor={accentColor} size="sm" />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3">
                        {proj.demo_url && <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.1 }} className="text-sm" style={{ color: accentColor }}> Demo</motion.a>}
                        {proj.github_url && <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.1 }} className="text-sm" style={{ color: accentColor }}> GitHub</motion.a>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Services */}
        {isVisible('services') && services?.length > 0 && (
          <section id="services" className="py-16 md:py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-16 text-center ${textColor}`}>
                  My <span style={{ color: accentColor }}>Services</span>
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((svc: any) => (
                    <motion.div key={svc.id} variants={fadeUp} whileHover={{ y: -8 }}
                      className={`p-6 rounded-2xl border text-center ${cardBg}`}>
                      <motion.div className="text-4xl mb-4" whileHover={{ scale: 1.2, rotate: 10 }}>{svc.icon || '✦'}</motion.div>
                      <h3 className={`text-lg font-bold mb-2 ${textColor}`}>{svc.title}</h3>
                      <p className={`text-sm text-justify ${subTextColor}`}>{svc.description}</p>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {isVisible('testimonials') && testimonials?.length > 0 && (
          <section id="testimonials" className="py-16 md:py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-16 text-center ${textColor}`}>
                  What People <span style={{ color: accentColor }}>Say</span>
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((t: any) => (
                    <motion.div key={t.id} variants={fadeUp} whileHover={{ y: -4 }}
                      className={`p-6 rounded-2xl border ${cardBg}`}>
                      <p className={`text-sm mb-4 italic ${subTextColor}`}>"{t.message}"</p>
                      <div className="flex items-center gap-3">
                        {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                        <div>
                          <p className={`font-semibold text-sm ${textColor}`}>{t.name}</p>
                          <p className="text-xs" style={{ color: accentColor }}>{t.position}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {isVisible('custom') && custom?.length > 0 && custom.map((sec: any) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-16 md:py-24 px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection key={sec.id}>
                <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-16 text-center ${textColor}`}>
                  <span style={{ color: accentColor }}>{sec.title}</span>
                </motion.h2>
                {sec.type === 'text' && (
                  <motion.p variants={fadeUp} className={`text-lg leading-relaxed ${subTextColor}`}>
                    {sec.content?.body}
                  </motion.p>
                )}
                {sec.type === 'list' && (
                  <ul className="space-y-3">
                    {(sec.content?.items || []).map((item: string, i: number) => (
                      <motion.li key={i} variants={fadeUp} className={`flex items-start gap-3 ${subTextColor}`}>
                        <span style={{ color: accentColor }}></span>{item}
                      </motion.li>
                    ))}
                  </ul>
                )}
                {sec.type === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(sec.content?.cards || []).map((card: any, i: number) => (
                      <motion.div key={i} variants={fadeUp} whileHover={{ y: -8 }}
                        className={`p-6 rounded-2xl border ${cardBg}`}>
                        {card.icon && <div className="text-3xl mb-3">{card.icon}</div>}
                        <h3 className={`font-bold mb-2 ${textColor}`}>{card.title}</h3>
                        <p className={`text-sm ${subTextColor}`}>{card.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
                {sec.type === 'links' && (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {(sec.content?.links || []).map((link: any, i: number) => (
                      <motion.a key={i} href={link.url} target="_blank" variants={fadeUp}
                        whileHover={{ scale: 1.05 }}
                        className="px-6 py-3 rounded-full font-medium text-white"
                        style={{ backgroundColor: accentColor }}>
                        {link.label}
                      </motion.a>
                    ))}
                  </div>
                )}
                {/* Fallback for typed sections (education, certification, language, etc.) */}
                {!['text','list','cards','links'].includes(sec.type) && sec.content && (
                  <div className="space-y-6">
                    {(() => {
                      if ((sec.original_type === 'certification' || sec.type === 'certification') && Array.isArray(sec.content?.items)) {
                        return <CertificationSection items={sec.content?.items} textColor={textColor} subTextColor={subTextColor} accentColor={accentColor} cardBg={cardBg} />;
                      }
                      const c = sec.content;
                      const fields = c.institution || c.degree || c.field || c.name || c.issuer || c.language || c.proficiency || c.area || c.title ? (
                        <div className={`p-6 rounded-2xl border ${cardBg}`}>
                          {c.institution && <p className={`text-lg font-semibold ${textColor}`}>{c.institution}</p>}
                          {(c.degree || c.field) && <p className={`text-sm ${subTextColor} mt-1`}>{[c.degree, c.field].filter(Boolean).join('  -  ')}</p>}
                          {(c.start_date || c.end_date) && <p className={`text-xs ${subTextColor} mt-1`}>{[c.start_date?.slice(0,7), c.end_date?.slice(0,7)].filter(Boolean).join(' - ')}</p>}
                          {c.gpa && <p className={`text-xs ${subTextColor} mt-1`}>GPA: {c.gpa}</p>}
                          {c.name && <p className={`text-lg font-semibold ${textColor}`}>{c.name}</p>}
                          {c.issuer && <p className={`text-sm ${subTextColor}`}>{c.issuer}</p>}
                          {c.date && <p className={`text-xs ${subTextColor} mt-1`}>{c.date}</p>}
                          {c.language && <p className={`text-lg font-semibold ${textColor}`}>{c.language}</p>}
                          {c.proficiency && <span className={`text-xs px-2 py-1 rounded-full`} style={{backgroundColor: accentColor+'30', color: accentColor}}>{c.proficiency}</span>}
                          {c.area && <p className={`text-lg font-semibold ${textColor}`}>{c.area}</p>}
                          {c.description && <p className={`text-sm ${subTextColor} mt-1`}>{c.description}</p>}
                          {c.credential_url && <a href={c.credential_url} target="_blank" className={`text-sm underline mt-2 inline-block`} style={{color: accentColor}}>View credential</a>}
                        </div>
                      ) : null;
                      return fields || (c.body ? <p className={`text-lg leading-relaxed ${subTextColor}`}>{c.body}</p> : null);
                    })()}
                  </div>
                )}
              </AnimatedSection>
            </div>
          </section>
        ))}

        {/* Certificates */}
        {isVisible('gallery') && gallery?.length > 0 && (
          <section id="gallery" className="py-16 md:py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <AnimatedSection>
                <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-16 text-center ${textColor}`}>
                  My <span style={{ color: accentColor }}>Certificates</span>
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gallery.map((cert: any) => (
                    <motion.div key={cert.id} variants={fadeUp} whileHover={{ y: -8, boxShadow: `0 20px 40px ${accentColor}20` }}
                      className={`p-5 rounded-2xl border flex flex-col ${cardBg}`}>
                      {(cert.image_url || cert.file_url) && (
                        <div className="w-full h-36 rounded-lg mb-3 overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                          <img src={cert.image_url || cert.file_url} alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.style.display = 'none' }} />
                        </div>
                      )}
                      <h3 className={`text-base font-bold mb-1 ${textColor}`}>{cert.title}</h3>
                      {cert.description && <p className={`text-sm mb-2 flex-1 text-justify ${subTextColor}`}>{cert.description}</p>}
                      {cert.issued_date && (
                        <p className="text-xs mt-auto" style={{ color: accentColor }}>
                           {new Date(cert.issued_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {cert.file_url && (
                        <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.05 }}
                          className="mt-3 text-center text-xs px-3 py-1.5 rounded-full font-medium text-white"
                          style={{ backgroundColor: accentColor }}>
                           Lihat Certificate
                        </motion.a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="py-16 md:py-24 px-4">
          <AnimatedSection>
            <div className="max-w-2xl mx-auto text-center">
              <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-4 ${textColor}`}>
                Get In <span style={{ color: accentColor }}>Touch</span>
              </motion.h2>
              <motion.p variants={fadeUp} className={`mb-10 ${subTextColor}`}>Have a project in mind? Let's work together!</motion.p>
              <div className="flex gap-4 justify-center flex-wrap mb-12">
                {(contact?.email || about?.email) && (
                  <motion.a variants={fadeUp} href={`mailto:${contact?.email || about?.email}`}
                    whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${accentColor}60` }}
                    className="inline-block px-10 py-4 rounded-full font-semibold text-white text-lg"
                    style={{ backgroundColor: accentColor }}> Email</motion.a>
                )}
                {contact?.phone && (
                  <motion.a variants={fadeUp}
                    href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(about?.name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`}
                    target="_blank"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px #25D36660' }}
                    className="inline-block px-10 py-4 rounded-full font-semibold text-white text-lg"
                    style={{ backgroundColor: '#25D366' }}> WhatsApp</motion.a>
                )}
                {contact?.linkedin_url && (
                  <motion.a variants={fadeUp} href={contact.linkedin_url} target="_blank"
                    whileHover={{ scale: 1.05, boxShadow: `0 0 30px #0077B560` }}
                    className="inline-block px-10 py-4 rounded-full font-semibold text-white text-lg"
                    style={{ backgroundColor: '#0077B5' }}> LinkedIn</motion.a>
                )}
                {contact?.github_url && (
                  <motion.a variants={fadeUp} href={contact.github_url} target="_blank"
                    whileHover={{ scale: 1.05, boxShadow: `0 0 30px #33333360` }}
                    className="inline-block px-10 py-4 rounded-full font-semibold text-white text-lg"
                    style={{ backgroundColor: '#333' }}> GitHub</motion.a>
                )}
              </div>
              <motion.div variants={fadeUp}>
                <ContactForm slug={portfolio.slug} accentColor={accentColor} textColor={isLight ? '#111' : '#f1f5f9'} subColor={subTextColor} />
              </motion.div>
            </div>
          </AnimatedSection>
        </section>
      </div>

      <footer className="py-8 text-center border-t" style={{ borderColor: `${accentColor}20` }}>
        <p className={`text-sm ${subTextColor}`}>(c) 2026 {about?.name || portfolio.title}. Built with </p>
        <p className="text-xs mt-1" style={{ color: `${accentColor}60` }}>Made with PortfolioKit</p>
      </footer>
      </div>
  );
}

