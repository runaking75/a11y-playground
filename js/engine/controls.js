/* ═══════════════════════════════════════
   A11y Playground — Controls
   컨트롤 패널 동적 생성 + 연동
   공통 컨트롤(controls-base.json) + 컴포넌트 고유 컨트롤 합침
   순서: 속성 → 컬러 → ARIA
   ═══════════════════════════════════════ */

var Controls = {
  panelEl: null,
  currentData: null,
  baseControls: null,
  mode: 'all',

  init: function() {
    this.panelEl = document.querySelector('.ap-control');
    this.loadBase();
  },

  loadBase: function() {
    var self = this;
    fetch('data/controls-base.json')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        self.baseControls = data;
        // 이미 렌더된 상태면 다시 렌더
        if (self.currentData) {
          self.render(self.currentData);
        }
      })
      .catch(function(err) { console.warn('controls-base.json not found', err); });
  },

  render: function(pg) {
    if (!this.panelEl) return;
    this.currentData = pg;

    // 공통 컨트롤 + 컴포넌트 고유 컨트롤 합치기
    var componentControls = pg.controls || [];
    var baseControls = this.baseControls ? this.baseControls.controls || [] : [];

    var html = '';

    // 모드 전환
    html += this.renderModeToggle();

    // 1. 속성 (컴포넌트 고유 옵션만) — 기본 열림
    if (componentControls.length > 0) {
      html += this.renderSection('속성', 'props', this.buildControlsHtml(componentControls), true, true);
    }

    // 2. 디자인 (공통 슬라이더 + 컬러) — 기본 열림
    var designHtml = this.buildControlsHtml(baseControls) + this.buildColorHtml(pg.colorPresets);
    html += this.renderSection('디자인', 'design', designHtml, true, true);

    // 3. ARIA — 기본 접힘
    html += this.renderSection('ARIA', 'aria', this.buildAriaHtml(pg.aria), true, false);

    // 4. 관련 컴포넌트 — 기본 접힘
    if (pg.related) {
      html += this.renderSection('관련 컴포넌트', 'related', this.buildRelatedHtml(pg.related), true, false);
    }

    this.panelEl.innerHTML = html;
    this.bindEvents();
  },

  renderModeToggle: function() {
    return '<div class="ap-control__mode">' +
      '<button class="ap-control__mode-btn' + (this.mode === 'all' ? ' is-active' : '') + '" data-mode="all">전체</button>' +
      '<button class="ap-control__mode-btn' + (this.mode === 'selected' ? ' is-active' : '') + '" data-mode="selected">선택</button>' +
    '</div>';
  },

  renderSection: function(title, id, content, collapsible, open) {
    var openClass = open ? ' is-open' : '';
    var toggleIcon = collapsible ? '<span class="ap-control__collapse-icon material-icons-outlined" style="font-size:16px">expand_less</span>' : '';
    return '<div class="ap-control__section' + openClass + '" data-section-id="' + id + '">' +
      '<div class="ap-control__section-header">' +
        '<span class="ap-control__section-title">' + title + '</span>' +
        toggleIcon +
      '</div>' +
      '<div class="ap-control__section-body">' + content + '</div>' +
    '</div>';
  },

  buildControlsHtml: function(controls) {
    if (!controls) return '';
    var html = '';
    for (var i = 0; i < controls.length; i++) {
      var ctrl = controls[i];
      if (ctrl.type === 'toggle') html += this.buildToggle(ctrl);
      if (ctrl.type === 'slider') html += this.buildSlider(ctrl);
      if (ctrl.type === 'select') html += this.buildSelect(ctrl);
    }
    return html;
  },

  buildToggle: function(ctrl) {
    var checked = ctrl.default ? ' checked' : '';
    var label = ctrl.label || ctrl.attr;
    return '<div class="ap-control__row">' +
      '<div class="ap-control__label">' +
        '<span>' + label + '</span>' +
        '<label class="ap-toggle">' +
          '<input type="checkbox" data-attr="' + ctrl.attr + '" data-type="toggle"' + checked + '>' +
          '<span class="ap-toggle__track"></span>' +
          '<span class="ap-toggle__thumb"></span>' +
        '</label>' +
      '</div>' +
    '</div>';
  },

  buildSlider: function(ctrl) {
    var step = ctrl.step || 1;
    var val = ctrl.default + (ctrl.unit || '');
    return '<div class="ap-control__row">' +
      '<div class="ap-control__label">' +
        '<span>' + ctrl.label + '</span>' +
        '<span class="ap-control__value" data-value-for="' + ctrl.attr + '">' + val + '</span>' +
      '</div>' +
      '<input type="range" class="ap-control__slider" data-attr="' + ctrl.attr + '" data-unit="' + (ctrl.unit || '') + '" data-type="slider" min="' + ctrl.min + '" max="' + ctrl.max + '" value="' + ctrl.default + '" step="' + step + '">' +
    '</div>';
  },

  buildSelect: function(ctrl) {
    var opts = '';
    for (var i = 0; i < ctrl.options.length; i++) {
      var opt = ctrl.options[i];
      var label = typeof opt === 'object' ? opt.label : opt;
      var value = typeof opt === 'object' ? opt.value : opt;
      var sel = value === ctrl.default ? ' selected' : '';
      opts += '<option value="' + value + '"' + sel + '>' + label + '</option>';
    }
    return '<div class="ap-control__row">' +
      '<div class="ap-control__label"><span>' + ctrl.label + '</span></div>' +
      '<select class="ap-control__select" data-attr="' + ctrl.attr + '" data-type="select">' + opts + '</select>' +
    '</div>';
  },

  buildColorHtml: function(presets) {
    var html = '';
    if (presets) {
      html += '<div class="ap-control__row"><div class="ap-control__presets">';
      for (var i = 0; i < presets.length; i++) {
        var p = presets[i];
        html += '<button class="ap-control__preset-btn" data-preset=\'' + JSON.stringify(p) + '\'>' + p.name + '</button>';
      }
      html += '</div></div>';
    }
    // 공통 컬러 피커
    var pickers = this.baseControls ? this.baseControls.colorPickers || [] : [
      { label: '배경색', attr: 'background-color', default: '#2563EB' },
      { label: '텍스트색', attr: 'color', default: '#FFFFFF' },
      { label: '테두리색', attr: 'border-color', default: '#93C5FD' }
    ];
    for (var j = 0; j < pickers.length; j++) {
      html += this.buildColorPicker(pickers[j].label, pickers[j].attr, pickers[j].default);
    }
    return html;
  },

  buildColorPicker: function(label, attr, defaultVal) {
    return '<div class="ap-control__row">' +
      '<div class="ap-control__label">' + label + '</div>' +
      '<div class="ap-color-row">' +
        '<div class="ap-color-swatch"><input type="color" data-color-attr="' + attr + '" value="' + defaultVal + '"></div>' +
        '<span class="ap-color-val" data-color-val="' + attr + '">' + defaultVal + '</span>' +
        '<span class="ap-contrast-result" data-contrast-for="' + attr + '"></span>' +
      '</div>' +
    '</div>';
  },

  buildAriaHtml: function(ariaList) {
    if (!ariaList) return '';
    var html = '';

    for (var i = 0; i < ariaList.length; i++) {
      var a = ariaList[i];

      // 파트별 ARIA (accordion, tabs 등)
      if (a.part && a.attrs) {
        html += '<div class="ap-control__part-label">' + a.part + '</div>';
        for (var j = 0; j < a.attrs.length; j++) {
          html += this.buildAriaItem(a.attrs[j]);
        }
        continue;
      }

      // 단일 ARIA (button 등)
      html += this.buildAriaItem(a);
    }
    return html;
  },

  buildAriaItem: function(a) {
    if (a.type === 'fixed') {
      return '<div class="ap-control__row">' +
        '<div class="ap-control__label">' +
          '<code>' + a.attr + '="' + a.value + '"</code>' +
          '<span class="ap-control__fixed">고정</span>' +
        '</div>' +
      '</div>';
    }

    var checked = a.default ? ' checked' : '';
    var speechAttr = a.speechState ? ' data-speech-state="' + a.speechState + '"' : '';
    var linkedAttr = a.linkedElement ? ' data-linked=\'' + JSON.stringify(a.linkedElement) + '\'' : '';
    var inputAttr = a.inputOnEnable ? ' data-input-on-enable="true"' : '';

    return '<div class="ap-control__row">' +
      '<div class="ap-control__label">' +
        '<code>' + a.attr + '</code>' +
        '<label class="ap-toggle">' +
          '<input type="checkbox" data-attr="' + a.attr + '" data-type="aria"' + speechAttr + linkedAttr + inputAttr + checked + '>' +
          '<span class="ap-toggle__track"></span>' +
          '<span class="ap-toggle__thumb"></span>' +
        '</label>' +
      '</div>' +
    '</div>';
  },

  buildRelatedHtml: function(related) {
    if (!related) return '';
    var html = '';
    for (var i = 0; i < related.length; i++) {
      var r = related[i];
      html += '<a href="#' + r.id + '" class="ap-related-link">' + r.name + '</a>';
    }
    return html;
  },

  bindEvents: function() {
    if (!this.panelEl) return;
    var self = this;

    // 모드 전환
    this.panelEl.querySelectorAll('.ap-control__mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self.mode = btn.dataset.mode;
        self.panelEl.querySelectorAll('.ap-control__mode-btn').forEach(function(b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
      });
    });

    // 섹션 접기/펼치기
    this.panelEl.querySelectorAll('.ap-control__section-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var section = header.parentElement;
        section.classList.toggle('is-open');
      });
    });

    // 속성 Toggle
    this.panelEl.querySelectorAll('input[data-type="toggle"]').forEach(function(input) {
      input.addEventListener('change', function() {
        self.applyToggle(input.dataset.attr, input.checked);
      });
    });

    // ARIA Toggle
    this.panelEl.querySelectorAll('input[data-type="aria"]').forEach(function(input) {
      input.addEventListener('change', function() {
        self.applyAria(input);
      });
    });

    // Slider
    this.panelEl.querySelectorAll('.ap-control__slider').forEach(function(slider) {
      slider.addEventListener('input', function() {
        var attr = slider.dataset.attr;
        var unit = slider.dataset.unit;
        var value = slider.value;
        var valEl = self.panelEl.querySelector('[data-value-for="' + attr + '"]');
        if (valEl) valEl.textContent = value + unit;
        self.applyStyle(attr, value + unit);
      });
    });

    // Select
    this.panelEl.querySelectorAll('.ap-control__select').forEach(function(select) {
      select.addEventListener('change', function() {
        var attr = select.dataset.attr;
        var value = select.value;
        self.applyStyle(attr, value);
      });
    });

    // Color picker
    this.panelEl.querySelectorAll('[data-color-attr]').forEach(function(picker) {
      picker.addEventListener('input', function() {
        var attr = picker.dataset.colorAttr;
        var value = picker.value;
        var valEl = self.panelEl.querySelector('[data-color-val="' + attr + '"]');
        if (valEl) valEl.textContent = value;
        self.applyStyle(attr, value);
        self.updateContrast();
      });
    });

    // Preset
    this.panelEl.querySelectorAll('.ap-control__preset-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var preset = JSON.parse(btn.dataset.preset);
        self.applyPreset(preset);
      });
    });
  },

  getTargets: function() {
    var canvas = document.querySelector('.ap-preview__canvas');
    if (!canvas) return [];
    if (this.mode === 'selected' && typeof AriaViewer !== 'undefined' && AriaViewer.currentEl) {
      return [AriaViewer.currentEl];
    }
    return canvas.querySelectorAll('[data-component]');
  },

  applyToggle: function(attr, value) {
    var targets = this.getTargets();
    for (var i = 0; i < targets.length; i++) {
      if (attr === 'disabled') {
        targets[i].disabled = value;
      }
    }
    // 탭 수동 활성화 모드
    if (attr === 'manual-activation' && typeof TabsAction !== 'undefined') {
      TabsAction.manual = value;
    }
    if (typeof AriaViewer !== 'undefined') AriaViewer.update();
    if (typeof Speech !== 'undefined') Speech.update();
  },

  applyAria: function(input) {
    var attr = input.dataset.attr;
    var value = input.checked;
    var targets = this.getTargets();

    for (var i = 0; i < targets.length; i++) {
      if (value) {
        targets[i].setAttribute(attr, 'true');
      } else {
        targets[i].removeAttribute(attr);
      }
    }

    var speechState = input.dataset.speechState;
    if (speechState && typeof Speech !== 'undefined') {
      if (value) {
        Speech.addState(speechState);
      } else {
        Speech.removeState(speechState);
      }
    }

    if (typeof AriaViewer !== 'undefined') AriaViewer.update();
    if (typeof Speech !== 'undefined') Speech.update();
  },

  applyStyle: function(attr, value) {
    var targets = this.getTargets();
    for (var i = 0; i < targets.length; i++) {
      targets[i].style[attr] = value;
    }
  },

  applyPreset: function(preset) {
    var bgPicker = this.panelEl.querySelector('[data-color-attr="background-color"]');
    var textPicker = this.panelEl.querySelector('[data-color-attr="color"]');
    var borderPicker = this.panelEl.querySelector('[data-color-attr="border-color"]');

    if (preset.bg && preset.bg !== 'none' && preset.bg !== 'transparent') {
      if (bgPicker) bgPicker.value = preset.bg;
      this.applyStyle('background-color', preset.bg);
      var bgVal = this.panelEl.querySelector('[data-color-val="background-color"]');
      if (bgVal) bgVal.textContent = preset.bg;
    } else {
      this.applyStyle('background-color', preset.bg || 'transparent');
      var bgVal2 = this.panelEl.querySelector('[data-color-val="background-color"]');
      if (bgVal2) bgVal2.textContent = preset.bg || 'transparent';
    }

    if (preset.text) {
      if (textPicker) textPicker.value = preset.text;
      this.applyStyle('color', preset.text);
      var textVal = this.panelEl.querySelector('[data-color-val="color"]');
      if (textVal) textVal.textContent = preset.text;
    }

    if (preset.border && preset.border !== 'none') {
      if (borderPicker) borderPicker.value = preset.border;
      this.applyStyle('border', '1px solid ' + preset.border);
      var borderVal = this.panelEl.querySelector('[data-color-val="border-color"]');
      if (borderVal) borderVal.textContent = preset.border;
    } else {
      this.applyStyle('border', 'none');
      var borderVal2 = this.panelEl.querySelector('[data-color-val="border-color"]');
      if (borderVal2) borderVal2.textContent = 'none';
    }

    this.updateContrast();
  },

  updateContrast: function() {
    var bgVal = this.panelEl.querySelector('[data-color-val="background-color"]');
    var textVal = this.panelEl.querySelector('[data-color-val="color"]');
    var resultEl = this.panelEl.querySelector('[data-contrast-for="background-color"]');

    if (bgVal && textVal && resultEl) {
      var bg = bgVal.textContent;
      var fg = textVal.textContent;
      if (bg.indexOf('#') === 0 && fg.indexOf('#') === 0) {
        var ratio = this.contrastRatio(bg, fg);
        var pass = ratio >= 4.5;
        resultEl.textContent = ratio.toFixed(1) + ':1';
        resultEl.className = 'ap-contrast-result ' + (pass ? 'ap-contrast--pass' : 'ap-contrast--fail');
      }
    }
  },

  contrastRatio: function(hex1, hex2) {
    var l1 = this.luminance(hex1);
    var l2 = this.luminance(hex2);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  luminance: function(hex) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16) / 255;
    var g = parseInt(hex.substr(2, 2), 16) / 255;
    var b = parseInt(hex.substr(4, 2), 16) / 255;
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
};
