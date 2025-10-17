// ==============================
// DYNAMIC CAROUSEL
// ==============================
const projects = [
  {title:"Moon & Zoom", tag:"3D Short Film", image:"moonzoom.png", media:"moonzoom_2.mp4", type:"video", description:"Final degree project: 3D animation short film in cartoon style for children.", tags:["3D Modeling","Animation","Video Editing","Graphic Design"], link:"https://www.youtube.com/channel/UC2rah47MqlS-85MhD8tD6ig"},
  {title:"W", tag:"Graphic Design", image:"w.png", media:"w.png", type:"image", description:"Typographic poster where the letter shape visually conveys the meaning of the adjective represented.", tags:["Graphic Design","Typography"], link:"https://drive.google.com/file/d/1jiKkA3bx6wzt6ALUXhSAaKLvpbPZOuOj/view?usp=sharing"},
  {title:"Hana", tag:"Graphic Design", image:"hana.png", media:"hana.png", type:"image", description:"Can design and visual identity for a natural energy drink for adults.", tags:["Graphic Design","Branding","Visual Identity"], link:"https://drive.google.com/file/d/1jiKkA3bx6wzt6ALUXhSAaKLvpbPZOuOj/view?usp=sharing"},
  {title:"Katakuri", tag:"3D Model", image:"katakuri.jpg", media:"katakuri_2.jpg", type:"image", description:"Digital sculpture of the character Charlotte Katakuri (One Piece), modeled in ZBrush and rendered in Marmoset.", tags:["3D Modeling","Digital Sculpture"], link:"https://www.artstation.com/artwork/dy9zJA"},
  {title:"Titan Appearance", tag:"Video Editing", image:"titan.png", media:"titan_2.mp4", type:"video", description:"Action montage with visual effects inspired by Attack on Titan, combining editing and digital compositing.", tags:["Video Editing","Compositing"], link:"https://drive.google.com/file/d/1Nw43kpP-hEXpgUT6LhtbQVIeWN2VCGhp/view?usp=sharing"},
  {title:"Celery", tag:"Video Game", image:"celery.png", media:"celery_2.mp4", type:"video", description:"Team-developed video game as part of a university project. Presented at Indie Dev Day 2024.", tags:["3D Modeling","Animation","Video Editing","VFX"], link:"https://kolageno.itch.io/celery"}
];

const shuffled = projects.sort(() => Math.random() - 0.5);
const track = document.querySelector(".carousel-track");

shuffled.forEach((p, i) => {
  const item = document.createElement("div");
  item.className = "carousel-item";
  item.dataset.index = i;
  item.innerHTML = `
    <div class="carousel-image-wrapper"><img src="images/${p.image}" alt="${p.title}"></div>
    <div class="carousel-text"><strong>${p.title}</strong><br><em>${p.tag}</em></div>
  `;
  track.appendChild(item);
});

document.querySelector(".prev").addEventListener("click", () => track.scrollBy({left:-360, behavior:"smooth"}));
document.querySelector(".next").addEventListener("click", () => track.scrollBy({left:360, behavior:"smooth"}));

// ==============================
// POPUP
// ==============================
const popup = document.createElement("div");
popup.className = "popup";
popup.innerHTML = `
  <div class="popup-content">
    <span class="popup-close">&times;</span>
    <div class="popup-media"></div>
    <div class="popup-info">
      <h3></h3>
      <p class="popup-desc"></p>
      <div class="popup-tags"></div>
      <a class="popup-link" target="_blank" rel="noopener">View More</a>
    </div>
  </div>
`;
document.body.appendChild(popup);

const popupClose = popup.querySelector(".popup-close"),
      popupMedia = popup.querySelector(".popup-media"),
      popupTitle = popup.querySelector("h3"),
      popupDesc = popup.querySelector(".popup-desc"),
      popupTags = popup.querySelector(".popup-tags"),
      popupLink = popup.querySelector(".popup-link");

document.querySelectorAll(".carousel-item").forEach(item => {
  item.addEventListener("click", () => {
    const p = shuffled[item.dataset.index];
    popupMedia.innerHTML = p.type === "video"
      ? `<video controls autoplay loop muted playsinline><source src="images/${p.media}" type="video/mp4">Your browser does not support the video.</video>` 
      : `<img src="images/${p.media}" alt="${p.title}">`;
    popupTitle.textContent = p.title;
    popupDesc.textContent = p.description;
    popupTags.textContent = p.tags?.length ? p.tags.map(t => `#${t.toLowerCase()}`).join(", ") : "";
    if(p.link) { popupLink.href = p.link; popupLink.style.display = "inline-block"; }
    else popupLink.style.display = "none";
    popup.classList.add("active");
  });
});

popupClose.addEventListener("click", () => popup.classList.remove("active"));
popup.addEventListener("click", e => { if(e.target === popup) popup.classList.remove("active"); });
window.addEventListener("wheel", () => { if(popup.classList.contains("active")) popup.classList.remove("active"); });

// ==============================
// SCROLL POR BLOQUES
// ==============================
const blocks = document.querySelectorAll(".section");
let currentBlock = 0, progress = 0, maxProgress = 100, scrollStep = 5, scrolling = false;

const heroBlock = blocks[0],
      heroOverlay = heroBlock.querySelector(".overlay-title, .hero-overlay-title"),
      heroH1 = heroBlock.querySelector("h1"),
      heroLogo = heroBlock.querySelector(".hero-logo-large");

heroH1.style.opacity = 0;
heroLogo.style.opacity = 0;

// Overlay en portfolio y contacto
blocks.forEach(b => {
  if(b.id==="portfolio"||b.id==="contact"){
    const o = document.createElement("div");
    o.className = "overlay-title";
    o.innerHTML = b.querySelector("h2").innerHTML;
    b.prepend(o);
  }
});

const scrollIndicator = document.querySelector(".scroll-indicator"),
      checkpoints = document.querySelectorAll(".scroll-bar .checkpoint");

showBlock(currentBlock);

// --- PC / WHEEL ---
window.addEventListener("wheel", e => {
  if(window.innerWidth <= 1024) return;
  e.preventDefault();
  if(scrolling) return;
  const delta = e.deltaY > 0 ? scrollStep : -scrollStep;
  progress = Math.max(0, Math.min(progress + delta, maxProgress));
  updateBlock(blocks[currentBlock], progress, delta>0);
  if(progress >= maxProgress && delta>0) nextBlock();
  if(progress <= 0 && delta<0) prevBlock();
});

// ==============================
// TOUCH / MOBILE
// ==============================
(() => {
  let startY=0, lastY=0, lastTime=0, velocity=0, touchActive=false, inertia=0, inertiaFrame=null;
  const SCROLL_SENS = 0.18, INERTIA_M = 2.2, DECAY = 0.925;

  function stopInertia(){ if(inertiaFrame) cancelAnimationFrame(inertiaFrame); inertiaFrame = null; }
  function startInertia(){
    stopInertia();
    const step = () => {
      if(Math.abs(inertia) < 0.01) return;
      progress += inertia;
      const down = inertia>0;
      if(progress >= maxProgress){progress=0;if(currentBlock<blocks.length-1) nextBlock(); inertia=0;}
      else if(progress <= 0){if(currentBlock>0){prevBlock();progress=maxProgress;} else progress=0; inertia=0;}
      else { updateBlock(blocks[currentBlock], progress, down); inertia *= DECAY; inertiaFrame = requestAnimationFrame(step); }
    };
    inertiaFrame = requestAnimationFrame(step);
  }

  const isMobileTouch = () => window.innerWidth <= 1024;

  window.addEventListener("touchstart", e => {
    if(!isMobileTouch() || e.target.closest(".carousel-wrapper") || e.target.closest(".popup")) return;
    stopInertia(); touchActive = true; startY = lastY = e.touches[0].clientY; lastTime = Date.now(); velocity = 0;
  }, {passive:false});

  window.addEventListener("touchmove", e => {
    if(!touchActive) return;
    e.preventDefault();
    const currentY = e.touches[0].clientY, deltaY = lastY - currentY, now = Date.now();
    velocity = deltaY / (now - lastTime || 16);
    lastY = currentY; lastTime = now;
    progress = Math.max(0, Math.min(progress + deltaY/window.innerHeight*maxProgress*SCROLL_SENS, maxProgress));
    updateBlock(blocks[currentBlock], progress, deltaY>0);
  }, {passive:false});

  window.addEventListener("touchend", () => { touchActive = false; inertia = velocity*INERTIA_M; startInertia(); });
  window.addEventListener("touchcancel", () => { touchActive = false; stopInertia(); });
  window.addEventListener("resize", stopInertia);
})();

// ==============================
// FUNCIONES SCROLL / BLOQUES
// ==============================
function showBlock(i){
  blocks.forEach((b,j)=>{
    b.style.opacity = j===i?1:0;
    b.style.zIndex = j===i?10:0;
    b.querySelectorAll(".fade-text").forEach(el=>el.classList.remove("visible"));
  });
  progress = 0; 
  if(i===0){ if(heroOverlay) heroOverlay.style.opacity=1; if(heroH1) heroH1.style.opacity=0; if(heroLogo) heroLogo.style.opacity=0; }
  updateScrollVisuals();
}

function updateBlock(b, prog, scrollDown=true){
  const texts = Array.from(b.querySelectorAll(".fade-text"));
  const overlay = b.querySelector(".overlay-title, .hero-overlay-title");
  const overlayH2 = b.querySelector("h2.fade-text");

  texts.forEach((el,i)=>{
    if(el !== overlayH2){
      const appearAt = scrollDown ? i*20 : (texts.length-1-i)*20;
      scrollDown ? (prog>=appearAt ? el.classList.add("visible") : el.classList.remove("visible"))
                 : (prog<=maxProgress-appearAt ? el.classList.remove("visible") : el.classList.add("visible"));
    }
  });

  if(overlay && overlayH2){
    scrollDown ? (prog>10 ? (overlay.style.opacity=0, overlayH2.classList.add("visible")) : (overlay.style.opacity=1, overlayH2.classList.remove("visible")))
               : (prog<=10 ? (overlay.style.opacity=1, overlayH2.classList.remove("visible")) : (overlay.style.opacity=0, overlayH2.classList.add("visible")));
  }

  if(b.id==="hero"){
    prog>10 ? (heroOverlay&&(heroOverlay.style.opacity=0), heroH1&&(heroH1.style.opacity=1), heroLogo&&(heroLogo.style.opacity=0.15))
            : (heroOverlay&&(heroOverlay.style.opacity=1), heroH1&&(heroH1.style.opacity=0), heroLogo&&(heroLogo.style.opacity=0));
  }

  updateScrollVisuals();
}

function updateScrollVisuals(){
  scrollIndicator.style.opacity = currentBlock===0?1:0;
  checkpoints.forEach((d,i)=>d.classList.toggle("active", i===currentBlock));
}

function nextBlock(){
  if(currentBlock < blocks.length-1){ scrolling=true; currentBlock++; showBlock(currentBlock); setTimeout(()=>scrolling=false,700); }
}

function prevBlock(){
  if(currentBlock > 0){ scrolling=true; currentBlock--; showBlock(currentBlock); setTimeout(()=>scrolling=false,700); }
}

// ==============================
// NAV Y CHECKPOINTS
// ==============================
document.querySelectorAll(".nav-links a").forEach(l=>{
  l.addEventListener("click", e=>{
    e.preventDefault();
    const t = document.querySelector(l.getAttribute("href"));
    const idx = Array.from(blocks).indexOf(t);
    if(idx >= 0){ currentBlock=idx; showBlock(currentBlock); progress=70; updateBlock(blocks[currentBlock], progress, true); }
  });
});

checkpoints.forEach((d,i)=>{
  d.addEventListener("click", ()=>{
    if(currentBlock !== i){ currentBlock=i; showBlock(currentBlock); progress=70; updateBlock(blocks[currentBlock], progress, true); }
  });
});

// ==============================
// LOGO SIGUE EL MOUSE
// ==============================
let mouseX=0, mouseY=0, logoX=0, logoY=0;
window.addEventListener("mousemove", e=>{ mouseX=e.clientX; mouseY=e.clientY; });
function animateLogo(){
  logoX += (mouseX - window.innerWidth/2 - logoX)*0.02;
  logoY += (mouseY - window.innerHeight/2 - logoY)*0.02;
  heroLogo.style.transform = `translateY(calc(-50% + ${logoY*0.02}px)) translateX(${logoX*0.02}px)`;
  requestAnimationFrame(animateLogo);
}
animateLogo();

// ==============================
// CONTACT FORM
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const button = form.querySelector(".btn-send");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    button.disabled = true;
    button.textContent = "Sending...";
    button.classList.add("sending");

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, { method: "POST", body: formData });

      button.classList.remove("sending");

      if (response.ok) {
        button.textContent = "Sent!";
        button.classList.add("sent");
        form.reset();
      } else {
        throw new Error("Error sending form");
      }
    } catch (error) {
      button.classList.remove("sending");
      button.textContent = "Error!";
      button.classList.add("error");
      console.error(error);
    }
  });
});