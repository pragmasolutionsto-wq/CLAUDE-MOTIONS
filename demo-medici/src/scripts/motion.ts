// METODO: animazioni minime, solo comparsa morbida allo scroll.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 18, opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((g) => {
    gsap.from(g.children, { y: 18, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.07, scrollTrigger: { trigger: g, start: 'top 88%', once: true } });
  });
}

// Barra "Prenoti" su mobile: compare dopo la hero, sparisce sulla sezione contatti
const bar = document.querySelector<HTMLElement>('[data-mobile-cta]');
const hero = document.querySelector('[data-hero-section]');
const finale = document.querySelector('[data-cta-finale]');
if (bar && hero) {
  let dopo = false; let fine = false;
  const upd = () => bar.classList.toggle('is-on', dopo && !fine);
  new IntersectionObserver(([e]) => { dopo = !e.isIntersecting; upd(); }).observe(hero);
  if (finale) new IntersectionObserver(([e]) => { fine = e.isIntersecting; upd(); }).observe(finale);
}
