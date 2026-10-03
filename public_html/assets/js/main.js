/* Cauce · scripts de la página principal (los mismos que tenía cauce.html) */

// Aparición suave al hacer scroll
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
},{threshold: 0.1, rootMargin: '0px 0px -80px 0px'});

document.querySelectorAll('.estado, .pilar, .metodo-step, .aud-card, .faq-item, .value').forEach(el=>{
  el.classList.add('fadein');
  observer.observe(el);
});

// Globo de Calendly
window.addEventListener('load', function() { Calendly.initBadgeWidget({ url: 'https://calendly.com/cauce-ingenieria/cauce-consultoria-60-min-clon-clon-1', text: 'Agenda tu Café Cauce ☕', color: '#0d1b2a', textColor: '#ffffff', branding: true }); });
