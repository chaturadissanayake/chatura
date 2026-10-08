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

    const aboutContent = document.querySelector('.about-philosophy');
    const aboutReadMoreBtn = document.getElementById('about-read-more-btn');
    if (aboutContent && aboutReadMoreBtn) {
        if (window.innerWidth <= 640) {
            aboutContent.classList.add('is-collapsed-mobile');
        }
        aboutReadMoreBtn.addEventListener('click', () => {
            aboutContent.classList.toggle('is-collapsed-mobile');
            aboutReadMoreBtn.setAttribute('aria-expanded', String(!aboutContent.classList.contains('is-collapsed-mobile')));
            aboutReadMoreBtn.innerHTML = aboutContent.classList.contains('is-collapsed-mobile') 
                ? 'Read more <i data-lucide="chevron-down"></i>' 
                : 'Show less <i data-lucide="chevron-up"></i>';
            if (window.lucide) lucide.createIcons({ root: aboutReadMoreBtn });
        });
    }

    const expContent = document.querySelector('.exp-list');
    const expReadMoreBtn = document.getElementById('exp-read-more-btn');
    if (expContent && expReadMoreBtn) {
        if (window.innerWidth <= 640) {
            expContent.classList.add('is-collapsed-mobile');
        }
        expReadMoreBtn.addEventListener('click', () => {
            expContent.classList.toggle('is-collapsed-mobile');
            expReadMoreBtn.setAttribute('aria-expanded', String(!expContent.classList.contains('is-collapsed-mobile')));
            expReadMoreBtn.innerHTML = expContent.classList.contains('is-collapsed-mobile') 
                ? 'View earlier roles <i data-lucide="chevron-down"></i>' 
                : 'Show fewer roles <i data-lucide="chevron-up"></i>';
            if (window.lucide) lucide.createIcons({ root: expReadMoreBtn });
        });
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