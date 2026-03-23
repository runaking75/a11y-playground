/* ═══════════════════════════════════════
   A11y Playground — Editable
   컴포넌트 텍스트 더블클릭 수정
   버튼 안 텍스트 노드를 span으로 감싸서 편집
   ═══════════════════════════════════════ */

var Editable = {

  init: function() {
    var canvas = document.querySelector('.ap-preview__canvas');
    if (!canvas) return;

    var self = this;
    canvas.addEventListener('dblclick', function(e) {
      var target = e.target.closest('[data-component]');
      if (target && !target.hasAttribute('data-no-edit')) {
        e.preventDefault();
        self.startEdit(target);
      }
    });
  },

  startEdit: function(el) {
    // 편집할 텍스트 span 찾거나 생성
    var textSpan = el.querySelector('.ap-editable-text');

    if (!textSpan) {
      // 텍스트 노드를 span으로 감싸기 (아이콘 제외)
      var children = el.childNodes;
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if (node.nodeType === 3 && node.textContent.trim().length > 0) {
          textSpan = document.createElement('span');
          textSpan.className = 'ap-editable-text';
          textSpan.textContent = node.textContent.trim();
          el.replaceChild(textSpan, node);
          break;
        }
      }
    }

    if (!textSpan || textSpan.isContentEditable) return;

    var originalText = textSpan.textContent;
    textSpan.contentEditable = true;
    textSpan.classList.add('is-editing');
    textSpan.focus();

    // 텍스트 전체 선택
    var range = document.createRange();
    range.selectNodeContents(textSpan);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    var onKeydown = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        endEdit();
      }
      if (e.key === 'Escape') {
        textSpan.textContent = originalText;
        endEdit();
      }
    };

    var onBlur = function() {
      endEdit();
    };

    var endEdit = function() {
      textSpan.contentEditable = false;
      textSpan.classList.remove('is-editing');
      textSpan.removeEventListener('keydown', onKeydown);
      textSpan.removeEventListener('blur', onBlur);

      if (typeof AriaViewer !== 'undefined') AriaViewer.update();
      if (typeof Speech !== 'undefined') Speech.update();
    };

    textSpan.addEventListener('keydown', onKeydown);
    textSpan.addEventListener('blur', onBlur);
  }
};
