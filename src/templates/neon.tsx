'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function GridBg() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
      style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
  );
}

function NeonBorder({ children, ac, className }: { children: React.ReactNode; ac: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className={`relative rounded-xl border ${className}`}
      style={{ borderColor: `${ac}40`, boxShadow: `0 0 15px ${ac}20, inset 0 0 15px ${ac}05` }}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, ac }: { title: string; subtitle?: string; ac: string }) {
  return (
    <div className="text-center mb-14">
      <motion.span className="text-xs uppercase tracking-[0.3em] font-mono" style={{ color: `${ac}90`, textShadow: `0 0 10px ${ac}50` }}>{subtitle}</motion.span>
      <motion.h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-2 uppercase tracking-wide"
        style={{ color: textColor, textShadow: `0 0 20px ${ac}40` }}>{title}</motion.h2>
      <motion.div className="mx-auto mt-4 w-20 h-px" style={{ backgroundColor: ac, boxShadow: `0 0 10px ${ac}` }} />
    </div>
  );
}

const textColor = '#e2e8f0';
const subColor = '#8892b0';

export default function NeonTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;
  const groupedCustom = (custom || []).reduce((groups: any[], section: any) => {
    const content = typeof section.content === 'string'
      ? (() => { try { return JSON.parse(section.content); } catch { return { body: section.content }; } })()
      : (section.content || {});
    const title = section.title || 'Custom Section';
    const type = section.type || 'text';
    const existing = groups.find(group => group.title === title && group.type === type);
    const item = { ...section, content };
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ title, type, items: [item] });
    }
    return groups;
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden font-mono" style={{ backgroundColor: '#0a0e17' }}>
      <GridBg />
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${ac}08 0%, transparent 60%)` }} />

      {/* Navbar */}
      <motion.nav initial={{ y: -60 }} animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b" style={{ borderColor: `${ac}30`, backgroundColor: '#0a0e17dd' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm uppercase tracking-widest" style={{ color: ac, textShadow: `0 0 10px ${ac}` }}>{about?.name || portfolio.title}</span>
          <div className="flex gap-2">
            {['about', 'projects', 'skills', 'contact'].map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ color: ac, textShadow: `0 0 10px ${ac}` }}
                className="px-3 py-1.5 text-xs uppercase tracking-wider font-medium" style={{ color: subColor }}>
                [ {s} ]
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
          <motion.div className="absolute inset-0"
            animate={{ background: [`radial-gradient(ellipse at 50% 50%, ${ac}15 0%, transparent 60%)`, `radial-gradient(ellipse at 50% 50%, ${ac}08 0%, transparent 60%)`, `radial-gradient(ellipse at 50% 50%, ${ac}15 0%, transparent 60%)`] }}
            transition={{ duration: 4, repeat: Infinity }} />
          {[...Array(3)].map((_, i) => (
            <motion.div key={i} className="absolute w-64 h-64 rounded-full border opacity-10"
              style={{ borderColor: ac }} animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear', delay: i * 2 }} />
          ))}
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.4em] mb-4"
              style={{ color: ac, textShadow: `0 0 10px ${ac}` }}>
              {hero?.greeting || 'Hello World'}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black leading-none mb-6 uppercase tracking-tight"
              style={{ color: textColor, textShadow: `0 0 40px ${ac}60` }}>
              {hero?.headline || about?.name || portfolio.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl font-light mb-10" style={{ color: subColor }}>
              {hero?.subheadline || ''}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex gap-4 justify-center flex-wrap">
              <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${ac}` }}
                className="px-10 py-4 rounded font-bold uppercase tracking-wider text-sm text-white" style={{ backgroundColor: ac, boxShadow: `0 0 20px ${ac}60` }}>
                [ {hero?.cta_text || 'Explore'} ]
              </motion.a>
              {about?.cv_url && (
                <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-10 py-4 rounded font-bold uppercase tracking-wider text-sm border" style={{ borderColor: `${ac}60`, color: ac }}>
                  [ CV ]
                </motion.a>
              )}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.04 }}
                  className="px-10 py-4 rounded font-bold uppercase tracking-wider text-sm border" style={{ borderColor: `${ac}60`, color: ac }}>
                  [ {hero.cta_secondary_text} ]
                </motion.a>
              )}
            </motion.div>
          </div>
        </section>

        {/* About */}
        {about?.name && (
          <section id="about" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="About" subtitle="Who Am I" ac={ac} />
              <NeonBorder ac={ac} className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {about.photo_url && (
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="shrink-0">
                      <img src={about.photo_url} alt={about.name} className="w-48 h-48 rounded-full object-cover border-2" style={{ border: `2px solid ${ac}60`, boxShadow: `0 0 20px ${ac}40` }} />
                    </motion.div>
                  )}
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-widest" style={{ color: ac }}>// profile</p>
                    <h3 className="text-2xl font-bold" style={{ color: textColor }}>{about.name}</h3>
                    <p className="text-sm" style={{ color: ac }}>{about.title}</p>
                    <p className="text-sm leading-relaxed text-justify whitespace-pre-line" style={{ color: subColor }}>{about.bio}</p>
                  </div>
                </div>
              </NeonBorder>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <section id="skills" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Skills" subtitle="System Stack" ac={ac} />
              <div className="space-y-8">
                {skills.map((skill: any, si: number) => (
                  <motion.div key={skill.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: si * 0.1 }}>
                    <p className="text-xs uppercase tracking-wider mb-4 font-mono" style={{ color: ac }}>&gt; {skill.title || 'skills'} </p>
                    <div className="flex flex-wrap gap-2">
                      {skill.skills?.split(',').map((s: string, i: number) => (
                        <motion.div key={s} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                          <TechBadge name={s.trim()} accentColor={ac} size="md" variant="outline" />
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
          <section id="experience" className="py-20 md:py-28 px-4">
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Experience" subtitle="Work Log" ac={ac} />
              <div className="space-y-6">
                {experience.map((exp: any, ei: number) => (
                  <motion.div key={exp.id} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: ei * 0.1 }}>
                    <NeonBorder ac={ac} className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-mono px-2 py-1" style={{ backgroundColor: `${ac}20`, color: ac, border: `1px solid ${ac}40` }}>
                          {exp.start_date?.slice(0, 7)}  -  {exp.end_date?.slice(0, 7) || 'CURRENT'}
                        </span>
                        <span className="text-xs" style={{ color: ac }}>[{exp.company}]</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>{exp.position}</h3>
                      {exp.description && (
                        <div className="text-sm space-y-1 font-mono" style={{ color: subColor }}>
                          {exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, i: number) => (
                            <div key={i} className="flex gap-2">
                              <span style={{ color: ac }}>&gt;</span>
                              <span>{s.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </NeonBorder>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section id="projects" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
            <div className="max-w-6xl mx-auto">
              <SectionTitle title="Projects" subtitle="Portfolio" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj: any) => (
                  <NeonBorder key={proj.id} ac={ac} className="overflow-hidden">
                    {proj.image_url && (
                      <div className="relative overflow-hidden">
                        <img src={proj.image_url} alt={proj.title} className="w-full h-44 object-cover opacity-80 hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: 'linear-gradient(to top, #0a0e17, transparent)' }} />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-base font-bold mb-2 uppercase tracking-wide" style={{ color: textColor }}>{proj.title}</h3>
                      <p className="text-xs mb-4 leading-relaxed text-justify font-mono" style={{ color: subColor }}>{proj.description}</p>
                      {proj.tech_stack && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {proj.tech_stack.split(',').map((t: string) => (
                            <TechBadge key={t} name={t.trim()} accentColor={ac} />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {proj.demo_url && (
                          <motion.a href={proj.demo_url} target="_blank" whileHover={{ boxShadow: `0 0 15px ${ac}` }}
                            className="text-xs font-semibold px-4 py-2 rounded font-mono uppercase tracking-wider" style={{ backgroundColor: `${ac}20`, color: ac }}>
                            Demo
                          </motion.a>
                        )}
                        {proj.github_url && (
                          <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.04 }}
                            className="text-xs font-semibold px-4 py-2 rounded font-mono uppercase tracking-wider border" style={{ borderColor: `${ac}40`, color: ac }}>
                            Code
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </NeonBorder>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {services?.length > 0 && (
          <section id="services" className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title="Services" subtitle="Capabilities" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc: any) => (
                  <NeonBorder key={svc.id} ac={ac} className="p-6 text-center">
                    <div className="text-3xl mb-4">{svc.icon || '✦'}</div>
                    <h3 className="text-base font-bold mb-2 uppercase tracking-wide" style={{ color: textColor }}>{svc.title}</h3>
                    <p className="text-xs font-mono text-justify" style={{ color: subColor }}>{svc.description}</p>
                  </NeonBorder>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials?.length > 0 && (
          <section id="testimonials" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
            <div className="max-w-4xl mx-auto">
              <SectionTitle title="Testimonials" subtitle="Feedback" ac={ac} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t: any) => (
                  <NeonBorder key={t.id} ac={ac} className="p-6">
                    <p className="text-3xl leading-none mb-2 font-mono" style={{ color: `${ac}40` }}>&gt;_</p>
                    <p className="text-sm italic mb-4 leading-relaxed text-justify" style={{ color: subColor }}>{t.message}</p>
                    <div className="flex items-center gap-3">
                      {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <p className="font-semibold text-sm" style={{ color: textColor }}>{t.name}</p>
                        <p className="text-xs font-mono" style={{ color: ac }}>{t.position}</p>
                      </div>
                    </div>
                  </NeonBorder>
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
                  <NeonBorder key={cert.id} ac={ac} className="p-5">
                    {(cert.image_url || cert.file_url) && (
                      <div className="w-full h-32 rounded mb-4 overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                        <img src={cert.image_url || cert.file_url} alt={cert.title}
                          className="w-full h-full object-cover"
                          onError={(e: any) => { e.target.style.display = 'none' }} />
                      </div>
                    )}
                    <h3 className="font-bold text-sm mb-1" style={{ color: textColor }}>{cert.title}</h3>
                    {cert.description && <p className="text-xs mb-2 font-mono" style={{ color: subColor }}>{cert.description}</p>}
                    {cert.issued_date && <p className="text-xs mb-3" style={{ color: ac }}>&gt; {new Date(cert.issued_date).toLocaleDateString()}</p>}
                    {cert.file_url && (
                      <motion.a href={cert.file_url} target="_blank" whileHover={{ boxShadow: `0 0 15px ${ac}` }}
                        className="inline-block text-xs font-semibold px-4 py-2 rounded font-mono" style={{ backgroundColor: `${ac}20`, color: ac }}>
                        View
                      </motion.a>
                    )}
                  </NeonBorder>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {groupedCustom.length > 0 && groupedCustom.map((sec: any) => (
          <section key={`${sec.title}-${sec.type}`} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-20 md:py-28 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle title={sec.title} ac={ac} />
              {sec.type === 'text' && sec.items.map((item: any) => (
                <NeonBorder key={item.id} ac={ac} className="p-6 mb-4"><p className="text-sm leading-relaxed text-center text-justify font-mono" style={{ color: subColor }}>{item.content?.body}</p></NeonBorder>
              ))}
              {sec.type === 'list' && sec.items.map((item: any) => (
                <ul className="space-y-3 max-w-2xl mx-auto">
                  {(item.content?.items || []).map((listItem: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      className="text-sm font-mono flex gap-2" style={{ color: subColor }}>
                      <span style={{ color: ac }}>&gt;</span>{listItem}
                    </motion.li>
                  ))}
                </ul>
              ))}
              {sec.type === 'links' && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {sec.items.flatMap((item: any) => item.content?.links || []).map((link: any, i: number) => (
                    <motion.a key={i} href={link.url} target="_blank" whileHover={{ boxShadow: `0 0 25px ${ac}` }}
                      className="px-8 py-3.5 rounded font-bold uppercase tracking-wider text-sm text-white" style={{ backgroundColor: ac, boxShadow: `0 0 15px ${ac}60` }}>
                      {link.label}
                    </motion.a>
                  ))}
                </div>
              )}
              {!['text','list','cards','links'].includes(sec.type) && sec.items.length > 0 && (
                (sec.original_type === 'certification' || sec.type === 'certification') && sec.items.some((item: any) => Array.isArray(item.content?.items)) ? (
                  <CertificationSection items={sec.items.flatMap((item: any) => item.content.items || [])} textColor={textColor} subTextColor={subColor} accentColor={ac} cardBg="" />
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.items.map((item: any) => {
                    const c = item.content || {};
                    if (c.institution || c.degree || c.field) {
                      return (
                        <div key={item.id} className="p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          {c.institution && <p className="text-lg font-semibold" style={{color: textColor}}>{c.institution}</p>}
                          {(c.degree || c.field) && <p className="text-sm mt-1" style={{color: subColor}}>{[c.degree, c.field].filter(Boolean).join('  -  ')}</p>}
                          {(c.start_date || c.end_date) && <p className="text-xs mt-1" style={{color: subColor}}>{[c.start_date?.slice(0,7), c.end_date?.slice(0,7)].filter(Boolean).join(' - ')}</p>}
                          {c.gpa && <p className="text-xs mt-1" style={{color: subColor}}>GPA: {c.gpa}</p>}
                        </div>
                      );
                    }
                    if (c.name || c.issuer) {
                      return (
                        <div key={item.id} className="p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          {c.name && <p className="text-lg font-semibold" style={{color: textColor}}>{c.name}</p>}
                          {c.issuer && <p className="text-sm mt-1" style={{color: subColor}}>{c.issuer}</p>}
                          {c.date && <p className="text-xs mt-1" style={{color: subColor}}>{c.date}</p>}
                          {c.credential_url && <a href={c.credential_url} target="_blank" className="text-sm underline mt-2 inline-block" style={{color: ac}}>View credential</a>}
                        </div>
                      );
                    }
                    if (c.language) {
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-6 rounded-2xl border" style={{background: '#ffffff08', borderColor: 'rgba(255,255,255,0.08)'}}>
                          <p className="text-lg font-semibold" style={{color: textColor}}>{c.language}</p>
                          {c.proficiency && <span className="text-xs px-3 py-1 rounded-full" style={{backgroundColor: ac+'30', color: ac}}>{c.proficiency}</span>}
                        </div>
                      );
                    }
                    if (c.body) {
                      return <p key={item.id} className="text-base leading-relaxed" style={{color: subColor}}>{c.body}</p>;
                    }
                    return null;
                  })}
                </div>
                ))}
            </div>
          </section>
        ))}

        {/* Contact */}
        {data.portfolio?.sections_order?.find((section: any) => section.type === 'contact')?.enabled !== false && (
          <section id="contact" className="py-20 md:py-28 px-4" style={{ background: `${ac}04` }}>
          <div className="max-w-3xl mx-auto text-center">
            <SectionTitle title="Contact" subtitle="Get In Touch" ac={ac} />
            <p className="text-sm font-mono mb-8" style={{ color: subColor }}>Have a project? Let's build something together.</p>
            <div className="flex gap-4 justify-center flex-wrap mb-10">
              {(contact?.email || about?.email) && (
                <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ boxShadow: `0 0 25px ${ac}` }}
                  className="px-8 py-3.5 rounded font-bold uppercase tracking-wider text-sm text-white" style={{ backgroundColor: ac, boxShadow: `0 0 15px ${ac}60` }}>
                  Email
                </motion.a>
              )}
              {contact?.phone && (
                <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ boxShadow: '0 0 25px #25D366' }}
                  className="px-8 py-3.5 rounded font-bold uppercase tracking-wider text-sm text-white" style={{ backgroundColor: '#25D366' }}>
                  WhatsApp
                </motion.a>
              )}
              {contact?.linkedin_url && (
                <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ boxShadow: '0 0 25px #0077B5' }}
                  className="px-8 py-3.5 rounded font-bold uppercase tracking-wider text-sm text-white" style={{ backgroundColor: '#0077B5' }}>
                  LinkedIn
                </motion.a>
              )}
              {contact?.github_url && (
                <motion.a href={contact.github_url} target="_blank" whileHover={{ boxShadow: '0 0 25px #333' }}
                  className="px-8 py-3.5 rounded font-bold uppercase tracking-wider text-sm text-white" style={{ backgroundColor: '#333' }}>
                  GitHub
                </motion.a>
              )}
            </div>
            <NeonBorder ac={ac} className="p-6">
              <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
            </NeonBorder>
          </div>
          </section>
        )}
      </div>

      <footer className="relative z-10 py-8 text-center border-t" style={{ borderColor: `${ac}30` }}>
        <p className="text-xs font-mono" style={{ color: subColor }}>
          &copy; 2026 {about?.name || portfolio.title} // built with PortfolioKit
        </p>
        <p className="text-xs font-mono mt-1" style={{ color: `${ac}60`, textShadow: `0 0 10px ${ac}` }}>Powered by PortfolioKit</p>
      </footer>
    </div>
  );
}

