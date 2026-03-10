/* ═══════════════════════════════════════
   A11y Playground — ARIA Viewer
   포커스/클릭된 요소의 ARIA 속성 실시간 표시
   ═══════════════════════════════════════ */

var AriaViewer = {
  codeEl: null,
  currentEl: null,

  init: function() {
    this.codeEl = document.querySelector('.ap-aria-viewer__code');

    var canvas = document.querySelector('.ap-preview__canvas');
    if (!canvas) return;

    var self = this;

    // 클릭으로 요소 선택
    canvas.addEventListener('click', function(e) {
      var target = e.target.closest('[data-component]');
      if (target) {
        self.select(target);
      }
    });

    // 포커스 이동 감지
    canvas.addEventListener('focusin', function(e) {
      var target = e.target.closest('[data-component]');
      if (target) {
        self.select(target);
      }
    });
  },

  // 요소 선택 + ARIA 읽기 + 발화 업데이트
  select: function(el) {
    if (!el || !this.codeEl) return;

    // 이전 선택 해제
    var prev = document.querySelector('[data-component].is-selected');
    if (prev) prev.classList.remove('is-selected');

    // 새 선택
    el.classList.add('is-selected');
    this.currentEl = el;
    this.read(el);

    // 발화 텍스트도 업데이트
    if (typeof Speech !== 'undefined') {
      Speech.update();
    }
  },

  // DOM 요소 → 한 줄 코드 생성
  read: function(el) {
    if (!el || !this.codeEl) return;

    var tag = el.tagName.toLowerCase();
    var attrs = this.getAttrs(el);
    var text = this.getVisibleText(el);
    if (text.length > 30) text = text.substring(0, 30) + '…';

    var html = '<span class="ap-aria-tag">&lt;' + tag + '</span>';

    for (var i = 0; i < attrs.length; i++) {
      var a = attrs[i];
      var isAria = a.name.indexOf('aria-') === 0 || a.name === 'role' || a.name === 'tabindex';
      var hlClass = isAria ? ' ap-aria-hl' : '';
      html += ' <span class="ap-aria-attr">' + a.name + '</span>=<span class="ap-aria-val' + hlClass + '">"' + a.value + '"</span>';
    }

    html += '<span class="ap-aria-tag">&gt;</span>';
    if (text) html += text;
    html += '<span class="ap-aria-tag">&lt;/' + tag + '&gt;</span>';

    this.codeEl.innerHTML = html;
  },

  // 아이콘 텍스트 제외하고 실제 텍스트만 추출
  getVisibleText: function(el) {
    var text = '';
    var children = el.childNodes;
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      // 텍스트 노드
      if (node.nodeType === 3) {
        text += node.textContent.trim();
      }
      // 요소 노드 — material-icons, aria-hidden 제외
      if (node.nodeType === 1) {
        var isIcon = node.classList && (
          node.classList.contains('material-icons-outlined') ||
          node.classList.contains('material-icons')
        );
        var isHidden = node.getAttribute && node.getAttribute('aria-hidden') === 'true';
        if (!isIcon && !isHidden) {
          text += node.textContent.trim();
        }
      }
    }
    return text.trim();
  },

  // 표시할 속성 필터링
  getAttrs: function(el) {
    var show = [
      'type', 'role', 'tabindex', 'href',
      'aria-label', 'aria-labelledby', 'aria-describedby',
      'aria-disabled', 'aria-pressed', 'aria-expanded',
      'aria-hidden', 'aria-haspopup', 'aria-controls',
      'aria-selected', 'aria-checked', 'aria-required',
      'aria-invalid', 'aria-live', 'aria-modal'
    ];

    var attrs = [];

    // disabled는 boolean 속성이라 별도 처리
    if (el.disabled || el.hasAttribute('disabled')) {
      attrs.push({ name: 'disabled', value: 'true' });
    }

    for (var i = 0; i < show.length; i++) {
      var name = show[i];
      if (el.hasAttribute(name)) {
        attrs.push({ name: name, value: el.getAttribute(name) });
      }
    }

    return attrs;
  },

  // 외부에서 호출 — 컨트롤 변경 시 갱신
  update: function() {
    if (this.currentEl) {
      this.read(this.currentEl);
    }
  }
};
