/* Content protection.
   Blocks right-click on images only, plus drag, copy/cut, text selection and Ctrl/Cmd+S on the page.
   Form fields are left alone so the contact form and the download gate still work.
   This deters casual copying only. Anything shown in a browser can still be captured
   with a screenshot or the developer tools. */
(function () {
    var isField = function (t) {
        return !!(t && t.closest && t.closest('input, textarea, [contenteditable="true"]'));
    };
    var isMedia = function (t) {
        return !!(t && t.closest && t.closest('img, picture, video, canvas, svg'));
    };
    // Right-click still works everywhere except on pictures, where "Save image as" would live
    document.addEventListener('contextmenu', function (e) { if (isMedia(e.target)) e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });
    document.addEventListener('selectstart', function (e) { if (!isField(e.target)) e.preventDefault(); });
    document.addEventListener('copy', function (e) { if (!isField(e.target)) e.preventDefault(); });
    document.addEventListener('cut', function (e) { if (!isField(e.target)) e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && String(e.key).toLowerCase() === 's') e.preventDefault();
    });
})();