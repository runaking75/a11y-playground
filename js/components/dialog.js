var DialogAction = {
  init: function(canvas) {
    if (!canvas) return;
    var trigger = canvas.querySelector('#dialog-trigger');
    var overlay = canvas.querySelector('#dialog-overlay');
    var dialog = canvas.querySelector('#demo-dialog');
    if (!trigger || !overlay || !dialog) return;
    var self = this;

    trigger.addEventListener('click', function() { self.open(overlay, dialog); });

    var closeBtn = dialog.querySelector('.dialog__close');
    var cancelBtn = dialog.querySelector('.dialog__cancel');
    var confirmBtn = dialog.querySelector('.dialog__confirm');
    if (closeBtn) closeBtn.addEventListener('click', function() { self.close(overlay, trigger); });
    if (cancelBtn) cancelBtn.addEventListener('click', function() { self.close(overlay, trigger); });
    if (confirmBtn) confirmBtn.addEventListener('click', function() { self.close(overlay, trigger); });

    // 오버레이 클릭으로 닫기
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) self.close(overlay, trigger);
    });

    // ESC + 포커스 트랩
    overlay.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') self.close(overlay, trigger);
      if (e.key === 'Tab') self.trapFocus(e, dialog);
    });
  },

  open: function(overlay, dialog) {
    overlay.style.display = 'flex';
    var first = dialog.querySelector('button, [tabindex]');
    if (first) first.focus();
  },

  close: function(overlay, trigger) {
    overlay.style.display = 'none';
    if (trigger) trigger.focus();
  },

  trapFocus: function(e, dialog) {
    var focusable = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
};
