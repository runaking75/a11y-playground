/* ═══════════════════════════════════════
   A11y Playground — Menu Button Action
   Light DOM 모드 전용
   메뉴 열기/닫기 + 키보드 + 선택 시 트리거 갱신
   ═══════════════════════════════════════ */

var MenuButtonAction = {

  init: function(root) {
    if (!root) return;
    var self = this;

    root.querySelectorAll('[aria-haspopup="true"]').forEach(function(trigger) {
      var menuId = trigger.getAttribute('aria-controls');
      var menu = menuId ? root.querySelector('#' + menuId) : trigger.nextElementSibling;
      if (!menu || menu.getAttribute('role') !== 'menu') return;

      if (trigger.dataset.menuBound) return;
      trigger.dataset.menuBound = 'true';

      var btnText = trigger.querySelector('.menu-button-text');

      var getItems = function() {
        return Array.from(menu.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemcheckbox"], [role="menuitemradio"]'));
      };

      var getActive = function() {
        if (root && root.activeElement) return root.activeElement;
        return document.activeElement;
      };

      // 초기 aria-label (첫 번째 항목 기준)
      if (!trigger.getAttribute('aria-label')) {
        var first = getItems()[0];
        if (first && btnText) {
          var label = first.textContent.trim();
          btnText.textContent = label;
          trigger.setAttribute('aria-label', '메뉴선택 ' + label);
        }
      }

      function openMenu() {
        trigger.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
        menu.style.display = '';
        var items = getItems();
        if (items.length) items[0].focus();
        if (typeof AriaViewer !== 'undefined') AriaViewer.select(trigger);
      }

      function closeMenu() {
        trigger.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        menu.style.display = 'none';
        trigger.focus();
        if (typeof AriaViewer !== 'undefined') AriaViewer.select(trigger);
      }

      function selectItem(item) {
        var label = item.textContent.trim();
        if (btnText) btnText.textContent = label;
        trigger.setAttribute('aria-label', '메뉴선택 ' + label);
        closeMenu();
      }

      // 클릭 토글
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (trigger.getAttribute('aria-expanded') === 'true') closeMenu();
        else openMenu();
      });

      // 트리거 키보드
      trigger.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'Down') {
          e.preventDefault(); openMenu();
        } else if (e.key === 'ArrowUp' || e.key === 'Up') {
          e.preventDefault();
          trigger.setAttribute('aria-expanded', 'true');
          menu.hidden = false;
          menu.style.display = '';
          var items = getItems();
          if (items.length) items[items.length - 1].focus();
        }
      });

      // 메뉴 키보드
      menu.addEventListener('keydown', function(e) {
        var items = getItems();
        var current = getActive();
        var idx = items.indexOf(current);

        switch (e.key) {
          case 'Escape': case 'Esc':
            e.preventDefault(); closeMenu(); break;
          case 'ArrowDown': case 'Down':
            e.preventDefault();
            if (idx < items.length - 1) items[idx + 1].focus();
            else items[0].focus();
            break;
          case 'ArrowUp': case 'Up':
            e.preventDefault();
            if (idx > 0) items[idx - 1].focus();
            else items[items.length - 1].focus();
            break;
          case 'Home': e.preventDefault(); items[0].focus(); break;
          case 'End': e.preventDefault(); items[items.length - 1].focus(); break;
          case 'Tab': closeMenu(); break;
          case 'Enter': case ' ':
            e.preventDefault();
            if (current) selectItem(current);
            break;
          default:
            if (e.key.length === 1) {
              var ch = e.key.toLowerCase();
              for (var i = 0; i < items.length; i++) {
                var ci = (idx + 1 + i) % items.length;
                if (items[ci].textContent.trim().toLowerCase().startsWith(ch)) {
                  items[ci].focus(); break;
                }
              }
            }
        }
      });

      // 메뉴 항목 클릭
      getItems().forEach(function(item) {
        item.addEventListener('click', function() {
          if (item.getAttribute('aria-disabled') !== 'true') selectItem(item);
        });
      });

      // 외부 클릭
      document.addEventListener('click', function(e) {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
          if (trigger.getAttribute('aria-expanded') === 'true') closeMenu();
        }
      });
    });
  }
};
