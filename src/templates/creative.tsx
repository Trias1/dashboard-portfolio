'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TechBadge from '@/components/TechIcon';
import ContactForm from '@/components/ContactForm';
import CertificationSection from '@/components/CertificationSection';

function Section({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  );
}

export default function CreativeTemplate({ data, theme, isPreview }: { data: any, theme: any, isPreview?: boolean }) {
  const { portfolio, hero, about, experience, projects, services, skills, testimonials, contact, gallery, custom } = data;
  const ac = theme.accent;
  const isLight = theme.bg === '#ffffff';
  const textColor = isLight ? '#111' : '#fff';
  const subColor = isLight ? '#555' : '#9ca3af';
  const cardBg = isLight ? '#f9f9f9' : 'rgba(255,255,255,0.04)';
  const sidebarBg = isLight ? '#f0f0f0' : 'rgba(255,255,255,0.03)';

  const navItems = ['About', 'Experience', 'Projects', 'Skills', 'Contact'];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: theme.bg }}>

      {/* Sidebar kiri  -  fixed */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col fixed h-screen overflow-y-auto border-r"
        style={{ backgroundColor: sidebarBg, borderColor: `${ac}20` }}>

        {/* Profile */}
        <div className="p-8 border-b" style={{ borderColor: `${ac}20` }}>
          {about?.photo_url && (
            <motion.img src={about.photo_url} alt={about?.name}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 shrink-0" style={{ borderColor: ac }} />
          )}
          <h1 className="text-xl font-bold mb-1" style={{ color: textColor }}>{about?.name || portfolio.title}</h1>
          <p className="text-sm font-medium mb-3" style={{ color: ac }}>{about?.title || ''}</p>
        </div>

        {/* Nav */}
        <nav className="p-6 flex-1">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: `${ac}80` }}>Navigation</p>
          <div className="space-y-1">
            {navItems.map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition hover:opacity-80"
                style={{ color: subColor }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} />
                {item}
              </a>
            ))}
          </div>
        </nav>

        {/* Contact info */}
        <div className="p-6 border-t space-y-2" style={{ borderColor: `${ac}20` }}>
          {contact?.email && <p className="text-xs" style={{ color: subColor }}> {contact.email}</p>}
          {contact?.location && <p className="text-xs" style={{ color: subColor }}> {contact.location}</p>}
          {about?.cv_url && (
            <a href={about.cv_url} target="_blank"
              className="block text-center text-xs py-2 rounded-lg font-medium mt-3 transition hover:opacity-80"
              style={{ backgroundColor: `${ac}20`, color: ac }}>
               Download CV
            </a>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-72 overflow-y-auto">

        {/* Mobile header */}
        <div className="lg:hidden px-6 py-4 border-b flex items-center gap-4" style={{ borderColor: `${ac}20` }}>
          {about?.photo_url && <img src={about.photo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />}
          <div>
            <p className="font-bold text-sm" style={{ color: textColor }}>{about?.name || portfolio.title}</p>
            <p className="text-xs" style={{ color: ac }}>{about?.title}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-16 md:space-y-20">

          {/* Hero */}
          <section id="hero" style={hero?.background_url ? { backgroundImage: `url(${hero.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            className="relative">
            {hero?.background_url && <div className="absolute inset-0 bg-black/60" />}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="relative z-10">
              <p className="text-sm mb-2" style={{ color: ac }}> Hello, I'm</p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 leading-tight" style={{ color: textColor }}>
                {hero?.headline || about?.name || portfolio.title}
              </h1>
              <p className="text-2xl mb-6" style={{ color: ac }}>{hero?.subheadline || ''}</p>
              <div className="flex gap-3 flex-wrap">
                <a href={hero?.cta_url || '#projects'}
                  className="px-6 py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: ac }}>
                  {hero?.cta_text || 'View My Work'}
                </a>
                <a href="#contact"
                  className="px-6 py-3 rounded-xl font-semibold border transition hover:opacity-80"
                  style={{ borderColor: `${ac}50`, color: ac }}>
                  Contact Me
                </a>
                {hero?.cta_secondary_text && hero?.cta_secondary_url && (
                  <a href={hero.cta_secondary_url} target="_blank"
                    className="px-6 py-3 rounded-xl font-semibold border transition hover:opacity-80"
                    style={{ borderColor: `${ac}50`, color: ac }}>
                    {hero.cta_secondary_text}
                  </a>
                )}
              </div>
            </motion.div>
          </section>

          {/* Skills horizontal pills */}
          {skills?.length > 0 && (
            <section id="skills">
              <Section>
                <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
                  <span style={{ color: ac }}>#</span> Skills
                </h2>
                <div className="space-y-4">
                  {skills.map((sk: any) => (
                    <div key={sk.id}>
                      {sk.title && <p className="text-xs uppercase tracking-widest mb-2" style={{ color: `${ac}80` }}>{sk.title}</p>}
                      <div className="flex flex-wrap gap-2">
                        {sk.skills?.split(',').map((s: string) => (
                          <TechBadge key={s} name={s.trim()} accentColor={ac} variant="outline" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </section>
          )}

          {/* Experience timeline */}
          {experience?.length > 0 && (
            <section id="experience">
              <Section>
                <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
                  <span style={{ color: ac }}>#</span> Experience
                </h2>
                <div className="space-y-6">
                  {experience.map((exp: any, i: number) => (
                    <motion.div key={exp.id}
                      initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ac }} />
                        {i < experience.length - 1 && <div className="w-px flex-1 mt-2" style={{ backgroundColor: `${ac}30` }} />}
                      </div>
                      <div className="pb-6 flex-1">
                        <div className="flex justify-between items-start mb-1 flex-wrap gap-1">
                          <div>
                            <p className="font-bold" style={{ color: textColor }}>{exp.position}</p>
                            <p className="text-sm font-medium" style={{ color: ac }}>{exp.company}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: `${ac}15`, color: ac }}>
                            {exp.start_date?.slice(0,7)}  -  {exp.end_date?.slice(0,7) || 'Present'}
                          </span>
                        </div>
                        {exp.description && <div className="text-sm mt-2 space-y-0.5" style={{ color: subColor }}>{(exp.description.split(/[*-]/).filter((s: string) => s.trim()).length > 1 ? exp.description.split(/[*-]/).filter((s: string) => s.trim()) : exp.description.split(/\.\s+(?=[A-Z])/).filter((s: string) => s.trim())).map((s: string, i: number) => (<div key={i} className="flex gap-1.5 mb-1"><span className="mt-0.5 shrink-0">*</span><span>{s.trim()}</span></div>))}</div>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Section>
            </section>
          )}

          {/* Projects grid */}
          {projects?.length > 0 && (
            <section id="projects">
              <Section>
                <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
                  <span style={{ color: ac }}>#</span> Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((proj: any) => (
                    <motion.div key={proj.id} whileHover={{ y: -4 }}
                      className="p-5 rounded-2xl border transition-all"
                      style={{ backgroundColor: cardBg, borderColor: `${ac}20` }}>
                      {proj.image_url && <img src={proj.image_url} alt={proj.title} className="w-full h-32 object-cover rounded-xl mb-3" />}
                      <h3 className="font-bold mb-1" style={{ color: textColor }}>{proj.title}</h3>
                      <p className="text-xs mb-3 text-justify" style={{ color: subColor }}>{proj.description}</p>
                        {proj.tech_stack && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {proj.tech_stack.split(',').map((t: string) => (
                            <TechBadge key={t} name={t.trim()} accentColor={ac} />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3">
                        {proj.demo_url && <a href={proj.demo_url} target="_blank" className="text-xs font-medium" style={{ color: ac }}> Demo</a>}
                        {proj.github_url && <a href={proj.github_url} target="_blank" className="text-xs font-medium" style={{ color: ac }}> Code</a>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Section>
            </section>
          )}

          {/* Services */}
          {services?.length > 0 && (
            <section id="services">
              <Section>
                <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
                  <span style={{ color: ac }}>#</span> Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {services.map((svc: any) => (
                    <div key={svc.id} className="p-5 rounded-2xl border text-center"
                      style={{ backgroundColor: cardBg, borderColor: `${ac}20` }}>
                      <div className="text-3xl mb-3">{svc.icon || '✦'}</div>
                      <h3 className="font-bold text-sm mb-1" style={{ color: textColor }}>{svc.title}</h3>
                      <p className="text-xs text-justify" style={{ color: subColor }}>{svc.description}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </section>
          )}

          {/* Testimonials */}
          {testimonials?.length > 0 && (
            <section id="testimonials">
              <Section>
                <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
                  <span style={{ color: ac }}>#</span> Testimonials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testimonials.map((tm: any) => (
                    <div key={tm.id} className="p-5 rounded-2xl border"
                      style={{ backgroundColor: cardBg, borderColor: `${ac}20` }}>
                      <p className="text-sm italic mb-4" style={{ color: subColor }}>"{tm.message}"</p>
                      <div className="flex items-center gap-3">
                        {tm.photo_url && <img src={tm.photo_url} alt={tm.name} className="w-9 h-9 rounded-full object-cover" />}
                        <div>
                          <p className="text-sm font-bold" style={{ color: textColor }}>{tm.name}</p>
                          <p className="text-xs" style={{ color: ac }}>{tm.position}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </section>
          )}

          {/* Custom Sections */}
          {custom?.length > 0 && custom.map((sec: any) => (
            <section key={sec.id} id={`custom-${(sec.title || sec.original_type || '').toLowerCase().replace(/\s+/g, '-')}`}>
              <Section>
                <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
                  <span style={{ color: ac }}>#</span> {sec.title}
                </h2>
                {sec.type === 'text' && (
                  <p className="text-sm leading-relaxed" style={{ color: subColor }}>{sec.content?.body}</p>
                )}
                {sec.type === 'list' && (
                  <ul className="space-y-2">
                    {(sec.content?.items || []).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: subColor }}>
                        <span style={{ color: ac }}></span>{item}
                      </li>
                    ))}
                  </ul>
                )}
                {sec.type === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(sec.content?.cards || []).map((card: any, i: number) => (
                      <div key={i} className="p-5 rounded-2xl border" style={{ backgroundColor: cardBg, borderColor: `${ac}20` }}>
                        {card.icon && <div className="text-2xl mb-2">{card.icon}</div>}
                        <h3 className="font-bold text-sm mb-1" style={{ color: textColor }}>{card.title}</h3>
                        <p className="text-xs" style={{ color: subColor }}>{card.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
                {sec.type === 'links' && (
                  <div className="flex flex-wrap gap-3">
                    {(sec.content?.links || []).map((link: any, i: number) => (
                      <a key={i} href={link.url} target="_blank"
                        className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
                        style={{ backgroundColor: `${ac}20`, color: ac }}>
                        {link.label}
                      </a>
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
                          <div className="p-6 rounded-2xl border" style={{background: cardBg, borderColor: `${ac}20`}}>
                            {c.institution && <p className="text-lg font-semibold" style={{color: textColor}}>{c.institution}</p>}
                            {(c.degree || c.field) && <p className="text-sm mt-1" style={{color: subColor}}>{[c.degree, c.field].filter(Boolean).join('  -  ')}</p>}
                            {(c.start_date || c.end_date) && <p className="text-xs mt-1" style={{color: subColor}}>{[c.start_date?.slice(0,7), c.end_date?.slice(0,7)].filter(Boolean).join(' - ')}</p>}
                            {c.gpa && <p className="text-xs mt-1" style={{color: subColor}}>GPA: {c.gpa}</p>}
                          </div>
                        );
                      }
                      if (c.name || c.issuer) {
                        return (
                          <div className="p-6 rounded-2xl border" style={{background: cardBg, borderColor: `${ac}20`}}>
                            {c.name && <p className="text-lg font-semibold" style={{color: textColor}}>{c.name}</p>}
                            {c.issuer && <p className="text-sm mt-1" style={{color: subColor}}>{c.issuer}</p>}
                            {c.date && <p className="text-xs mt-1" style={{color: subColor}}>{c.date}</p>}
                            {c.credential_url && <a href={c.credential_url} target="_blank" className="text-sm underline mt-2 inline-block" style={{color: ac}}>View credential</a>}
                          </div>
                        );
                      }
                      if (c.language) {
                        return (
                          <div className="flex items-center gap-3 p-6 rounded-2xl border" style={{background: cardBg, borderColor: `${ac}20`}}>
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
              </Section>
            </section>
          ))}

          {/* Certificates */}
          {gallery?.length > 0 && (
            <section id="gallery">
              <Section>
                <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
                  <span style={{ color: ac }}>#</span> Certificates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gallery.map((cert: any) => (
                    <motion.div key={cert.id} whileHover={{ y: -4 }}
                      className="p-5 rounded-2xl border transition-all"
                      style={{ backgroundColor: cardBg, borderColor: `${ac}20` }}>
                      {(cert.image_url || cert.file_url) && (
                        <div className="w-full h-36 rounded-xl mb-3 overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${cert.image_url || cert.file_url})` }}>
                          <img src={cert.image_url || cert.file_url} alt={cert.title}
                            className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.style.display = 'none' }} />
                        </div>
                      )}
                      <h3 className="font-bold mb-1" style={{ color: textColor }}>{cert.title}</h3>
                      {cert.description && <p className="text-xs mb-2" style={{ color: subColor }}>{cert.description}</p>}
                      {cert.issued_date && (
                        <p className="text-xs mb-3" style={{ color: ac }}>
                           {new Date(cert.issued_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {cert.file_url && (
                        <a href={cert.file_url} target="_blank"
                          className="inline-block text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-80"
                          style={{ backgroundColor: `${ac}20`, color: ac }}>
                           Lihat Certificate
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Section>
            </section>
          )}

          {/* Contact */}
          {data.portfolio?.sections_order?.find((section: any) => section.type === 'contact')?.enabled !== false && (
            <section id="contact">
            <Section>
              <div className="p-8 rounded-2xl border text-center"
                style={{ backgroundColor: `${ac}08`, borderColor: `${ac}30` }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>Let's work together</h2>
                <p className="text-sm mb-6" style={{ color: subColor }}>Have a project? I'd love to hear about it.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {(contact?.email || about?.email) && (
                    <a href={`mailto:${contact?.email || about?.email}`}
                      className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: ac }}>
                       Email
                    </a>
                  )}
                  {contact?.phone && (
                    <a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(about?.name || 'there')}%2C%20saya%20tertarik%20untuk%20bekerja%20sama!`}
                      target="_blank"
                      className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#25D366' }}>
                       WhatsApp
                    </a>
                  )}
                  {contact?.linkedin_url && (
                    <a href={contact.linkedin_url} target="_blank"
                      className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#0077B5' }}>
                       LinkedIn
                    </a>
                  )}
                  {contact?.github_url && (
                    <a href={contact.github_url} target="_blank"
                      className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#333' }}>
                       GitHub
                    </a>
                  )}
                </div>
                <div className="mt-8">
                  <ContactForm slug={portfolio.slug} accentColor={ac} textColor={textColor} subColor={subColor} />
                </div>
              </div>
            </Section>
            </section>
          )}

        </div>

        <footer className="text-center py-6 border-t text-xs" style={{ borderColor: `${ac}15`, color: subColor }}>
          (c) 2026 {about?.name || portfolio.title}. Built with 
          <p className="mt-1" style={{ color: `${ac}60` }}>Made with PortfolioKit</p>
        </footer>
      </main>
      </div>
  );
}


