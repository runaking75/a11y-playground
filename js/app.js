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

  // 가이드 앵커 목차
  var spyPaused = false;

  // 스무스 스크롤 + 즉시 활성화 + 스파이 일시 정지
  document.querySelectorAll('.ap-guide__toc-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        // 즉시 활성화
        document.querySelectorAll('.ap-guide__toc-link').forEach(function(l) { l.classList.remove('is-active'); });
        link.classList.add('is-active');
        // 스파이 일시 정지
        spyPaused = true;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function() { spyPaused = false; }, 800);
      }
    });
  });

  // 스크롤 스파이
  var mainEl = document.querySelector('.ap-main');
  if (mainEl) {
    mainEl.addEventListener('scroll', function() {
      if (spyPaused) return;

      var tocLinks = document.querySelectorAll('.ap-guide__toc-link');
      var sections = document.querySelectorAll('.ap-guide__content .ap-section[id]');
      if (sections.length === 0 || tocLinks.length === 0) return;

      var currentId = sections[0].id;
      var isBottom = mainEl.scrollTop + mainEl.clientHeight >= mainEl.scrollHeight - 10;

      if (isBottom) {
        currentId = sections[sections.length - 1].id;
      } else {
        for (var i = sections.length - 1; i >= 0; i--) {
          var rect = sections[i].getBoundingClientRect();
          if (rect.top <= 120) {
            currentId = sections[i].id;
            break;
          }
        }
      }

      tocLinks.forEach(function(link) {
        link.classList.remove('is-active');
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('is-active');
        }
      });
    });
  }

  // 로고 클릭 → 카드 그리드
  var logoLink = document.getElementById('logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function(e) {
      e.preventDefault();
      history.replaceState(null, '', window.location.pathname);
      if (typeof Router !== 'undefined') Router.currentPage = null;
      if (typeof CardGrid !== 'undefined') CardGrid.render();
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
