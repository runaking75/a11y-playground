/* ═══════════════════════════════════════
   A11y Playground — Element Manager
   컴포넌트별 요소 추가/삭제
   ═══════════════════════════════════════ */

var ElementManager = {
  counter: 0,
  canvas: null,
  componentId: null,

  init: function() {
    this.canvas = document.querySelector('.ap-preview__canvas');
  },

  setComponent: function(id, addable) {
    this.componentId = id;
    this.addable = addable !== false;
    this.counter = 0;
  },

  createAddBar: function() {
    if (!this.canvas) return;
    // 기존 추가 바 제거
    var old = this.canvas.querySelector('.ap-preview__add-bar');
    if (old) old.remove();

    // addable이 false면 추가 바 안 만듦
    if (!this.addable) return;

    var bar = document.createElement('div');
    bar.className = 'ap-preview__add-bar';
    bar.innerHTML = '<button type="button" class="ap-preview__add-btn">+ 추가</button>';
    this.canvas.appendChild(bar);

    var self = this;
    bar.querySelector('.ap-preview__add-btn').addEventListener('click', function() {
      self.addElement();
    });
  },

  addElement: function() {
    this.counter++;

    switch (this.componentId) {
      case 'accordion':
        this.addAccordionItem();
        break;
      case 'link':
        this.addGenericItem('<a href="#" class="link" data-component="link">링크 ' + this.counter + '</a>');
        break;
      case 'checkbox':
        this.addGenericItem('<label class="checkbox" data-component="checkbox"><input type="checkbox"> <span class="checkbox__label">옵션 ' + this.counter + '</span></label>');
        break;
      case 'radio':
        this.addGenericItem('<label class="radio" data-component="radio"><input type="radio" name="new-radio"> <span class="radio__label">옵션 ' + this.counter + '</span></label>');
        break;
      case 'input':
        this.addBlockItem('<div class="input-field" data-component="input"><label class="input-label" for="new-input-' + this.counter + '">필드 ' + this.counter + '</label><input type="text" class="input" id="new-input-' + this.counter + '" placeholder="입력하세요"></div>');
        break;
      case 'switch':
        this.addGenericItem('<div class="switch-field" data-component="switch"><label class="switch-label">옵션 ' + this.counter + '</label><button type="button" class="switch" role="switch" aria-checked="false"><span class="switch__thumb"></span></button></div>');
        break;
      case 'tooltip':
        this.addGenericItem('<div class="tooltip-wrap" data-component="tooltip"><button type="button" class="btn btn-outlined tooltip-trigger" aria-describedby="new-tip-' + this.counter + '">버튼 ' + this.counter + '</button><div class="tooltip" id="new-tip-' + this.counter + '" role="tooltip">툴팁 내용</div></div>');
        break;
      case 'tabs':
        this.addTabItem();
        break;
      case 'button':
      default:
        this.addButton();
        break;
    }
  },

  // 인라인 요소 추가 (link, checkbox, radio, switch, tooltip)
  addGenericItem: function(html) {
    var rows = this.canvas.querySelectorAll('.ap-preview__row');
    var targetRow = rows[0];

    if (!targetRow) {
      targetRow = document.createElement('div');
      targetRow.className = 'ap-preview__row';
      var addBar = this.canvas.querySelector('.ap-preview__add-bar');
      this.canvas.insertBefore(targetRow, addBar);
    }

    var wrapper = document.createElement('span');
    wrapper.className = 'ap-preview__item';
    wrapper.innerHTML = html + '<span class="ap-preview__delete-btn" title="삭제">&times;</span>';

    targetRow.appendChild(wrapper);
    this.bindDelete(wrapper, targetRow);
    this.selectNew(wrapper.querySelector('[data-component]'));
  },

  // 블록 요소 추가 (input)
  addBlockItem: function(html) {
    var addBar = this.canvas.querySelector('.ap-preview__add-bar');
    var rows = this.canvas.querySelectorAll('.ap-preview__row');
    var targetRow = null;

    // input은 세로 레이아웃 row 찾기
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].style.flexDirection === 'column') {
        targetRow = rows[i];
        break;
      }
    }

    if (!targetRow) {
      targetRow = document.createElement('div');
      targetRow.className = 'ap-preview__row';
      targetRow.style.flexDirection = 'column';
      targetRow.style.alignItems = 'stretch';
      targetRow.style.maxWidth = '320px';
      targetRow.style.width = '100%';
      this.canvas.insertBefore(targetRow, addBar);
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'ap-preview__item';
    wrapper.style.display = 'block';
    wrapper.innerHTML = html + '<span class="ap-preview__delete-btn ap-preview__delete-btn--block" title="삭제">&times;</span>';

    targetRow.appendChild(wrapper);
    this.bindDelete(wrapper, targetRow);
    this.selectNew(wrapper.querySelector('[data-component]'));
  },

  // 탭 항목 추가
  addTabItem: function() {
    var tablist = this.canvas.querySelector('[role="tablist"]');
    var tabsContainer = this.canvas.querySelector('.tabs');
    if (!tablist || !tabsContainer) return;

    var num = this.counter;
    var tabId = 'new-tab-' + num;
    var panelId = 'new-tabpanel-' + num;

    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs__tab';
    tab.setAttribute('role', 'tab');
    tab.id = tabId;
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('tabindex', '-1');
    tab.textContent = '탭 ' + num;
    tablist.appendChild(tab);

    var panel = document.createElement('div');
    panel.className = 'tabs__panel';
    panel.setAttribute('role', 'tabpanel');
    panel.id = panelId;
    panel.setAttribute('aria-labelledby', tabId);
    panel.hidden = true;
    panel.innerHTML = '<p>새 탭 ' + num + '의 내용입니다.</p>';
    tabsContainer.appendChild(panel);

    // 탭 액션 바인딩
    var self = this;
    if (typeof TabsAction !== 'undefined') {
      tab.addEventListener('click', function() { TabsAction.select(tab, self.canvas); });
      tab.addEventListener('keydown', function(e) { TabsAction.handleKey(e, tab, self.canvas); });
    }
  },

  // 버튼 추가
  addButton: function() {
    var label = '버튼 ' + this.counter;
    var rows = this.canvas.querySelectorAll('.ap-preview__row');
    var targetRow = rows[0];

    if (!targetRow) {
      targetRow = document.createElement('div');
      targetRow.className = 'ap-preview__row';
      var addBar = this.canvas.querySelector('.ap-preview__add-bar');
      this.canvas.insertBefore(targetRow, addBar);
    }

    var wrapper = document.createElement('span');
    wrapper.className = 'ap-preview__item';
    wrapper.innerHTML =
      '<button type="button" class="btn btn-filled" data-component="button">' + label + '</button>' +
      '<span class="ap-preview__delete-btn" title="삭제">&times;</span>';

    targetRow.appendChild(wrapper);
    this.bindDelete(wrapper, targetRow);
    this.selectNew(wrapper.querySelector('[data-component]'));
  },

  // 아코디언 항목 추가
  addAccordionItem: function() {
    var num = this.counter;
    var headerId = 'acc-new-h' + num;
    var panelId = 'acc-new-p' + num;

    var accordion = this.canvas.querySelector('.accordion');
    if (!accordion) return;

    var item = document.createElement('div');
    item.className = 'accordion-item ap-preview__item';
    item.innerHTML =
      '<h3 class="accordion-heading">' +
        '<button type="button" class="accordion-header" id="' + headerId + '" aria-expanded="false" aria-controls="' + panelId + '" data-component="accordion">' +
          '새 항목 ' + num +
        '</button>' +
      '</h3>' +
      '<div class="accordion-panel" id="' + panelId + '" role="region" aria-labelledby="' + headerId + '" hidden>' +
        '<p>새 아코디언 항목 ' + num + '의 내용입니다.</p>' +
      '</div>' +
      '<span class="ap-preview__delete-btn ap-preview__delete-btn--block" title="삭제">&times;</span>';

    accordion.appendChild(item);
    this.bindDelete(item, accordion);

    // 액션 바인딩
    var header = item.querySelector('.accordion-header');
    if (typeof AccordionAction !== 'undefined' && header) {
      header.addEventListener('click', function() {
        AccordionAction.toggle(header, this.canvas);
      }.bind(this));
      header.addEventListener('keydown', function(e) {
        AccordionAction.handleKey(e, header, this.canvas);
      }.bind(this));
    }

    this.selectNew(header);
  },

  // 삭제 바인딩
  bindDelete: function(wrapper, parent) {
    var self = this;
    var deleteBtn = wrapper.querySelector('.ap-preview__delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        self.removeElement(wrapper, parent);
      });
    }
  },

  // 요소 삭제
  removeElement: function(wrapper, parent) {
    wrapper.remove();
    if (parent && parent.children.length === 0) {
      var prev = parent.previousElementSibling;
      if (prev && prev.classList.contains('ap-preview__label')) {
        prev.remove();
      }
      parent.remove();
    }
    if (typeof AriaViewer !== 'undefined') {
      AriaViewer.currentEl = null;
      AriaViewer.update();
    }
  },

  // 새 요소 선택
  selectNew: function(el) {
    if (el && typeof AriaViewer !== 'undefined') {
      AriaViewer.select(el);
    }
  },

  // 기존 요소에 삭제 버튼 바인딩
  bindDeleteButtons: function() {
    if (!this.canvas || !this.addable) return;
    var self = this;

    if (this.componentId === 'accordion') {
      // 아코디언은 item 단위로 삭제
      var accordion = this.canvas.querySelector('.accordion');
      if (!accordion) return;
      var items = accordion.querySelectorAll('.accordion-item');
      items.forEach(function(item) {
        if (item.querySelector('.ap-preview__delete-btn')) return;
        item.classList.add('ap-preview__item');
        var deleteBtn = document.createElement('span');
        deleteBtn.className = 'ap-preview__delete-btn ap-preview__delete-btn--block';
        deleteBtn.title = '삭제';
        deleteBtn.innerHTML = '&times;';
        item.appendChild(deleteBtn);
        self.bindDelete(item, accordion);
      });
    } else {
      // 버튼 등 기본
      var rows = this.canvas.querySelectorAll('.ap-preview__row');
      rows.forEach(function(row) {
        var buttons = row.querySelectorAll('button[data-component]');
        buttons.forEach(function(btn) {
          if (btn.parentElement.classList.contains('ap-preview__item')) return;
          var wrapper = document.createElement('span');
          wrapper.className = 'ap-preview__item';
          var deleteBtn = document.createElement('span');
          deleteBtn.className = 'ap-preview__delete-btn';
          deleteBtn.title = '삭제';
          deleteBtn.innerHTML = '&times;';
          btn.parentNode.insertBefore(wrapper, btn);
          wrapper.appendChild(btn);
          wrapper.appendChild(deleteBtn);
          self.bindDelete(wrapper, row);
        });
      });
    }
  }
};
