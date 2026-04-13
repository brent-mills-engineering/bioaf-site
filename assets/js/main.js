// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded',
        navLinks.classList.contains('open'));
    });
  }

  // Docs sidebar toggle (mobile)
  var sidebarToggle = document.querySelector('.sidebar-toggle');
  var sidebarNav = document.querySelector('.sidebar-nav');

  if (sidebarToggle && sidebarNav) {
    sidebarToggle.addEventListener('click', function () {
      sidebarNav.classList.toggle('open');
      sidebarToggle.setAttribute('aria-expanded',
        sidebarNav.classList.contains('open'));
    });
  }

  // OS tabs (Getting Started page)
  var osTabs = document.querySelectorAll('.os-tab');
  if (osTabs.length) {
    var panels = document.querySelectorAll('[data-os-panel]');
    var activate = function (os) {
      osTabs.forEach(function (t) {
        var on = t.getAttribute('data-os') === os;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        if (p.getAttribute('data-os-panel') === os) {
          p.removeAttribute('hidden');
        } else {
          p.setAttribute('hidden', '');
        }
      });
    };

    // Guess the user's OS for a sensible default
    var ua = navigator.userAgent || '';
    var guess = 'macos';
    if (/Windows/i.test(ua)) guess = 'windows';
    else if (/Linux/i.test(ua) && !/Android/i.test(ua)) guess = 'linux';
    if (document.querySelector('[data-os-panel="' + guess + '"]')) activate(guess);

    osTabs.forEach(function (t) {
      t.addEventListener('click', function () {
        activate(t.getAttribute('data-os'));
      });
    });
  }

  // Copy-to-clipboard for install command
  var copyButtons = document.querySelectorAll('[data-copy-target]');
  copyButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-copy-target'));
      if (!target) return;
      var text = target.textContent;
      var done = function () {
        var original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var range = document.createRange();
        range.selectNode(target);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try { document.execCommand('copy'); done(); } catch (e) {}
        sel.removeAllRanges();
      }
    });
  });
});
