// /JS/quote.js
const API = '/api/posts';
const WHATSAPP_NUMBER = '573142851999'; // Número de WhatsApp
const tokenKey = 'api_token';
const roleKey = 'user_role';

// ==================
// AUTH HELPERS
// ==================
function getToken(){ return localStorage.getItem(tokenKey); }
function setToken(t){ if(t) localStorage.setItem(tokenKey,t); else localStorage.removeItem(tokenKey); }
function getRole(){ return localStorage.getItem(roleKey); }
function setRole(r){ if(r) localStorage.setItem(roleKey,r); else localStorage.removeItem(roleKey); }

// ==================
// ESCAPE HTML
// ==================
function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, c => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]
  ));
}

function normalizeImagePath(url) {
  if(!url) return '';
  if(/^https?:\/\//i.test(url)) return url;
  if(url.startsWith('/')) return url;
  return '/' + url;
}

// ==================
// MENSAJE DE COTIZACIÓN
// ==================
function generarMensaje(titulo) {
  return `Hello, 

This is (your name), I am interested in a product similar to the one in the publication and I would like to request more information in order to get a quotation. 

As a company, we kindly request that you provide your phone number or email so we can communicate with you more effectively. **We would appreciate a prompt response.**

Publication: ${titulo}

Phone number: 
Email: 
Name: `;
}

// ==================
// ABRIR CORREO PREDETERMINADO
// ==================
function abrirCorreoPredeterminado(titulo) {
  const correoDestino = "jchaparrovaca@gmail.com";
  const subject = `Quotation Request: ${titulo}`;
  const body = generarMensaje(titulo);

  const url = `mailto:${correoDestino}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

// ==================
// CARRUSEL HTML
// ==================
function buildCarousel(images, titulo) {
  if(!images || images.length === 0) return '';
  if(typeof images === 'string') images = [images];

  let slides = images.map((img, i) => `
    <div class="carousel-slide ${i === 0 ? 'active' : ''}">
      <img src="${normalizeImagePath(img)}" alt="${escapeHtml(titulo)}">
    </div>
  `).join('');

  return `
    <div class="carousel">
      <div class="carousel-inner">
        ${slides}
      </div>
      ${images.length > 1 ? `
        <button class="carousel-control prev">❮</button>
        <button class="carousel-control next">❯</button>
      ` : ''}
    </div>
  `;
}

// ==================
// RENDER POSTS
// ==================
async function render(){
  const list = document.getElementById('list');
  list.innerHTML = 'Loading posts...';

  try {
    const res = await fetch(API);
    if(!res.ok) throw new Error('Error fetching posts');
    const posts = await res.json();

    if(!Array.isArray(posts) || posts.length === 0) {
      list.innerHTML = '<p>No posts available yet.</p>';
      return;
    }

    list.innerHTML = posts.map(p => {
      const imgs = Array.isArray(p.imagenes) && p.imagenes.length > 0 ? p.imagenes : (p.imagen ? [p.imagen] : []);
      const avg = (p.avgRating || p.avgRating === 0) ? Number(p.avgRating).toFixed(1) : 'No rating yet';
      const viewLink = '/Paginas/Detail.html?id=' + encodeURIComponent(p.id);
      const mensaje = encodeURIComponent(generarMensaje(p.titulo || ''));

      return `
        <article class="card" data-id="${p.id}">
          ${ imgs.length ? `
            <div class="imgWrap">
              ${buildCarousel(imgs, p.titulo)}
              <div class="overlay">
                <a class="btn" href="${viewLink}">View comments and rating</a>
                <a class="btn" target="_blank" href="https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}">
                  Request quote via WhatsApp
                </a>
                <a class="btn cotizar-btn" data-title="${escapeHtml(p.titulo)}" href="#">
                  Request quote via Email
                </a>
              </div>
            </div>` : '' }
          <div class="content">
            <h3>${escapeHtml(p.titulo)}</h3>
            <div class="meta">
              Avg rating: <strong>${avg}</strong>
            </div>
            <p>${escapeHtml(p.contenido || '')}</p>
          </div>
        </article>
      `;
    }).join('');

    document.querySelectorAll(".cotizar-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const titulo = btn.dataset.title;
        abrirCorreoPredeterminado(titulo);
      });
    });

    initCarousels();

  } catch (err) {
    console.error(err);
    list.innerHTML = '<p>Error loading posts. Check console.</p>';
  }
}

// ==================
// CARRUSEL SCRIPT (fade + autoplay + flechas visibles)
// ==================
function initCarousels(){
  document.querySelectorAll(".carousel").forEach(carousel => {
    const slides = carousel.querySelectorAll(".carousel-slide");
    const prevBtn = carousel.querySelector(".prev");
    const nextBtn = carousel.querySelector(".next");
    let index = 0;
    let interval;

    // Configuración inicial
    slides.forEach((s, i) => {
      s.style.opacity = i === 0 ? "1" : "0";
      s.style.position = "absolute";
      s.style.top = 0;
      s.style.left = 0;
      s.style.width = "100%";
      s.style.height = "100%";
      s.style.transition = "opacity 1s ease-in-out";
    });

    function showSlide(i) {
      slides[index].style.opacity = "0";
      index = (i + slides.length) % slides.length;
      slides[index].style.opacity = "1";
    }

    function nextSlide() { showSlide(index + 1); }
    function prevSlide() { showSlide(index - 1); }

    if(prevBtn) prevBtn.addEventListener("click", ()=> { prevSlide(); resetInterval(); });
    if(nextBtn) nextBtn.addEventListener("click", ()=> { nextSlide(); resetInterval(); });

    function startInterval() { interval = setInterval(nextSlide, 5000); }
    function resetInterval() { clearInterval(interval); startInterval(); }

    startInterval();
  });
}

// ==================
// HEADER Y FOOTER
// ==================
function initHeaderFooter(){
  fetch("/Header/header.html").then(r=>r.text()).then(d=>{
    document.getElementById("header-placeholder").innerHTML=d;
    const s=document.createElement("script");
    s.src="/Header/header.js";
    document.body.appendChild(s);

    setTimeout(()=>{
      const loginBtn = document.querySelector("#header-placeholder .btn-login"); 
      if(getToken()){
        if(loginBtn){
          loginBtn.textContent = "Log out";
          loginBtn.href = "#";
          loginBtn.addEventListener("click", e=>{
            e.preventDefault();
            setToken(null); setRole(null);
            window.location.href="/Paginas/Home.html";
          });
        }
      }
    },300);
  });

  fetch("/footer/footer.html").then(r=>r.text()).then(d=>{
    document.getElementById("footer-placeholder").innerHTML=d;
    const s=document.createElement("script");
    s.src="/footer/footer.js";
    document.body.appendChild(s);
  });
}

// ==================
// INIT
// ==================
document.addEventListener('DOMContentLoaded', ()=>{
  initHeaderFooter();
  render();
});
