/* ═══════════════════════════════════════
   A11y Playground — Sidebar
   sidebar.json 기반 동적 사이드바 생성
   ═══════════════════════════════════════ */

var Sidebar = {
  data: null,
  el: null,

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
        self.render();
        // 검색 데이터 갱신
        if (typeof Search !== 'undefined') Search.loadSearchData();
        // 라우터 초기화
        Router.init();
      })
      .catch(function(err) {
        console.warn('sidebar.json not found', err);
        // fallback: 기존 정적 사이드바 사용
        Router.init();
      });
  },

  render: function() {
    if (!this.el || !this.data) return;

    var html = '';
    var sections = this.data.sections;

    for (var s = 0; s < sections.length; s++) {
      var section = sections[s];

      if (s > 0) html += '<div class="ap-sidebar__divider"></div>';

      html += '<div class="ap-sidebar__section">';
      if (section.label === '컴포넌트') {
        html += '<div class="ap-sidebar__label ap-sidebar__label--link" data-show-grid="true">' + section.label + '</div>';
      } else {
        html += '<div class="ap-sidebar__label">' + section.label + '</div>';
      }

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

    // 컴포넌트 라벨 클릭 → 카드 그리드
    var gridLabel = this.el.querySelector('[data-show-grid]');
    if (gridLabel) {
      gridLabel.addEventListener('click', function() {
        if (typeof CardGrid !== 'undefined') {
          // 해시 제거 + 라우터 리셋
          history.pushState(null, '', window.location.pathname);
          if (typeof Router !== 'undefined') Router.currentPage = null;
          CardGrid.render();
          // 사이드바 활성화 해제
          document.querySelectorAll('.ap-sidebar__item').forEach(function(item) {
            item.classList.remove('is-active');
          });
        }
      });
    }
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
