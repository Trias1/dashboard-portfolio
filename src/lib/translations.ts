export type Lang = 'id' | 'en';

export const t = {
  nav: {
    login: { en: 'Login', id: 'Masuk' },
    getStarted: { en: 'Get Started Free', id: 'Mulai Gratis' },
  },
  hero: {
    badge: { en: 'Free to use  -  No credit card required', id: 'Gratis  -  Tanpa kartu kredit' },
    title1: { en: 'Build your', id: 'Buat' },
    title2: { en: 'portfolio', id: 'portfolio' },
    title3: { en: 'in minutes', id: 'dalam menit' },
    desc: { en: 'Drag & drop builder, live preview, 5 themes. Build a professional portfolio without coding  -  publish instantly with your unique URL.', id: 'Drag & drop builder, live preview, 5 tema. Buat portfolio profesional tanpa coding  -  publish langsung dengan URL unikmu.' },
    cta: { en: ' Start Building Free', id: ' Mulai Gratis' },
    demo: { en: ' Live Demo', id: ' Lihat Demo' },
    madeFor: { en: 'Made for developers & designers ', id: 'Dibuat untuk developer & designer Indonesia ' },
  },
  themes: {
    label: { en: '5 Beautiful Themes', id: '5 Tema Keren' },
    title: { en: 'Choose your', id: 'Pilih gaya' },
    titleAccent: { en: 'favorite style', id: 'favoritmu' },
    active: { en: 'Active theme', id: 'Tema aktif' },
    hint: { en: 'click to change', id: 'klik untuk ganti' },
  },
  features: {
    label: { en: 'Features', id: 'Fitur' },
    title: { en: 'Everything you', id: 'Semua yang kamu' },
    titleAccent: { en: 'need', id: 'butuhkan' },
    items: {
      en: [
        { icon: '', title: 'Drag & Drop Builder', desc: 'Arrange portfolio sections however you like, no coding needed.' },
        { icon: '', title: 'Live Preview', desc: 'See results in real-time before publishing.' },
        { icon: '', title: '5 Custom Themes', desc: 'Choose a theme that matches your personality.' },
        { icon: '', title: 'One-Click Publish', desc: 'Portfolio goes live instantly with your unique URL.' },
        { icon: '', title: 'Mobile Friendly', desc: 'Looks great on all devices.' },
        { icon: '', title: 'Secure & Private', desc: 'Your data is safe, publish whenever you want.' },
      ],
      id: [
        { icon: '', title: 'Drag & Drop Builder', desc: 'Susun section portfolio sesuka hati tanpa coding.' },
        { icon: '', title: 'Live Preview', desc: 'Lihat hasilnya real-time sebelum dipublish.' },
        { icon: '', title: '5 Custom Themes', desc: 'Pilih tema yang sesuai kepribadianmu.' },
        { icon: '', title: 'One-Click Publish', desc: 'Portfolio langsung live dengan URL unikmu.' },
        { icon: '', title: 'Mobile Friendly', desc: 'Tampilan optimal di semua perangkat.' },
        { icon: '', title: 'Secure & Private', desc: 'Data kamu aman, publish kapan kamu mau.' },
      ],
    },
  },
  steps: {
    label: { en: 'How it works', id: 'Cara kerja' },
    title: { en: '3 simple', id: '3 langkah' },
    titleAccent: { en: 'steps', id: 'simpel' },
    items: {
      en: [
        { num: '01', title: 'Register', desc: 'Create a free account in 30 seconds.' },
        { num: '02', title: 'Build', desc: 'Fill sections, upload photos, pick a theme.' },
        { num: '03', title: 'Publish', desc: 'Click publish and share your URL with the world.' },
      ],
      id: [
        { num: '01', title: 'Register', desc: 'Buat akun gratis dalam 30 detik.' },
        { num: '02', title: 'Build', desc: 'Isi section, upload foto, pilih tema.' },
        { num: '03', title: 'Publish', desc: 'Klik publish dan share URL-mu ke dunia.' },
      ],
    },
  },
  cta: {
    title: { en: 'Start now,', id: 'Mulai sekarang,' },
    titleAccent: { en: 'free!', id: 'gratis!' },
    desc: { en: 'No credit card. Setup in 2 minutes.', id: 'Tidak perlu kartu kredit. Setup dalam 2 menit.' },
    btn: { en: ' Build My Portfolio', id: ' Buat Portfolio Saya' },
  },
  footer: {
    text: { en: '(c) 2026 PortfolioKit. Built with  for Indonesian developers.', id: '(c) 2026 PortfolioKit. Dibuat dengan  untuk developer Indonesia.' },
  },
};

export const g = (key: any, lang: Lang) => key[lang] ?? key['en'];
