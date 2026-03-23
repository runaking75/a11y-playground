/* ═══════════════════════════════════════
   A11y Playground — Card Grid
   컴포넌트 목록 카드 그리드
   sidebar.json 기반 + previewHtml 미니 프리뷰
   ═══════════════════════════════════════ */

var CardGrid = {

  render: function() {
    // 가이드/컴포넌트 뷰 모두 숨기고 카드 그리드 표시
    if (typeof GuideRenderer !== 'undefined') GuideRenderer.showComponentView();

    var pageHeader = document.querySelector('.ap-page-header');
    var tabs = document.querySelector('.ap-tabs');
    var content = document.querySelector('.ap-content');
    var guidePage = document.querySelector('.ap-guide-page');

    if (pageHeader) pageHeader.style.display = 'none';
    if (tabs) tabs.style.display = 'none';
    if (content) content.style.display = 'none';
    if (guidePage) guidePage.style.display = 'none';

    // 카드 그리드 컨테이너
    var grid = document.querySelector('.ap-card-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'ap-card-grid';
      var main = document.querySelector('.ap-main');
      if (main) main.appendChild(grid);
    }
    grid.style.display = 'block';

    var mainEl = document.querySelector('.ap-main');
    if (mainEl) mainEl.scrollTop = 0;

    // sidebar.json에서 컴포넌트 목록 가져오기
    var components = this.getComponents();

    var html = '<div class="ap-card-grid__header">';
    html += '<h1 class="ap-card-grid__title">컴포넌트</h1>';
    html += '<p class="ap-card-grid__desc">접근성 기준을 충족하는 UI 컴포넌트 라이브러리. 각 컴포넌트를 클릭하여 Playground에서 직접 테스트해보세요.</p>';
    html += '<div class="ap-card-grid__stats">';
    var ready = components.filter(function(c) { return c.status === 'pass'; }).length;
    html += '<span class="ap-card-grid__stat">' + components.length + '개 컴포넌트</span>';
    html += '<span class="ap-card-grid__stat ap-card-grid__stat--ready">' + ready + '개 완성</span>';
    html += '<span class="ap-card-grid__stat ap-card-grid__stat--planned">' + (components.length - ready) + '개 준비 중</span>';
    html += '</div></div>';

    html += '<div class="ap-card-grid__list">';
    for (var i = 0; i < components.length; i++) {
      html += this.renderCard(components[i]);
    }
    html += '</div>';

    grid.innerHTML = html;
    this.loadPreviews(components);
    this.bindEvents();
  },

  renderCard: function(comp) {
    var statusCls = comp.status === 'pass' ? 'ap-card--ready' : 'ap-card--planned';
    var statusText = comp.status === 'pass' ? '완성' : '준비 중';
    var statusIcon = comp.status === 'pass' ? 'check_circle' : 'schedule';

    return '<a href="#' + comp.id + '" class="ap-card ' + statusCls + '" data-card-id="' + comp.id + '">' +
      '<div class="ap-card__preview" data-preview-id="' + comp.id + '">' +
        '<div class="ap-card__placeholder"><span class="material-icons-outlined">widgets</span></div>' +
      '</div>' +
      '<div class="ap-card__info">' +
        '<div class="ap-card__name">' + comp.name + '</div>' +
        '<div class="ap-card__status">' +
          '<span class="material-icons-outlined" style="font-size:14px">' + statusIcon + '</span> ' + statusText +
        '</div>' +
      '</div>' +
    '</a>';
  },

  // previewHtml을 비동기로 로드해서 미니 프리뷰 삽입
  loadPreviews: function(components) {
    for (var i = 0; i < components.length; i++) {
      var comp = components[i];
      if (comp.status === 'pass') {
        this.loadPreview(comp.id);
      }
    }
  },

  loadPreview: function(id) {
    fetch('data/components/' + id + '.json')
      .then(function(res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function(data) {
        if (!data || !data.playground || !data.playground.previewHtml) return;

        var previewEl = document.querySelector('[data-preview-id="' + id + '"]');
        if (!previewEl) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'ap-card__preview-inner';
        wrapper.innerHTML = data.playground.previewHtml;

        // placeholder 제거
        var placeholder = previewEl.querySelector('.ap-card__placeholder');
        if (placeholder) placeholder.style.display = 'none';

        previewEl.appendChild(wrapper);
      })
      .catch(function() {});
  },

  getComponents: function() {
    if (typeof Sidebar !== 'undefined' && Sidebar.data) {
      var sections = Sidebar.data.sections;
      for (var s = 0; s < sections.length; s++) {
        if (sections[s].label === '컴포넌트') {
          return sections[s].items;
        }
      }
    }
    return [];
  },

  hide: function() {
    var grid = document.querySelector('.ap-card-grid');
    if (grid) grid.style.display = 'none';

    var pageHeader = document.querySelector('.ap-page-header');
    var tabs = document.querySelector('.ap-tabs');
    var content = document.querySelector('.ap-content');
    if (pageHeader) pageHeader.style.display = '';
    if (tabs) tabs.style.display = '';
    if (content) content.style.display = '';
  },

  bindEvents: function() {
    // 카드 클릭은 기본 <a> href로 해시 라우팅 처리
  }
};
