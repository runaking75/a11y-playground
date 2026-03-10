/* ═══════════════════════════════════════
   A11y Playground — Router
   해시 라우팅 + JSON 로드
   ═══════════════════════════════════════ */

const Router = {
  currentPage: null,

  init() {
    // 사이드바 이벤트 위임 (동적 생성 항목 대응)
    var sidebar = document.querySelector('.ap-sidebar');
    var self = this;
    if (sidebar) {
      sidebar.addEventListener('click', function(e) {
        var item = e.target.closest('.ap-sidebar__item[data-page]');
        if (!item) return;
        e.preventDefault();
        e.stopPropagation();
        var pageId = item.dataset.page;
        var pageType = item.dataset.type;
        // 해시 업데이트 (hashchange 이벤트는 무시)
        history.replaceState(null, '', '#' + pageId);
        // 직접 네비게이션
        self.setActiveSidebar(item);
        self.currentPage = null;
        self.navigate(pageId, pageType);
      });
    }

    // 해시 직접 입력/뒤로가기 대응
    window.addEventListener('hashchange', () => this.handleHash());

    // 초기 로드
    if (window.location.hash) {
      this.handleHash();
    } else {
      this.currentPage = null;
      if (typeof CardGrid !== 'undefined') {
        CardGrid.render();
      }
    }
  },

  handleHash() {
    const hash = window.location.hash.slice(1); // # 제거
    if (!hash || hash === this.currentPage) return;

    // 사이드바에서 해당 항목 찾기
    const item = document.querySelector(`.ap-sidebar__item[data-page="${hash}"]`);
    if (!item) return;

    const pageType = item.dataset.type;
    this.setActiveSidebar(item);
    this.navigate(hash, pageType);
  },

  setActiveSidebar(activeItem) {
    document.querySelectorAll('.ap-sidebar__item').forEach(i => {
      i.classList.remove('is-active');
    });
    activeItem.classList.add('is-active');
  },

  async navigate(pageId, pageType) {
    this.currentPage = pageId;

    try {
      switch (pageType) {
        case 'component':
          await this.loadComponent(pageId);
          break;
        case 'guide':
          await this.loadGuide(pageId);
          break;
        case 'tool':
          this.loadTool(pageId);
          break;
        case 'audit':
          this.loadAudit(pageId);
          break;
      }
    } catch (err) {
      console.error('Page load error:', err);
    }
  },

  async loadComponent(id) {
    // 가이드 뷰 → 컴포넌트 뷰 전환
    if (typeof GuideRenderer !== 'undefined') GuideRenderer.showComponentView();
    if (typeof CardGrid !== 'undefined') CardGrid.hide();

    const res = await fetch(`data/components/${id}.json`);
    if (!res.ok) {
      this.showPlanned(id);
      return;
    }
    const data = await res.json();
    Renderer.renderComponent(data);
  },

  showPlanned: function(id) {
    if (typeof GuideRenderer !== 'undefined') GuideRenderer.showComponentView();
    if (typeof CardGrid !== 'undefined') CardGrid.hide();

    var mainEl = document.querySelector('.ap-main');
    if (mainEl) mainEl.scrollTop = 0;

    var pageHeader = document.querySelector('.ap-page-header');
    if (pageHeader) {
      pageHeader.innerHTML =
        '<div class="ap-breadcrumb"><a href="#">컴포넌트</a> &nbsp;›&nbsp; ' + id + '</div>' +
        '<h1 class="ap-page-title">' + id + '</h1>' +
        '<p class="ap-page-desc">이 컴포넌트는 준비 중입니다.</p>' +
        '<div class="ap-page-tags"></div>';
    }
    var canvas = document.querySelector('.ap-preview__canvas');
    if (canvas) {
      var modeToggle = canvas.querySelector('.ap-preview__mode');
      var modeHtml = modeToggle ? modeToggle.outerHTML : '';
      canvas.innerHTML = modeHtml +
        '<div style="text-align:center;color:#9E9E9E;padding:80px 0;">' +
          '<span class="material-icons-outlined" style="font-size:48px;display:block;margin-bottom:16px">construction</span>' +
          '준비 중인 컴포넌트입니다.' +
        '</div>';
    }
    var control = document.querySelector('.ap-control');
    if (control) control.innerHTML = '';

    // 탭 초기화
    var tabBtns = document.querySelectorAll('.ap-tabs__btn');
    tabBtns.forEach(function(b) { b.classList.remove('is-active'); });
    if (tabBtns[0]) tabBtns[0].classList.add('is-active');

    var playground = document.querySelector('[data-content="playground"]');
    var guide = document.querySelector('[data-content="guide"]');
    var code = document.querySelector('[data-content="code"]');
    if (playground) playground.classList.add('is-active');
    if (guide) guide.classList.remove('is-active');
    if (code) code.classList.remove('is-active');
  },

  async loadGuide(id) {
    // 카드 그리드만 숨기기 (CardGrid.hide()는 컴포넌트 뷰를 복원하므로 직접 처리)
    var grid = document.querySelector('.ap-card-grid');
    if (grid) grid.style.display = 'none';

    const res = await fetch(`data/guides/${id}.json`);
    if (!res.ok) {
      // JSON 없는 가이드 → 준비 중 표시
      this.showPlannedGuide(id);
      return;
    }
    const data = await res.json();
    GuideRenderer.render(data);
  },

  showPlannedGuide: function(id) {
    var pageHeader = document.querySelector('.ap-page-header');
    var tabs = document.querySelector('.ap-tabs');
    var content = document.querySelector('.ap-content');
    if (pageHeader) pageHeader.style.display = 'none';
    if (tabs) tabs.style.display = 'none';
    if (content) content.style.display = 'none';

    var guidePage = document.querySelector('.ap-guide-page');
    if (guidePage) {
      guidePage.style.display = 'block';
      var contentEl = guidePage.querySelector('.ap-guide-page__content');
      var tocEl = guidePage.querySelector('.ap-guide-page__toc-list');
      if (contentEl) {
        contentEl.innerHTML =
          '<div class="ap-guide-page__header">' +
            '<h1 class="ap-guide-page__title">' + id + '</h1>' +
          '</div>' +
          '<div style="text-align:center;color:#9E9E9E;padding:80px 0;">' +
            '<span class="material-icons-outlined" style="font-size:48px;display:block;margin-bottom:16px">construction</span>' +
            '준비 중인 가이드입니다.' +
          '</div>';
      }
      if (tocEl) tocEl.innerHTML = '';
    }

    var mainEl = document.querySelector('.ap-main');
    if (mainEl) mainEl.scrollTop = 0;
  },

  loadTool(id) {
    console.log('Load tool:', id);
    // 추후 구현
  },

  loadAudit(id) {
    console.log('Load audit:', id);
    // 추후 구현
  }
};
