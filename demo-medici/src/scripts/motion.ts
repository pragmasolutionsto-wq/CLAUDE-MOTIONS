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
  let dopo = false; let fine = false; let cal = false;
  const upd = () => bar.classList.toggle('is-on', dopo && !fine && !cal);
  new IntersectionObserver(([e]) => { dopo = !e.isIntersecting; upd(); }).observe(hero);
  if (finale) new IntersectionObserver(([e]) => { fine = e.isIntersecting; upd(); }).observe(finale);
  const calSez = document.querySelector('#prenota');
  if (calSez) new IntersectionObserver(([e]) => { cal = e.isIntersecting; upd(); }).observe(calSez);
}

// Box prenotazione: chip selezionabili (uno per gruppo) + link WhatsApp/mail ricomposto a ogni scelta
const boxPren = document.querySelector<HTMLElement>('[data-booking]');
const aggiornaPrenota = () => {
  if (!boxPren) return;
  const link = boxPren.querySelector<HTMLAnchorElement>('[data-prenota]');
  const motivo = boxPren.querySelector<HTMLElement>('[data-chip="motivo"][aria-pressed="true"]')?.dataset.frase;
  const sede = boxPren.querySelector<HTMLSelectElement>('[data-sede-select]')?.value ?? boxPren.querySelector<HTMLElement>('[data-chip="sede"][aria-pressed="true"]')?.dataset.frase;
  if (!link || !motivo || !sede) return;
  const testo = `Buongiorno Dottore, vorrei prenotare una visita per ${motivo} presso ${sede}.`;
  const { wa, email, oggetto } = boxPren.dataset;
  link.href = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(testo)}`
    : `mailto:${email}?subject=${encodeURIComponent(oggetto ?? '')}&body=${encodeURIComponent(testo)}`;
};
document.querySelectorAll<HTMLElement>('[data-chip]').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll<HTMLElement>(`[data-chip="${b.dataset.chip}"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    aggiornaPrenota();
  });
});
document.querySelector('[data-sede-select]')?.addEventListener('change', aggiornaPrenota);
aggiornaPrenota();

// Caroselli con frecce
document.querySelectorAll<HTMLElement>('[data-carosello]').forEach((c) => {
  const t = c.querySelector<HTMLElement>('[data-traccia]');
  c.querySelectorAll<HTMLElement>('[data-scorri]').forEach((b) => b.addEventListener('click', () => {
    if (t) t.scrollBy({ left: Number(b.dataset.scorri) * t.clientWidth * 0.8, behavior: 'smooth' });
  }));
});
