/* ═══════════════════════════════════════
   A11y Playground — Guide Renderer
   가이드 JSON → 페이지 렌더링
   ═══════════════════════════════════════ */

var GuideRenderer = {
  data: null,
  activeLevel: 'all',

  render: function(data) {
    this.data = data;
    this.activeLevel = 'all';

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
      html += '</div></div>';
    }

    // 레벨 필터 (WCAG만)
    if (data.id === 'wcag22') {
      html += '<div class="ap-guide-page__filter" id="guide-filter">';
      html += '<button class="ap-guide-page__filter-btn is-active" data-level="all">전체 (87)</button>';
      html += '<button class="ap-guide-page__filter-btn" data-level="A">A (32)</button>';
      html += '<button class="ap-guide-page__filter-btn" data-level="AA">AA (24)</button>';
      html += '<button class="ap-guide-page__filter-btn" data-level="AAA">AAA (31)</button>';
      html += '</div>';
    }

    // 전체 펼치기/접기 툴바
    html += '<div class="ap-guide-page__toolbar">';
    html += '<button class="ap-guide-page__toolbar-btn" data-action="expand-all"><span class="material-icons-outlined" style="font-size:16px">unfold_more</span> 전체 펼치기</button>';
    html += '<button class="ap-guide-page__toolbar-btn" data-action="collapse-all"><span class="material-icons-outlined" style="font-size:16px">unfold_less</span> 전체 접기</button>';
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
    html += '<div class="ap-gp-criterion__header" data-toggle="sc">';
    html += '<span class="ap-gp-criterion__id">' + sc.id + '</span>';
    html += '<span class="ap-gp-criterion__name">' + sc.name;
    if (sc.nameEn) html += ' <span class="ap-gp-en">(' + sc.nameEn + ')</span>';
    html += '</span>';
    if (sc.level && sc.level !== '폐기') {
      var lvlCls = 'ap-gp-level--' + sc.level.toLowerCase();
      html += '<span class="ap-gp-level ' + lvlCls + '">' + sc.level + '</span>';
    }
    if (sc.deprecated) html += '<span class="ap-gp-badge--deprecated">폐기</span>';
    html += newBadge + statusBadge;
    html += '<span class="ap-gp-criterion__arrow"></span>';
    html += '</div>';

    // 본문 (접히는 영역)
    html += '<div class="ap-gp-criterion__body" style="display:none">';

    // 설명
    if (sc.desc) html += '<p class="ap-gp-criterion__desc">' + this.escapeAndFormat(sc.desc) + '</p>';

    // WCAG 매핑
    if (sc.wcagMapping) {
      html += '<div class="ap-gp-criterion__mapping">WCAG: ' + sc.wcagMapping + '</div>';
    }

    // 예외
    if (sc.exceptions && sc.exceptions.length > 0) {
      html += '<div class="ap-gp-criterion__section"><strong>예외:</strong><ul>';
      for (var i = 0; i < sc.exceptions.length; i++) {
        html += '<li>' + this.escapeAndFormat(sc.exceptions[i]) + '</li>';
      }
      html += '</ul></div>';
    }

    // 컴포넌트 적용
    if (sc.components && sc.components.length > 0) {
      html += '<div class="ap-gp-criterion__section"><strong>컴포넌트 적용:</strong><ul>';
      for (var j = 0; j < sc.components.length; j++) {
        html += '<li>' + this.escapeAndFormat(sc.components[j]) + '</li>';
      }
      html += '</ul></div>';
    }

    // 기대효과
    if (sc.benefit) {
      html += '<div class="ap-gp-criterion__benefit">기대효과: ' + sc.benefit + '</div>';
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
        }
      });
    });

    // 전체 펼치기/접기
    document.querySelectorAll('.ap-guide-page__toolbar-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = btn.dataset.action;
        var bodies = document.querySelectorAll('.ap-gp-criterion__body');
        var criteria = document.querySelectorAll('.ap-gp-criterion');
        if (action === 'expand-all') {
          bodies.forEach(function(b) { b.style.display = ''; });
          criteria.forEach(function(c) { c.classList.add('is-open'); });
        } else {
          bodies.forEach(function(b) { b.style.display = 'none'; });
          criteria.forEach(function(c) { c.classList.remove('is-open'); });
        }
      });
    });

    // 레벨 필터
    var filterBtns = document.querySelectorAll('.ap-guide-page__filter-btn');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        self.filterByLevel(btn.dataset.level);
      });
    });

    // 목차 클릭
    document.querySelectorAll('.ap-guide-page__toc-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = link.dataset.target;
        if (target === 'top') {
          var mainEl = document.querySelector('.ap-main');
          if (mainEl) mainEl.scrollTop = 0;
        } else {
          var href = link.getAttribute('href');
          if (href && href !== '#') {
            var el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        // 활성화
        document.querySelectorAll('.ap-guide-page__toc-link').forEach(function(l) { l.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    });

    // 스크롤 스파이
    var mainEl = document.querySelector('.ap-main');
    if (mainEl) {
      mainEl.addEventListener('scroll', function() {
        var tocLinks = document.querySelectorAll('.ap-guide-page__toc-link');
        var sections = document.querySelectorAll('.ap-gp-principle, .ap-gp-guideline');
        if (sections.length === 0 || tocLinks.length === 0) return;

        var currentId = '';
        for (var i = sections.length - 1; i >= 0; i--) {
          var rect = sections[i].getBoundingClientRect();
          if (rect.top <= 120) {
            currentId = sections[i].id;
            break;
          }
        }

        if (currentId) {
          tocLinks.forEach(function(link) {
            link.classList.remove('is-active');
            if (link.getAttribute('href') === '#' + currentId) {
              link.classList.add('is-active');
            }
          });
        }
      });
    }
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
  }
};
