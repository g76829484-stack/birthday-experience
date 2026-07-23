/* =============================================
   BIRTHDAY EXPERIENCE — CINEMATIC JS ENGINE
   ============================================= */

(function () {
    'use strict';

    var state = {
        currentScene: 'intro',
        isAnimating: false,
        isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        audioPlaying: false,
        particlesCreated: false,
        fxRunning: false,
        opened: false
    };

    var dom = {
        scenes: {
            intro: document.getElementById('scene-intro'),
            envelope: document.getElementById('scene-envelope'),
            opening: document.getElementById('scene-opening'),
            letter: document.getElementById('scene-letter'),
            finale: document.getElementById('scene-finale')
        },
        introText1: document.getElementById('introText1'),
        introText2: document.getElementById('introText2'),
        introParticles: document.getElementById('introParticles'),
        envelope: document.getElementById('envelope'),
        envelopeHint: document.querySelector('.envelope-hint'),
        envelopeFlap: document.querySelector('.envelope-flap'),
        envelopeLetter: document.querySelector('.envelope-letter'),
        openingEnvelopeFlap: document.querySelector('.opening-flap'),
        openingEnvelopeLetter: document.querySelector('.opening-letter'),
        letterCard: document.getElementById('letterCard'),
        letterTitle: document.getElementById('letterTitle'),
        letterParagraphs: document.querySelectorAll('.letter-paragraph'),
        continueBtn: document.getElementById('continueBtn'),
        finaleTitle: document.getElementById('finaleTitle'),
        finaleSubtitle: document.getElementById('finaleSubtitle'),
        canvas: document.getElementById('fxCanvas'),
        audioToggle: document.getElementById('audioToggle'),
        bgMusic: document.getElementById('bgMusic')
    };

    var ctx = dom.canvas.getContext('2d');
    var canvasW = 0;
    var canvasH = 0;
    var fxParticles = [];
    var rafId = null;

    /* ---------- HELPERS ---------- */
    function resizeCanvas() {
        canvasW = dom.canvas.width = window.innerWidth;
        canvasH = dom.canvas.height = window.innerHeight;
    }

    function addVisible(el, extraDelay) {
        if (!el) return;
        var d = extraDelay || 0;
        setTimeout(function () { el.classList.add('visible'); }, d);
    }

    function removeVisible(el) {
        if (!el) return;
        el.classList.remove('visible');
    }

    /* ---------- PARTICLES (Scene 1) ---------- */
    function createIntroParticles() {
        if (state.particlesCreated) return;
        state.particlesCreated = true;
        var container = dom.introParticles;
        var count = state.isReducedMotion ? 0 : 30;
        for (var i = 0; i < count; i++) {
            var p = document.createElement('div');
            p.className = 'intro-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.bottom = '-5%';
            p.style.animationDuration = (6 + Math.random() * 10) + 's';
            p.style.animationDelay = (Math.random() * 8) + 's';
            p.style.width = (1 + Math.random() * 2) + 'px';
            p.style.height = p.style.width;
            p.style.opacity = 0.2 + Math.random() * 0.5;
            container.appendChild(p);
        }
    }

    /* ---------- SCENE TRANSITIONS ---------- */
    function transitionTo(sceneName) {
        if (state.isAnimating) return Promise.resolve();
        state.isAnimating = true;

        var current = dom.scenes[state.currentScene];
        var next = dom.scenes[sceneName];

        return new Promise(function (resolve) {
            if (current) {
                current.classList.add('fading-out');
                current.classList.remove('active');
            }

            setTimeout(function () {
                if (current) current.classList.remove('fading-out');
                next.classList.add('active');
                state.currentScene = sceneName;
                state.isAnimating = false;
                resolve();
            }, 800);
        });
    }

    /* ---------- SCENE 1: INTRO ---------- */
    function initIntro() {
        createIntroParticles();

        setTimeout(function () { addVisible(dom.introText1); }, 800);
        setTimeout(function () { addVisible(dom.introText2); }, 2600);

        dom.introText2.addEventListener('click', function handler() {
            dom.introText2.removeEventListener('click', handler);
            goToEnvelope();
        });
    }

    function goToEnvelope() {
        if (state.isAnimating) return;
        transitionTo('envelope').then(function () {
            setTimeout(function () { addVisible(dom.envelopeHint); }, 400);
            setupEnvelopeClick();
        });
    }

    /* ---------- SCENE 2: ENVELOPE ---------- */
    function setupEnvelopeClick() {
        dom.envelope.addEventListener('click', function handler() {
            dom.envelope.removeEventListener('click', handler);
            openEnvelope();
        });
    }

    function openEnvelope() {
        if (state.isAnimating) return;
        state.isAnimating = true;

        removeVisible(dom.envelopeHint);

        dom.envelope.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
        dom.envelope.style.transform = 'translateY(-20px) scale(1.08)';

        setTimeout(function () {
            dom.envelopeFlap.style.transform = 'rotateX(180deg)';
            dom.envelopeFlap.style.transition = 'transform 1s cubic-bezier(0.4,0,0.2,1)';
            dom.envelopeLetter.style.opacity = '1';
            dom.envelopeLetter.style.transform = 'translateY(-20px)';
        }, 400);

        setTimeout(function () {
            transitionTo('opening').then(function () {
                startOpeningAnimation();
            });
        }, 1800);
    }

    /* ---------- SCENE 3: OPENING ---------- */
    function startOpeningAnimation() {
        var flap = dom.openingEnvelopeFlap;
        var letter = dom.openingEnvelopeLetter;

        setTimeout(function () {
            flap.style.transform = 'rotateX(180deg)';
        }, 200);

        setTimeout(function () {
            letter.style.transform = 'translateY(-120px) scale(1.05)';
        }, 600);

        setTimeout(function () {
            transitionTo('letter').then(function () {
                showLetter();
            });
        }, 2400);
    }

    /* ---------- SCENE 4: LETTER ---------- */
    function showLetter() {
        addVisible(dom.letterCard, 200);
        addVisible(dom.letterTitle, 700);

        var paragraphs = dom.letterParagraphs;
        var delay = 1200;
        for (var i = 0; i < paragraphs.length; i++) {
            var isEmphasis = paragraphs[i].classList.contains('letter-emphasis');
            var isFinal = paragraphs[i].classList.contains('letter-final');
            var step = isEmphasis ? 900 : isFinal ? 700 : 500;
            addVisible(paragraphs[i], delay);
            delay += step;
        }

        addVisible(dom.continueBtn, delay + 500);

        dom.continueBtn.addEventListener('click', function handler() {
            dom.continueBtn.removeEventListener('click', handler);
            startCelebration();
        });
    }

    /* ---------- SCENE 5: FINALE ---------- */
    function startCelebration() {
        transitionTo('finale').then(function () {
            addVisible(dom.finaleTitle, 300);
            addVisible(dom.finaleSubtitle, 900);

            resizeCanvas();
            state.fxRunning = true;

            if (!state.isReducedMotion) {
                createConfettiBurst();
                createGlowParticles();
                scheduleFireworks();
                startRenderLoop();
            }
        });
    }

    /* ---------- CANVAS: CONFETTI ---------- */
    function createConfettiBurst() {
        var colors = ['#d4a853', '#f0d48a', '#e8a0b4', '#c45c5c', '#f5f0e8', '#c4b89a'];
        var count = 120;

        for (var i = 0; i < count; i++) {
            fxParticles.push({
                x: canvasW * 0.5 + (Math.random() - 0.5) * canvasW * 0.3,
                y: canvasH * 0.3,
                vx: (Math.random() - 0.5) * 12,
                vy: -(2 + Math.random() * 10),
                gravity: 0.15 + Math.random() * 0.1,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                width: 6 + Math.random() * 6,
                height: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.003 + Math.random() * 0.005,
                type: 'confetti'
            });
        }
    }

    function createGlowParticles() {
        var count = 50;
        for (var i = 0; i < count; i++) {
            fxParticles.push({
                x: Math.random() * canvasW,
                y: Math.random() * canvasH,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -(0.3 + Math.random() * 0.8),
                radius: 1 + Math.random() * 2.5,
                alpha: 0.3 + Math.random() * 0.5,
                decay: 0.001 + Math.random() * 0.003,
                color: Math.random() > 0.5 ? '#d4a853' : '#f0d48a',
                type: 'glow'
            });
        }
    }

    /* ---------- CANVAS: FIREWORKS ---------- */
    function createFirework(x, y) {
        var count = 40 + Math.floor(Math.random() * 20);
        var hue = Math.random() * 60 + 20;
        for (var i = 0; i < count; i++) {
            var angle = (Math.PI * 2 / count) * i;
            var speed = 2 + Math.random() * 4;
            fxParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1.5 + Math.random() * 1.5,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.01,
                color: 'hsl(' + (hue + Math.random() * 30) + ', 100%, 65%)',
                type: 'firework'
            });
        }
    }

    function scheduleFireworks() {
        var times = [600, 1500, 2500, 3800, 5000];
        times.forEach(function (t) {
            setTimeout(function () {
                if (!state.fxRunning) return;
                var x = canvasW * (0.2 + Math.random() * 0.6);
                var y = canvasH * (0.15 + Math.random() * 0.35);
                createFirework(x, y);
            }, t);
        });

        setTimeout(function () {
            state.fxRunning = false;
        }, 7000);
    }

    /* ---------- CANVAS RENDER LOOP ---------- */
    function renderFx() {
        ctx.clearRect(0, 0, canvasW, canvasH);

        for (var i = fxParticles.length - 1; i >= 0; i--) {
            var p = fxParticles[i];

            if (p.type === 'confetti') {
                p.x += p.vx;
                p.vy += p.gravity;
                p.y += p.vy;
                p.vx *= 0.99;
                p.rotation += p.rotSpeed;
                p.alpha -= p.decay;

                if (p.alpha <= 0 || p.y > canvasH + 20) {
                    fxParticles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
                ctx.restore();

            } else if (p.type === 'glow') {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    fxParticles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.alpha * 0.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

            } else if (p.type === 'firework') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.04;
                p.vx *= 0.98;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    fxParticles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.alpha * 0.4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        if (fxParticles.length > 0 || state.fxRunning) {
            rafId = requestAnimationFrame(renderFx);
        } else {
            rafId = null;
            ctx.clearRect(0, 0, canvasW, canvasH);
        }
    }

    function startRenderLoop() {
        if (rafId) return;
        rafId = requestAnimationFrame(renderFx);
    }

    /* ---------- AUDIO ---------- */
    function setupAudio() {
        dom.audioToggle.addEventListener('click', function () {
            if (state.audioPlaying) {
                dom.bgMusic.pause();
                state.audioPlaying = false;
                dom.audioToggle.classList.add('muted');
            } else {
                dom.bgMusic.play().then(function () {
                    state.audioPlaying = true;
                    dom.audioToggle.classList.remove('muted');
                }).catch(function () {
                    dom.audioToggle.classList.add('muted');
                });
            }
        });
    }

    /* ---------- RESIZE ---------- */
    function onResize() {
        resizeCanvas();
    }

    /* ---------- INIT ---------- */
    function init() {
        resizeCanvas();
        setupAudio();
        initIntro();

        window.addEventListener('resize', onResize);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
