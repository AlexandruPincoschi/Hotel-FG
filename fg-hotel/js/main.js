/* FG Logroño · lógica de la maqueta. Todo es simulado: no hay backend ni se guardan datos. */
const ROOMS = [
  { id: 'doble', type: 'doble', name: 'Habitación Doble Estándar', img: 'img/hab-doble.jpg', price: 75, capacity: 2, left: 3,
    desc: 'Cama de matrimonio o dos individuales, vistas exteriores y baño privado.', features: ['Wifi gratis', 'Minibar', 'Caja fuerte'] },
  { id: 'individual', type: 'individual', name: 'Doble Uso Individual', img: 'img/hab-individual.jpg', price: 65, capacity: 1, left: 2,
    desc: 'Ideal para viajes de negocios: intimidad total con todos los servicios.', features: ['Wifi gratis', 'TV satélite', 'Escritorio'] },
  { id: 'triple', type: 'triple', name: 'Habitación Triple', img: 'img/hab-triple.jpg', price: 95, capacity: 3, left: 1,
    desc: 'Espacio versátil con cama de matrimonio o dos individuales más supletoria.', features: ['Hasta 3 personas', 'Minibar', 'Baño privado'] },
  { id: 'suite', type: 'suite', name: 'Junior Suite', img: 'img/hab-suite.jpg', price: 120, capacity: 3, left: 2,
    desc: 'Dos ambientes con zona de estar para una estancia de lujo en el casco histórico.', features: ['2 ambientes', 'Zona de estar', 'Minibar'] }
];
 
const $ = (s, r = document) => r.querySelector(s);
const eur = n => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fmt = d => d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
 
/* Lee la búsqueda de la URL (?entrada=&salida=&huespedes=). Devuelve null si no es válida. */
function getSearch() {
  const p = new URLSearchParams(location.search);
  const a = parseDate(p.get('entrada')), b = parseDate(p.get('salida')), g = parseInt(p.get('huespedes'), 10);
  if (!a || !b || b <= a || !(g >= 1 && g <= 3)) return null;
  return { a, b, g, entrada: p.get('entrada'), salida: p.get('salida'), nights: Math.round((b - a) / 864e5) };
}
 
/* Fechas: entrada desde hoy y salida siempre posterior a la entrada */
function initDates(form) {
  const e = form.elements.entrada, s = form.elements.salida;
  e.min = iso(new Date());
  e.addEventListener('change', () => {
    if (!e.value) return;
    const min = iso(addDays(parseDate(e.value), 1));
    s.min = min;
    if (s.value && s.value < min) s.value = min;
  });
}
 
/* Validación Bootstrap. Devuelve true si el formulario es válido. */
function validate(form, ev) {
  if (!form.checkValidity()) {
    ev.preventDefault(); ev.stopPropagation();
    form.classList.add('was-validated');
    return false;
  }
  return true;
}
 
/* ---------- Landing: formulario de contacto (simulado) ---------- */
function initHome() {
  const f = $('#contactForm');
  f.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!validate(f, ev)) return;
    $('#contactOk').classList.remove('d-none');
    f.reset(); f.classList.remove('was-validated');
  });
}
 
/* ---------- Rooms: filtro por tipo ---------- */
function initRooms() {
  const buttons = document.querySelectorAll('[data-filter]');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('[data-type]').forEach(c =>
      c.classList.toggle('d-none', btn.dataset.filter !== 'all' && c.dataset.type !== btn.dataset.filter));
  }));
}
 
/* ---------- Available Rooms: resultados de ejemplo ---------- */
function initAvailable() {
  const s = getSearch(), f = $('form[data-search]');
  if (!s) { $('#noSearch').classList.remove('d-none'); return; }
  f.elements.entrada.value = s.entrada; f.elements.salida.value = s.salida; f.elements.huespedes.value = s.g;
  f.elements.entrada.dispatchEvent(new Event('change'));
  $('#summary').textContent = `${fmt(s.a)} → ${fmt(s.b)} · ${plural(s.nights, 'noche', 'noches')} · ${plural(s.g, 'huésped', 'huéspedes')}`;
 
  const list = ROOMS.filter(r => r.capacity >= s.g);
  if (!list.length) { $('#noRooms').classList.remove('d-none'); return; }
  $('#results').innerHTML = list.map(r => `
    <div class="col-12">
      <article class="card card-fg">
        <div class="row g-0">
          <div class="col-md-4"><img src="${r.img}" alt="${r.name}" class="img-ph img-card h-100" style="min-height:200px"></div>
          <div class="col-md-8">
            <div class="card-body p-3 p-md-4 d-flex flex-column h-100">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <h2 class="h4 mb-2">${r.name}</h2>
                ${r.left === 1 ? '<span class="badge text-bg-warning">Última habitación</span>' : `<span class="badge text-bg-light border">${r.left} disponibles</span>`}
              </div>
              <p class="text-muted-fg small mb-2">${r.desc}</p>
              <div class="d-flex flex-wrap gap-2 mb-3">${r.features.map(x => `<span class="chip">${x}</span>`).join('')}</div>
              <div class="mt-auto d-flex flex-wrap justify-content-between align-items-end gap-3 border-top pt-3">
                <div><div class="small text-muted-fg">${eur(r.price)} / noche · ${plural(s.nights, 'noche', 'noches')}</div>
                  <div class="price">${eur(r.price * s.nights)}</div></div>
                <a class="btn btn-fg px-4" href="reservation.html?room=${r.id}&entrada=${s.entrada}&salida=${s.salida}&huespedes=${s.g}">Seleccionar</a>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>`).join('');
}
 
/* ---------- Complete Reservation ---------- */
function initReservation() {
  const s = getSearch();
  const room = ROOMS.find(r => r.id === new URLSearchParams(location.search).get('room'));
  if (!s || !room || room.capacity < s.g) {
    $('#noData').classList.remove('d-none'); $('#reservationWrap').classList.add('d-none'); return;
  }
  const total = room.price * s.nights;
  const set = (id, v) => { $(id).textContent = v; };
  $('#sumImg').src = room.img; $('#sumImg').alt = room.name;
  set('#sumRoom', room.name); set('#sumIn', fmt(s.a)); set('#sumOut', fmt(s.b));
  set('#sumGuests', plural(s.g, 'huésped', 'huéspedes')); set('#sumNights', plural(s.nights, 'noche', 'noches'));
  set('#sumPrice', eur(room.price)); set('#sumTotal', eur(total));
 
  const f = $('#reservationForm');
  f.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!validate(f, ev)) return;
    set('#bookingRef', 'FG-' + Math.random().toString(36).slice(2, 8).toUpperCase());
    set('#modalRoom', room.name); set('#modalTotal', eur(total));
    new bootstrap.Modal('#confirmModal').show();
    f.reset(); f.classList.remove('was-validated'); // no se conserva ningún dato
  });
}
 
/* ---------- Navbar ---------- */
function initNavbar() {
  const menu = $('#menu');
  const links = [...menu.querySelectorAll('.nav-link')];
 
  // Móvil: cierra el menú al pulsar una opción (los enlaces #reserva y #contacto no recargan la página)
  links.forEach(l => l.addEventListener('click', () => {
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
  }));
 
  // Solo en la Landing: marca la opción activa según la sección visible
  if (document.body.dataset.page !== 'home') return;
  const byHref = h => links.find(l => l.getAttribute('href') === h);
  const reserva = $('#reserva'), contacto = $('#contacto');
  const setActive = target => links.forEach(l => {
    l.classList.toggle('active', l === target);
    l.toggleAttribute('aria-current', l === target);
  });
  const update = () => {
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const r = reserva.getBoundingClientRect(), c = contacto.getBoundingClientRect();
    if (c.top <= 120 || atBottom) setActive(byHref('index.html#contacto'));
    else if (r.top <= 120 && r.bottom > 120) setActive(byHref('index.html#reserva'));
    else setActive(byHref('index.html'));
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  update();
}
 
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  document.querySelectorAll('form[data-search]').forEach(f => {
    initDates(f);
    f.addEventListener('submit', ev => validate(f, ev));
  });
  const pages = { home: initHome, rooms: initRooms, available: initAvailable, reservation: initReservation };
  (pages[document.body.dataset.page] || (() => {}))();
});
 