/* ================================================
   GHAZAL'S BIRTHDAY — script.js
   ================================================ */

'use strict';

/* ─── Helpers ─── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ─── State ─── */
const CORRECT_PIN = '157850';
let pinBuffer = '';
let slideUnlocked = false;
let pinVerified = false;
let musicMuted = false;
let candlesOut = false;

/* ─── Elements ─── */
const music        = $('bg-music');
const musicBtn     = $('music-btn');
const slidesWrapper= $('slidesWrapper');
const lockSlide    = $('slide-lock');
const slideTrack   = $('slideTrack');
const slideThumb   = $('slideThumb');
const slideText    = $('slideText');
const keypad       = $('keypad');
const pinDots      = $$('.dot');
const delKey       = $('delKey');
const blowBtn      = $('blowBtn');
const wishMsg      = $('wishMsg');
const letterGlass  = $('letterGlass');
const letterBody   = document.querySelector('.letter-body');
const finalHearts  = $('finalHearts');

/* ================================================
   CLOCK
================================================ */
function updateClock() {
  const now  = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  const hPersian = toPersian(String(h).padStart(2, '0'));
  const mPersian = toPersian(String(m).padStart(2, '0'));
  const timeStr  = hPersian + ':' + mPersian;
  const el = $('lock-clock');
  if (el) el.textContent = timeStr;
}
function toPersian(str) {
  const map = {'0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹'};
  return str.replace(/[0-9]/g, d => map[d]);
}
updateClock();
setInterval(updateClock, 30000);

/* ================================================
   SLIDE NAVIGATION
================================================ */
function showSlide(id) {
  $$('.slide').forEach(s => {
    if (s.id === id) {
      s.classList.remove('hidden-slide');
      s.classList.add('active-slide');
    } else {
      s.classList.add('hidden-slide');
      s.classList.remove('active-slide');
    }
  });
  // Trigger slide-specific actions
  if (id === 'slide-letter') activateLetter();
  if (id === 'slide-hero')   ensureFloaties();
}

/* Nav arrows */
document.querySelectorAll('.nav-arrow').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (target) showSlide(target);
  });
});

/* ================================================
   PIN KEYPAD
================================================ */
function updateDots() {
  pinDots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < pinBuffer.length);
    dot.classList.remove('error');
  });
}

function pinError() {
  pinDots.forEach(d => d.classList.add('error'));
  keypad.classList.add('shake');
  setTimeout(() => {
    keypad.classList.remove('shake');
    pinBuffer = '';
    updateDots();
  }, 600);
}

function checkPin() {
  if (pinBuffer === CORRECT_PIN) {
    pinVerified = true;
    pinDots.forEach(d => { d.classList.add('filled'); d.style.background = '#a0efb0'; });
    // If slide also done → unlock
    if (slideUnlocked) enterApp();
  } else {
    pinError();
  }
}

keypad.addEventListener('click', e => {
  const key = e.target.closest('.key');
  if (!key) return;
  if (key.classList.contains('key-empty')) return;

  if (key.id === 'delKey') {
    pinBuffer = pinBuffer.slice(0, -1);
    updateDots();
    return;
  }

  if (pinBuffer.length >= 6) return;
  const n = key.dataset.n;
  if (n === undefined) return;

  pinBuffer += n;
  updateDots();

  if (pinBuffer.length === 6) {
    setTimeout(checkPin, 150);
  }
});

/* ================================================
   SLIDE-TO-UNLOCK
================================================ */
(function() {
  const trackWidth = () => slideTrack.offsetWidth - 48; // track minus thumb
  let dragging = false, startX = 0, currentX = 0;

  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onStart(e) {
    if (dragging) return;
    dragging = true;
    startX   = getClientX(e);
    slideThumb.style.transition = 'none';
  }

  function onMove(e) {
    if (!dragging) return;
    const dx = Math.max(0, Math.min(getClientX(e) - startX, trackWidth()));
    currentX = dx;
    slideThumb.style.left = (4 + dx) + 'px';
    // fade out text
    const ratio = dx / trackWidth();
    slideText.style.opacity = 1 - ratio;
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    slideThumb.style.transition = '';

    if (currentX >= trackWidth() * 0.85) {
      // Completed!
      slideThumb.style.left = (4 + trackWidth()) + 'px';
      slideTrack.classList.add('unlocked');
      slideUnlocked = true;
      slideText.style.opacity = '0';
      if (pinVerified) enterApp();
    } else {
      // Snap back
      slideThumb.style.left = '4px';
      slideText.style.opacity = '1';
      currentX = 0;
    }
  }

  slideTrack.addEventListener('mousedown',  onStart);
  slideTrack.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('mousemove',    onMove);
  document.addEventListener('touchmove',    onMove, { passive: true });
  document.addEventListener('mouseup',      onEnd);
  document.addEventListener('touchend',     onEnd);
})();

/* ================================================
   ENTER APP (lock → hero)
================================================ */
function enterApp() {
  // Fade out lock
  lockSlide.style.transition = 'opacity .8s ease';
  lockSlide.style.opacity    = '0';
  setTimeout(() => {
    lockSlide.style.display = 'none';
    showSlide('slide-hero');
  }, 800);

  // Start music
  startMusic();

  // Show music button
  musicBtn.classList.remove('hidden');

  // Trigger confetti
  launchConfetti(120);
}

/* ================================================
   MUSIC
================================================ */
function startMusic() {
  music.volume = 0;
  music.play().catch(() => {});
  // Fade in volume
  let vol = 0;
  const fade = setInterval(() => {
    vol = Math.min(1, vol + 0.04);
    music.volume = vol;
    if (vol >= 1) clearInterval(fade);
  }, 80);
}

musicBtn.addEventListener('click', () => {
  musicMuted = !musicMuted;
  music.muted = musicMuted;
  musicBtn.classList.toggle('muted', musicMuted);
  musicBtn.querySelector('.note-icon').textContent = musicMuted ? '🔇' : '🎵';
});

/* ================================================
   HERO — FLOATING ELEMENTS
================================================ */
const FLOATY_CHARS = ['🎈','🎀','🌸','💕','✨','🎊','💗','🌷','🦋','⭐'];
function ensureFloaties() {
  const container = $('floaties');
  if (container.children.length > 0) return;
  for (let i = 0; i < 20; i++) spawnFloaty(container, true);
  // Continue spawning
  setInterval(() => spawnFloaty(container, false), 1800);
}
function spawnFloaty(container, initial) {
  const el = document.createElement('div');
  el.className = 'floaty';
  el.textContent = FLOATY_CHARS[Math.floor(Math.random() * FLOATY_CHARS.length)];
  el.style.left = Math.random() * 100 + 'vw';
  const dur = 6 + Math.random() * 8;
  el.style.animationDuration = dur + 's';
  el.style.animationDelay = initial ? -(Math.random() * dur) + 's' : '0s';
  el.style.fontSize = (18 + Math.random() * 20) + 'px';
  container.appendChild(el);
  setTimeout(() => el.remove(), (dur + 1) * 1000);
}

/* ================================================
   CAKE — BLOW OUT CANDLES
================================================ */
function blowCandles() {
  if (candlesOut) return;
  candlesOut = true;

  // Animate each flame out with a small delay
  [1, 2, 3, 4].forEach((n, i) => {
    setTimeout(() => {
      const flame = $('flame' + n);
      if (flame) {
        flame.style.transition = 'opacity .3s';
        flame.style.opacity    = '0';
        setTimeout(() => flame.classList.add('out'), 300);
      }
    }, i * 120);
  });

  // Show message
  setTimeout(() => {
    wishMsg.classList.remove('hidden');
    blowBtn.classList.add('hidden');
    launchConfetti(180, true);
  }, 600);
}

blowBtn.addEventListener('click', blowCandles);



/* ================================================
   LETTER ANIMATION
================================================ */
function activateLetter() {
  setTimeout(() => {
    letterGlass.classList.add('visible');
    setTimeout(() => {
      letterBody.classList.add('animate');
      spawnFinalHearts();
    }, 600);
  }, 100);
}

function spawnFinalHearts() {
  const HEARTS = ['💗','💕','💖','💓','🌸','✨'];
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'fheart';
      el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      el.style.left    = Math.random() * 100 + 'vw';
      el.style.bottom  = '-40px';
      const dur = 5 + Math.random() * 6;
      el.style.animationDuration = dur + 's';
      finalHearts.appendChild(el);
      setTimeout(() => el.remove(), dur * 1000 + 500);
    }, i * 400);
  }
  // Keep spawning softly
  setInterval(() => {
    const el = document.createElement('div');
    el.className = 'fheart';
    el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    el.style.left   = Math.random() * 100 + 'vw';
    el.style.bottom = '-40px';
    const dur = 6 + Math.random() * 6;
    el.style.animationDuration = dur + 's';
    finalHearts.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 500);
  }, 1800);
}

/* ================================================
   CONFETTI
================================================ */
(function() {
  const canvas = $('confetti-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], animId = null;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const COLORS = ['#f9a8c9','#ffb3c6','#c77dff','#ffd6e7','#fff0a0','#a0f0d0','#ffaed2'];

  function Particle(x, y, burst) {
    this.x  = x  || Math.random() * W;
    this.y  = y  || -10;
    this.vx = (Math.random() - .5) * (burst ? 12 : 4);
    this.vy = (Math.random() * 4 + 2) * (burst ? 1.5 : 1);
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.size  = Math.random() * 8 + 4;
    this.shape = Math.random() > .5 ? 'circle' : 'rect';
    this.rot   = Math.random() * 360;
    this.rotV  = (Math.random() - .5) * 8;
    this.alpha = 1;
    this.life  = 0;
    this.maxLife = 120 + Math.random() * 80;
  }

  Particle.prototype.update = function() {
    this.x   += this.vx;
    this.y   += this.vy;
    this.vy  += .08; // gravity
    this.vx  *= .99;
    this.rot += this.rotV;
    this.life++;
    if (this.life > this.maxLife * .6) this.alpha = 1 - (this.life - this.maxLife * .6) / (this.maxLife * .4);
  };

  Particle.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle   = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot * Math.PI / 180);
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    }
    ctx.restore();
  };

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles = particles.filter(p => p.life < p.maxLife && p.y < H + 40);
    particles.forEach(p => { p.update(); p.draw(); });
    if (particles.length > 0) animId = requestAnimationFrame(loop);
    else animId = null;
  }

  window.launchConfetti = function(count = 80, burst = false) {
    const cx = W / 2, cy = burst ? H * .35 : -10;
    for (let i = 0; i < count; i++) {
      const p = new Particle(
        burst ? cx + (Math.random() - .5) * 60 : Math.random() * W,
        burst ? cy : -10,
        burst
      );
      particles.push(p);
    }
    if (!animId) animId = requestAnimationFrame(loop);
  };
})();

/* ================================================
   SWIPE GESTURE (horizontal) between slides
================================================ */
(function() {
  const slideOrder = ['slide-hero','slide-cake','slide-gallery','slide-letter'];
  let touchStartX = 0, touchStartY = 0;

  function currentIndex() {
    for (let i = 0; i < slideOrder.length; i++) {
      if ($(slideOrder[i]).classList.contains('active-slide')) return i;
    }
    return -1;
  }

  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if ($('slide-lock').style.display === 'none' || $('slide-lock').style.opacity === '0') {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

      const idx = currentIndex();
      if (idx === -1) return;

      // RTL: swipe right → prev, swipe left → next
      if (dx < -50 && idx < slideOrder.length - 1) showSlide(slideOrder[idx + 1]);
      if (dx >  50 && idx > 0)                     showSlide(slideOrder[idx - 1]);
    }
  }, { passive: true });
})();

/* ================================================
   KEYBOARD SUPPORT (desktop testing)
================================================ */
document.addEventListener('keydown', e => {
  if ($('slide-lock').style.display === '' || !$('slide-lock').style.display) {
    // Lock screen keyboard
    if (e.key >= '0' && e.key <= '9') {
      if (pinBuffer.length < 6) {
        pinBuffer += e.key;
        updateDots();
        if (pinBuffer.length === 6) setTimeout(checkPin, 150);
      }
    }
    if (e.key === 'Backspace') { pinBuffer = pinBuffer.slice(0, -1); updateDots(); }
  }
});

/* ================================================
   INIT — make sure hero is not active yet
================================================ */
(function init() {
  lockSlide.classList.add('active-slide');
  $$('.slide').forEach(s => {
    if (s.id !== 'slide-lock') {
      s.classList.add('hidden-slide');
      s.classList.remove('active-slide');
    }
  });
})();