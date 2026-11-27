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
