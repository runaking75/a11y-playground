/* ═══════════════════════════════════════
   A11y Playground — Speech
   스크린리더 발화 텍스트 (카드형)
   readers.json (공통) + 컴포넌트별 패턴
   ═══════════════════════════════════════ */

var Speech = {
  readers: null,
  speechData: null,
  sectionEl: null,
  currentState: null,

  init: function() {
    this.sectionEl = document.querySelector('[data-section="speech"]');
    this.loadReaders();
  },

  loadReaders: function() {
    var self = this;
    fetch('data/readers.json')
      .then(function(res) { return res.json(); })
      .then(function(data) { self.readers = data; })
      .catch(function(err) { console.warn('readers.json not found', err); });
  },

  setData: function(speechData) {
    this.speechData = speechData;
    if (speechData && speechData.columns && speechData.columns.length > 0) {
      this.currentState = speechData.columns[0];
    }
  },

  addState: function(stateName) {
    if (!this.speechData) return;
    var cols = this.speechData.columns;
    for (var i = 0; i < cols.length; i++) {
      if (cols[i] === stateName) return;
    }
    cols.push(stateName);
    this.render();
  },

  removeState: function(stateName) {
    if (!this.speechData) return;
    var cols = this.speechData.columns;
    var idx = cols.indexOf(stateName);
    if (idx > -1) {
      cols.splice(idx, 1);
      if (this.currentState === stateName) {
        this.currentState = cols[0] || '기본 상태';
      }
      this.render();
    }
  },

  render: function() {
    if (!this.speechData || !this.sectionEl || !this.readers) return;

    var columns = this.speechData.columns;
    var patterns = this.speechData.patterns;
    var readers = this.readers;
    var label = this.getCurrentLabel();

    // 상태 버튼
    var stateHtml = '<div class="ap-speech-states">';
    for (var c = 0; c < columns.length; c++) {
      var col = columns[c];
      var activeCls = col === this.currentState ? ' is-active' : '';
      stateHtml += '<button class="ap-speech-state-btn' + activeCls + '" data-state="' + col + '">' + col + '</button>';
    }
    stateHtml += '</div>';

    // 카드
    var cardsHtml = '<div class="ap-speech-cards">';
    for (var r = 0; r < readers.length; r++) {
      var reader = readers[r];
      var badgeCls = 'ap-sr-badge--' + reader.id;
      var readerPatterns = patterns[reader.id];
      var pattern = readerPatterns ? (readerPatterns[this.currentState] || '') : '';
      var text = pattern.split('{label}').join(label);

      // 버전 + 브라우저 정보
      var info = reader.name + ' ' + reader.version;
      if (reader.browser) {
        info += ' + ' + reader.browser;
        if (reader.browserVersion) info += ' ' + reader.browserVersion;
      }

      cardsHtml += '<div class="ap-speech-card">' +
        '<div class="ap-speech-card__reader">' +
          '<span class="ap-sr-badge ' + badgeCls + '">' + reader.badge + '</span>' +
          '<span class="ap-speech-card__info">' +
            '<span class="ap-speech-card__name">' + info + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="ap-speech-card__text" data-reader="' + reader.id + '">"' + text + '"</div>' +
      '</div>';
    }
    cardsHtml += '</div>';

    this.sectionEl.innerHTML =
      '<h2 class="ap-section__title">스크린리더 발화 텍스트</h2>' +
      stateHtml + cardsHtml;

    this.bindStateButtons();
  },

  bindStateButtons: function() {
    var self = this;
    var btns = this.sectionEl.querySelectorAll('.ap-speech-state-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function(e) {
        self.currentState = e.target.dataset.state;
        self.render();
      });
    }
  },

  update: function() {
    if (!this.speechData || !this.sectionEl || !this.readers) return;

    var label = this.getCurrentLabel();
    var patterns = this.speechData.patterns;
    var readers = this.readers;

    for (var r = 0; r < readers.length; r++) {
      var reader = readers[r];
      var readerPatterns = patterns[reader.id];
      var pattern = readerPatterns ? (readerPatterns[this.currentState] || '') : '';
      var text = pattern.split('{label}').join(label);
      var el = this.sectionEl.querySelector('[data-reader="' + reader.id + '"]');
      if (el) el.textContent = '"' + text + '"';
    }
  },

  getCurrentLabel: function() {
    var el = null;
    if (typeof AriaViewer !== 'undefined' && AriaViewer.currentEl) {
      el = AriaViewer.currentEl;
    } else {
      var canvas = document.querySelector('.ap-preview__canvas');
      if (canvas) {
        el = canvas.querySelector('[data-component]') ||
             canvas.querySelector('.btn, button');
      }
    }
    return this.getLabel(el);
  },

  getLabel: function(el) {
    if (!el) return '확인';
    if (el.getAttribute && el.getAttribute('aria-label')) {
      return el.getAttribute('aria-label');
    }
    var text = '';
    var children = el.childNodes;
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      if (node.nodeType === 3) {
        text += node.textContent.trim();
      }
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
    text = text.trim();
    if (text.length > 0) return text.substring(0, 20);
    return '확인';
  }
};
