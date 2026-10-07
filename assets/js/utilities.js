window.SiteUtils = (function() {
    const initIcons = (root) => {
        if (window.lucide) {
            lucide.createIcons({ root: root || document });
        }
    };

    const getScrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

    // localStorage can throw (private mode, blocked storage). Never let that break the page.
    const storage = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
    };

    // The hamburger menu replaces the desktop nav at this width (kept in sync with animations.css).
    const MOBILE_NAV_MAX = 1040;

    return { initIcons, getScrollBehavior, storage, MOBILE_NAV_MAX };
})();