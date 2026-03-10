/* ═══════════════════════════════════════
   A11y Playground — Search
   검색 기능 (Ctrl+K)
   ═══════════════════════════════════════ */

const Search = {
  modalEl: null,
  inputEl: null,
  resultsEl: null,
  data: [],

  init() {
    this.createModal();
    this.bindShortcut();
    this.loadSearchData();
  },

  /* ── 검색 모달 생성 ── */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'ap-search-modal';
    modal.innerHTML = `
      <div class="ap-search-backdrop"></div>
      <div class="ap-search-dialog" role="dialog" aria-label="검색">
        <div class="ap-search-input-wrap">
          <span class="material-icons-outlined" style="font-size:20px;color:var(--gray-400)">search</span>
          <input type="text" class="ap-search-input" placeholder="컴포넌트, WCAG 기준 검색..." autofocus>
          <kbd>ESC</kbd>
        </div>
        <div class="ap-search-results"></div>
      </div>
    `;
    document.body.appendChild(modal);

    this.modalEl = modal;
    this.inputEl = modal.querySelector('.ap-search-input');
    this.resultsEl = modal.querySelector('.ap-search-results');

    // 배경 클릭으로 닫기
    modal.querySelector('.ap-search-backdrop').addEventListener('click', () => this.close());

    // 입력 이벤트
    this.inputEl.addEventListener('input', () => this.search(this.inputEl.value));

    // ESC로 닫기
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
      if (e.key === 'Enter') {
        const first = this.resultsEl.querySelector('.ap-search-result-item');
        if (first) first.click();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const first = this.resultsEl.querySelector('.ap-search-result-item');
        if (first) first.focus();
      }
    });

    // 헤더 검색 버튼 클릭
    const headerSearch = document.querySelector('.ap-header__search');
    if (headerSearch) {
      headerSearch.addEventListener('click', () => this.open());
    }
  },

  /* ── Ctrl+K 단축키 ── */
  bindShortcut() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
    });
  },

  /* ── 검색 데이터 로드 ── */
  async loadSearchData() {
    // 사이드바에서 검색 데이터 수집
    document.querySelectorAll('.ap-sidebar__item[data-page]').forEach(item => {
      this.data.push({
        id: item.dataset.page,
        type: item.dataset.type,
        name: item.textContent.trim().replace(/check_circle|warning|cancel/g, '').trim()
      });
    });
  },

  /* ── 모달 열기 ── */
  open() {
    this.modalEl.classList.add('is-open');
    this.inputEl.value = '';
    this.resultsEl.innerHTML = '';
    this.inputEl.focus();
    this.showAll();
  },

  /* ── 모달 닫기 ── */
  close() {
    this.modalEl.classList.remove('is-open');
  },

  /* ── 전체 표시 ── */
  showAll() {
    this.renderResults(this.data);
  },

  /* ── 검색 실행 ── */
  search(query) {
    if (!query.trim()) {
      this.showAll();
      return;
    }

    const q = query.toLowerCase();
    const results = this.data.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );

    this.renderResults(results);
  },

  /* ── 결과 렌더링 ── */
  renderResults(results) {
    if (results.length === 0) {
      this.resultsEl.innerHTML = '<div class="ap-search-empty">검색 결과가 없습니다.</div>';
      return;
    }

    const typeLabels = {
      component: '컴포넌트',
      guide: '가이드',
      tool: '도구',
      audit: '검수'
    };

    this.resultsEl.innerHTML = results.map(item => `
      <a href="#${item.id}" class="ap-search-result-item" tabindex="0">
        <span class="ap-search-result-name">${item.name}</span>
        <span class="ap-search-result-type">${typeLabels[item.type] || item.type}</span>
      </a>
    `).join('');

    // 결과 클릭 이벤트
    this.resultsEl.querySelectorAll('.ap-search-result-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = item.getAttribute('href').slice(1);
        this.close();
      });

      // 키보드 탐색
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.location.hash = item.getAttribute('href').slice(1);
          this.close();
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = item.nextElementSibling;
          if (next) next.focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = item.previousElementSibling;
          if (prev) prev.focus();
          else this.inputEl.focus();
        }
        if (e.key === 'Escape') this.close();
      });
    });
  }
};
