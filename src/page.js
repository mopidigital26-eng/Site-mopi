// JS mínimo das páginas interiores: revelação ao fazer scroll, sem bibliotecas.
window.__m = 1;
const els = document.querySelectorAll('.rv');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), {rootMargin: '0px 0px -8% 0px'});
  els.forEach(el => io.observe(el));
} else {
  els.forEach(el => el.classList.add('in'));
}
