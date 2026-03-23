/* ═══════════════════════════════════════
   A11y Playground — ScrollSpy
   TOC 스크롤 스파이 공용 유틸
   ═══════════════════════════════════════ */

var ScrollSpy = {
  /**
   * 스크롤 스파이 인스턴스 생성
   * @param {Object} config
   *   tocSelector     — TOC 링크 셀렉터
   *   sectionSelector — 감시할 섹션 셀렉터
   *   topSelector     — 최상단 기본 링크 셀렉터 (없으면 첫 번째 보이는 링크)
   * @returns {{ update, destroy }}
   */
  create: function(config) {
    var mainEl = document.querySelector('.ap-main');
    if (!mainEl) return null;

    var paused = false;

    var update = function() {
      if (paused) return;
      var tocLinks = document.querySelectorAll(config.tocSelector);
      var sections = document.querySelectorAll(config.sectionSelector);
      if (sections.length === 0 || tocLinks.length === 0) return;

      // 섹션이 숨겨져 있으면 (탭 비활성 등) 스킵
      if (!sections[0].offsetParent) return;

      var currentId = '';
      var atBottom = mainEl.scrollTop > 0 &&
                     mainEl.scrollTop + mainEl.clientHeight >= mainEl.scrollHeight - 10;

      if (atBottom) {
        currentId = sections[sections.length - 1].id;
      } else {
        for (var i = sections.length - 1; i >= 0; i--) {
          if (sections[i].getBoundingClientRect().top <= 120) {
            currentId = sections[i].id;
            break;
          }
        }
      }

      tocLinks.forEach(function(l) { l.classList.remove('is-active'); });
      if (currentId) {
        tocLinks.forEach(function(l) {
          if (l.getAttribute('href') === '#' + currentId) l.classList.add('is-active');
        });
      } else if (config.topSelector) {
        var topLink = document.querySelector(config.topSelector);
        if (topLink) topLink.classList.add('is-active');
      } else {
        // 기본: 첫 번째 보이는 링크
        for (var t = 0; t < tocLinks.length; t++) {
          if (tocLinks[t].style.display !== 'none') {
            tocLinks[t].classList.add('is-active');
            break;
          }
        }
      }
    };

    // 스크롤 이벤트
    var scrollHandler = function() { update(); };
    mainEl.addEventListener('scroll', scrollHandler);

    // TOC 클릭 이벤트
    document.querySelectorAll(config.tocSelector).forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = link.dataset.target;
        if (target === 'top') {
          mainEl.scrollTop = 0;
        } else {
          var href = link.getAttribute('href');
          if (href && href !== '#') {
            var el = document.querySelector(href);
            if (el) {
              paused = true;
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setTimeout(function() { paused = false; }, 800);
            }
          }
        }
        document.querySelectorAll(config.tocSelector).forEach(function(l) { l.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    });

    // 초기 1회 실행
    requestAnimationFrame(update);

    return {
      update: update,
      destroy: function() {
        mainEl.removeEventListener('scroll', scrollHandler);
      }
    };
  }
};


/* ═══════════════════════════════════════
   A11y Playground — App
   초기화 + 기본 인터랙션
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

  // Tab 전환
  var tabBtns = document.querySelectorAll('.ap-tabs__btn');
  var tabMap = {
    playground: document.querySelector('[data-content="playground"]'),
    guide: document.querySelector('[data-content="guide"]'),
    code: document.querySelector('[data-content="code"]')
  };

  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabBtns.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      Object.values(tabMap).forEach(function(c) {
        if (c) c.classList.remove('is-active');
      });
      var target = tabMap[btn.dataset.tab];
      if (target) target.classList.add('is-active');
    });
  });

  // Code 복사
  var copyBtn = document.querySelector('.ap-code-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      var code = document.querySelector('.ap-code-block pre').textContent;
      navigator.clipboard.writeText(code).then(function() {
        copyBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:14px">check</span> 복사됨';
        setTimeout(function() {
          copyBtn.innerHTML = '<span class="material-icons-outlined" style="font-size:14px">content_copy</span> 복사';
        }, 2000);
      });
    });
  }

  // 컴포넌트 가이드 탭 TOC — ScrollSpy 사용
  ScrollSpy.create({
    tocSelector: '.ap-guide__toc-link',
    sectionSelector: '.ap-guide__content .ap-section[id]'
  });

  // 로고 클릭 → 카드 그리드
  var logoLink = document.getElementById('logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function(e) {
      e.preventDefault();
      history.replaceState(null, '', window.location.pathname);
      if (typeof Router !== 'undefined') Router.currentPage = null;
      if (typeof CardGrid !== 'undefined') CardGrid.render();
      if (typeof Sidebar !== 'undefined') Sidebar.switchSection(1);
      document.querySelectorAll('.ap-sidebar__item').forEach(function(item) {
        item.classList.remove('is-active');
      });
      // 모바일 사이드바 닫기
      document.querySelector('.ap-sidebar').classList.remove('is-open');
    });
  }

  // 햄버거 메뉴
  var hamburgerBtn = document.getElementById('hamburger-btn');
  var sidebar = document.querySelector('.ap-sidebar');
  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', function() {
      sidebar.classList.toggle('is-open');
    });
    // 사이드바 항목 클릭 시 모바일에서 닫기
    sidebar.addEventListener('click', function(e) {
      if (e.target.closest('.ap-sidebar__item')) {
        sidebar.classList.remove('is-open');
      }
    });
  }

  // 엔진 초기화
  Controls.init();
  AriaViewer.init();
  Speech.init();
  Editable.init();
  ShadowDom.init();
  ElementManager.init();
  Search.init();
  Sidebar.init(); // → sidebar.json 로드 → Router.init() 자동 호출

});
