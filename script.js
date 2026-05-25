gsap.registerPlugin(ScrollTrigger);

// ============================================
// PARTICLES
// ============================================

const canvas = document.getElementById("particles-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let animId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.15;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(46, 204, 113, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 80);
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
        p.update();
        p.draw();
    });

    // Draw connections
    particles.forEach((a, i) => {
        for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(46, 204, 113, ${0.08 * (1 - dist / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    });

    animId = requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// Stop particles when hero is not visible (performance)
const heroSection = document.querySelector(".hero");
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            if (!animId) animateParticles();
        } else {
            cancelAnimationFrame(animId);
            animId = null;
        }
    });
}, { threshold: 0.1 });

observer.observe(heroSection);

// ============================================
// MATRIX RAIN
// ============================================

const matrixCanvas = document.getElementById("matrix-canvas");
const mCtx = matrixCanvas.getContext("2d");

let matrixDrops = [];
let matrixAnimId;

function resizeMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    initMatrix();
}

const matrixChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}[]|&^%$#@!";

function initMatrix() {
    const cols = Math.floor(matrixCanvas.width / 14);
    matrixDrops = [];
    for (let i = 0; i < cols; i++) {
        matrixDrops[i] = Math.floor(Math.random() * -matrixCanvas.height / 14);
    }
}

function drawMatrix() {
    mCtx.fillStyle = "rgba(28, 28, 28, 0.05)";
    mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    mCtx.font = "14px monospace";

    for (let i = 0; i < matrixDrops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * 14;
        const y = matrixDrops[i] * 14;

        // Bright leading char
        mCtx.fillStyle = "rgba(46, 204, 113, 0.9)";
        mCtx.fillText(char, x, y);

        // Trail chars above
        for (let t = 1; t <= 8; t++) {
            const trailChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const trailY = y - t * 14;
            if (trailY > 0) {
                mCtx.fillStyle = `rgba(46, 204, 113, ${0.4 - t * 0.045})`;
                mCtx.fillText(trailChar, x, trailY);
            }
        }

        // Random glitch - flash some rows
        if (Math.random() < 0.005) {
            mCtx.fillStyle = "rgba(46, 204, 113, 0.6)";
            mCtx.fillRect(x, y - 4, 14, 20);
        }

        if (matrixDrops[i] * 14 > matrixCanvas.height || Math.random() < 0.005) {
            matrixDrops[i] = 0;
        }

        matrixDrops[i]++;
    }

    matrixAnimId = requestAnimationFrame(drawMatrix);
}

resizeMatrix();
window.addEventListener("resize", resizeMatrix);
drawMatrix();

const matrixObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            if (!matrixAnimId) drawMatrix();
        } else {
            cancelAnimationFrame(matrixAnimId);
            matrixAnimId = null;
        }
    });
}, { threshold: 0.1 });

matrixObserver.observe(heroSection);

// ============================================
// CUSTOM CURSOR (apenas em dispositivos com mouse)
// ============================================

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
    const cursor = document.createElement("div");
    cursor.classList.add("cursor-dot");
    document.body.appendChild(cursor);

    const cursorRing = document.createElement("div");
    cursorRing.classList.add("cursor-ring");
    document.body.appendChild(cursorRing);

    document.addEventListener("mousemove", (e) => {
        gsap.to(cursor, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1,
            ease: "power2.out",
        });
        gsap.to(cursorRing, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.2,
            ease: "power2.out",
        });
    });

    document.addEventListener("mouseleave", () => {
        gsap.to([cursor, cursorRing], { opacity: 0, duration: 0.3 });
    });

    document.addEventListener("mouseenter", () => {
        gsap.to([cursor, cursorRing], { opacity: 1, duration: 0.3 });
    });

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll("a, button, input, textarea, .nav-toggle, .social-link");

    hoverTargets.forEach((el) => {
        el.addEventListener("mouseenter", () => cursorRing.classList.add("hover"));
        el.addEventListener("mouseleave", () => cursorRing.classList.remove("hover"));
    });
}

// ============================================
// HERO ANIMATION (inspired by moblinks.fr)
// ============================================

const heroTL = gsap.timeline({ delay: 0.3 });

heroTL
    .to(".hero-logo", {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out",
    })
    .to(".hero-title .line1", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
    }, "-=0.4")
    .to(".hero-title .line2", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
    }, "-=0.5")
    .to(".hero-title .line3", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
    }, "-=0.5")
    .to(".hero-subtitle", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
    }, "-=0.3")
    .to(".hero-cta", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
    }, "-=0.3")
    .to(".scroll-indicator", {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
    }, "-=0.2");

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

const navbar = document.querySelector(".navbar");
const navLinks = document.querySelectorAll(".nav-links a");

gsap.to(navbar, {
    scrollTrigger: {
        trigger: "body",
        start: "80px top",
        toggleClass: { targets: navbar, className: "scrolled" },
    },
});

// Active nav link on scroll
const sections = document.querySelectorAll("section[id]");

ScrollTrigger.create({
    onUpdate: (self) => {
        const scrollPos = self.scroll();
        let current = "hero";

        sections.forEach((section) => {
            const top = section.offsetTop - 120;
            const bottom = top + section.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                current = section.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
        });
    },
});

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

const revealElements = (selector, stagger = 0.15, start = "top 85%") => {
    gsap.from(selector, {
        scrollTrigger: {
            trigger: selector,
            start,
            toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger,
        ease: "power3.out",
    });
};

// Animate each section on scroll
gsap.utils.toArray(".section-header").forEach((el) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
    });
});

// Sobre wave text animation (bottom to top)
gsap.from(".sobre-text p", {
    scrollTrigger: {
        trigger: ".sobre-text",
        start: "top 85%",
        toggleActions: "play none none reverse",
    },
    y: 50,
    opacity: 0,
    duration: 0.7,
    stagger: { each: 0.2, from: "end" },
    ease: "power3.out",
});

// Info items animation
gsap.from(".info-item", {
    scrollTrigger: {
        trigger: ".sobre-info",
        start: "top 90%",
        toggleActions: "play none none reverse",
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power3.out",
});

// Stats counter animation
const statNumbers = document.querySelectorAll(".stat-number");

statNumbers.forEach((stat) => {
    const target = parseInt(stat.dataset.target);

    ScrollTrigger.create({
        trigger: stat,
        start: "top 90%",
        onEnter: () => {
            gsap.to(stat, {
                innerText: target,
                duration: 2,
                ease: "power2.out",
                snap: { innerText: 1 },
                onUpdate: () => {
                    const current = Math.floor(parseFloat(stat.innerText));
                    stat.innerText = current;
                },
            });
        },
        once: true,
    });
});

// Skill bars animation
const skillFills = document.querySelectorAll(".skill-fill");

skillFills.forEach((fill) => {
    const width = fill.dataset.width;

    ScrollTrigger.create({
        trigger: fill,
        start: "top 90%",
        onEnter: () => {
            gsap.to(fill, {
                width: `${width}%`,
                duration: 1.5,
                ease: "power3.out",
            });
        },
        once: true,
    });
});

// Timeline items animation
gsap.utils.toArray(".timeline-item").forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
        },
        x: -40,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.15,
        ease: "power3.out",
    });
});

// Projeto cards animation
gsap.utils.toArray(".projeto-card").forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.12,
        ease: "power3.out",
    });
});

// Skill categories animation
gsap.utils.toArray(".skill-category").forEach((cat, i) => {
    gsap.from(cat, {
        scrollTrigger: {
            trigger: cat,
            start: "top 85%",
            toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.12,
        ease: "power3.out",
    });
});

// Contact form animation
gsap.from(".contato-form", {
    scrollTrigger: {
        trigger: ".contato-form",
        start: "top 85%",
        toggleActions: "play none none reverse",
    },
    x: -30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
});

gsap.from(".contato-info", {
    scrollTrigger: {
        trigger: ".contato-info",
        start: "top 85%",
        toggleActions: "play none none reverse",
    },
    x: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
});

// ============================================
// MOBILE NAV TOGGLE
// ============================================

const navToggle = document.querySelector(".nav-toggle");
const navLinksContainer = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navLinksContainer.classList.toggle("open");
});

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navToggle.classList.remove("active");
        navLinksContainer.classList.remove("open");
    });
});

// ============================================
// SECTION PARTICLES (reusable)
// ============================================

function createSectionParticles(canvasSelector, options = {}) {
    const c = document.querySelector(canvasSelector);
    if (!c) return;
    const ctx = c.getContext("2d");
    const opts = { count: 30, size: 2, color: "46, 204, 113", speed: 0.3, opacity: 0.3, ...options };
    let pts = [], anim;

    function resize() {
        const parent = c.parentElement;
        c.width = parent.offsetWidth;
        c.height = parent.offsetHeight;
    }

    class Pt {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * c.width;
            this.y = Math.random() * c.height;
            this.size = Math.random() * opts.size + 1;
            this.speedX = (Math.random() - 0.5) * opts.speed;
            this.speedY = (Math.random() - 0.5) * opts.speed;
            this.opacity = Math.random() * opts.opacity + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > c.width || this.y < 0 || this.y > c.height) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${opts.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    function init() {
        pts = [];
        for (let i = 0; i < opts.count; i++) pts.push(new Pt());
    }

    function animate() {
        ctx.clearRect(0, 0, c.width, c.height);
        pts.forEach(p => { p.update(); p.draw(); });
        anim = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    window.addEventListener("resize", resize);

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { if (!anim) animate(); }
            else { cancelAnimationFrame(anim); anim = null; }
        });
    }, { threshold: 0.1 });
    obs.observe(c.parentElement);
}

createSectionParticles("#sobre .section-particles", { count: 45, size: 3, speed: 0.4, opacity: 0.4 });
createSectionParticles("#contato .section-particles", { count: 30, size: 2.5, speed: 0.35, opacity: 0.35 });

const heroEl = document.querySelector(".hero");

function triggerGlitch() {
    const bar = document.createElement("div");
    bar.style.cssText = `
        position: fixed;
        top: ${Math.random() * 100}%;
        left: 0;
        width: ${Math.random() * 30 + 5}%;
        height: ${Math.random() * 4 + 2}px;
        background: rgba(46, 204, 113, ${Math.random() * 0.3 + 0.1});
        z-index: 5;
        pointer-events: none;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(bar);

    gsap.to(bar, {
        opacity: 0,
        duration: 0.1 + Math.random() * 0.2,
        delay: 0.05 + Math.random() * 0.15,
        onComplete: () => bar.remove(),
    });
}

function scheduleGlitch() {
    const delay = 2000 + Math.random() * 8000;
    setTimeout(() => {
        if (isHeroVisible()) {
            triggerGlitch();
            if (Math.random() < 0.3) {
                setTimeout(triggerGlitch, 50 + Math.random() * 100);
            }
        }
        scheduleGlitch();
    }, delay);
}

function isHeroVisible() {
    const rect = heroSection.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
}

scheduleGlitch();

// ============================================
// PARALLAX MOUSE MOVE ON HERO
// ============================================

document.querySelector(".hero").addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 50;
    const y = (clientY / window.innerHeight - 0.5) * 50;

    gsap.to(".hero-content", {
        x,
        y,
        duration: 1,
        ease: "power2.out",
    });
});

document.querySelector(".hero").addEventListener("mouseleave", () => {
    gsap.to(".hero-content", {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
    });
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
            gsap.to(window, {
                scrollTo: { y: target, offsetY: 80 },
                duration: 1,
                ease: "power3.inOut",
            });
        }
    });
});

// ============================================
// FORM VALIDATION

document.querySelectorAll(".contato-form input, .contato-form textarea").forEach((field) => {
    field.addEventListener("invalid", () => {
        field.setCustomValidity("Esqueceu aqui :)");
    });
    field.addEventListener("input", () => {
        field.setCustomValidity("");
    });
});

// ============================================
// WHATSAPP
// ============================================

function enviarWhatsApp(event) {
    event.preventDefault();
    const nome = document.getElementById("whatsapp-nome").value;
    const email = document.getElementById("whatsapp-email").value;
    const msg = document.getElementById("whatsapp-msg").value;
    const texto = `Olá! Me chamo ${nome} (${email}). ${msg}`;
    window.open(`https://wa.me/5521989898923?text=${encodeURIComponent(texto)}`, "_blank");
}

// ============================================
// REFRESH SCROLLTRIGGER ON LOAD
// ============================================

window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});

// ============================================
// MUSICA DE FUNDO (loop nos primeiros 14s)
// ============================================

const audio = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-toggle");
let isPlaying = false;

const playIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const pauseIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;

if (audio && musicBtn) {
    musicBtn.innerHTML = playIcon;
    audio.loop = false;
    audio.volume = 0;

    function fadeIn() {
        let vol = 0;
        audio.volume = 0;
        const interval = setInterval(() => {
            vol += 0.005;
            if (vol >= 0.05) {
                vol = 0.05;
                clearInterval(interval);
            }
            audio.volume = vol;
        }, 40);
    }

    function fadeOut(callback) {
        let vol = audio.volume;
        const interval = setInterval(() => {
            vol -= 0.002;
            if (vol <= 0) {
                vol = 0;
                clearInterval(interval);
                audio.volume = 0;
                if (callback) callback();
            }
            audio.volume = vol;
        }, 80);
    }

    let isLooping = false;

    audio.addEventListener("timeupdate", () => {
        if (audio.currentTime >= 13.8 && !isLooping) {
            isLooping = true;
            fadeOut(() => {
                audio.currentTime = 0;
                audio.play().then(() => {
                    isLooping = false;
                    fadeIn();
                }).catch(() => { isLooping = false; });
            });
        }
    });

    audio.addEventListener("error", () => {
        console.warn("Audio não encontrado:", audio.src);
    });

    musicBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isPlaying) {
            fadeOut(() => {
                audio.pause();
                musicBtn.innerHTML = playIcon;
            });
        } else {
            audio.currentTime = 0;
            audio.volume = 0;
            audio.play().then(() => {
                fadeIn();
                musicBtn.innerHTML = pauseIcon;
            }).catch((err) => {
                console.warn("Erro ao tocar:", err);
            });
        }
        isPlaying = !isPlaying;
    });
}
