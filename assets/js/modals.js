document.addEventListener('DOMContentLoaded', () => {
    const projectModal    = document.getElementById('project-detail-modal');
    const closeProjectBtn = document.getElementById('close-project-modal');
    let lastFocusedElement = null;

    const focusableSelectors = 'a, button, [tabindex]:not([tabindex="-1"])';

    const openModal = card => {
        lastFocusedElement = document.activeElement;
        const titleText = card.getAttribute('data-title') || card.querySelector('h3')?.textContent || 'Project';
        document.getElementById('pm-title').textContent = titleText;
        document.getElementById('pm-challenge').textContent = card.getAttribute('data-challenge')  || '—';
        document.getElementById('pm-role').textContent      = card.getAttribute('data-role')      || '—';
        document.getElementById('pm-outcome').textContent   = card.getAttribute('data-outcome')   || '—';

        window.location.hash = 'project-details';

        const link   = document.getElementById('pm-link');
        const href   = card.getAttribute('data-link');
        const status = card.getAttribute('data-status') || 'View Project';

        link.innerHTML = `${status} <i data-lucide="arrow-up-right" aria-hidden="true" style="width:14px;height:14px;margin-left:4px;"></i>`;

        if (window.lucide) {
            lucide.createIcons({ nameAttr: 'data-lucide', root: link });
        }

        if (href && href !== '#') {
            link.href = href;
            link.target = href.startsWith('http') ? '_blank' : '_self';
            link.style.display = 'inline-flex';
            link.style.opacity = '1';
            link.style.pointerEvents = 'auto';
        } else if (status && status !== 'View Project') {
            link.textContent = status;
            link.removeAttribute('href');
            link.style.opacity = '0.45';
            link.style.pointerEvents = 'none';
            link.style.display = 'inline-flex';
        } else {
            link.removeAttribute('href');
            link.style.display = 'none';
        }

        const tagsEl = document.getElementById('pm-tags');
        tagsEl.innerHTML = '';
        const rawTags = card.getAttribute('data-tags');
        if (rawTags) {
            rawTags.split(',').forEach(t => {
                const span = document.createElement('span');
                span.className = 'pm-tag';
                span.textContent = t.trim();
                tagsEl.appendChild(span);
            });
        }

        const methoEl = document.getElementById('pm-methodology');
        if (methoEl) {
            const dataSource = card.getAttribute('data-source');
            const stack = card.getAttribute('data-stack');
            const parts = [];
            if (dataSource) parts.push(`Data Source: ${dataSource}`);
            if (stack) parts.push(`Stack: ${stack}`);
            methoEl.textContent = parts.join(' · ');
            methoEl.style.display = parts.length ? 'block' : 'none';
        }

        // Prevent scrollbar layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.setProperty('--scroll-pad', `${scrollbarWidth}px`);

        // Pure CSS toggle (no showModal API)
        projectModal.classList.add('is-open');
        document.body.classList.add('modal-open');
        document.body.classList.add('project-modal-open');

        const panel = projectModal.querySelector('.modal-panel');
        if (panel) panel.scrollTop = 0;
        
        setTimeout(() => {
            closeProjectBtn?.focus({ preventScroll: true });
        }, 50);
    };

    const closeModal = () => {
        if (!projectModal.classList.contains('is-open')) return;

        projectModal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
        document.body.classList.remove('project-modal-open');

        if (window.location.hash === '#project-details') {
            history.pushState(null, '', window.location.pathname + window.location.search);
        }
        if (lastFocusedElement) lastFocusedElement.focus();
    };

    closeProjectBtn?.addEventListener('click', closeModal);
    document.getElementById('pm-close-secondary')?.addEventListener('click', closeModal);
    
    projectModal?.addEventListener('mousedown', e => {
        if (e.target === projectModal) closeModal();
    });
    
    document.querySelector('.modal-panel')?.addEventListener('mousedown', e => {
        e.stopPropagation();
    });

    window.addEventListener('hashchange', () => {
        if (window.location.hash !== '#project-details' && projectModal.classList.contains('is-open')) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && projectModal.classList.contains('is-open')) {
            closeModal();
        }
    });

    // --- Mobile Swipe-to-Close Physics ---
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const swipePanel = projectModal?.querySelector('.modal-panel');

    swipePanel?.addEventListener('touchstart', (e) => {
        const scrollArea = swipePanel.querySelector('.modal-scroll');
        // Only allow pulling down if we are at the very top of the content
        if (scrollArea && scrollArea.scrollTop > 0) return;
        
        startY = e.touches[0].clientY;
        isDragging = true;
        swipePanel.style.transition = 'none'; // Disable CSS animation so it tracks finger perfectly 1:1
    }, { passive: true });

    swipePanel?.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const dragDistance = currentY - startY;
        
        // Only allow the panel to be pulled downwards
        if (dragDistance > 0) {
            swipePanel.style.transform = `translateY(${dragDistance}px)`;
        }
    }, { passive: true });

    swipePanel?.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        swipePanel.style.transition = ''; // Restore smooth CSS animations
        
        const dragDistance = currentY - startY;
        
        // If pulled down more than 120px, snap it closed
        if (dragDistance > 120) {
            closeModal();
            setTimeout(() => {
                swipePanel.style.transform = ''; 
            }, 400); // Clear the inline transform after it finishes closing
        } else {
            // Otherwise, it wasn't pulled far enough, so snap it back up
            swipePanel.style.transform = ''; 
        }
    });

    const lightboxModal  = document.getElementById('lightbox-modal');
    const lightboxImg    = document.getElementById('lightbox-image');
    const lightboxClose  = lightboxModal?.querySelector('.lightbox-close');
    const lightboxPrev   = document.getElementById('lightbox-prev');
    const lightboxNext   = document.getElementById('lightbox-next');
    const vizTriggers    = Array.from(document.querySelectorAll('.viz-lightbox-trigger'));
    let lightboxIdx      = 0;

    const trapLightboxFocus = e => {
        if (lightboxModal.style.display !== 'flex') return;
        const focusable = [...lightboxModal.querySelectorAll(focusableSelectors)];
        if (focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    };

    const openLightboxAt = (idx) => {
        if (!lightboxModal || !vizTriggers[idx]) return;
        if (lightboxModal.style.display !== 'flex') lastFocusedElement = document.activeElement;
        lightboxIdx = idx;
        const src = vizTriggers[idx].querySelector('.viz-main-img');
        if (src && lightboxImg) {
            lightboxImg.src = src.src;
            lightboxImg.alt = src.alt || '';
        }
        lightboxModal.style.display = 'flex';
        lightboxModal.addEventListener('keydown', trapLightboxFocus);

        document.getElementById('main-content')?.setAttribute('aria-hidden', 'true');
        document.getElementById('main-header')?.setAttribute('aria-hidden', 'true');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                lightboxModal.classList.add('is-open');
            });
        });

        lightboxClose?.focus();
    };

    const closeLightbox = () => {
        if (lightboxModal) {
            lightboxModal.classList.remove('is-open');
            lightboxModal.removeEventListener('keydown', trapLightboxFocus);

            let finished = false;
            const finishClose = () => {
                if (finished) return;
                finished = true;
                lightboxModal.style.display = 'none';
                if (lightboxImg) { lightboxImg.src = ''; lightboxImg.alt = ''; }
            };
            lightboxModal.addEventListener('transitionend', finishClose, { once: true });
            setTimeout(finishClose, 350);
        }

        document.getElementById('main-content')?.removeAttribute('aria-hidden');
        document.getElementById('main-header')?.removeAttribute('aria-hidden');

        if (lastFocusedElement) lastFocusedElement.focus();
    };

    vizTriggers.forEach((item, idx) => {
        item.addEventListener('click', () => openLightboxAt(idx));
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', (e) => { e.stopPropagation(); openLightboxAt((lightboxIdx - 1 + vizTriggers.length) % vizTriggers.length); });
    lightboxNext?.addEventListener('click', (e) => { e.stopPropagation(); openLightboxAt((lightboxIdx + 1) % vizTriggers.length); });

    lightboxModal?.addEventListener('click', e => {
        if (e.target === lightboxModal) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (!lightboxModal || lightboxModal.style.display !== 'flex') return;
        if (e.key === 'Escape')     { closeLightbox(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); openLightboxAt((lightboxIdx + 1) % vizTriggers.length); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); openLightboxAt((lightboxIdx - 1 + vizTriggers.length) % vizTriggers.length); }
    });

    let lightboxTouchStartX = 0;
    let lightboxTouchStartY = 0;

    lightboxModal?.addEventListener('touchstart', e => {
        lightboxTouchStartX = e.changedTouches[0].clientX;
        lightboxTouchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    lightboxModal?.addEventListener('touchend', e => {
        const deltaX = e.changedTouches[0].clientX - lightboxTouchStartX;
        const deltaY = e.changedTouches[0].clientY - lightboxTouchStartY;
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
                openLightboxAt((lightboxIdx + 1) % vizTriggers.length);
            } else {
                openLightboxAt((lightboxIdx - 1 + vizTriggers.length) % vizTriggers.length);
            }
        }
    }, { passive: true });

    window.SiteModals = { openModal, closeModal };
});