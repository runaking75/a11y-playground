/* ═══════════════════════════════════════
   A11y Playground — Renderer
   JSON 데이터 → 화면 자동 생성
   ═══════════════════════════════════════ */

const Renderer = {

  /**
   * 태그 텍스트 → 해시 링크 변환
   * SC 4.1.2 → #wcag22-4:sc-4-1-2
   * KWCAG 1.3.1 → #kwcag22-1:sc-1-3-1
   */
  tagToHash(tag) {
    var num;
    if (tag.type === 'wcag') {
      num = tag.text.replace('SC ', '');
      var p = num.split('.')[0];
      return '#wcag22-' + p + ':sc-' + num.replace(/\./g, '-');
    }
    if (tag.type === 'kwcag') {
      num = tag.text.replace('KWCAG ', '');
      var p = num.split('.')[0];
      return '#kwcag22-' + p + ':sc-' + num.replace(/\./g, '-');
    }
    return '';
  },

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
        var href = this.tagToHash(tag);
        if (href) {
          tagsHtml += '<a href="' + href + '" class="ap-tag ' + cls + ' ap-tag--lg">' + tag.text + '</a>';
        } else {
          tagsHtml += '<span class="ap-tag ' + cls + ' ap-tag--lg">' + tag.text + '</span>';
        }
      }
    }
    el.innerHTML = '<div class="ap-breadcrumb"><a href="#" class="ap-breadcrumb__home">컴포넌트</a> &nbsp;›&nbsp; ' + data.name + '</div>' +
      '<h1 class="ap-page-title">' + data.name + '</h1>' +
      '<p class="ap-page-desc">' + data.description + '</p>' +
      '<div class="ap-page-tags">' + tagsHtml + '</div>';

    // 브레드크럼 홈 링크
    var homeLink = el.querySelector('.ap-breadcrumb__home');
    if (homeLink) {
      homeLink.addEventListener('click', function(e) {
        e.preventDefault();
        history.replaceState(null, '', window.location.pathname);
        if (typeof Router !== 'undefined') Router.currentPage = null;
        if (typeof CardGrid !== 'undefined') CardGrid.render();
        document.querySelectorAll('.ap-sidebar__item').forEach(function(item) {
          item.classList.remove('is-active');
        });
      });
    }
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
    if (typeof MenuButtonAction !== 'undefined' && canvas.querySelector('[aria-haspopup="true"]')) {
      MenuButtonAction.init(canvas);
    }
  },

  // HTML 이스케이프
  esc: function(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  renderCompare: function(compare) {
    var section = document.querySelector('[data-section="compare"]');
    var el = section ? section.querySelector('.ap-compare') : null;
    var tocLink = document.querySelector('.ap-guide__toc-link[href="#guide-compare"]');
    if (!section) return;
    if (!compare) {
      section.style.display = 'none';
      if (tocLink) tocLink.style.display = 'none';
      return;
    }
    section.style.display = '';
    if (tocLink) tocLink.style.display = '';
    if (!el) return;
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
    var tocLink = document.querySelector('.ap-guide__toc-link[href="#guide-keyboard"]');
    if (!el) return;
    if (!keyboard) {
      el.style.display = 'none';
      if (tocLink) tocLink.style.display = 'none';
      return;
    }
    el.style.display = '';
    if (tocLink) tocLink.style.display = '';

    var self = this;
    var formatKey = function(key) {
      var parts = key.split(' / ');
      var result = '';
      for (var p = 0; p < parts.length; p++) {
        if (p > 0) result += ' / ';
        var combo = parts[p].split(' + ');
        for (var j = 0; j < combo.length; j++) {
          if (j > 0) result += ' + ';
          result += '<kbd>' + combo[j].trim() + '</kbd>';
        }
      }
      return result;
    };

    var tableHtml = '';

    // 복합 구조: { headers, colWidths?, groups: [{target, keys}] }
    if (keyboard.groups) {
      var headers = keyboard.headers || ['대상', 'Key', 'Action'];
      tableHtml += '<div class="ap-table-wrap"><table class="ap-table">';
      if (keyboard.colWidths) {
        tableHtml += '<colgroup>';
        for (var w = 0; w < keyboard.colWidths.length; w++) {
          tableHtml += '<col style="width:' + keyboard.colWidths[w] + '">';
        }
        tableHtml += '</colgroup>';
      }
      tableHtml += '<thead><tr>';
      for (var h = 0; h < headers.length; h++) {
        tableHtml += '<th>' + headers[h] + '</th>';
      }
      tableHtml += '</tr></thead><tbody>';
      for (var g = 0; g < keyboard.groups.length; g++) {
        var group = keyboard.groups[g];
        for (var i = 0; i < group.keys.length; i++) {
          tableHtml += '<tr>';
          if (i === 0) {
            tableHtml += '<th scope="row" class="ap-concept__label-cell" rowspan="' + group.keys.length + '">' + group.target + '</th>';
          }
          tableHtml += '<td>' + formatKey(group.keys[i].key) + '</td>';
          tableHtml += '<td>' + group.keys[i].action + '</td>';
          tableHtml += '</tr>';
        }
      }
      tableHtml += '</tbody></table></div>';

    // 단순 구조: [{key, action}]
    } else {
      var trHtml = '';
      for (var i = 0; i < keyboard.length; i++) {
        trHtml += '<tr><td>' + formatKey(keyboard[i].key) + '</td><td>' + keyboard[i].action + '</td></tr>';
      }
      tableHtml = '<div class="ap-table-wrap"><table class="ap-table">' +
        '<thead><tr><th>Key</th><th>Action</th></tr></thead>' +
        '<tbody>' + trHtml + '</tbody>' +
      '</table></div>';
    }

    el.innerHTML = '<h2 class="ap-section__title">키보드 인터랙션</h2>' + tableHtml;
  },

  renderGuideTab: function(guide, playground) {
    this.renderConcepts(guide ? guide.concepts : null);
    this.renderStandards(guide ? guide.standards : null);
    this.renderRoles(guide ? guide.roles : null);
    this.renderCompare(playground ? playground.compare : null);
    this.renderKeyboard(playground ? playground.keyboard : null);
    this.renderDoDont(guide ? guide.doDont : null);
    this.renderChecklist(guide ? guide.checklist : null);

    // TOC 활성화 리셋 — 첫 번째 보이는 링크 활성화
    var tocLinks = document.querySelectorAll('.ap-guide__toc-link');
    tocLinks.forEach(function(l) { l.classList.remove('is-active'); });
    for (var t = 0; t < tocLinks.length; t++) {
      if (tocLinks[t].style.display !== 'none') {
        tocLinks[t].classList.add('is-active');
        break;
      }
    }
  },

  renderConcepts: function(concepts) {
    var el = document.querySelector('[data-section="concepts"]');
    var tocLink = document.querySelector('.ap-guide__toc-link[href="#guide-concepts"]');
    if (!el) return;
    if (!concepts || concepts.length === 0) {
      el.style.display = 'none';
      if (tocLink) tocLink.style.display = 'none';
      return;
    }
    el.style.display = '';
    if (tocLink) tocLink.style.display = '';

    var html = '<h2 class="ap-section__title">개요</h2>';
    for (var i = 0; i < concepts.length; i++) {
      var c = concepts[i];
      html += '<h3 class="ap-concept__title">' + c.title + '</h3>';

      // desc: 문자열 또는 배열
      if (c.desc) {
        if (Array.isArray(c.desc)) {
          html += '<ul class="ap-concept__list">';
          for (var d = 0; d < c.desc.length; d++) {
            html += '<li>' + c.desc[d] + '</li>';
          }
          html += '</ul>';
        } else {
          html += '<p class="ap-concept__desc">' + c.desc + '</p>';
        }
      }

      // 테이블: headers + rows
      if (c.headers && c.rows) {
        html += '<div class="ap-table-wrap"><table class="ap-table">';

        // colgroup (colWidths 지정 시)
        if (c.colWidths) {
          html += '<colgroup>';
          for (var w = 0; w < c.colWidths.length; w++) {
            html += '<col style="width:' + c.colWidths[w] + '">';
          }
          html += '</colgroup>';
        }

        html += '<thead><tr>';
        for (var h = 0; h < c.headers.length; h++) {
          var hCell = c.headers[h];
          if (typeof hCell === 'object') {
            var hAttrs = '';
            if (hCell.colspan) hAttrs += ' colspan="' + hCell.colspan + '"';
            if (hCell.rowspan) hAttrs += ' rowspan="' + hCell.rowspan + '"';
            html += '<th' + hAttrs + '>' + hCell.text + '</th>';
          } else {
            html += '<th>' + hCell + '</th>';
          }
        }
        html += '</tr></thead><tbody>';
        for (var r = 0; r < c.rows.length; r++) {
          html += '<tr>';
          for (var k = 0; k < c.rows[r].length; k++) {
            var rCell = c.rows[r][k];
            if (typeof rCell === 'object') {
              var rAttrs = '';
              if (rCell.colspan) rAttrs += ' colspan="' + rCell.colspan + '"';
              if (rCell.rowspan) rAttrs += ' rowspan="' + rCell.rowspan + '"';
              if (k === 0 || rCell.isHeader) {
                html += '<th scope="row" class="ap-concept__label-cell"' + rAttrs + '>' + rCell.text + '</th>';
              } else {
                html += '<td' + rAttrs + '>' + rCell.text + '</td>';
              }
            } else {
              if (k === 0) {
                html += '<th scope="row" class="ap-concept__label-cell">' + rCell + '</th>';
              } else {
                html += '<td>' + rCell + '</td>';
              }
            }
          }
          html += '</tr>';
        }
        html += '</tbody></table></div>';
      }

      // 주의사항
      if (c.notes && c.notes.length > 0) {
        html += '<div class="ap-concept__notes">';
        html += '<div class="ap-concept__notes-title">주의사항</div>';
        html += '<ul class="ap-concept__list">';
        for (var n = 0; n < c.notes.length; n++) {
          html += '<li>' + c.notes[n] + '</li>';
        }
        html += '</ul></div>';
      }
    }
    el.innerHTML = html;
  },

  renderStandards(standards) {
    var el = document.querySelector('[data-section="standards"]');
    var tocLink = document.querySelector('.ap-guide__toc-link[href="#guide-standards"]');
    if (!el) return;
    if (!standards) {
      el.style.display = 'none';
      if (tocLink) tocLink.style.display = 'none';
      return;
    }
    el.style.display = '';
    if (tocLink) tocLink.style.display = '';
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
    var tocLink = document.querySelector('.ap-guide__toc-link[href="#guide-roles"]');
    if (!el) return;
    if (!roles) {
      el.style.display = 'none';
      if (tocLink) tocLink.style.display = 'none';
      return;
    }
    el.style.display = '';
    if (tocLink) tocLink.style.display = '';
    var trHtml = '';
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i];
      var descHtml = '';
      for (var d = 0; d < r.desc.length; d++) {
        descHtml += '<li>' + r.desc[d] + '</li>';
      }
      trHtml += '<tr>' +
        '<td><code>' + r.element + '</code></td>' +
        '<td>' + (r.role ? '<code>' + r.role + '</code>' : '') + '</td>' +
        '<td>' + (r.attr ? '<code>' + r.attr + '</code>' : '') + '</td>' +
        '<td><ul class="ap-td-list">' + descHtml + '</ul></td>' +
      '</tr>';
    }
    el.innerHTML =
      '<h2 class="ap-section__title">Role, 속성, 상태</h2>' +
      '<div class="ap-table-wrap"><table class="ap-table">' +
        '<thead><tr><th>대상</th><th>Role</th><th>속성 / 상태</th><th>설명</th></tr></thead>' +
        '<tbody>' + trHtml + '</tbody>' +
      '</table></div>';
  },

  renderDoDont: function(doDont) {
    var el = document.querySelector('[data-section="dodont"]');
    var tocLink = document.querySelector('.ap-guide__toc-link[href="#guide-dodont"]');
    if (!el) return;
    if (!doDont) {
      el.style.display = 'none';
      if (tocLink) tocLink.style.display = 'none';
      return;
    }
    el.style.display = '';
    if (tocLink) tocLink.style.display = '';
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
    var tocLink = document.querySelector('.ap-guide__toc-link[href="#guide-checklist"]');
    if (!el) return;
    if (!checklist) {
      el.style.display = 'none';
      if (tocLink) tocLink.style.display = 'none';
      return;
    }
    el.style.display = '';
    if (tocLink) tocLink.style.display = '';
    var html = '<h2 class="ap-section__title">접근성 체크리스트</h2>';
    for (var i = 0; i < checklist.length; i++) {
      var item = checklist[i];
      // 문자열 (하위 호환) 또는 객체
      if (typeof item === 'string') {
        html += '<div class="ap-checklist__item"><div class="ap-checklist__box"></div><span>' + item + '</span></div>';
      } else {
        html += '<div class="ap-checklist__item">';
        html += '<div class="ap-checklist__box"></div>';
        html += '<div class="ap-checklist__content">';
        html += '<div class="ap-checklist__text">';
        if (item.sc) html += '<span class="ap-tag ap-tag--wcag">' + item.sc + '</span> ';
        html += item.text + '</div>';
        if (item.solution) html += '<div class="ap-checklist__solution"><span class="ap-checklist__solution-label">해결 방안</span> ' + item.solution + '</div>';
        html += '</div></div>';
      }
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
