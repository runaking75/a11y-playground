/* ═══════════════════════════════════════
   A11y Playground — Tabs Action
   자동 활성화 / 수동 활성화 모드
   ═══════════════════════════════════════ */

var TabsAction = {
  manual: false,

  init: function(canvas) {
    if (!canvas) return;
    var tabs = canvas.querySelectorAll('[role="tab"]');
    var self = this;
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() { self.select(tab, canvas); });
      tab.addEventListener('keydown', function(e) { self.handleKey(e, tab, canvas); });
    });
  },

  select: function(tab, canvas) {
    var tablist = tab.closest('[role="tablist"]');
    if (!tablist) return;
    tablist.querySelectorAll('[role="tab"]').forEach(function(t) {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
      var panel = canvas.querySelector('#' + t.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
    });
    tab.setAttribute('aria-selected', 'true');
    tab.removeAttribute('tabindex');
    var panel = canvas.querySelector('#' + tab.getAttribute('aria-controls'));
    if (panel) panel.hidden = false;
    if (typeof AriaViewer !== 'undefined') AriaViewer.select(tab);
  },

  // 수동 모드: 포커스만 이동 (선택 안 함)
  focusOnly: function(tab) {
    tab.focus();
    if (typeof AriaViewer !== 'undefined') AriaViewer.select(tab);
  },

  handleKey: function(e, tab, canvas) {
    var tabs = Array.from(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'));
    var idx = tabs.indexOf(tab);
    var self = this;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        var next = tabs[(idx + 1) % tabs.length];
        if (self.manual) {
          self.focusOnly(next);
        } else {
          next.focus();
          self.select(next, canvas);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        var prev = tabs[(idx - 1 + tabs.length) % tabs.length];
        if (self.manual) {
          self.focusOnly(prev);
        } else {
          prev.focus();
          self.select(prev, canvas);
        }
        break;
      case 'Home':
        e.preventDefault();
        if (self.manual) {
          self.focusOnly(tabs[0]);
        } else {
          tabs[0].focus();
          self.select(tabs[0], canvas);
        }
        break;
      case 'End':
        e.preventDefault();
        var last = tabs[tabs.length - 1];
        if (self.manual) {
          self.focusOnly(last);
        } else {
          last.focus();
          self.select(last, canvas);
        }
        break;
      case 'Enter':
      case ' ':
        // 수동 모드에서만 Enter/Space로 활성화
        if (self.manual) {
          e.preventDefault();
          self.select(tab, canvas);
        }
        break;
    }
  }
};
