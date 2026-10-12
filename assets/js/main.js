document.addEventListener('DOMContentLoaded', () => {
    SiteUtils.initIcons();

    // Logo strip: tag near-square logos so CSS can balance them against wide ones
    document.querySelectorAll('.client-logo-item img').forEach(img => {
        const tag = () => {
            if (!img.naturalWidth || !img.naturalHeight) return;
            img.parentElement.classList.toggle('is-square', img.naturalWidth / img.naturalHeight < 1.35);
        };
        if (img.complete) tag(); else img.addEventListener('load', tag);
    });

    document.querySelectorAll('.tag[data-tag-filter]').forEach(tagEl => {
        tagEl.addEventListener('click', () => {
            sessionStorage.setItem('activeProjectFilter', tagEl.getAttribute('data-tag-filter'));
        });
    });

    console.log('%cChatura Dissanayake', 'font-size:22px;font-weight:bold;color:#111;');
    console.log('%cDesigned and built by Chatura Dissanayake. Say hello: consultchatura@gmail.com', 'font-size:13px;color:#555;');

    document.addEventListener('click', e => {
        const anchor = e.target.closest('a[href^="/#"], a[href^="#"]');
        if (anchor && !anchor.classList.contains('mobile-link')) {
            const targetId = anchor.getAttribute('href').split('#')[1];
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: SiteUtils.getScrollBehavior() });
                history.pushState(null, '', '#' + targetId);
            }
        }
    });

    // Scroll reveal. Content is only hidden by CSS when the "js" class is on <html>, and
    // everything is revealed straight away if IntersectionObserver is missing or fails.
    const fadeTargets = document.querySelectorAll('.section-fade-in');
    const revealAll = () => fadeTargets.forEach(el => el.classList.add('is-visible'));
    if ('IntersectionObserver' in window) {
        try {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-visible');
                        observer.unobserve(e.target);
                    }
                });
            // threshold 0 + bottom margin: a very tall section can never get "stuck" below an 8% threshold
            }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
            fadeTargets.forEach(s => observer.observe(s));

            // Safety net: anything already on screen but still hidden (fast jumps to an anchor, restored
            // scroll position, a very short section at the very end of a page) is revealed shortly after.
            let settleTimer;
            const settle = () => {
                clearTimeout(settleTimer);
                settleTimer = setTimeout(() => {
                    fadeTargets.forEach(el => {
                        if (el.classList.contains('is-visible')) return;
                        const r = el.getBoundingClientRect();
                        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
                    });
                }, 400);
            };
            window.addEventListener('scroll', settle, { passive: true });
            window.addEventListener('load', settle);
        } catch (err) {
            revealAll();
        }
    } else {
        revealAll();
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const proofNums = document.querySelectorAll('.proof-num[data-count-to]');

    const animateCountUp = (el) => {
        const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';

        if (prefersReducedMotion) {
            el.textContent = target.toLocaleString('en-US') + suffix;
            return;
        }

        const duration = 1400;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);

            el.textContent = current.toLocaleString('en-US') + suffix;

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    };

    if (proofNums.length) {
        const proofObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCountUp(entry.target);
                    proofObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        proofNums.forEach(el => proofObserver.observe(el));
    }

    // About: on phones the biography is trimmed to a short paragraph until "Read more".
    // Follows the screen size live (rotating a phone, resizing a window), so the button
    // can never be left on screen when there is nothing to expand.
    const aboutContent = document.querySelector('.about-philosophy');
    const aboutReadMoreBtn = document.getElementById('about-read-more-btn');
    if (aboutContent && aboutReadMoreBtn) {
        const phoneMq = window.matchMedia('(max-width: 640px)');
        let aboutOpen = false;
        const paintAbout = () => {
            const trimmed = phoneMq.matches && !aboutOpen;
            aboutContent.classList.toggle('is-collapsed-mobile', trimmed);
            aboutReadMoreBtn.setAttribute('aria-expanded', String(!trimmed));
            aboutReadMoreBtn.innerHTML = trimmed
                ? 'Read more <i data-lucide="chevron-down" aria-hidden="true"></i>'
                : 'Show less <i data-lucide="chevron-up" aria-hidden="true"></i>';
            if (window.lucide) lucide.createIcons({ root: aboutReadMoreBtn });
        };
        aboutReadMoreBtn.addEventListener('click', () => { aboutOpen = !aboutOpen; paintAbout(); });
        if (phoneMq.addEventListener) phoneMq.addEventListener('change', paintAbout); else phoneMq.addListener(paintAbout);
        paintAbout();
    }

    const contactForm   = document.getElementById('contact-form');
    const formStatus    = document.getElementById('form-status');
    const formSubmitBtn = document.getElementById('form-submit-btn');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async e => {
            e.preventDefault();
            formSubmitBtn.disabled = true;
            formSubmitBtn.textContent = 'Sending…';
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            try {
                const res = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.ok) {
                    contactForm.innerHTML = '<div class="system-message form-success-state" tabindex="-1" role="status"><strong>Message received.</strong><span>I\'ll follow up within 1–2 business days.</span></div>';
                    contactForm.querySelector('.form-success-state')?.focus();
                } else {
                    throw new Error('server');
                }
            } catch (error) {
                console.error('Contact form submission error:', error);
                formStatus.textContent = 'Message not sent, something went wrong. Try again or email directly at consultchatura@gmail.com';
                formStatus.classList.add('error');
            } finally {
                if (document.contains(formSubmitBtn)) {
                    formSubmitBtn.disabled = false;
                    formSubmitBtn.innerHTML = 'Send message <i data-lucide="send" aria-hidden="true"></i>';
                    if (window.lucide) {
                        lucide.createIcons({ nameAttr: 'data-lucide', root: formSubmitBtn });
                    }
                }
            }
        });
    }

    document.querySelectorAll('.media-item img, .thread-post-media img').forEach(img => {
        const handleLoad = () => img.classList.add('img-loaded');
        if (img.complete && img.naturalHeight !== 0) {
            handleLoad();
        } else {
            img.addEventListener('load', handleLoad);
            img.addEventListener('error', handleLoad);
        }
    });

    // ---- Cookie consent -------------------------------------------------
    // The banner appears on first visit, and can be reopened any time from the footer
    // ("Cookie settings"), so a visitor can change their mind without clearing browser data.
    const GA_ID = 'G-24MX1C8QK3';
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');
    let bannerOpener = null;

    const hideBanner = () => {
        if (!cookieBanner) return;
        cookieBanner.style.display = 'none';
        if (bannerOpener && document.contains(bannerOpener)) bannerOpener.focus();
        bannerOpener = null;
    };
    const showBanner = (opener) => {
        if (!cookieBanner) return;
        bannerOpener = opener || null;
        cookieBanner.style.display = 'block';
        if (opener) acceptBtn?.focus();
    };
    const clearAnalyticsCookies = () => {
        document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
                const past = '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                document.cookie = name + past;
                document.cookie = name + past + '; domain=' + location.hostname;
                document.cookie = name + past + '; domain=.' + location.hostname.replace(/^www\./, '');
            }
        });
    };

    if (cookieBanner && !SiteUtils.storage.get('cookieConsent')) {
        setTimeout(() => showBanner(null), 1500);
    }

    acceptBtn?.addEventListener('click', () => {
        SiteUtils.storage.set('cookieConsent', 'granted');
        window['ga-disable-' + GA_ID] = false;
        hideBanner();
        const alreadyLoaded = document.querySelector('script[src*="googletagmanager.com/gtag"]');
        if (!alreadyLoaded && typeof window.loadGA === 'function') window.loadGA();
    });

    declineBtn?.addEventListener('click', () => {
        SiteUtils.storage.set('cookieConsent', 'denied');
        window['ga-disable-' + GA_ID] = true;   // stops any already-loaded tracker from sending hits
        clearAnalyticsCookies();
        hideBanner();
    });

    document.querySelectorAll('[data-cookie-settings]').forEach(btn => {
        btn.addEventListener('click', () => showBanner(btn));
    });

    document.addEventListener('keydown', e => {
        // Escape dismisses the banner only when it was reopened on purpose and a choice already exists
        if (e.key === 'Escape' && cookieBanner && cookieBanner.style.display === 'block' && SiteUtils.storage.get('cookieConsent')) {
            hideBanner();
        }
    });

    const mapContainer = document.querySelector('.map-image-inner');
    const mapTooltip = document.getElementById('map-tooltip');

    if (mapContainer && mapTooltip) {
        fetch('/assets/world-map.svg')
            .then(response => {
                if (!response.ok) throw new Error('SVG not found');
                return response.text();
            })
            .then(svgData => {
                mapContainer.innerHTML = svgData;

                const svg = mapContainer.querySelector('svg');
                if (svg) {
                    svg.classList.add('clients-map-img');
                    svg.style.width = '100%';
                    svg.style.height = 'auto';
                }

                const interactiveElements = mapContainer.querySelectorAll('.cls-1, .cls-2, [data-info]');

                interactiveElements.forEach(el => {
                    el.style.cursor = 'pointer';
                    el.style.transition = 'opacity 0.2s ease';

                    el.addEventListener('mouseenter', () => {
                        el.style.opacity = '0.6';
                        const infoText = el.getAttribute('data-info');
                        if (infoText) {
                            mapTooltip.textContent = infoText;
                            mapTooltip.classList.add('is-visible');
                        }
                    });

                    let ticking = false;
                    el.addEventListener('mousemove', (e) => {
                        if (!ticking) {
                            window.requestAnimationFrame(() => {
                                mapTooltip.style.left = `${e.clientX}px`;
                                mapTooltip.style.top = `${e.clientY}px`;
                                ticking = false;
                            });
                            ticking = true;
                        }
                    });

                    el.addEventListener('mouseleave', () => {
                        el.style.opacity = '1';
                        mapTooltip.classList.remove('is-visible');
                    });
                });
            })
            .catch(err => {
                console.error('Map loading error:', err);
                mapContainer.innerHTML = '<div class="system-message error-state"><p>Map unavailable right now.</p></div>';
            });
    }

    });

// ---- Download gate + quote prefill --------------------------------------
// The Services Guide and CV open only after an access code or an email address.
// The code is checked in the browser against a SHA-256 hash (below). This is a
// polite gate, not a lock: the PDFs themselves are still public files on the server.
(function () {
    const FORM_URL = 'https://formspree.io/f/myyqzqjb';
    // SHA-256 of the access code. To change the code, run this in the browser console
    // and paste the result here:
    //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-new-code'))
    //     .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')))
    const CODE_HASH = 'd26410fe051774b2ddeda372666ba047e76735b733639f0710934aba4be170e2';
    const FILES = {
        'Services_Guide.pdf': 'Services Guide',
        'Chatura_Dissanayake_CV_Communications.pdf': 'CV'
    };
    const KEY = 'docUnlocked';
    const canHash = !!(window.crypto && crypto.subtle);

    const store = {
        get() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } },
        set() { try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ } }
    };

    const sha256 = async text => {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const startDownload = (url, label) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    let modal, lastFocus, current = null;

    const build = () => {
        modal = document.createElement('div');
        modal.className = 'gate-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'gate-title');
        modal.innerHTML = `
            <div class="gate-panel">
                <button type="button" class="gate-close" aria-label="Close">&times;</button>
                <h2 class="gate-title" id="gate-title">Download</h2>
                <p class="gate-desc">Enter the access code I shared with you, or leave your email address and the download starts straight away.</p>
                <div class="gate-tabs" role="tablist">
                    <button type="button" class="gate-tab" role="tab" data-tab="email" aria-selected="true">Use email</button>
                    ${canHash ? '<button type="button" class="gate-tab" role="tab" data-tab="code" aria-selected="false">I have a code</button>' : ''}
                </div>
                <form class="gate-form" data-panel="email" novalidate>
                    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none">
                    <input class="gate-input" type="email" name="email" placeholder="your@email.com" autocomplete="email" aria-label="Email address" required>
                    <button type="submit" class="btn-primary gate-submit">Send and download</button>
                </form>
                <form class="gate-form" data-panel="code" hidden novalidate>
                    <input class="gate-input" type="password" inputmode="numeric" name="code" placeholder="Access code" autocomplete="off" aria-label="Access code" required>
                    <button type="submit" class="btn-primary gate-submit">Unlock and download</button>
                </form>
                <p class="gate-status" role="status" aria-live="polite"></p>
                <p class="gate-note">Your email is used only to know who is reading these documents. See the <a href="/privacy.html" class="inline-link">privacy policy</a>.</p>
            </div>`;
        document.body.appendChild(modal);

        modal.addEventListener('mousedown', e => { if (e.target === modal) close(); });
        modal.querySelector('.gate-close').addEventListener('click', close);
        modal.querySelectorAll('.gate-tab').forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));
        modal.querySelector('[data-panel="email"]').addEventListener('submit', onEmail);
        modal.querySelector('[data-panel="code"]').addEventListener('submit', onCode);
        modal.addEventListener('keydown', e => {
            if (e.key === 'Escape') { close(); return; }
            if (e.key !== 'Tab') return;
            const f = [...modal.querySelectorAll('button, input:not([type="hidden"]), a[href]')].filter(el => el.offsetParent !== null && el.tabIndex !== -1);
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });
    };

    const status = (msg, isError) => {
        const el = modal.querySelector('.gate-status');
        el.textContent = msg || '';
        el.classList.toggle('is-error', !!isError);
    };

    const setTab = name => {
        modal.querySelectorAll('.gate-tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
        modal.querySelectorAll('.gate-form').forEach(f => { f.hidden = f.dataset.panel !== name; });
        status('');
        modal.querySelector(`[data-panel="${name}"] .gate-input`)?.focus();
    };

    const open = (url, label) => {
        if (!modal) build();
        current = { url, label };
        lastFocus = document.activeElement;
        modal.querySelector('.gate-title').textContent = 'Download the ' + label;
        modal.querySelectorAll('form').forEach(f => f.reset());
        setTab('email');
        status('');
        document.body.classList.add('gate-open');
        modal.classList.add('is-open');
        lockScroll();
        setTimeout(() => modal.querySelector('[data-panel="email"] .gate-input')?.focus({ preventScroll: true }), 30);
    };

    // Keep the page still behind the popup WITHOUT changing overflow or padding on <body>.
    // (That used to shift the layout, reset the sticky portrait in About and made the page flicker.)
    const SCROLL_KEYS = [' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'];
    const stopScroll = e => { if (e.cancelable) e.preventDefault(); };
    const stopKeys = e => {
        if (SCROLL_KEYS.indexOf(e.key) === -1) return;
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        e.preventDefault();
    };
    const lockScroll = () => {
        window.addEventListener('wheel', stopScroll, { passive: false });
        window.addEventListener('touchmove', stopScroll, { passive: false });
        window.addEventListener('keydown', stopKeys);
    };
    const unlockScroll = () => {
        window.removeEventListener('wheel', stopScroll);
        window.removeEventListener('touchmove', stopScroll);
        window.removeEventListener('keydown', stopKeys);
    };

    function close() {
        if (!modal) return;
        modal.classList.remove('is-open');
        document.body.classList.remove('gate-open');
        unlockScroll();
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }

    const finish = () => {
        store.set();
        const { url, label } = current;
        close();
        startDownload(url, label);
    };

    async function onEmail(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.email;
        const btn = form.querySelector('button[type="submit"]');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
            status('Please enter a valid email address.', true);
            input.focus();
            return;
        }
        btn.disabled = true;
        status('Sending…');
        const data = new FormData(form);
        data.append('_subject', 'Document download: ' + current.label);
        data.append('message', 'Requested the ' + current.label + ' from ' + location.pathname);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
            const res = await fetch(FORM_URL, { method: 'POST', body: data, headers: { 'Accept': 'application/json' }, signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error('server');
            finish();
        } catch (err) {
            clearTimeout(timer);
            status('That did not go through. Try again, or use an access code.', true);
        } finally {
            btn.disabled = false;
        }
    }

    async function onCode(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const value = form.elements.code.value.trim();
        if (!value) { status('Enter the access code.', true); return; }
        try {
            if ((await sha256(value)) === CODE_HASH) { finish(); return; }
        } catch (err) { /* fall through to the error below */ }
        status('That code is not right.', true);
        form.elements.code.select();
    }

    document.addEventListener('click', e => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        let name;
        try { name = decodeURIComponent(new URL(link.href, location.href).pathname.split('/').pop()); } catch (err) { return; }
        if (!Object.prototype.hasOwnProperty.call(FILES, name)) return;
        e.preventDefault();
        if (store.get()) { startDownload(link.href, FILES[name]); return; }
        open(link.href, FILES[name]);
    });

    // "Request a quote" jumps to the contact form with the service already in the message
    document.addEventListener('click', e => {
        const q = e.target.closest('.service-quote-link[data-service]');
        if (!q) return;
        const msg = document.getElementById('contact-message');
        if (msg && !msg.value.trim()) {
            const svc = new DOMParser().parseFromString(q.dataset.service, 'text/html').documentElement.textContent;
            msg.value = 'I would like a quote for: ' + svc + '.\n\n';
        }
    });
})();

// ---- Insights: swipe dots on phones (same pattern as the visualisations) -----
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const track = document.getElementById('insights-container');
        const dots = Array.from(document.querySelectorAll('#insights-swipe-hint span'));
        if (!track || !dots.length) return;
        const update = () => {
            const max = track.scrollWidth - track.clientWidth;
            const p = max > 0 ? track.scrollLeft / max : 0;
            const idx = Math.min(dots.length - 1, Math.round(p * (dots.length - 1)));
            dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        };
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    });
})();