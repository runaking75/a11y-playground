/* ═══════════════════════════════════════
   A11y Playground — Renderer
   JSON 데이터 → 화면 자동 생성
   ═══════════════════════════════════════ */

const Renderer = {

  renderComponent(data) {
    // 스크롤 위치 리셋
    var mainEl = document.querySelector('.ap-main');
    if (mainEl) mainEl.scrollTop = 0;

    this.renderPageHeader(data);
    this.renderTabs();
    // related를 playground에 합쳐서 Controls에 전달
    if (data.playground && data.related) {
      data.playground.related = data.related;
    }
    if (data.playground) {
      data.playground.componentId = data.id;
    }
    this.renderPlayground(data.playground);
    this.renderGuideTab(data.guide, data.playground);
    this.renderCodeTab(data.code);
  },

  renderPageHeader(data) {
    var el = document.querySelector('.ap-page-header');
    if (!el) return;
    var tagsHtml = '';
    if (data.tags) {
      for (var i = 0; i < data.tags.length; i++) {
        var tag = data.tags[i];
        var cls = tag.type === 'kwcag' ? 'ap-tag--kwcag' : 'ap-tag--wcag';
        tagsHtml += '<span class="ap-tag ' + cls + '">' + tag.text + '</span>';
      }
    }
    el.innerHTML = '<div class="ap-breadcrumb"><a href="#">컴포넌트</a> &nbsp;›&nbsp; ' + data.name + '</div>' +
      '<h1 class="ap-page-title">' + data.name + '</h1>' +
      '<p class="ap-page-desc">' + data.description + '</p>' +
      '<div class="ap-page-tags">' + tagsHtml + '</div>';
  },

  renderTabs() {
    var tabBtns = document.querySelectorAll('.ap-tabs__btn');
    var playground = document.querySelector('[data-content="playground"]');
    var guide = document.querySelector('[data-content="guide"]');
    var code = document.querySelector('[data-content="code"]');
    tabBtns.forEach(function(b) { b.classList.remove('is-active'); });
    if (playground) playground.classList.remove('is-active');
    if (guide) guide.classList.remove('is-active');
    if (code) code.classList.remove('is-active');
    if (tabBtns[0]) tabBtns[0].classList.add('is-active');
    if (playground) playground.classList.add('is-active');
  },

  renderPlayground: function(pg) {
    if (!pg) return;

    // 프리뷰 캔버스 교체
    if (pg.previewHtml) {
      var canvas = document.querySelector('.ap-preview__canvas');
      if (canvas) {
        // 모드 토글 보존
        var modeToggle = canvas.querySelector('.ap-preview__mode');
        var modeHtml = modeToggle ? modeToggle.outerHTML : '';
        canvas.innerHTML = modeHtml + pg.previewHtml;

        // 컴포넌트 액션 초기화
        this.initComponentAction(pg, canvas);

        // ElementManager 재초기화
        if (typeof ElementManager !== 'undefined') {
          ElementManager.canvas = canvas;
          ElementManager.setComponent(pg.componentId || 'button', pg.addable);
          ElementManager.createAddBar();
          ElementManager.bindDeleteButtons();
        }

        // AriaViewer 재초기화
        if (typeof AriaViewer !== 'undefined') {
          AriaViewer.currentEl = null;
          AriaViewer.init();
        }

        // Editable 재초기화
        if (typeof Editable !== 'undefined') {
          Editable.init();
        }

        // ShadowDom 재초기화
        if (typeof ShadowDom !== 'undefined') {
          ShadowDom.toLight();
          ShadowDom.mode = 'light';
          ShadowDom.shadowHosts = [];
          // 모드 버튼 시각 리셋
          canvas.querySelectorAll('.ap-preview__mode-btn').forEach(function(btn) {
            btn.classList.remove('is-active');
            if (btn.textContent.trim().indexOf('Light') >= 0) {
              btn.classList.add('is-active');
            }
          });
          ShadowDom.init();
        }
      }
    }

    Speech.setData(pg.speech);
    Speech.render();
    Controls.render(pg);
  },

  // 컴포넌트별 액션 스크립트 초기화
  initComponentAction: function(pg, canvas) {
    if (typeof AccordionAction !== 'undefined' && canvas.querySelector('.accordion-header')) {
      AccordionAction.init(canvas);
    }
    if (typeof TabsAction !== 'undefined' && canvas.querySelector('[role="tab"]')) {
      TabsAction.init(canvas);
    }
    if (typeof DialogAction !== 'undefined' && canvas.querySelector('#demo-dialog')) {
      DialogAction.init(canvas);
    }
  },

  // HTML 이스케이프
  esc: function(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  renderCompare: function(compare) {
    var el = document.querySelector('.ap-compare');
    if (!el || !compare) return;
    var nIcon = compare.native.descType === 'warn' ? 'warning' : 'check_circle';
    var aIcon = compare.aria.descType === 'warn' ? 'warning' : 'check_circle';
    el.innerHTML =
      '<div class="ap-compare__col">' +
        '<div class="ap-compare__label">' + compare.native.label + '</div>' +
        '<div class="ap-compare__code">' + this.esc(compare.native.code) + '</div>' +
        '<div class="ap-compare__desc"><span class="material-icons-outlined ap-desc--' + compare.native.descType + '">' + nIcon + '</span>' + compare.native.desc + '</div>' +
      '</div>' +
      '<div class="ap-compare__col">' +
        '<div class="ap-compare__label">' + compare.aria.label + '</div>' +
        '<div class="ap-compare__code">' + this.esc(compare.aria.code) + '</div>' +
        '<div class="ap-compare__desc"><span class="material-icons-outlined ap-desc--' + compare.aria.descType + '">' + aIcon + '</span>' + compare.aria.desc + '</div>' +
      '</div>';
  },

  renderKeyboard: function(keyboard) {
    var el = document.querySelector('[data-section="keyboard"]');
    if (!el || !keyboard) return;
    var trHtml = '';
    for (var i = 0; i < keyboard.length; i++) {
      var k = keyboard[i];
      var parts = k.key.split(' / ');
      var keys = '';
      for (var p = 0; p < parts.length; p++) {
        if (p > 0) keys += ' / ';
        var combo = parts[p].split(' + ');
        for (var j = 0; j < combo.length; j++) {
          if (j > 0) keys += ' + ';
          keys += '<kbd>' + combo[j].trim() + '</kbd>';
        }
      }
      trHtml += '<tr><td>' + keys + '</td><td>' + k.action + '</td></tr>';
    }
    el.innerHTML =
      '<h2 class="ap-section__title">키보드 인터랙션</h2>' +
      '<div class="ap-table-wrap"><table class="ap-table">' +
        '<thead><tr><th>Key</th><th>Action</th></tr></thead>' +
        '<tbody>' + trHtml + '</tbody>' +
      '</table></div>';
  },

  renderGuideTab: function(guide, playground) {
    if (!guide) return;
    this.renderStandards(guide.standards);
    this.renderRoles(guide.roles);
    if (playground) {
      this.renderCompare(playground.compare);
      this.renderKeyboard(playground.keyboard);
    }
    this.renderDoDont(guide.doDont);
    this.renderChecklist(guide.checklist);
  },

  renderStandards(standards) {
    var el = document.querySelector('[data-section="standards"]');
    if (!el || !standards) return;
    var trHtml = '';
    for (var i = 0; i < standards.length; i++) {
      var s = standards[i];
      var stdCls = s.std === 'kwcag' ? 'ap-std--kwcag' : 'ap-std--wcag';
      var levelCls = s.level === 'A' ? 'ap-level--a' : s.level === 'AA' ? 'ap-level--aa' : s.level === 'AAA' ? 'ap-level--aaa' : 'ap-level--kwcag';
      trHtml += '<tr>' +
        '<td><span class="ap-std ' + stdCls + '">' + s.stdLabel + '</span></td>' +
        '<td>' + s.item + '</td>' +
        '<td class="ap-td-desc">' + s.desc + '</td>' +
        '<td><span class="ap-level ' + levelCls + '">' + s.level + '</span></td>' +
      '</tr>';
    }
    el.innerHTML =
      '<h2 class="ap-section__title">적용 기준</h2>' +
      '<div class="ap-table-wrap"><table class="ap-table">' +
        '<thead><tr><th>기준</th><th>항목</th><th>설명</th><th>레벨</th></tr></thead>' +
        '<tbody>' + trHtml + '</tbody>' +
      '</table></div>';
  },

  renderRoles(roles) {
    var el = document.querySelector('[data-section="roles"]');
    if (!el || !roles) return;
    var trHtml = '';
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i];
      var descHtml = '';
      for (var d = 0; d < r.desc.length; d++) {
        descHtml += '<li>' + r.desc[d] + '</li>';
      }
      trHtml += '<tr>' +
        '<td>' + (r.role ? '<code>' + r.role + '</code>' : '') + '</td>' +
        '<td>' + (r.attr ? '<code>' + r.attr + '</code>' : '') + '</td>' +
        '<td><code>' + r.element + '</code></td>' +
        '<td><ul class="ap-td-list">' + descHtml + '</ul></td>' +
      '</tr>';
    }
    el.innerHTML =
      '<h2 class="ap-section__title">Role, 속성, 상태</h2>' +
      '<div class="ap-table-wrap"><table class="ap-table">' +
        '<thead><tr><th>Role</th><th>속성 / 상태</th><th>요소</th><th>설명</th></tr></thead>' +
        '<tbody>' + trHtml + '</tbody>' +
      '</table></div>';
  },

  renderDoDont: function(doDont) {
    var el = document.querySelector('[data-section="dodont"]');
    if (!el || !doDont) return;
    var html = '<h2 class="ap-section__title">Do / Don\'t</h2>';
    for (var i = 0; i < doDont.length; i++) {
      var pair = doDont[i];
      var doNote = pair.do.note ? '<div class="ap-dodont__note">' + pair.do.note + '</div>' : '';
      var dontNote = pair.dont.note ? '<div class="ap-dodont__note">' + pair.dont.note + '</div>' : '';
      var dontComment = pair.dont.comment ? '\n<span class="ap-c-cmt">&lt;!-- ' + this.esc(pair.dont.comment) + ' --&gt;</span>' : '';

      // 이미지 또는 코드
      var doContent = '';
      if (pair.do.image) {
        doContent = '<div class="ap-dodont__image"><img src="' + pair.do.image + '" alt="Do 예시"></div>';
        if (pair.do.code) doContent += '<div class="ap-dodont__code">' + this.esc(pair.do.code) + '</div>';
      } else {
        doContent = '<div class="ap-dodont__code">' + this.esc(pair.do.code) + '</div>';
      }

      var dontContent = '';
      if (pair.dont.image) {
        dontContent = '<div class="ap-dodont__image"><img src="' + pair.dont.image + '" alt="Don\'t 예시"></div>';
        if (pair.dont.code) dontContent += '<div class="ap-dodont__code">' + this.esc(pair.dont.code) + dontComment + '</div>';
      } else {
        dontContent = '<div class="ap-dodont__code">' + this.esc(pair.dont.code) + dontComment + '</div>';
      }

      html += '<div class="ap-dodont">' +
        '<div class="ap-dodont__do">' +
          '<div class="ap-dodont__label ap-dodont__label--do"><span class="material-icons-outlined">check_circle</span> Do</div>' +
          doContent + doNote +
        '</div>' +
        '<div class="ap-dodont__dont">' +
          '<div class="ap-dodont__label ap-dodont__label--dont"><span class="material-icons-outlined">cancel</span> Don\'t</div>' +
          dontContent + dontNote +
        '</div>' +
      '</div>';
    }
    el.innerHTML = html;
  },

  renderChecklist(checklist) {
    var el = document.querySelector('[data-section="checklist"]');
    if (!el || !checklist) return;
    var html = '<h2 class="ap-section__title">접근성 체크리스트</h2>';
    for (var i = 0; i < checklist.length; i++) {
      html += '<div class="ap-checklist__item"><div class="ap-checklist__box"></div><span>' + checklist[i] + '</span></div>';
    }
    el.innerHTML = html;
  },

  renderCodeTab: function(code) {
    if (!code) return;
    var nameEl = document.querySelector('.ap-code-toolbar__name');
    var blockEl = document.querySelector('.ap-code-block');
    if (!nameEl || !blockEl) return;
    nameEl.textContent = code.filename;
    var html = '';
    for (var i = 0; i < code.snippets.length; i++) {
      var s = code.snippets[i];
      html += '<span class="ap-c-cmt">&lt;!-- ' + s.label + ' --&gt;</span>\n' + this.esc(s.code) + '\n\n';
    }
    blockEl.innerHTML = '<pre>' + html + '</pre>';
  },

  renderGuide(data) {
    console.log('Render guide:', data.id);
  }
};
