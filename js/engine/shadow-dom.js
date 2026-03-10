/* ═══════════════════════════════════════
   A11y Playground — Shadow DOM
   각 컴포넌트를 개별 Shadow DOM으로 전환
   ═══════════════════════════════════════ */

var ShadowDom = {
  mode: 'light',
  canvas: null,
  shadowHosts: [],

  init: function() {
    this.canvas = document.querySelector('.ap-preview__canvas');
    if (!this.canvas) return;

    var self = this;
    document.querySelectorAll('.ap-preview__mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.ap-preview__mode-btn').forEach(function(b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');

        var newMode = btn.textContent.trim().indexOf('Shadow') >= 0 ? 'shadow' : 'light';
        if (newMode !== self.mode) {
          self.mode = newMode;
          self.toggle();
        }
      });
    });
  },

  toggle: function() {
    if (this.mode === 'shadow') {
      this.toShadow();
    } else {
      this.toLight();
    }
  },

  getComponentStyles: function(componentType) {
    var base = '@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap");\n' +
      '@import url("https://fonts.googleapis.com/icon?family=Material+Icons+Outlined");\n' +
      ':host { display: inline-block; }\n' +
      '.material-icons-outlined { font-family: "Material Icons Outlined"; font-size: 18px; font-weight: normal; font-style: normal; display: inline-block; line-height: 1; text-transform: none; letter-spacing: normal; word-wrap: normal; white-space: nowrap; direction: ltr; -webkit-font-smoothing: antialiased; }';

    if (componentType === 'accordion') {
      return base + '\n' +
        ':host { display: block; width: 100%; }\n' +
        '.accordion { width: 100%; border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden; }\n' +
        '.accordion-item { border-bottom: 1px solid #E0E0E0; }\n' +
        '.accordion-item:last-child { border-bottom: none; }\n' +
        '.accordion-heading { margin: 0; font-size: inherit; }\n' +
        '.accordion-header { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 20px; font-family: "Noto Sans KR", sans-serif; font-size: 14px; font-weight: 500; color: #1A1A1A; background: #fff; border: none; cursor: pointer; text-align: left; }\n' +
        '.accordion-header:hover { background: #FAFAFA; }\n' +
        '.accordion-header::after { content: ""; width: 8px; height: 8px; border-right: 2px solid #9E9E9E; border-bottom: 2px solid #9E9E9E; transform: rotate(45deg); transition: transform 0.2s; flex-shrink: 0; }\n' +
        '.accordion-header[aria-expanded="true"]::after { transform: rotate(-135deg); }\n' +
        '.accordion-panel { padding: 0 20px 16px; font-size: 14px; color: #757575; line-height: 1.7; }\n' +
        '.accordion-panel[hidden] { display: none; }';
    }

    if (componentType === 'tabs') {
      return base + '\n' +
        ':host { display: block; width: 100%; }\n' +
        '.tabs { width: 100%; border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden; }\n' +
        '.tabs__list { display: flex; border-bottom: 1px solid #E0E0E0; background: #FAFAFA; }\n' +
        '.tabs__tab { flex: 1; padding: 12px 16px; border: none; background: none; font-family: "Noto Sans KR", sans-serif; font-size: 14px; font-weight: 500; color: #9E9E9E; cursor: pointer; border-bottom: 2px solid transparent; }\n' +
        '.tabs__tab[aria-selected="true"] { color: #1A1A1A; background: #fff; border-bottom-color: #1A1A1A; }\n' +
        '.tabs__panel { padding: 20px; font-size: 14px; color: #757575; line-height: 1.7; }\n' +
        '.tabs__panel[hidden] { display: none; }';
    }

    if (componentType === 'dialog') {
      return base + '\n' +
        ':host { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: relative; }\n' +
        '.dialog-shadow-wrap { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; }\n' +
        '.ap-preview__row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; }\n' +
        '.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 8px; font-family: "Noto Sans KR", sans-serif; font-size: 14px; font-weight: 500; border: none; cursor: pointer; }\n' +
        '.btn-filled { background: #2563EB; color: #fff; }\n' +
        '.btn-outlined { background: none; color: #2563EB; border: 1px solid #93C5FD; }\n' +
        '.dialog-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 20; }\n' +
        '.dialog { background: #fff; border: none; border-radius: 8px; padding: 0; max-width: 400px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }\n' +
        '.dialog__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }\n' +
        '.dialog__title { font-size: 18px; font-weight: 600; }\n' +
        '.dialog__close { background: none; border: none; font-size: 24px; color: #9E9E9E; cursor: pointer; padding: 0; line-height: 1; }\n' +
        '.dialog__body { padding: 16px 24px; font-size: 14px; color: #757575; line-height: 1.6; }\n' +
        '.dialog__footer { display: flex; gap: 8px; justify-content: flex-end; padding: 0 24px 20px; }';
    }

    return base + '\n' +
      '.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 8px; font-family: "Noto Sans KR", sans-serif; font-size: 14px; font-weight: 500; border: none; cursor: pointer; transition: all 0.15s; }\n' +
      '.btn-filled { background: #2563EB; color: #fff; }\n' +
      '.btn-outlined { background: none; color: #2563EB; border: 1px solid #93C5FD; }\n' +
      '.btn-text { background: none; color: #2563EB; border: none; }\n' +
      '.btn-disabled { background: #BFDBFE; color: #93C5FD; cursor: not-allowed; }';
  },

  toShadow: function() {
    if (!this.canvas) return;

    var self = this;
    var accordion = this.canvas.querySelector('.accordion');
    var tabs = this.canvas.querySelector('.tabs');
    var dialogOverlay = this.canvas.querySelector('.dialog-overlay');

    if (accordion) {
      this.wrapBlockInShadow(accordion, 'accordion');
    } else if (tabs) {
      this.wrapBlockInShadow(tabs, 'tabs');
    } else if (dialogOverlay) {
      // Dialog는 트리거 + 오버레이 전체를 감싸야 함
      var wrapper = document.createElement('div');
      wrapper.className = 'dialog-shadow-wrap';
      var rows = this.canvas.querySelectorAll('.ap-preview__row');
      var addBar = this.canvas.querySelector('.ap-preview__add-bar');
      rows.forEach(function(row) { wrapper.appendChild(row.cloneNode(true)); });
      wrapper.appendChild(dialogOverlay.cloneNode(true));
      // 원본 숨기기
      rows.forEach(function(row) { row.style.display = 'none'; row.dataset.shadowWrapped = 'true'; });
      dialogOverlay.style.display = 'none';
      dialogOverlay.dataset.shadowWrapped = 'true';

      var host = document.createElement('custom-dialog');
      host.style.cssText = 'display:block; position:absolute; inset:0; z-index:1;';
      var shadow = host.attachShadow({ mode: 'open' });
      var style = document.createElement('style');
      style.textContent = this.getComponentStyles('dialog');
      shadow.appendChild(style);
      shadow.appendChild(wrapper);
      this.rebindActions(shadow, 'dialog');

      this.canvas.appendChild(host);
      this.shadowHosts.push({ host: host, originals: Array.from(rows).concat([dialogOverlay]) });
    } else {
      // 버튼 등은 각각 개별 Shadow DOM
      var items = this.canvas.querySelectorAll('.ap-preview__item');
      if (items.length > 0) {
        items.forEach(function(item) {
          var btn = item.querySelector('button[data-component]');
          if (btn) self.wrapInShadow(btn, 'button');
        });
      } else {
        var buttons = this.canvas.querySelectorAll('button[data-component]');
        buttons.forEach(function(btn) {
          self.wrapInShadow(btn, 'button');
        });
      }
    }
  },

  // 블록 요소를 Shadow DOM으로 감싸기 (accordion, tabs, dialog 등)
  wrapBlockInShadow: function(el, componentType) {
    if (el.dataset.shadowWrapped) return;

    var host = document.createElement('custom-' + componentType);
    host.style.display = 'block';
    host.style.width = '100%';
    host.style.maxWidth = '480px';
    var shadow = host.attachShadow({ mode: 'open' });

    var style = document.createElement('style');
    style.textContent = this.getComponentStyles(componentType);
    shadow.appendChild(style);

    var clone = el.cloneNode(true);
    shadow.appendChild(clone);

    // Shadow DOM 내부에 이벤트 다시 바인딩
    this.rebindActions(shadow, componentType);

    el.style.display = 'none';
    el.dataset.shadowWrapped = 'true';
    el.parentNode.insertBefore(host, el);

    this.shadowHosts.push({ host: host, original: el });
  },

  // Shadow DOM 내부 이벤트 재바인딩
  rebindActions: function(shadow, componentType) {
    if (componentType === 'accordion' && typeof AccordionAction !== 'undefined') {
      AccordionAction.init(shadow);
    }
    if (componentType === 'tabs' && typeof TabsAction !== 'undefined') {
      TabsAction.init(shadow);
    }
    if (componentType === 'dialog') {
      this.rebindDialog(shadow);
    }
  },

  // Dialog 재바인딩
  rebindDialog: function(shadow) {
    var trigger = shadow.querySelector('#dialog-trigger');
    var overlay = shadow.querySelector('#dialog-overlay');
    var dialog = shadow.querySelector('#demo-dialog');
    if (!trigger || !overlay || !dialog) return;

    trigger.addEventListener('click', function() {
      overlay.style.display = 'flex';
      var first = dialog.querySelector('button, [tabindex]');
      if (first) first.focus();
    });

    var close = function() {
      overlay.style.display = 'none';
      trigger.focus();
    };

    var closeBtn = dialog.querySelector('.dialog__close');
    var cancelBtn = dialog.querySelector('.dialog__cancel');
    var confirmBtn = dialog.querySelector('.dialog__confirm');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (confirmBtn) confirmBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    overlay.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') close();
    });
  },

  wrapInShadow: function(btn, componentType) {
    if (btn.dataset.shadowWrapped) return;

    var host = document.createElement('custom-button');
    host.style.display = 'inline-block';
    var shadow = host.attachShadow({ mode: 'open' });

    var style = document.createElement('style');
    style.textContent = this.getComponentStyles(componentType || 'button');
    shadow.appendChild(style);

    var clone = btn.cloneNode(true);
    clone.removeAttribute('data-component');
    shadow.appendChild(clone);

    btn.style.display = 'none';
    btn.dataset.shadowWrapped = 'true';
    btn.parentNode.insertBefore(host, btn);

    this.shadowHosts.push({ host: host, original: btn });
  },

  toLight: function() {
    if (!this.canvas) return;

    for (var i = 0; i < this.shadowHosts.length; i++) {
      var item = this.shadowHosts[i];
      if (item.host.parentNode) {
        item.host.parentNode.removeChild(item.host);
      }
      // 단일 원본
      if (item.original) {
        item.original.style.display = '';
        delete item.original.dataset.shadowWrapped;
      }
      // 복수 원본 (dialog)
      if (item.originals) {
        for (var j = 0; j < item.originals.length; j++) {
          item.originals[j].style.display = '';
          delete item.originals[j].dataset.shadowWrapped;
        }
      }
    }
    this.shadowHosts = [];
  }
};
