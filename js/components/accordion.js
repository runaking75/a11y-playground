/* ═══════════════════════════════════════
   A11y Playground — Accordion Action
   패널 쇼/하이드 + 키보드 인터랙션
   ═══════════════════════════════════════ */

var AccordionAction = {
  multiOpen: false,

  init: function(canvas) {
    if (!canvas) return;
    var self = this;

    canvas.querySelectorAll('.accordion-header').forEach(function(header) {
      header.addEventListener('click', function() {
        self.toggle(header, canvas);
      });

      header.addEventListener('keydown', function(e) {
        self.handleKey(e, header, canvas);
      });
    });
  },

  toggle: function(header, canvas) {
    if (header.getAttribute('aria-disabled') === 'true') return;

    var expanded = header.getAttribute('aria-expanded') === 'true';
    var panelId = header.getAttribute('aria-controls');
    var panel = panelId ? canvas.querySelector('#' + panelId) : null;

    // 다중 열기 미허용 시 다른 패널 닫기
    if (!this.multiOpen && !expanded) {
      canvas.querySelectorAll('.accordion-header').forEach(function(h) {
        if (h !== header) {
          h.setAttribute('aria-expanded', 'false');
          var otherId = h.getAttribute('aria-controls');
          var otherPanel = otherId ? canvas.querySelector('#' + otherId) : null;
          if (otherPanel) otherPanel.hidden = true;
        }
      });
    }

    // 토글
    header.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    if (panel) panel.hidden = expanded;

    // ARIA 뷰어 업데이트
    if (typeof AriaViewer !== 'undefined') {
      AriaViewer.select(header);
    }
  },

  handleKey: function(e, header, canvas) {
    var headers = Array.from(canvas.querySelectorAll('.accordion-header'));
    var idx = headers.indexOf(header);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (idx < headers.length - 1) headers[idx + 1].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (idx > 0) headers[idx - 1].focus();
        break;
      case 'Home':
        e.preventDefault();
        headers[0].focus();
        break;
      case 'End':
        e.preventDefault();
        headers[headers.length - 1].focus();
        break;
    }
  }
};
