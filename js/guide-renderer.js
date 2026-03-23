/* ═══════════════════════════════════════
   A11y Playground — Guide Renderer
   가이드 JSON → 페이지 렌더링
   ═══════════════════════════════════════ */

var GuideRenderer = {
  data: null,
  activeLevel: 'all',
  _scrollSpy: null,

  render: function(data) {
    this.data = data;
    this.activeLevel = 'all';

    // 매핑 타입이면 별도 렌더
    if (data.type === 'mapping') {
      this.renderMapping(data);
      return;
    }

    // FAQ 타입이면 별도 렌더
    if (data.type === 'faq') {
      this.renderFaq(data);
      return;
    }

    // 체크리스트 가이드 타입이면 별도 렌더
    if (data.type === 'checklist-guide') {
      this.renderChecklistGuide(data);
      return;
    }

    // 컴포넌트 뷰 숨기기
    this.showGuideView();

    var contentEl = document.querySelector('.ap-guide-page__content');
    var tocListEl = document.querySelector('.ap-guide-page__toc-list');
    if (!contentEl) return;

    var html = '';

    // 페이지 헤더
    html += '<div class="ap-guide-page__header">';
    html += '<h1 class="ap-guide-page__title">' + data.title + '</h1>';
    if (data.source) {
      html += '<a href="' + data.source + '" target="_blank" class="ap-guide-page__source">' + data.source + '</a>';
    }
    if (data.updated) {
      html += '<span class="ap-guide-page__updated">최종 업데이트: ' + data.updated + '</span>';
    }
    html += '</div>';

    // 개요
    if (data.overview) {
      html += '<div class="ap-guide-page__overview">';
      html += '<p>' + data.overview.desc + '</p>';
      html += '<div class="ap-guide-page__meta">';
      if (data.overview.structure) html += '<span><strong>구조:</strong> ' + data.overview.structure + '</span>';
      if (data.overview.levels) html += '<span><strong>적합 수준:</strong> ' + data.overview.levels + '</span>';
      if (data.overview.changes) html += '<span><strong>변경사항:</strong> ' + data.overview.changes + '</span>';
      html += '</div>';
      // 범례
      if (data.overview.legend) {
        html += '<div class="ap-guide-page__legend"><strong>기법 코드 범례:</strong> ';
        for (var lg = 0; lg < data.overview.legend.length; lg++) {
          var l = data.overview.legend[lg];
          if (lg > 0) html += '<span class="ap-guide-page__legend-sep">·</span>';
          html += '<span class="ap-guide-page__legend-item"><code>' + l.code + '</code> ' + l.desc + '</span>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    // 레벨 필터 (WCAG 원칙별 페이지)
    if (data.id && data.id.indexOf('wcag22') === 0) {
      // SC 개수 동적 계산
      var countAll = 0, countA = 0, countAA = 0, countAAA = 0;
      for (var cp = 0; cp < data.principles.length; cp++) {
        for (var cg = 0; cg < data.principles[cp].guidelines.length; cg++) {
          var crits = data.principles[cp].guidelines[cg].criteria;
          for (var cc = 0; cc < crits.length; cc++) {
            countAll++;
            if (crits[cc].level === 'A') countA++;
            else if (crits[cc].level === 'AA') countAA++;
            else if (crits[cc].level === 'AAA') countAAA++;
          }
        }
      }
      html += '<div class="ap-guide-page__filter" id="guide-filter">';
      html += '<button class="ap-guide-page__filter-btn is-active" data-level="all">전체 (' + countAll + ')</button>';
      if (countA > 0) html += '<button class="ap-guide-page__filter-btn" data-level="A">A (' + countA + ')</button>';
      if (countAA > 0) html += '<button class="ap-guide-page__filter-btn" data-level="AA">AA (' + countAA + ')</button>';
      if (countAAA > 0) html += '<button class="ap-guide-page__filter-btn" data-level="AAA">AAA (' + countAAA + ')</button>';
      html += '</div>';
    }

    // 전체 펼치기/접기 툴바
    html += '<div class="ap-guide-page__toolbar">';
    html += '<button class="ap-guide-page__toolbar-btn" id="guide-toggle-all" data-expanded="false"><span class="material-icons-outlined" style="font-size:16px">unfold_more</span> 전체 펼치기</button>';
    html += '</div>';

    // 원칙 → 지침 → 항목
    html += '<div class="ap-guide-page__principles" id="guide-principles">';
    for (var p = 0; p < data.principles.length; p++) {
      var principle = data.principles[p];
      html += this.renderPrinciple(principle);
    }
    html += '</div>';

    contentEl.innerHTML = html;

    // 목차
    if (tocListEl) {
      tocListEl.innerHTML = this.renderToc(data);
    }

    // 이벤트
    this.bindEvents();
  },

  renderPrinciple: function(principle) {
    var pid = 'principle-' + principle.id;
    var html = '<div class="ap-gp-principle" id="' + pid + '">';
    html += '<h2 class="ap-gp-principle__title">' + principle.id + '. ' + principle.name;
    if (principle.nameEn) html += ' <span class="ap-gp-en">(' + principle.nameEn + ')</span>';
    html += '</h2>';
    if (principle.desc) html += '<p class="ap-gp-principle__desc">' + principle.desc + '</p>';

    for (var g = 0; g < principle.guidelines.length; g++) {
      html += this.renderGuideline(principle.guidelines[g]);
    }
    html += '</div>';
    return html;
  },

  renderGuideline: function(guideline) {
    var gid = 'guideline-' + guideline.id.replace(/\./g, '-');
    var html = '<div class="ap-gp-guideline" id="' + gid + '">';
    html += '<h3 class="ap-gp-guideline__title">' + guideline.id + ' ' + guideline.name;
    if (guideline.nameEn) html += ' <span class="ap-gp-en">(' + guideline.nameEn + ')</span>';
    html += '</h3>';
    if (guideline.desc) html += '<p class="ap-gp-guideline__desc">' + guideline.desc + '</p>';

    for (var c = 0; c < guideline.criteria.length; c++) {
      html += this.renderCriterion(guideline.criteria[c]);
    }
    html += '</div>';
    return html;
  },

  renderCriterion: function(sc) {
    var scid = 'sc-' + sc.id.replace(/\./g, '-');
    var levelCls = sc.level ? ' data-level="' + sc.level + '"' : '';
    var newBadge = sc.isNew ? '<span class="ap-gp-badge--new">2.2 신규</span>' : '';
    var statusBadge = '';
    if (sc.status && sc.status !== 'new' && !sc.isNew) {
      statusBadge = '<span class="ap-gp-badge--status">' + sc.status + '</span>';
    }
    var deprecatedCls = sc.deprecated ? ' ap-gp-criterion--deprecated' : '';

    var html = '<div class="ap-gp-criterion' + deprecatedCls + '" id="' + scid + '"' + levelCls + '>';

    // 헤더 (클릭 가능)
    html += '<button type="button" class="ap-gp-criterion__header" data-toggle="sc" aria-expanded="false">';
    html += '<span class="ap-gp-criterion__id">' + sc.id + '</span>';
    html += '<span class="ap-gp-criterion__name">' + sc.name;
    if (sc.nameEn) html += ' <span class="ap-gp-en">(' + sc.nameEn + ')</span>';
    html += '</span>';
    html += newBadge + statusBadge;
    if (sc.level && sc.level !== '폐기') {
      var lvlCls = 'ap-gp-level--' + sc.level.toLowerCase();
      html += '<span class="ap-gp-level ' + lvlCls + '">' + sc.level + '</span>';
    }
    if (sc.deprecated) html += '<span class="ap-gp-badge--deprecated">폐기</span>';
    html += '<span class="ap-gp-criterion__arrow"></span>';
    html += '</button>';

    // 본문 (접히는 영역)
    html += '<div class="ap-gp-criterion__body" style="display:none">';

    // 설명
    if (sc.desc) html += '<p class="ap-gp-criterion__desc">' + this.escapeAndFormat(sc.desc) + '</p>';

    // 의도
    if (sc.intent) {
      html += '<div class="ap-gp-criterion__intent"><strong>의도:</strong> ' + this.escapeAndFormat(sc.intent) + '</div>';
    }

    // 기대효과 (benefits 배열)
    if (sc.benefits && sc.benefits.length > 0) {
      html += '<div class="ap-gp-criterion__section"><strong>기대효과:</strong><ul>';
      for (var b = 0; b < sc.benefits.length; b++) {
        html += '<li>' + this.escapeAndFormat(sc.benefits[b]) + '</li>';
      }
      html += '</ul></div>';
    }

    // 기대효과 (단일 문자열 — 하위 호환)
    if (sc.benefit && !sc.benefits) {
      html += '<div class="ap-gp-criterion__intent"><strong>기대효과:</strong> ' + this.escapeAndFormat(sc.benefit) + '</div>';
    }

    // 예외
    if (sc.exceptions && sc.exceptions.length > 0) {
      html += '<div class="ap-gp-criterion__section"><strong>예외:</strong><ul>';
      for (var i = 0; i < sc.exceptions.length; i++) {
        html += '<li>' + this.escapeAndFormat(sc.exceptions[i]) + '</li>';
      }
      html += '</ul></div>';
    }

    // 충족 기법 + 실패 사례 (2단)
    var hasTech = sc.techniques && sc.techniques.length > 0;
    var hasFail = sc.failures && sc.failures.length > 0;
    if (hasTech || hasFail) {
      html += '<div class="ap-gp-criterion__two-col">';
      if (hasTech) {
        html += '<div class="ap-gp-criterion__section ap-gp-criterion__techniques"><strong>충족 기법:</strong><ul>';
        for (var t = 0; t < sc.techniques.length; t++) {
          html += '<li>' + this.escapeAndFormat(sc.techniques[t]) + '</li>';
        }
        html += '</ul></div>';
      }
      if (hasFail) {
        html += '<div class="ap-gp-criterion__section ap-gp-criterion__failures"><strong>실패 사례:</strong><ul>';
        for (var f = 0; f < sc.failures.length; f++) {
          html += '<li>' + this.escapeAndFormat(sc.failures[f]) + '</li>';
        }
        html += '</ul></div>';
      }
      html += '</div>';
    }

    // 컴포넌트 적용
    if (sc.components && sc.components.length > 0) {
      html += '<div class="ap-gp-criterion__section"><strong>컴포넌트 적용:</strong><ul>';
      for (var j = 0; j < sc.components.length; j++) {
        html += '<li>' + this.escapeAndFormat(sc.components[j]) + '</li>';
      }
      html += '</ul></div>';
    }

    // KWCAG 매핑
    if (sc.wcagMapping) {
      html += '<div class="ap-gp-criterion__mapping"><strong>WCAG 매핑:</strong> ' + sc.wcagMapping + '</div>';
    }

    // 참고
    if (sc.notes && sc.notes.length > 0) {
      html += '<div class="ap-gp-criterion__section"><strong>참고:</strong><ul>';
      for (var k = 0; k < sc.notes.length; k++) {
        html += '<li>' + this.escapeAndFormat(sc.notes[k]) + '</li>';
      }
      html += '</ul></div>';
    }

    html += '</div>'; // body
    html += '</div>'; // criterion
    return html;
  },

  renderToc: function(data) {
    var html = '';
    html += '<a href="#" class="ap-guide-page__toc-link" data-target="top">개요</a>';
    for (var p = 0; p < data.principles.length; p++) {
      var principle = data.principles[p];
      var pid = 'principle-' + principle.id;
      html += '<a href="#' + pid + '" class="ap-guide-page__toc-link ap-guide-page__toc-link--principle">' + principle.id + '. ' + principle.name + '</a>';
      for (var g = 0; g < principle.guidelines.length; g++) {
        var guideline = principle.guidelines[g];
        var gid = 'guideline-' + guideline.id.replace(/\./g, '-');
        html += '<a href="#' + gid + '" class="ap-guide-page__toc-link ap-guide-page__toc-link--guideline">' + guideline.id + ' ' + guideline.name + '</a>';
      }
    }
    return html;
  },

  showGuideView: function() {
    // 컴포넌트 뷰 숨기기
    var pageHeader = document.querySelector('.ap-page-header');
    var tabs = document.querySelector('.ap-tabs');
    var content = document.querySelector('.ap-content');
    if (pageHeader) pageHeader.style.display = 'none';
    if (tabs) tabs.style.display = 'none';
    if (content) content.style.display = 'none';

    // 카드 그리드 숨기기 (CardGrid.hide() 쓰면 컴포넌트 뷰 복원돼서 직접 처리)
    var grid = document.querySelector('.ap-card-grid');
    if (grid) grid.style.display = 'none';

    // 가이드 뷰 보이기
    var guidePage = document.querySelector('.ap-guide-page');
    if (guidePage) guidePage.style.display = 'block';

    // 스크롤 리셋
    var mainEl = document.querySelector('.ap-main');
    if (mainEl) mainEl.scrollTop = 0;
  },

  showComponentView: function() {
    var pageHeader = document.querySelector('.ap-page-header');
    var tabs = document.querySelector('.ap-tabs');
    var content = document.querySelector('.ap-content');
    if (pageHeader) pageHeader.style.display = '';
    if (tabs) tabs.style.display = '';
    if (content) content.style.display = '';

    var guidePage = document.querySelector('.ap-guide-page');
    if (guidePage) guidePage.style.display = 'none';
  },

  bindEvents: function() {
    var self = this;

    // SC 아코디언 토글
    document.querySelectorAll('.ap-gp-criterion__header[data-toggle="sc"]').forEach(function(header) {
      header.addEventListener('click', function() {
        var criterion = header.parentElement;
        var body = criterion.querySelector('.ap-gp-criterion__body');
        if (body) {
          var isOpen = body.style.display !== 'none';
          body.style.display = isOpen ? 'none' : '';
          criterion.classList.toggle('is-open', !isOpen);
          header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');

          // 열릴 때 상단으로 이동
          if (!isOpen) {
            requestAnimationFrame(function() {
              criterion.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }
        }
      });
    });

    // 전체 펼치기/접기 토글
    var toggleBtn = document.getElementById('guide-toggle-all');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        var isExpanded = toggleBtn.dataset.expanded === 'true';
        var bodies = document.querySelectorAll('.ap-gp-criterion__body');
        var criteria = document.querySelectorAll('.ap-gp-criterion');
        var headers = document.querySelectorAll('.ap-gp-criterion__header');
        if (isExpanded) {
          bodies.forEach(function(b) { b.style.display = 'none'; });
          criteria.forEach(function(c) { c.classList.remove('is-open'); });
          headers.forEach(function(h) { h.setAttribute('aria-expanded', 'false'); });
          toggleBtn.dataset.expanded = 'false';
          toggleBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:16px">unfold_more</span> 전체 펼치기';
        } else {
          bodies.forEach(function(b) { b.style.display = ''; });
          criteria.forEach(function(c) { c.classList.add('is-open'); });
          headers.forEach(function(h) { h.setAttribute('aria-expanded', 'true'); });
          toggleBtn.dataset.expanded = 'true';
          toggleBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:16px">unfold_less</span> 전체 접기';
        }
      });
    }

    // 레벨 필터
    var filterBtns = document.querySelectorAll('.ap-guide-page__filter-btn');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        self.filterByLevel(btn.dataset.level);
      });
    });

    // 목차 + 스크롤 스파이 — ScrollSpy 공용 유틸 사용
    if (this._scrollSpy) this._scrollSpy.destroy();
    this._scrollSpy = ScrollSpy.create({
      tocSelector: '.ap-guide-page__toc-link',
      sectionSelector: '.ap-gp-principle, .ap-gp-guideline',
      topSelector: '.ap-guide-page__toc-link[data-target="top"]'
    });
  },

  filterByLevel: function(level) {
    this.activeLevel = level;
    var criteria = document.querySelectorAll('.ap-gp-criterion');
    criteria.forEach(function(el) {
      if (level === 'all') {
        el.style.display = '';
      } else {
        var scLevel = el.dataset.level;
        el.style.display = (scLevel === level) ? '' : 'none';
      }
    });
  },

  escapeAndFormat: function(text) {
    if (!text) return '';
    // HTML 이스케이프 먼저
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // 코드 포맷팅: `text` → <code>text</code>
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // 볼드: **text** → <strong>text</strong>
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return text;
  },

  escapeAttr: function(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  /* ═══════════════════════════════════════
     Mapping Renderer (WCAG ↔ KWCAG)
     ═══════════════════════════════════════ */

  mappingFilters: { status: 'all', level: 'all' },

  renderMapping: function(data) {
    this.data = data;
    this.mappingFilters = { status: 'all', level: 'all' };
    this.showGuideView();

    var contentEl = document.querySelector('.ap-guide-page__content');
    var tocListEl = document.querySelector('.ap-guide-page__toc-list');
    if (!contentEl) return;

    // 카운트 계산
    var counts = { total: 0, A: 0, AA: 0, AAA: 0 };
    var statusLabels = {};
    for (var st = 0; st < data.statusTypes.length; st++) {
      var key = data.statusTypes[st].key;
      statusLabels[key] = data.statusTypes[st].label;
      counts[key] = 0;
    }
    for (var p = 0; p < data.principles.length; p++) {
      var items = data.principles[p].items;
      for (var i = 0; i < items.length; i++) {
        counts[items[i].status]++;
        counts.total++;
        if (items[i].level === 'A') counts.A++;
        else if (items[i].level === 'AA') counts.AA++;
        else if (items[i].level === 'AAA') counts.AAA++;
      }
    }

    var html = '';

    // 헤더
    html += '<div class="ap-guide-page__header">';
    html += '<h1 class="ap-guide-page__title">' + data.title + '</h1>';
    if (data.source) html += '<a href="' + data.source + '" target="_blank" class="ap-guide-page__source">' + data.source + '</a>';
    if (data.updated) html += '<span class="ap-guide-page__updated">최종 업데이트: ' + data.updated + '</span>';
    html += '</div>';

    // 개요
    if (data.overview) {
      html += '<div class="ap-guide-page__overview">';
      html += '<p>' + data.overview.desc + '</p>';
      if (data.overview.meta) {
        html += '<div class="ap-guide-page__meta">';
        for (var m = 0; m < data.overview.meta.length; m++) {
          var meta = data.overview.meta[m];
          html += '<span><strong>' + meta.label + ':</strong> ' + meta.value + '</span>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    html += '<div class="ap-mapping">';

    // 필터 바 (stats + 상태필터 통합)
    html += '<div class="ap-mapping__filters" role="search" aria-label="필터">';
    html += '<div class="ap-mapping__filter-group" role="group" aria-label="매핑 상태">';
    html += '<span class="ap-mapping__filter-label">상태</span>';
    html += '<button class="ap-guide-page__filter-btn is-active" data-mf="status" data-mv="all" type="button">전체 (' + counts.total + ')</button>';
    for (var s = 0; s < data.statusTypes.length; s++) {
      var st = data.statusTypes[s];
      var count = counts[st.key] || 0;
      html += '<button class="ap-guide-page__filter-btn" data-mf="status" data-mv="' + st.key + '" type="button">';
      html += '<span class="ap-mapping__dot ap-mapping__dot--' + st.key + '" aria-hidden="true"></span>';
      html += st.label + ' (' + count + ')';
      html += '</button>';
    }
    html += '</div>';
    // 레벨 필터 (레벨이 있는 경우만)
    var hasLevels = counts.A > 0 || counts.AA > 0 || counts.AAA > 0;
    this.hasLevels = hasLevels;
    if (hasLevels) {
      html += '<div class="ap-mapping__filter-sep" aria-hidden="true"></div>';
      html += '<div class="ap-mapping__filter-group" role="group" aria-label="적합성 레벨">';
      html += '<span class="ap-mapping__filter-label">레벨</span>';
      html += '<button class="ap-guide-page__filter-btn is-active" data-mf="level" data-mv="all" type="button">전체 (' + counts.total + ')</button>';
      html += '<button class="ap-guide-page__filter-btn" data-mf="level" data-mv="A" type="button">A (' + counts.A + ')</button>';
      html += '<button class="ap-guide-page__filter-btn" data-mf="level" data-mv="AA" type="button">AA (' + counts.AA + ')</button>';
      html += '<button class="ap-guide-page__filter-btn" data-mf="level" data-mv="AAA" type="button">AAA (' + counts.AAA + ')</button>';
      html += '</div>';
    }
    html += '<div class="ap-mapping__filter-sep" aria-hidden="true"></div>';
    html += '<label for="mapping-search" class="ap-mapping__search-label">검색</label>';
    html += '<input type="search" class="ap-mapping__search" id="mapping-search" placeholder="SC 번호 또는 이름 검색…" aria-label="성공 기준 검색">';
    html += '</div>';

    // 결과 카운트
    html += '<div class="ap-mapping__count" aria-live="polite"><strong id="mapping-visible-count">' + counts.total + '</strong>개 항목 표시 중</div>';

    // 원칙별 테이블
    for (var p = 0; p < data.principles.length; p++) {
      html += this.renderMappingPrinciple(data.principles[p], statusLabels);
    }

    // 인사이트
    if (data.insights && data.insights.length > 0) {
      html += '<div class="ap-mapping__insights" id="mapping-insights">';
      html += '<h2 class="ap-gp-guideline__title">핵심 차이점 분석</h2>';
      html += '<div class="ap-mapping__insights-grid">';
      for (var n = 0; n < data.insights.length; n++) {
        html += this.renderMappingInsight(data.insights[n]);
      }
      html += '</div></div>';
    }

    html += '</div>'; // .ap-mapping

    contentEl.innerHTML = html;

    // 목차
    if (tocListEl) {
      var tocHtml = '<a href="#" class="ap-guide-page__toc-link" data-target="top">개요</a>';
      for (var p = 0; p < data.principles.length; p++) {
        var pr = data.principles[p];
        tocHtml += '<a href="#mapping-principle-' + pr.id + '" class="ap-guide-page__toc-link ap-guide-page__toc-link--principle">' + pr.id + '. ' + pr.name + '</a>';
      }
      tocHtml += '<a href="#mapping-insights" class="ap-guide-page__toc-link ap-guide-page__toc-link--principle">핵심 차이점 분석</a>';
      tocListEl.innerHTML = tocHtml;
    }

    this.bindMappingEvents();
  },

  renderMappingPrinciple: function(principle, statusLabels) {
    var data = this.data;
    var html = '<div class="ap-mapping__principle" id="mapping-principle-' + principle.id + '">';
    html += '<div class="ap-mapping__principle-header">';
    html += '<span class="ap-mapping__principle-num">' + principle.id + '</span>';
    html += '<h2 class="ap-mapping__principle-title">' + principle.name;
    if (principle.nameEn) html += '<span class="ap-mapping__principle-en">' + principle.nameEn + '</span>';
    html += '</h2></div>';

    html += '<div class="ap-table-wrap"><table class="ap-table" aria-label="' + principle.name + ' 매핑 테이블">';

    // colgroup
    if (data.colWidths) {
      html += '<colgroup>';
      for (var c = 0; c < data.colWidths.length; c++) {
        var w = data.colWidths[c];
        html += w ? '<col style="width:' + w + '">' : '<col>';
      }
      html += '</colgroup>';
    }

    // thead (기존 renderer.js와 동일한 colspan 패턴)
    var headers = data.colHeaders || ['WCAG 2.2', '', '레벨', 'KWCAG 2.2', '상태', '비고'];
    var aligns = data.colAlign || [];
    html += '<thead><tr>';
    for (var h = 0; h < headers.length; h++) {
      var hCell = headers[h];
      if (typeof hCell === 'object') {
        var hAttrs = '';
        if (hCell.colspan) hAttrs += ' colspan="' + hCell.colspan + '"';
        if (hCell.rowspan) hAttrs += ' rowspan="' + hCell.rowspan + '"';
        html += '<th' + hAttrs + '>' + hCell.text + '</th>';
      } else {
        var thStyle = aligns[h] ? ' style="text-align:' + aligns[h] + '"' : '';
        html += '<th' + thStyle + '>' + hCell + '</th>';
      }
    }
    html += '</tr></thead><tbody>';

    for (var i = 0; i < principle.items.length; i++) {
      html += this.renderMappingRow(principle.items[i], statusLabels);
    }

    html += '</tbody></table></div></div>';
    return html;
  },

  renderMappingRow: function(item, statusLabels) {
    var data = this.data;
    var aligns = data.colAlign || [];
    var searchText = (item.wcag + ' ' + item.wcagName + ' ' + (item.wcagKo || '') + ' ' + item.kwcag + ' ' + item.kwcagName).toLowerCase();

    // WCAG 셀
    var wcagHtml = '';
    if (item.wcag === '—') {
      wcagHtml = '<span style="color:var(--gray-400)">—</span>';
    } else {
      var depCls = item.deprecated ? ' ap-mapping__sc-id--deprecated' : '';
      wcagHtml = '<span class="ap-mapping__sc-id' + depCls + '">' + item.wcag + '</span> ' + item.wcagName;
      if (item.isNew) wcagHtml += '<span class="ap-mapping__ver">' + item.isNew + '</span>';
      if (item.wcagKo) wcagHtml += '<br><span class="ap-mapping__sub">' + item.wcagKo + '</span>';
    }

    // KWCAG 셀
    var kwcagHtml = '';
    if (item.kwcag === '—') {
      kwcagHtml = '<span style="color:var(--gray-400)">—</span>';
    } else {
      kwcagHtml = '<span class="ap-mapping__kwcag-id">' + item.kwcag + '</span> ' + item.kwcagName;
    }

    // 레벨 배지
    var levelHtml = '';
    if (item.level && item.level !== '—') {
      var lvlCls = 'ap-gp-level--' + item.level.toLowerCase();
      levelHtml = '<span class="ap-gp-level ' + lvlCls + '">' + item.level + '</span>';
    }

    // 셀 데이터 배열
    var cells = [
      '<span class="ap-mapping__dot ap-mapping__dot--' + item.status + '" aria-hidden="true"></span>',
      wcagHtml
    ];
    if (this.hasLevels) {
      cells.push(levelHtml);
    }
    cells.push(
      kwcagHtml,
      '<span class="ap-mapping__tag ap-mapping__tag--' + item.status + '">' + (statusLabels[item.status] || item.status) + '</span>',
      '<span class="ap-mapping__note">' + this.escapeAndFormat(item.note || '') + '</span>'
    );

    var html = '<tr data-status="' + item.status + '" data-level="' + item.level + '" data-search="' + searchText + '">';
    for (var i = 0; i < cells.length; i++) {
      var tdStyle = aligns[i] ? ' style="text-align:' + aligns[i] + '"' : '';
      html += '<td' + tdStyle + '>' + cells[i] + '</td>';
    }
    html += '</tr>';
    return html;
  },

  renderMappingInsight: function(insight) {
    var dotHtml = '';
    if (insight.status !== 'note') {
      dotHtml = '<span class="ap-mapping__dot ap-mapping__dot--' + insight.status + '" aria-hidden="true"></span>';
    }
    var html = '<div class="ap-mapping__insight">';
    html += '<h4>' + dotHtml + insight.title + '</h4>';
    html += '<p>' + insight.desc + '</p>';
    if (insight.items && insight.items.length > 0) {
      html += '<ul>';
      for (var i = 0; i < insight.items.length; i++) {
        html += '<li>' + this.escapeAndFormat(insight.items[i]) + '</li>';
      }
      html += '</ul>';
    }
    html += '</div>';
    return html;
  },

  bindMappingEvents: function() {
    var self = this;

    // 필터 버튼
    document.querySelectorAll('.ap-mapping__filters .ap-guide-page__filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var group = btn.dataset.mf;
        var value = btn.dataset.mv;
        self.mappingFilters[group] = value;

        // 같은 그룹 내 active 토글
        btn.closest('.ap-mapping__filter-group').querySelectorAll('.ap-guide-page__filter-btn').forEach(function(b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');
        self.applyMappingFilters();
      });
    });

    // 검색
    var searchInput = document.getElementById('mapping-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        self.applyMappingFilters();
      });
    }

    // 목차 + 스크롤 스파이 — ScrollSpy 공용 유틸 사용
    if (this._scrollSpy) this._scrollSpy.destroy();
    this._scrollSpy = ScrollSpy.create({
      tocSelector: '.ap-guide-page__toc-link',
      sectionSelector: '.ap-mapping__principle, .ap-mapping__insights',
      topSelector: '.ap-guide-page__toc-link[data-target="top"]'
    });
  },

  /* ═══════════════════════════════════════
     FAQ 렌더링
     ═══════════════════════════════════════ */

  renderFaq: function(data) {
    this.data = data;
    this.showGuideView();

    var contentEl = document.querySelector('.ap-guide-page__content');
    var tocListEl = document.querySelector('.ap-guide-page__toc-list');
    if (!contentEl) return;

    var totalCount = 0;
    for (var c = 0; c < data.categories.length; c++) {
      totalCount += data.categories[c].items.length;
    }

    var html = '';

    // 헤더
    html += '<div class="ap-guide-page__header">';
    html += '<h1 class="ap-guide-page__title">' + data.title + '</h1>';
    if (data.updated) html += '<span class="ap-guide-page__updated">최종 업데이트: ' + data.updated + '</span>';
    html += '</div>';

    // 검색
    html += '<div class="ap-faq__search-wrap">';
    html += '<label for="faq-search" class="ap-faq__search-label">검색</label>';
    html += '<input type="search" class="ap-mapping__search" id="faq-search" placeholder="질문 검색…" aria-label="FAQ 검색" style="width:100%;max-width:400px">';
    html += '</div>';

    // 결과 카운트 + 전체 토글
    html += '<div class="ap-faq__toolbar">';
    html += '<div class="ap-mapping__count" aria-live="polite"><strong id="faq-visible-count">' + totalCount + '</strong>개 질문</div>';
    html += '<button type="button" class="ap-guide-page__toolbar-btn" id="faq-toggle-all" data-expanded="false"><span class="material-icons-outlined" style="font-size:16px">unfold_more</span> 전체 펼치기</button>';
    html += '</div>';

    // 카테고리별 아코디언 (기본 접힘)
    for (var c = 0; c < data.categories.length; c++) {
      var cat = data.categories[c];
      html += '<div class="ap-faq__category" id="faq-cat-' + cat.id + '">';
      html += '<h2 class="ap-gp-principle__title">' + cat.name + '</h2>';

      for (var i = 0; i < cat.items.length; i++) {
        var item = cat.items[i];
        var itemId = 'faq-' + cat.id + '-' + i;
        var searchText = (item.q + ' ' + item.a).toLowerCase();

        html += '<div class="ap-gp-criterion" id="' + itemId + '" data-search="' + this.escapeAttr(searchText) + '">';
        html += '<button class="ap-gp-criterion__header" data-toggle="faq" aria-expanded="false" type="button">';
        html += '<span class="ap-gp-criterion__name">' + item.q + '</span>';
        html += '<span class="ap-gp-criterion__toggle material-icons-outlined" aria-hidden="true">expand_more</span>';
        html += '</button>';
        html += '<div class="ap-gp-criterion__body" style="display:none">';
        html += '<div class="ap-faq__answer">' + item.a + '</div>';
        if (item.tags && item.tags.length > 0) {
          html += '<div class="ap-faq__tags">';
          for (var t = 0; t < item.tags.length; t++) {
            var isKwcag = item.tags[t].indexOf('KWCAG') === 0;
            var cls = isKwcag ? 'ap-tag--kwcag' : 'ap-tag--wcag';
            html += '<span class="ap-tag ' + cls + '">' + item.tags[t] + '</span>';
          }
          html += '</div>';
        }
        html += '</div></div>';
      }

      html += '</div>';
    }

    contentEl.innerHTML = html;

    // TOC
    if (tocListEl) {
      var tocHtml = '<a href="#" class="ap-guide-page__toc-link" data-target="top">개요</a>';
      for (var c = 0; c < data.categories.length; c++) {
        var cat = data.categories[c];
        tocHtml += '<a href="#faq-cat-' + cat.id + '" class="ap-guide-page__toc-link ap-guide-page__toc-link--principle">' + cat.name + '</a>';
      }
      tocListEl.innerHTML = tocHtml;
    }

    this.bindFaqEvents(data);

    // 스크롤 리셋
    var mainEl = document.querySelector('.ap-main');
    if (mainEl) mainEl.scrollTop = 0;
  },

  bindFaqEvents: function(data) {
    // 아코디언 토글
    document.querySelectorAll('.ap-gp-criterion__header[data-toggle="faq"]').forEach(function(header) {
      header.addEventListener('click', function() {
        var criterion = header.parentElement;
        var body = criterion.querySelector('.ap-gp-criterion__body');
        if (body) {
          var isOpen = body.style.display !== 'none';
          body.style.display = isOpen ? 'none' : '';
          criterion.classList.toggle('is-open', !isOpen);
          header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');

          if (!isOpen) {
            requestAnimationFrame(function() {
              criterion.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }
        }
      });
    });

    // 전체 펼치기/접기
    var toggleBtn = document.getElementById('faq-toggle-all');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        var isExpanded = toggleBtn.dataset.expanded === 'true';
        var bodies = document.querySelectorAll('.ap-faq__category .ap-gp-criterion__body');
        var criteria = document.querySelectorAll('.ap-faq__category .ap-gp-criterion');
        var headers = document.querySelectorAll('.ap-gp-criterion__header[data-toggle="faq"]');
        if (isExpanded) {
          bodies.forEach(function(b) { b.style.display = 'none'; });
          criteria.forEach(function(c) { c.classList.remove('is-open'); });
          headers.forEach(function(h) { h.setAttribute('aria-expanded', 'false'); });
          toggleBtn.dataset.expanded = 'false';
          toggleBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:16px">unfold_more</span> 전체 펼치기';
        } else {
          bodies.forEach(function(b) { b.style.display = ''; });
          criteria.forEach(function(c) { c.classList.add('is-open'); });
          headers.forEach(function(h) { h.setAttribute('aria-expanded', 'true'); });
          toggleBtn.dataset.expanded = 'true';
          toggleBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:16px">unfold_less</span> 전체 접기';
        }
      });
    }

    // 검색
    var searchInput = document.getElementById('faq-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        var query = searchInput.value.toLowerCase().trim();
        var items = document.querySelectorAll('.ap-faq__category .ap-gp-criterion');
        var visible = 0;

        items.forEach(function(item) {
          var match = !query || item.dataset.search.indexOf(query) !== -1;
          item.style.display = match ? '' : 'none';
          if (match) visible++;
        });

        // 빈 카테고리 숨기기
        document.querySelectorAll('.ap-faq__category').forEach(function(cat) {
          var hasVisible = cat.querySelector('.ap-gp-criterion:not([style*="display: none"])');
          cat.style.display = hasVisible ? '' : 'none';
        });

        var countEl = document.getElementById('faq-visible-count');
        if (countEl) countEl.textContent = visible;
      });
    }

    // ScrollSpy
    if (this._scrollSpy) this._scrollSpy.destroy();
    this._scrollSpy = ScrollSpy.create({
      tocSelector: '.ap-guide-page__toc-link',
      sectionSelector: '.ap-faq__category',
      topSelector: '.ap-guide-page__toc-link[data-target="top"]'
    });
  },

  /* ═══════════════════════════════════════
     체크리스트 가이드 렌더링 (Do/Don't)
     ═══════════════════════════════════════ */

  renderChecklistGuide: function(data) {
    this.data = data;
    this.showGuideView();

    var contentEl = document.querySelector('.ap-guide-page__content');
    var tocListEl = document.querySelector('.ap-guide-page__toc-list');
    if (!contentEl) return;

    var html = '';

    // 헤더
    html += '<div class="ap-guide-page__header">';
    html += '<h1 class="ap-guide-page__title">' + data.title + '</h1>';
    if (data.updated) html += '<span class="ap-guide-page__updated">최종 업데이트: ' + data.updated + '</span>';
    html += '</div>';

    // 개요
    if (data.overview) {
      html += '<div class="ap-guide-page__overview"><p>' + data.overview + '</p></div>';
    }

    // 항목
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      html += '<div class="ap-cl-item" id="cl-' + item.id + '">';
      html += '<h2 class="ap-cl-item__title">' + item.title + '</h2>';
      html += '<p class="ap-cl-item__desc">' + item.desc + '</p>';

      html += '<div class="ap-cl-dodont">';

      // Do
      html += '<div class="ap-cl-dodont__col ap-cl-dodont__col--do">';
      html += '<div class="ap-cl-dodont__header ap-cl-dodont__header--do"><span class="material-icons-outlined" style="font-size:18px">check_circle</span> Do</div>';
      html += '<ul class="ap-cl-dodont__list">';
      for (var d = 0; d < item.do.length; d++) {
        html += '<li>' + item.do[d] + '</li>';
      }
      html += '</ul></div>';

      // Don't
      html += '<div class="ap-cl-dodont__col ap-cl-dodont__col--dont">';
      html += '<div class="ap-cl-dodont__header ap-cl-dodont__header--dont"><span class="material-icons-outlined" style="font-size:18px">cancel</span> Don\'t</div>';
      html += '<ul class="ap-cl-dodont__list">';
      for (var n = 0; n < item.dont.length; n++) {
        html += '<li>' + item.dont[n] + '</li>';
      }
      html += '</ul></div>';

      html += '</div>';

      // 태그
      if (item.tags && item.tags.length > 0) {
        html += '<div class="ap-cl-item__tags">';
        for (var t = 0; t < item.tags.length; t++) {
          var isKwcag = item.tags[t].indexOf('KWCAG') === 0;
          var cls = isKwcag ? 'ap-tag--kwcag' : 'ap-tag--wcag';
          html += '<span class="ap-tag ' + cls + '">' + item.tags[t] + '</span>';
        }
        html += '</div>';
      }

      html += '</div>';
    }

    contentEl.innerHTML = html;

    // TOC
    if (tocListEl) {
      var tocHtml = '<a href="#" class="ap-guide-page__toc-link" data-target="top">개요</a>';
      for (var i = 0; i < data.items.length; i++) {
        tocHtml += '<a href="#cl-' + data.items[i].id + '" class="ap-guide-page__toc-link">' + data.items[i].title + '</a>';
      }
      tocListEl.innerHTML = tocHtml;
    }

    // ScrollSpy
    if (this._scrollSpy) this._scrollSpy.destroy();
    this._scrollSpy = ScrollSpy.create({
      tocSelector: '.ap-guide-page__toc-link',
      sectionSelector: '.ap-cl-item',
      topSelector: '.ap-guide-page__toc-link[data-target="top"]'
    });

    // 스크롤 리셋
    var mainEl = document.querySelector('.ap-main');
    if (mainEl) mainEl.scrollTop = 0;
  },

  applyMappingFilters: function() {
    var search = '';
    var searchInput = document.getElementById('mapping-search');
    if (searchInput) search = searchInput.value.toLowerCase().trim();

    var rows = document.querySelectorAll('.ap-mapping .ap-table tbody tr');
    var visible = 0;

    var self = this;
    rows.forEach(function(row) {
      var matchStatus = self.mappingFilters.status === 'all' || row.dataset.status === self.mappingFilters.status;
      var matchLevel = self.mappingFilters.level === 'all' || row.dataset.level === self.mappingFilters.level || row.dataset.level === '—';
      var matchSearch = !search || (row.dataset.search && row.dataset.search.indexOf(search) !== -1);

      if (matchStatus && matchLevel && matchSearch) {
        row.classList.remove('is-hidden');
        visible++;
      } else {
        row.classList.add('is-hidden');
      }
    });

    var countEl = document.getElementById('mapping-visible-count');
    if (countEl) countEl.textContent = visible;
  }
};
