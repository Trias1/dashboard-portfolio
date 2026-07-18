'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}>
      {children}
    </motion.div>
  );
}

const textColor = '#e8e6e3';
const subColor = '#888490';
const panelBg = '#1a181e';

export default function DeveloperTemplate({ data, theme, isPreview }: { data: any; theme: any; isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121016', color: textColor }}>
      {/* Fixed sidebar  -  terminal-like */}
      <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
        className="fixed left-0 top-0 h-full w-64 z-40 border-r overflow-y-auto hidden lg:block" style={{ backgroundColor: '#0d0b10', borderColor: `${ac}25` }}>
        <div className="p-5 border-b" style={{ borderColor: `${ac}20` }}>
          <div className="flex items-center gap-3 mb-1">
            <motion.div whileHover={{ rotate: 360 }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ backgroundColor: ac, color: '#0d0b10' }}>{about?.name?.charAt(0) || 'D'}</motion.div>
            <div>
              <p className="text-sm font-bold" style={{ color: textColor }}>{about?.name || portfolio.title}</p>
              <p className="text-xs font-mono" style={{ color: subColor }}>{about?.title || 'developer'}</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { label: 'about', icon: '◉' },
            { label: 'experience', icon: '▣' },
            { label: 'projects', icon: '▤' },
            { label: 'skills', icon: '◆' },
            { label: 'contact', icon: '✉' },
          ].map(s => (
            <motion.a key={s.label} href={`#${s.label}`} whileHover={{ x: 5, color: ac }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors" style={{ color: subColor }}>
              <span>{s.icon}</span><span>$ cd {s.label}</span>
            </motion.a>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: `${ac}20` }}>
          <div className="font-mono text-xs" style={{ color: `${ac}60` }}>
            <p> uptime</p>
            <p className="text-green-400">online</p>
          </div>
        </div>
      </motion.aside>

      <div className="lg:ml-64 relative">
        {/* Mobile nav */}
        <motion.nav initial={{ y: -80 }} animate={{ y: 0 }}
          className="lg:hidden fixed top-0 w-full z-50 backdrop-blur-md border-b" style={{ backgroundColor: '#121016dd', borderColor: `${ac}25` }}>
          <div className="flex items-center gap-2 px-4 py-3 font-mono text-sm" style={{ color: subColor }}>
            <span style={{ color: ac }}></span>
            <span>{about?.name || portfolio.title}  -  portfolio</span>
          </div>
        </motion.nav>

        <div className="lg:pt-0 pt-14">
          {/* Hero */}
          <section id="hero" className="min-h-screen flex items-center px-6 md:px-16 relative overflow-hidden"
            style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
            <motion.div className="absolute inset-0 opacity-[0.03] font-mono text-xs leading-relaxed overflow-hidden select-none pointer-events-none p-10" style={{ color: textColor }}>
              {Array.from({ length: 60 }).map((_, i) => <div key={i}>{`const ${['app', 'data', 'config', 'state', 'user', 'portfolio'][i % 6]} = await fetch('/api/${['v1', 'latest', 'beta', 'dev', 'stable', 'experimental'][i % 6]}');`}</div>)}
            </motion.div>
            <div className="relative z-10 max-w-4xl">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-sm mb-4" style={{ color: `${ac}60` }}>
                <span style={{ color: '#50fa7b' }}>$</span> cat /etc/README.md
              </motion.div>
              {hero?.greeting && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="inline-block px-4 py-1.5 rounded text-xs font-mono font-bold mb-6" style={{ backgroundColor: `${ac}20`, color: ac }}>{hero.greeting}</motion.span>}
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-5xl sm:text-7xl font-black leading-none mb-4 font-mono">
                <span style={{ color: '#50fa7b' }}>{'>'}</span> {hero?.headline || about?.name || portfolio.title}
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl font-mono mb-10" style={{ color: subColor }}>
                <span style={{ color: '#f1fa8c' }}>//</span> {hero?.subheadline || 'Building things for the web'}
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="flex gap-4 flex-wrap">
                <motion.a href={hero?.cta_url || '#projects'} whileHover={{ scale: 1.05 }} className="px-8 py-3.5 rounded font-mono font-bold text-sm" style={{ backgroundColor: ac, color: '#121016' }}>
                  <span style={{ color: '#121016' }}></span> view_projects()
                </motion.a>
              {about?.cv_url && <motion.a href={about.cv_url} target="_blank" whileHover={{ scale: 1.05 }}
                className="px-8 py-3.5 rounded font-mono font-bold text-sm border-2" style={{ borderColor: `${ac}40`, color: subColor }}>
                <span style={{ color: '#f1fa8c' }}></span> download_resume()
              </motion.a>}
              {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                <motion.a href={hero.cta_secondary_url} target="_blank" whileHover={{ scale: 1.05 }}
                  className="px-8 py-3.5 rounded font-mono font-bold text-sm border-2" style={{ borderColor: `${ac}40`, color: subColor }}>
                  <span style={{ color: '#f1fa8c' }}></span> {hero.cta_secondary_text}()
                </motion.a>
              )}
            </motion.div>
            </div>
          </section>

          {/* About */}
          {about?.name && (
            <section id="about" className="py-24 px-6 md:px-16">
              <div className="max-w-5xl mx-auto">
                <FadeUp>
                  <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                    <span style={{ color: '#50fa7b' }}>$</span> cat ~/about.md
                  </div>
                  <div className="rounded-xl border p-8 md:p-12" style={{ borderColor: `${ac}20`, backgroundColor: panelBg }}>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {about.photo_url && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="shrink-0"
                        >
                          <img
                            src={about.photo_url}
                            alt={about.name}
                            className="w-40 h-40 rounded-full object-cover border-2"
                            style={{ borderColor: `${ac}30` }}
                          />
                        </motion.div>
                      )}
                      <div>
                        <h2 className="text-2xl font-black font-mono mb-1">{about.name}</h2>
                        <p style={{ color: ac }} className="font-mono text-sm mb-4">@{about.title}</p>
                        <p className="text-sm leading-relaxed text-justify whitespace-pre-line" style={{ color: subColor }}>{about.bio}</p>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              </div>
            </section>
          )}

          {/* Experience */}
          {experience?.length > 0 && (
            <section id="experience" className="py-24 px-6 md:px-16">
              <div className="max-w-5xl mx-auto">
                <FadeUp>
                  <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                    <span style={{ color: '#50fa7b' }}>$</span> ls -la ~/experience/
                  </div>
                  <div className="space-y-4">
                    {experience.map((exp: any, i: number) => (
                      <motion.div key={exp.id} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                        className="rounded-xl border p-6 md:p-8" style={{ borderColor: `${ac}20`, backgroundColor: panelBg }}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h3 className="text-lg font-black font-mono" style={{ color: textColor }}>{'>'} {exp.position}</h3>
                          <span className="font-mono text-xs px-3 py-1 rounded border" style={{ borderColor: `${ac}30`, color: ac }}>{exp.start_date?.slice(0, 7)} to {exp.end_date?.slice(0, 7) || 'HEAD'}</span>
                        </div>
                        <p className="font-mono text-sm mb-3" style={{ color: ac }}>@ {exp.company}</p>
                        {exp.description && <div className="font-mono text-xs space-y-1.5" style={{ color: subColor }}>{exp.description.split(/[*-.\n]/).filter((s: string) => s.trim()).map((s: string, si: number) => (<div key={si} className="flex gap-2"><span className="text-green-400">OK</span><span>{s.trim()}</span></div>))}</div>}
                      </motion.div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </section>
          )}

          {/* Projects */}
          {projects?.length > 0 && (
            <section id="projects" className="py-24 px-6 md:px-16">
              <div className="max-w-6xl mx-auto">
                <FadeUp>
                  <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                    <span style={{ color: '#50fa7b' }}>$</span> ./scripts/deploy.sh
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((proj: any) => (
                      <motion.div key={proj.id} whileHover={{ y: -4, borderColor: ac }}
                        className="rounded-xl border p-5" style={{ borderColor: `${ac}15`, backgroundColor: panelBg }}>
                        {proj.image_url && <div className="overflow-hidden rounded-lg mb-4"><motion.img whileHover={{ scale: 1.05 }} src={proj.image_url} alt={proj.title} className="w-full h-40 object-cover" /></div>}
                        <h3 className="font-mono font-bold text-sm mb-1" style={{ color: ac }}>{'>'} {proj.title}</h3>
                        <p className="font-mono text-xs mb-3" style={{ color: subColor }}>{proj.description}</p>
                        {proj.tech_stack && <div className="flex flex-wrap gap-1.5 mb-4">{proj.tech_stack.split(',').map((t: string) => <TechBadge key={t} name={t.trim()} accentColor={ac} size="sm" variant="pill" />)}</div>}
                        <div className="flex gap-2 font-mono text-xs">
                          {proj.demo_url && <motion.a href={proj.demo_url} target="_blank" whileHover={{ scale: 1.05 }} className="px-4 py-1.5 rounded font-bold" style={{ backgroundColor: ac, color: '#121016' }}>demo</motion.a>}
                          {proj.github_url && <motion.a href={proj.github_url} target="_blank" whileHover={{ scale: 1.05 }} className="px-4 py-1.5 rounded border font-bold" style={{ borderColor: `${ac}40`, color: subColor }}>source</motion.a>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </section>
          )}

          {/* Skills */}
          {skills?.length > 0 && (
            <section id="skills" className="py-24 px-6 md:px-16">
              <div className="max-w-5xl mx-auto">
                <FadeUp>
                  <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                    <span style={{ color: '#50fa7b' }}>$</span> which skills
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map((skill: any) => (
                      <motion.div key={skill.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} whileHover={{ borderColor: ac }}
                        className="rounded-xl border p-5" style={{ borderColor: `${ac}15`, backgroundColor: panelBg }}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-green-400"></span>
                          <h3 className="font-mono font-bold text-sm" style={{ color: textColor }}>{skill.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">{skill.skills?.split(',').map((s: string) => <TechBadge key={s} name={s.trim()} accentColor={ac} size="sm" />)}</div>
                      </motion.div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </section>
          )}

          {/* Services */}
          {services?.length > 0 && (
            <section id="services" className="py-24 px-6 md:px-16">
              <div className="max-w-5xl mx-auto">
                <FadeUp>
                  <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                    <span style={{ color: '#50fa7b' }}>$</span> cat services.config.json
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {services.map((svc: any) => (
                      <motion.div key={svc.id} whileHover={{ y: -4 }} className="rounded-xl border p-6" style={{ borderColor: `${ac}15`, backgroundColor: panelBg }}>
                        <p className="text-2xl mb-3">{svc.icon || '✦'}</p>
                        <h3 className="font-mono font-black text-sm mb-2" style={{ color: textColor }}>{'>'} {svc.title}</h3>
                        <p className="font-mono text-xs text-justify" style={{ color: subColor }}>{svc.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </section>
          )}

          {/* Testimonials */}
          {testimonials?.length > 0 && (
            <section id="testimonials" className="py-24 px-6 md:px-16">
              <div className="max-w-4xl mx-auto">
                <FadeUp>
                  <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                    <span style={{ color: '#50fa7b' }}>$</span> cat ~/testimonials.log
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testimonials.map((t: any) => (
                      <div key={t.id} className="rounded-xl border p-5" style={{ borderColor: `${ac}15`, backgroundColor: panelBg }}>
                        <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <span key={i} className="text-xs" style={{ color: '#f1fa8c' }}></span>)}</div>
                        <p className="font-mono text-xs italic mb-4" style={{ color: subColor }}>{t.message}</p>
                        <div className="flex items-center gap-3 font-mono text-xs">
                          {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-8 h-8 rounded object-cover" />}
                          <div><span className="font-bold" style={{ color: textColor }}>{t.name}</span><br /><span style={{ color: ac }}>{t.position}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </section>
          )}

          {/* Gallery */}
          {gallery?.length > 0 && (
            <section id="gallery" className="py-24 px-6 md:px-16">
              <div className="max-w-6xl mx-auto">
                <FadeUp>
                  <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                    <span style={{ color: '#50fa7b' }}>$</span> open ~/certificates/
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gallery.map((cert: any) => (
                      <div key={cert.id} className="rounded-xl border p-5" style={{ borderColor: `${ac}15`, backgroundColor: panelBg }}>
                        {(cert.image_url || cert.file_url) && (
                          <div className="w-full h-32 rounded-lg mb-4 overflow-hidden bg-cover bg-center"
                            style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                            <img src={cert.image_url || cert.file_url} alt={cert.title}
                              className="w-full h-full object-cover"
                              onError={(e: any) => { e.target.style.display = 'none' }} />
                          </div>
                        )}
                        <h3 className="font-mono font-bold text-sm mb-1" style={{ color: textColor }}>{cert.title}</h3>
                        {cert.description && <p className="font-mono text-xs mb-2" style={{ color: subColor }}>{cert.description}</p>}
                        {cert.issued_date && <p className="font-mono text-xs mb-3" style={{ color: ac }}>{new Date(cert.issued_date).toLocaleDateString()}</p>}
                        {cert.file_url && <motion.a href={cert.file_url} target="_blank" whileHover={{ scale: 1.05 }} className="inline-block font-mono text-xs px-4 py-1.5 rounded font-bold" style={{ backgroundColor: ac, color: '#121016' }}>view</motion.a>}
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </section>
          )}

          {/* Custom */}
          {custom?.length > 0 && custom.map((sec: any) => (
            <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`} className="py-24 px-6 md:px-16">
              <div className="max-w-5xl mx-auto">
                <FadeUp>
                  <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                    <span style={{ color: '#50fa7b' }}>$</span> ./custom_sections/{sec.title.toLowerCase().replace(/\s+/g, '_')}.sh
                  </div>
                  <h2 className="font-mono text-2xl font-black mb-6" style={{ color: textColor }}>{'>'} {sec.title}</h2>
                  {sec.type === 'text' && <p className="font-mono text-sm leading-relaxed text-justify" style={{ color: subColor }}>{sec.content?.body}</p>}
                  {sec.type === 'list' && <div className="space-y-2">{(sec.content?.items || []).map((item: string, i: number) => <div key={i} className="flex gap-2 font-mono text-sm" style={{ color: subColor }}><span className="text-green-400">OK</span>{item}</div>)}</div>}
                  {sec.type === 'links' && <div className="flex flex-wrap gap-3">{(sec.content?.links || []).map((link: any, i: number) => <motion.a key={i} href={link.url} target="_blank" whileHover={{ scale: 1.05 }} className="font-mono text-sm px-6 py-3 rounded font-bold" style={{ backgroundColor: ac, color: '#121016' }}>{link.label}</motion.a>)}</div>}
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
                </FadeUp>
              </div>
            </section>
          ))}

          {/* Contact */}
          <section id="contact" className="py-24 px-6 md:px-16">
            <div className="max-w-3xl mx-auto">
              <FadeUp>
                <div className="font-mono text-xs mb-8" style={{ color: `${ac}50` }}>
                  <span style={{ color: '#50fa7b' }}>$</span> ./send_message.sh
                </div>
                <div className="rounded-xl border p-8" style={{ borderColor: `${ac}20`, backgroundColor: panelBg }}>
                  <h2 className="font-mono text-xl font-black mb-2" style={{ color: textColor }}>{'>'} Contact</h2>
                  <p className="font-mono text-sm mb-8" style={{ color: subColor }}>// Fill out the form below</p>
                  <div className="flex gap-4 mb-8 justify-center flex-wrap">
                    {(contact?.email || about?.email) && <motion.a href={`mailto:${contact?.email || about?.email}`} whileHover={{ scale: 1.05 }} className="font-mono text-sm px-6 py-3 rounded font-bold" style={{ backgroundColor: ac, color: '#121016' }}>send email</motion.a>}
                    {contact?.phone && <motion.a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" whileHover={{ scale: 1.05 }} className="font-mono text-sm px-6 py-3 rounded font-bold border-2" style={{ borderColor: `${ac}40`, color: subColor }}>WhatsApp</motion.a>}
                    {contact?.linkedin_url && <motion.a href={contact.linkedin_url} target="_blank" whileHover={{ scale: 1.05 }} className="font-mono text-sm px-6 py-3 rounded font-bold border-2" style={{ borderColor: `${ac}40`, color: subColor }}>LinkedIn</motion.a>}
                    {contact?.github_url && <motion.a href={contact.github_url} target="_blank" whileHover={{ scale: 1.05 }} className="font-mono text-sm px-6 py-3 rounded font-bold border-2" style={{ borderColor: `${ac}40`, color: subColor }}>GitHub</motion.a>}
                  </div>
                  <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
                </div>
              </FadeUp>
            </div>
          </section>
        </div>

        <footer className="py-8 px-6 text-center border-t" style={{ borderColor: `${ac}20`, backgroundColor: '#0d0b10' }}>
          <div className="font-mono text-xs" style={{ color: subColor }}>
            <p><span style={{ color: '#50fa7b' }}>$</span> echo "(c) 2026 {about?.name || portfolio.title}"</p>
            <p className="mt-1" style={{ color: `${ac}60` }}>Built with PortfolioKit  -  MIT License</p>
          </div>
        </footer>
      </div>
    </div>
  );
}



