/* ═══════════════════════════════════════
   A11y Playground — Sidebar
   sidebar.json 기반 동적 사이드바 생성
   헤더 네비게이션 연동
   ═══════════════════════════════════════ */

var Sidebar = {
  data: null,
  el: null,
  activeSection: 1,

  init: function() {
    this.el = document.querySelector('.ap-sidebar');
    this.load();
  },

  load: function() {
    var self = this;
    fetch('data/sidebar.json')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        self.data = data;
        self.renderHeaderNav();
        self.render();
        // 검색 데이터 갱신
        if (typeof Search !== 'undefined') Search.loadSearchData();
        // 라우터 초기화
        Router.init();
      })
      .catch(function(err) {
        console.warn('sidebar.json not found', err);
        Router.init();
      });
  },

  /* ── 헤더 네비게이션 렌더 ── */
  renderHeaderNav: function() {
    var navEl = document.getElementById('header-nav');
    if (!navEl || !this.data) return;

    var self = this;
    var html = '';
    var sections = this.data.sections;

    var enabledSections = ['레퍼런스', '컴포넌트'];

    for (var s = 0; s < sections.length; s++) {
      if (enabledSections.indexOf(sections[s].label) === -1) continue;
      var activeCls = s === this.activeSection ? ' is-active' : '';
      html += '<button type="button" class="ap-header__nav-btn' + activeCls + '" data-section="' + s + '">' + sections[s].label + '</button>';
    }
    navEl.innerHTML = html;

    // 클릭 이벤트
    navEl.querySelectorAll('.ap-header__nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.dataset.section);
        self.switchSection(idx);

        // 섹션 전환 시 기본 뷰
        var section = self.data.sections[idx];
        if (section.label === '컴포넌트') {
          history.pushState(null, '', window.location.pathname);
          if (typeof Router !== 'undefined') Router.currentPage = null;
          if (typeof CardGrid !== 'undefined') CardGrid.render();
          document.querySelectorAll('.ap-sidebar__item').forEach(function(item) {
            item.classList.remove('is-active');
          });
        } else {
          // 첫 번째 항목 자동 로드
          var firstItem = self.el.querySelector('.ap-sidebar__section[data-section-idx="' + idx + '"] .ap-sidebar__item[data-page]');
          if (firstItem) firstItem.click();
        }
      });
    });
  },

  switchSection: function(idx) {
    this.activeSection = idx;

    // 헤더 버튼 활성화
    var navBtns = document.querySelectorAll('.ap-header__nav-btn');
    navBtns.forEach(function(b) { b.classList.remove('is-active'); });
    if (navBtns[idx]) navBtns[idx].classList.add('is-active');

    // 사이드바 섹션 표시/숨김
    var sectionEls = this.el.querySelectorAll('.ap-sidebar__section');
    sectionEls.forEach(function(el, i) {
      el.style.display = i === idx ? '' : 'none';
    });
  },

  /* 페이지 ID로 해당 섹션 인덱스 찾기 */
  findSectionByPage: function(pageId) {
    if (!this.data) return 0;
    var sections = this.data.sections;
    for (var s = 0; s < sections.length; s++) {
      var items = sections[s].items;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === pageId) return s;
        if (items[i].children) {
          for (var c = 0; c < items[i].children.length; c++) {
            if (items[i].children[c].id === pageId) return s;
          }
        }
      }
    }
    return 0;
  },

  /* ── 사이드바 렌더 ── */
  render: function() {
    if (!this.el || !this.data) return;

    var html = '';
    var sections = this.data.sections;

    for (var s = 0; s < sections.length; s++) {
      var section = sections[s];
      var display = s === this.activeSection ? '' : 'none';

      html += '<div class="ap-sidebar__section" data-section-idx="' + s + '" style="display:' + display + '">';
      html += '<div class="ap-sidebar__label">' + section.label + '</div>';

      for (var i = 0; i < section.items.length; i++) {
        var item = section.items[i];
        if (item.type === 'group' && item.children) {
          html += this.renderGroup(item);
        } else {
          html += this.renderItem(item);
        }
      }

      html += '</div>';
    }

    this.el.innerHTML = html;

    // 그룹 토글 (WCAG 2.2 등)
    this.el.querySelectorAll('.ap-sidebar__group-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var group = header.parentElement;
        var isOpen = group.classList.toggle('is-open');
        header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  },

  renderGroup: function(group) {
    var html = '<div class="ap-sidebar__group is-open">';
    html += '<button type="button" class="ap-sidebar__group-header" data-group="' + group.id + '" aria-expanded="true">';
    if (group.icon) {
      var isEmoji = /[^\x00-\x7F]/.test(group.icon);
      var isMaterial = !isEmoji && group.icon.indexOf(' ') === -1 && group.icon === group.icon.toLowerCase();
      if (isEmoji) {
        html += '<span class="ap-sidebar__icon" style="font-size:16px">' + group.icon + '</span>';
      } else if (isMaterial) {
        html += '<span class="ap-sidebar__icon material-icons-outlined">' + group.icon + '</span>';
      } else {
        html += '<span class="ap-sidebar__icon ap-sidebar__icon--text">' + group.icon + '</span>';
      }
    }
    html += '<span>' + group.name + '</span>';
    html += '<span class="ap-sidebar__group-arrow material-icons-outlined" style="font-size:16px;margin-left:auto">expand_more</span>';
    html += '</button>';
    html += '<div class="ap-sidebar__group-children">';
    for (var i = 0; i < group.children.length; i++) {
      html += this.renderItem(group.children[i]);
    }
    html += '</div></div>';
    return html;
  },

  renderItem: function(item) {
    var disabledCls = item.disabled ? ' ap-sidebar__item--disabled' : '';
    var html;
    if (item.disabled) {
      html = '<span class="ap-sidebar__item' + disabledCls + '">';
    } else {
      html = '<a href="#' + item.id + '" class="ap-sidebar__item" data-page="' + item.id + '" data-type="' + item.type + '">';
    }

    // 아이콘 (가이드)
    if (item.icon) {
      var isEmoji = /[^\x00-\x7F]/.test(item.icon);
      var isMaterial = !isEmoji && item.icon.indexOf(' ') === -1 && item.icon === item.icon.toLowerCase();
      if (isEmoji) {
        html += '<span class="ap-sidebar__icon" style="font-size:16px">' + item.icon + '</span>';
      } else if (isMaterial) {
        html += '<span class="ap-sidebar__icon material-icons-outlined">' + item.icon + '</span>';
      } else {
        html += '<span class="ap-sidebar__icon ap-sidebar__icon--text">' + item.icon + '</span>';
      }
    }

    html += '<span>' + item.name + '</span>';

    // 상태 뱃지 (컴포넌트)
    if (item.status) {
      var statusMap = {
        pass: { cls: 'ap-status--pass', icon: 'check_circle' },
        partial: { cls: 'ap-status--partial', icon: 'warning' },
        fail: { cls: 'ap-status--fail', icon: 'cancel' },
        planned: { cls: 'ap-status--planned', icon: 'schedule' }
      };
      var status = statusMap[item.status];
      if (status) {
        html += '<span class="ap-sidebar__status ' + status.cls + ' material-icons-outlined" style="font-size:14px">' + status.icon + '</span>';
      }
    }

    html += item.disabled ? '</span>' : '</a>';
    return html;
  }
};
