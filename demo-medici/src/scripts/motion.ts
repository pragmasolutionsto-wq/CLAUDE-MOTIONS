// Animazioni leggere: scroll morbido (Lenis) + reveal discreti (GSAP ScrollTrigger).
// Il contenuto è visibile anche senza JS: le animazioni partono solo se lo script gira.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!ridotto) {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Ancore interne con Lenis
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -40 });
    });
  });

  // Hero: entrata a cascata
  gsap.from('[data-hero] > *', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.09, delay: 0.1 });
  gsap.from('[data-hero-art]', { opacity: 0, scale: 0.96, duration: 1.4, ease: 'power2.out', delay: 0.2 });

  // Parallax leggerissimo sulla grafica hero
  gsap.to('[data-parallax]', {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: '[data-hero-section]', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Reveal singoli
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Reveal a gruppi (card)
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    gsap.from(group.children, { y: 26, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: group, start: 'top 85%', once: true } });
  });
}

// Barra CTA mobile: appare dopo la hero, sparisce sulla CTA finale
const bar = document.querySelector<HTMLElement>('[data-mobile-cta]');
const hero = document.querySelector('[data-hero-section]');
const finale = document.querySelector('[data-cta-finale]');
if (bar && hero) {
  let dopoHero = false; let suFinale = false;
  const aggiorna = () => bar.classList.toggle('is-on', dopoHero && !suFinale);
  new IntersectionObserver(([e]) => { dopoHero = !e.isIntersecting; aggiorna(); }).observe(hero);
  if (finale) new IntersectionObserver(([e]) => { suFinale = e.isIntersecting; aggiorna(); }).observe(finale);
}
