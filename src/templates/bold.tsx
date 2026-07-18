'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { themes } from '@/lib/sections';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

const acGradient = (ac: string) => `linear-gradient(135deg, ${ac}, ${ac}dd, ${ac}88)`;
const cardGlow = (ac: string) => `0 0 30px ${ac}30, 0 0 60px ${ac}10`;

function GlowCard({ children, className, ac }: { children: React.ReactNode; className?: string; ac: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6, boxShadow: cardGlow(ac), borderColor: ac }}
      className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 ${className}`}
      style={{ borderColor: `${ac}20`, backgroundColor: `${ac}08` }}>
      {children}
    </motion.div>
  );
}

function Particles({ ac }: { ac: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: ac, left: `${(i * 8.3) % 100}%`, top: `${(i * 13) % 100}%` }}
          animate={{
            y: [-30, 30, -30],
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 3 + (i % 3) * 2, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

export default function BoldTemplate({ data, theme: initialTheme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const [theme] = useState(initialTheme || themes[0]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;
  const textColor = '#f1f5f9';
  const subColor = '#94a3b8';
  const navItems = ['about', 'experience', 'projects', 'services', 'contact'];

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Animated gradient bg */}
      <motion.div className="fixed inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${ac}15 0%, transparent 50%)` }} />

      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 h-1 z-[100]" style={{ width: progressWidth, background: acGradient(ac) }} />

      {/* Navbar */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.4, type: 'spring' }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl border-b" style={{ borderColor: `${ac}20`, backgroundColor: '#0a0a0fcc' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.span className="font-extrabold text-xl bg-clip-text text-transparent" style={{ backgroundImage: acGradient(ac) }}
            whileHover={{ scale: 1.05 }}>
            {about?.name?.split(' ')[0] || portfolio.title || 'Portfolio'}
          </motion.span>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ scale: 1.05 }}
                className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: subColor }}
                whileTap={{ scale: 0.95 }}>
                <motion.span className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: `${ac}15` }} />
                <span className="relative capitalize">{s}</span>
              </motion.a>
            ))}
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden relative z-50 w-8 h-8 flex items-center justify-center">
            <motion.span className="absolute w-5 h-0.5 block rounded-full" style={{ backgroundColor: ac }}
              animate={mobileMenu ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }} />
            <motion.span className="absolute w-5 h-0.5 block rounded-full" style={{ backgroundColor: ac }}
              animate={mobileMenu ? { opacity: 0 } : { opacity: 1 }} />
            <motion.span className="absolute w-5 h-0.5 block rounded-full" style={{ backgroundColor: ac }}
              animate={mobileMenu ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }} />
          </button>
        </div>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t px-4 py-4 space-y-2" style={{ borderColor: `${ac}20`, backgroundColor: '#0a0a0fee' }}>
            {navItems.map(s => (
              <a key={s} href={`#${s}`} onClick={() => setMobileMenu(false)}
                className="block py-2.5 px-4 rounded-lg text-sm capitalize font-medium" style={{ color: subColor }}>
                {s}
              </a>
            ))}
          </motion.div>
        )}
      </motion.nav>

      <div className="relative z-10" style={{ paddingTop: '4rem' }}>

        {/* Hero */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden"
          style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
          <Particles ac={ac} />
          <motion.div className="absolute inset-0 opacity-20"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: `radial-gradient(ellipse at 50% 50%, ${ac} 0%, transparent 70%)` }}
          />
          <motion.div className="absolute top-20 left-10 w-32 h-32 border rounded-3xl opacity-10"
            style={{ borderColor: ac }} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute bottom-32 right-10 w-24 h-24 border rounded-full opacity-10"
            style={{ borderColor: ac }} animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />

          <div className="relative z-10 max-w-4xl mx-auto">
            {hero?.greeting && (
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-block px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-6"
                style={{ backgroundColor: `${ac}20`, color: ac }}>
                {hero.greeting}
              </motion.span>
            )}
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black leading-none mb-6 bg-clip-text text-transparent"
              style={{ backgroundImage: acGradient(ac), WebkitBackgroundClip: 'text' }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-xl md:text-3xl font-light mb-8" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.05, boxShadow: cardGlow(ac) }}
                className="px-10 py-4 rounded-xl font-bold text-white text-lg relative overflow-hidden group"
                style={{ background: acGradient(ac) }}>
                <motion.span className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.4 }} />
                <span className="relative">{hero?.cta_text || 'View My Work'}</span>
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.05 }}
                  className="px-10 py-4 rounded-xl font-semibold text-lg border backdrop-blur-sm"
                  style={{ borderColor: `${ac}50`, color: ac, backgroundColor: `${ac}10` }}>
                  Download CV
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.05 }}
                  className="px-10 py-4 rounded-xl font-semibold text-lg border backdrop-blur-sm"
                  style={{ borderColor: `${ac}50`, color: ac, backgroundColor: `${ac}10` }}>
                  {hero.cta_secondary_text}
                </motion.a>
              )}
            </motion.div>
          </div>

          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-5 h-8 border-2 rounded-full flex justify-center pt-1.5" style={{ borderColor: `${ac}50` }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }}
                animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
          </motion.div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-20 md:py-32 px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>About</motion.span>
                <motion.h2 className="text-4xl md:text-6xl font-black mt-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: acGradient(ac) }}>
                  Who I Am
                </motion.h2>
              </motion.div>
              <div className="flex flex-col md:flex-row gap-12 items-center">
                  {about.photo_url && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    className="relative flex-shrink-0">
                    <motion.div className="absolute inset-0 rounded-full opacity-40 blur-xl" style={{ background: acGradient(ac) }}
                      animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} />
                    <img src={about.photo_url} alt={about.name}
                      className="w-56 h-56 rounded-full object-cover relative z-10 border-2" style={{ borderColor: `${ac}40` }} />
                  </motion.div>
                )}
                <div className="space-y-4">
                  <motion.h3 initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    className="text-3xl font-bold" style={{ color: textColor }}>{about.name}</motion.h3>
                  <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: 0.1 }} className="text-lg" style={{ color: ac }}>{about.title}</motion.p>
                  <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    transition={{ delay: 0.2 }} className="text-base leading-relaxed text-justify" style={{ color: subColor }}>
                    {about.bio}
                  </motion.p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-20 md:py-32 px-4" style={{ background: `linear-gradient(180deg, transparent, ${ac}08, transparent)` }}>
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>Expertise</motion.span>
                <motion.h2 className="text-4xl md:text-6xl font-black mt-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: acGradient(ac) }}>
                  Skills & Tools
                </motion.h2>
              </motion.div>
              <div className="space-y-10">
                {skills.map((skill: any, si: number) => (
                  <motion.div key={skill.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: si * 0.1 }}>
                    {skill.title && <h3 className="text-lg font-bold mb-5" style={{ color: textColor }}>{skill.title}</h3>}
                    <div className="flex flex-wrap gap-3">
                      {skill.skills?.split(',').map((s: string, i: number) => (
                        <motion.div key={s} initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                          transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.1, y: -3 }}>
                          <TechBadge name={s.trim()} accentColor={ac} size="md" variant="filled" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section id="experience" className="py-20 md:py-32 px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>Career</motion.span>
                <motion.h2 className="text-4xl md:text-6xl font-black mt-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: acGradient(ac) }}>
                  Experience
                </motion.h2>
              </motion.div>
              <div className="relative">
                <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${ac}40, transparent)` }} />
                <div className="space-y-12">
                  {experience.map((exp: any, i: number) => (
                    <motion.div key={exp.id} initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                      className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <GlowCard ac={ac} className="p-6">
                          <span className="text-xs font-medium mb-2 inline-block px-3 py-1 rounded-full"
                            style={{ backgroundColor: `${ac}20`, color: ac }}>
                            {exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'Present'}
                          </span>
                          <h3 className="text-xl font-bold mt-2" style={{ color: textColor }}>{exp.position}</h3>
                          <p className="text-sm font-medium mb-3" style={{ color: ac }}>{exp.company}</p>
                          {exp.description && (
                            <div className="text-sm space-y-1" style={{ color: subColor }}>
                              {((exp.description.split(/[*-]/).filter((s: string) => s.trim()).length > 1
                                ? exp.description.split(/[*-]/).filter((s: string) => s.trim())
                                : exp.description.split(/\.\s+(?=[A-Z])/).filter((s: string) => s.trim())
                              )).map((s: string, si: number) => (
                                <div key={si} className="flex gap-2">
                                  <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} />
                                  <span>{s.trim()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </GlowCard>
                      </div>
                      <div className="hidden md:flex w-12 flex-shrink-0 justify-center relative">
                        <motion.div className="w-5 h-5 rounded-full border-2 z-10" style={{ borderColor: ac, backgroundColor: '#0a0a0f' }}
                          initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                          transition={{ type: 'spring', delay: i * 0.1 }} />
                      </div>
                      <div className="flex-1" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="projects" className="py-20 md:py-32 px-4" style={{ background: `linear-gradient(180deg, transparent, ${ac}08, transparent)` }}>
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>Portfolio</motion.span>
                <motion.h2 className="text-4xl md:text-6xl font-black mt-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: acGradient(ac) }}>
                  Featured Work
                </motion.h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj: any) => (
                  <GlowCard key={proj.id} ac={ac} className="p-0 overflow-hidden group">
                    {proj.image_url && (
                      <div className="relative overflow-hidden">
                        <motion.img src={proj.image_url} alt={proj.title}
                          className="w-full h-48 object-cover transition-transform duration-500"
                          whileHover={{ scale: 1.1 }} />
                        <motion.div className="absolute inset-0" style={{ background: `linear-gradient(to top, #0a0a0f, transparent)` }}
                          initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>{proj.title}</h3>
                      <p className="text-sm mb-4 text-justify" style={{ color: subColor }}>{proj.description}</p>
                      {proj.tech_stack && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {proj.tech_stack.split(',').map((t: string) => (
                            <TechBadge key={t} name={t.trim()} accentColor={ac} />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3">
                        {proj.demo_url && (
                          <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.05 }}
                            className="text-xs font-semibold px-4 py-2 rounded-lg"
                            style={{ backgroundColor: `${ac}20`, color: ac }}>
                            Live Demo
                          </motion.a>
                        )}
                        {proj.github_url && (
                          <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.05 }}
                            className="text-xs font-semibold px-4 py-2 rounded-lg border"
                            style={{ borderColor: `${ac}30`, color: ac }}>
                            Source Code
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <section id="services" className="py-20 md:py-32 px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>What I Do</motion.span>
                <motion.h2 className="text-4xl md:text-6xl font-black mt-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: acGradient(ac) }}>
                  Services
                </motion.h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc: any) => (
                  <GlowCard key={svc.id} ac={ac} className="p-8 text-center">
                    <motion.div className="text-4xl mb-5 inline-block" whileHover={{ scale: 1.2, rotate: 10 }}>
                      <span className="inline-flex items-center justify-center w-16 h-16 rounded-xl"
                        style={{ backgroundColor: `${ac}15` }}>
                        {svc.icon || '✦'}
                      </span>
                    </motion.div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: textColor }}>{svc.title}</h3>
                    <p className="text-sm text-justify" style={{ color: subColor }}>{svc.description}</p>
                  </GlowCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <section id="testimonials" className="py-20 md:py-32 px-4" style={{ background: `linear-gradient(180deg, transparent, ${ac}08, transparent)` }}>
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>Testimonials</motion.span>
                <motion.h2 className="text-4xl md:text-6xl font-black mt-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: acGradient(ac) }}>
                  Kind Words
                </motion.h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t: any) => (
                  <GlowCard key={t.id} ac={ac} className="p-8">
                    <motion.div className="text-5xl mb-4 leading-none" style={{ color: `${ac}40` }}>"</motion.div>
                    <p className="text-base italic mb-6 leading-relaxed" style={{ color: subColor }}>{t.message}</p>
                    <div className="flex items-center gap-4">
                      {t.photo_url && (
                        <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2" style={{ borderColor: `${ac}40` }} />
                      )}
                      <div>
                        <p className="font-bold text-sm" style={{ color: textColor }}>{t.name}</p>
                        <p className="text-xs" style={{ color: ac }}>{t.position}</p>
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {custom?.length > 0 && custom.map((sec: any) => (
          <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-20 md:py-32 px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <motion.h2 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent"
                  style={{ backgroundImage: acGradient(ac) }}>
                  {sec.title}
                </motion.h2>
              </motion.div>
              {sec.type === 'text' && (
                <p className="text-lg leading-relaxed text-center max-w-3xl mx-auto" style={{ color: subColor }}>{sec.content?.body}</p>
              )}
              {sec.type === 'list' && (
                <ul className="space-y-4 max-w-2xl mx-auto">
                  {(sec.content?.items || []).map((item: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 text-base" style={{ color: subColor }}>
                      <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: ac }} />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              )}
              {sec.type === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(sec.content?.cards || []).map((card: any, i: number) => (
                    <GlowCard key={i} ac={ac} className="p-6 text-center">
                      {card.icon && <div className="text-3xl mb-4">{card.icon}</div>}
                      <h3 className="font-bold text-lg mb-2" style={{ color: textColor }}>{card.title}</h3>
                      <p className="text-sm" style={{ color: subColor }}>{card.desc}</p>
                    </GlowCard>
                  ))}
                </div>
              )}
              {sec.type === 'links' && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {(sec.content?.links || []).map((link: any, i: number) => (
                    <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.05, boxShadow: cardGlow(ac) }}
                      className="px-8 py-3.5 rounded-xl font-bold text-white"
                      style={{ background: acGradient(ac) }}>
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

        {/* Certificates */}
        {gallery?.length > 0 && (
          <section id="gallery" className="py-20 md:py-32 px-4" style={{ background: `linear-gradient(180deg, transparent, ${ac}08, transparent)` }}>
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>Credentials</motion.span>
                <motion.h2 className="text-4xl md:text-6xl font-black mt-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: acGradient(ac) }}>
                  Certificates
                </motion.h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((cert: any) => (
                  <GlowCard key={cert.id} ac={ac} className="p-6">
                    {(cert.image_url || cert.file_url) && (
                      <div className="w-full h-36 rounded-xl mb-4 overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                        <img src={cert.image_url || cert.file_url} alt={cert.title}
                          className="w-full h-full object-cover"
                          onError={(e: any) => { e.target.style.display = 'none' }} />
                      </div>
                    )}
                    <h3 className="text-base font-bold mb-1" style={{ color: textColor }}>{cert.title}</h3>
                    {cert.description && <p className="text-sm mb-2 text-justify" style={{ color: subColor }}>{cert.description}</p>}
                    {cert.issued_date && (
                      <p className="text-xs mb-3" style={{ color: ac }}>
                         {new Date(cert.issued_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    {cert.file_url && (
                      <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.05 }}
                        className="inline-block text-xs font-semibold px-4 py-2 rounded-lg"
                        style={{ backgroundColor: `${ac}20`, color: ac }}>
                         View Certificate
                      </motion.a>
                    )}
                  </GlowCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="py-20 md:py-32 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <motion.span className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: `${ac}80` }}>Contact</motion.span>
              <motion.h2 className="text-4xl md:text-6xl font-black mt-3 mb-6 bg-clip-text text-transparent"
                style={{ backgroundImage: acGradient(ac) }}>
                Let's Create Together
              </motion.h2>
              <motion.p className="text-lg mb-12" style={{ color: subColor }}>
                Have a project? Let's talk about how we can make something amazing.
              </motion.p>
              <div className="flex gap-4 justify-center flex-wrap">
                {(contact?.email || about?.email) && (
                  <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.05, boxShadow: cardGlow(ac) }}
                    className="px-10 py-4 rounded-xl font-bold text-white text-lg"
                    style={{ background: acGradient(ac) }}>
                     Email Me
                  </motion.a>
                )}
                {contact?.phone && (
                  <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(about?.name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`}
                    target="_blank" whileHover={{ scale: 1.05, boxShadow: '0 0 30px #25D36650' }}
                    className="px-10 py-4 rounded-xl font-bold text-white text-lg"
                    style={{ backgroundColor: '#25D366' }}>
                     WhatsApp
                  </motion.a>
                )}
                {contact?.linkedin_url && (
                  <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.05, boxShadow: '0 0 30px #0077B550' }}
                    className="px-10 py-4 rounded-xl font-bold text-white text-lg"
                    style={{ backgroundColor: '#0077B5' }}>
                     LinkedIn
                  </motion.a>
                )}
                {contact?.github_url && (
                  <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.05, boxShadow: '0 0 30px #33333350' }}
                    className="px-10 py-4 rounded-xl font-bold text-white text-lg"
                    style={{ backgroundColor: '#333' }}>
                     GitHub
                  </motion.a>
                )}
              </div>
              <motion.div className="mt-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
              </motion.div>
            </motion.div>
          </div>
        </section>

      </div>

      <footer className="relative z-10 py-10 text-center border-t" style={{ borderColor: `${ac}20` }}>
        <motion.p className="text-sm" style={{ color: subColor }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          (c) 2026 {about?.name || portfolio.title}. Built with <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ color: ac }}></motion.span>
        </motion.p>
        <p className="text-xs mt-2" style={{ color: `${ac}50` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}

