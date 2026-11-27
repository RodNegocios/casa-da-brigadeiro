// Drift Wall adapted from the supplied React Bits component. CSS handles the
// alternating tracks so the photographs also render without JavaScript.
const gallery = document.querySelector('.gallery');
const button = gallery.querySelector('.motion');
const label = button.querySelector('.motion-label');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let playing = !motionPreference.matches;
let visible = true;

function updateGallery() {
  gallery.classList.toggle('is-playing', playing && visible && !document.hidden);
  label.textContent = playing ? 'Pausar galeria' : 'Animar galeria';
}

button.addEventListener('click', () => {
  playing = !playing;
  updateGallery();
});
motionPreference.addEventListener('change', event => {
  playing = !event.matches;
  updateGallery();
});
document.addEventListener('visibilitychange', updateGallery);
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateGallery();
  }).observe(gallery);
}
button.hidden = false;
updateGallery();

// ScrollStack uses the window's native scrolling. Incoming cards move the
// ones behind them back in proportion to the amount of overlap.
function setupCatalogStack(stack) {
  const slots = Array.from(stack.querySelectorAll('.catalog-slot'));
  const cards = slots.map(slot => slot.querySelector('.catalog-card'));
  if (cards.length < 2 || !('ResizeObserver' in window)) return;

  let pin = 0;
  let height = 0;
  let stride = 0;
  let active = false;
  let frame = 0;
  const paintedDepths = [];
  const step = 9;
  stack.style.setProperty('--card-count', cards.length);

  function paint() {
    frame = 0;
    if (!active) return;
    const travel = pin - stack.getBoundingClientRect().top;
    let depth = 0;
    for (let i = cards.length - 1; i >= 0; i--) {
      if (depth !== paintedDepths[i]) {
        const style = cards[i].style;
        style.setProperty('--retreat', (-depth * step).toFixed(2) + 'px');
        style.setProperty('--scale', Math.max(.82, 1 - depth * .045).toFixed(4));
        style.setProperty('--shade', (1 - .82 ** depth).toFixed(3));
        paintedDepths[i] = depth;
      }
      const distanceToPin = i * stride - travel;
      depth += Math.max(0, Math.min(1, 1 - distanceToPin / height));
    }
  }

  function schedule() {
    if (active && !frame) frame = requestAnimationFrame(paint);
  }

  function measure() {
    height = slots[0].offsetHeight;
    stride = height + parseFloat(getComputedStyle(stack).rowGap);
    pin = Math.min(Math.round(innerHeight * .13), innerHeight - height - 12);
    active = !motionPreference.matches && pin >= (cards.length - 1) * step + 8;
    stack.style.setProperty('--pin', pin + 'px');
    stack.classList.toggle('is-stacking', active);
    schedule();
  }

  // Shift+Tab can focus a link on an already covered card. Bring that card
  // back to its own reading position before the user activates the link.
  stack.addEventListener('focusin', event => {
    if (!active || !event.target.matches(':focus-visible')) return;
    const slot = event.target.closest('.catalog-slot');
    if (!slot) return;
    const y = scrollY + stack.getBoundingClientRect().top + slots.indexOf(slot) * stride - pin;
    window.scrollTo({ top: y, behavior: 'instant' });
  });
  const observer = new ResizeObserver(measure);
  slots.forEach(slot => observer.observe(slot));
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', schedule, { passive: true });
  motionPreference.addEventListener('change', measure);
  measure();
}

setupCatalogStack(document.querySelector('.catalog-stack'));
