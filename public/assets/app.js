(function() {
  var _root = document.getElementById('app');
  if (_root) _root.innerHTML = "<div class=\"ta-app\">\n<div class=\"ta-app\">\n  <div class=\"sidebar-overlay\" id=\"sidebar-overlay\"></div>\n  <aside class=\"ta-sidebar\" id=\"sidebar\">\n    <div class=\"sb-head\">\n      <a href=\"/\" class=\"brand-logo\">\n        <img src=\"/avatar.png\" alt=\"\" class=\"brand-avatar\">\n        <span class=\"brand-title\">Personal AI</span>\n      </a>\n      <button id=\"sidebar-close-btn\" class=\"icon-btn\" title=\"關閉\" style=\"display:none\">✕</button>\n    </div>\n    <button id=\"new-chat-btn\" class=\"new-chat-btn\" type=\"button\">\n      <span class=\"nc-main\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><path d=\"M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6\"/><path d=\"M18.4 2.6a2 2 0 0 1 2.9 2.9L12 14.8 8 16l1.2-4z\"/></svg><span data-i18n=\"newChat\">Nueva conversación</span></span>\n      <kbd class=\"hint\">Ctrl K</kbd>\n    </button>\n    <button id=\"temp-chat-btn\" class=\"new-chat-btn ghost\" type=\"button\">\n      <span class=\"nc-main\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><circle cx=\"12\" cy=\"12\" r=\"9\" stroke-dasharray=\"3 3\"/><path d=\"M12 7v5l3 2\"/></svg><span data-i18n=\"tempChat\">Chat temporal</span></span>\n      <kbd class=\"hint\">Ctrl ⇧ N</kbd>\n    </button>\n    <div class=\"history-search-box\">\n      <input type=\"search\" id=\"history-search\" class=\"history-search-input\" placeholder=\"Buscar…\" autocomplete=\"off\" data-i18n=\"searchPh\" data-i18n-attr=\"placeholder\">\n    </div>\n    <div class=\"sb-tabs\">\n      <button type=\"button\" class=\"sb-tab active\" data-view=\"chats\" id=\"tab-chats\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><path d=\"M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z\"/></svg><span data-i18n=\"chats\">Chats</span></button>\n      <button type=\"button\" class=\"sb-tab\" data-view=\"projects\" id=\"tab-projects\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><path d=\"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg><span data-i18n=\"projects\">Proyectos</span></button>\n      <button type=\"button\" class=\"sb-tab\" data-view=\"docs\" id=\"tab-docs\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z\"/><path d=\"M14 3v5h5\"/><path d=\"M9 13h6M9 17h4\"/></svg><span data-i18n=\"docs\">Documentos</span></button>\n      \n      <button type=\"button\" class=\"sb-tab\" data-view=\"prompts\" id=\"tab-prompts\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><path d=\"M4 6h16M4 12h10M4 18h7\"/><path d=\"m17 15 3 3-3 3\"/></svg><span>Prompts</span></button>\n    </div>\n    <div class=\"history-list\" id=\"history-list\"></div>\n    <div class=\"sb-foot\">\n                  <button type=\"button\" id=\"open-settings-btn\" class=\"sb-link\" data-open-settings=\"pane-general\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z\"/></svg><span data-i18n=\"settings\">Ajustes</span></button>\n      \n      <div class=\"sb-account\">\n      <button type=\"button\" class=\"user-pill\" id=\"user-profile-pill\" data-open-settings=\"pane-account\">\n        <div style=\"display:flex;align-items:center;gap:8px;min-width:0\">\n          <div class=\"avatar-letter\" id=\"user-letter\">T</div>\n          <div style=\"min-width:0\">\n            <div class=\"user-info-name\" id=\"user-display-name\">Invitado</div>\n            <div class=\"user-info-tier\" id=\"user-display-tier\">50K tokens / día</div>\n          </div>\n        </div>\n      </button>\n      <div id=\"lang-select\" class=\"lang-picker\" aria-label=\"Language\"></div>\n      </div>\n    </div>\n  </aside>\n\n  <main class=\"ta-main\">\n    <header class=\"ta-topbar\">\n      <div class=\"topbar-left\">\n        <button id=\"sidebar-toggle-btn\" class=\"icon-btn menu-toggle-btn\" type=\"button\" title=\"選單\" aria-label=\"選單\">\n          <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"/></svg>\n        </button>\n        <div class=\"model-picker\" id=\"model-picker\">\n          <button type=\"button\" class=\"model-picker-btn\" id=\"model-picker-btn\" aria-haspopup=\"listbox\" aria-expanded=\"false\">\n            <span class=\"model-picker-label\" id=\"model-picker-label\">GPT OSS 120B</span>\n            <svg class=\"model-picker-caret\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M6 9l6 6 6-6\"/></svg>\n          </button>\n          <div class=\"model-menu\" id=\"model-menu\" role=\"listbox\"></div>\n        </div>\n      </div>\n      <div class=\"topbar-right\">\n        <span id=\"temp-badge\" class=\"temp-badge\" data-i18n=\"tempOn\">Temporal</span>\n        <button id=\"cmd-open-btn\" class=\"topbar-icon-btn\" type=\"button\" title=\"Ctrl+P\" data-i18n=\"commandPalette\" data-i18n-attr=\"title\" aria-label=\"命令\">\n          <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/></svg>\n        </button>\n        <button id=\"topbar-auth-btn\" class=\"topbar-action-btn primary\" type=\"button\" data-open-settings=\"pane-general\">\n          <span class=\"avatar-letter\" id=\"topbar-letter\" hidden>T</span>\n          <span id=\"topbar-auth-text\">設定</span>\n        </button>\n      </div>\n    </header>\n    <div class=\"setup-banner\" id=\"setup-banner\" role=\"status\" hidden></div>\n    <div class=\"proj-header\" id=\"proj-header\" hidden>\n      <div class=\"proj-header-title\"><span class=\"proj-header-label\">專案</span><strong id=\"proj-header-name\"></strong></div>\n      <div class=\"proj-tabs\" role=\"tablist\" aria-label=\"專案面板\">\n        <button type=\"button\" class=\"proj-tab\" role=\"tab\" data-proj-tab=\"chat\">對話</button>\n        <button type=\"button\" class=\"proj-tab\" role=\"tab\" data-proj-tab=\"files\">檔案</button>\n        <button type=\"button\" class=\"proj-tab\" role=\"tab\" data-proj-tab=\"instructions\">指示</button>\n        <button type=\"button\" class=\"proj-tab\" role=\"tab\" data-proj-tab=\"settings\">設定</button>\n      </div>\n      <span class=\"proj-status\" id=\"proj-status\" role=\"status\"></span>\n      <button type=\"button\" class=\"hist-bar-btn\" id=\"proj-exit-btn\" title=\"回到一般對話\">離開專案</button>\n    </div>\n    <div class=\"ta-chat-scroll\" id=\"chat-scroll\">\n      <div class=\"ta-chat-wrap\" id=\"chat-container\"></div>\n    </div>\n    <footer class=\"ta-input-dock\">\n      <div class=\"capsule-box\">\n        <div id=\"attached-badge\" class=\"file-badge-preview\">\n          <img id=\"attached-thumb\" alt=\"\" hidden>\n          <span id=\"attached-kind\">Documento</span>\n          <span id=\"attached-name\">documento.txt</span>\n          <button id=\"remove-file-btn\" type=\"button\" style=\"background:none;border:none;color:var(--dim);cursor:pointer\">✕</button>\n        </div>\n        <div class=\"skill-suggest\" id=\"skill-suggest\" role=\"listbox\" aria-label=\"技能\" hidden></div>\n        <textarea id=\"prompt-input\" class=\"prompt-textarea\" rows=\"1\" placeholder=\"Pregunta lo que quieras…\" data-i18n=\"askPh\" data-i18n-attr=\"placeholder\"></textarea>\n        <div class=\"dock-controls\">\n          <div class=\"dock-plus\" id=\"dock-plus\">\n            <button type=\"button\" class=\"dock-btn dock-plus-btn\" id=\"dock-plus-btn\" aria-haspopup=\"menu\" aria-expanded=\"false\" aria-controls=\"dock-plus-menu\" aria-label=\"更多選項\" title=\"更多選項\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" aria-hidden=\"true\"><path d=\"M12 5v14M5 12h14\"/></svg></button>\n            <div class=\"dock-plus-menu\" id=\"dock-plus-menu\" role=\"menu\" hidden>\n              <button type=\"button\" role=\"menuitem\" class=\"dpm-item\" data-dpm=\"attach\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><path d=\"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48\"/></svg><span class=\"dpm-label\">附加檔案</span></button>\n              <button type=\"button\" role=\"menuitemcheckbox\" aria-checked=\"false\" class=\"dpm-item\" data-dpm=\"web\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18\"/></svg><span class=\"dpm-label\">網頁搜尋</span><span class=\"dpm-check\" aria-hidden=\"true\">✓</span></button>\n              <button type=\"button\" role=\"menuitemcheckbox\" aria-checked=\"false\" class=\"dpm-item\" data-dpm=\"image\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"sb-ico\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><circle cx=\"9\" cy=\"10\" r=\"2\"/><path d=\"m21 16-5-5-9 9\"/></svg><span class=\"dpm-label\">產生圖片</span><span class=\"dpm-check\" aria-hidden=\"true\">✓</span></button>\n                          </div>\n          </div>\n          <div class=\"control-pills\">\n            <div class=\"tools-menu-wrap\" id=\"tools-menu-wrap\">\n              <button id=\"tools-pill\" class=\"dock-pill\" type=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\" aria-controls=\"tools-menu\">工具</button>\n              <div class=\"tools-menu\" id=\"tools-menu\" role=\"dialog\" aria-label=\"工具、技能與 MCP\" hidden></div>\n            </div>\n            <button id=\"web-search-pill\" class=\"dock-pill\" type=\"button\" data-i18n=\"searchWeb\">Buscar</button>\n            <button id=\"image-gen-pill\" class=\"dock-pill\" type=\"button\" data-i18n=\"image\">Imagen</button>\n            <div class=\"length-segmented-pill\" style=\"display:none;\" title=\"長度\"><button class=\"length-opt-btn active\" data-len=\"normal\" id=\"len-btn-normal\" type=\"button\" data-i18n=\"normal\">Normal</button></div>\n          </div>\n          <div class=\"dock-action-buttons\">\n            <input type=\"file\" id=\"file-uploader\" style=\"display:none\" accept=\"image/jpeg,image/png,image/webp,image/gif,.txt,.md,.json,.js,.ts,.py,.csv,.log,.html,.css\">\n            <button id=\"attach-file-btn\" class=\"dock-btn\" type=\"button\" title=\"附加檔案\" aria-label=\"附加檔案\" data-i18n=\"attach\" data-i18n-attr=\"title\">\n              <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48\"/></svg>\n            </button>\n            <button id=\"mic-btn\" class=\"dock-btn\" type=\"button\" title=\"語音輸入\" aria-label=\"語音輸入\" data-i18n=\"dictate\" data-i18n-attr=\"title\">\n              <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"9\" y=\"2\" width=\"6\" height=\"12\" rx=\"3\"/><path d=\"M5 11a7 7 0 0 0 14 0\"/><path d=\"M12 18v4\"/><path d=\"M8 22h8\"/></svg>\n            </button>\n            <button id=\"speak-last-btn\" class=\"dock-btn\" type=\"button\" title=\"朗讀回覆\" aria-label=\"朗讀回覆\" data-i18n=\"speakLast\" data-i18n-attr=\"title\">\n              <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 5L6 9H3v6h3l5 4V5z\"/><path d=\"M15.5 8.5a5 5 0 0 1 0 7\"/><path d=\"M18.5 6a8.5 8.5 0 0 1 0 12\"/></svg>\n            </button>\n            <button id=\"send-btn\" class=\"send-submit-btn\" type=\"button\" title=\"送出\">\n              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"><path d=\"M12 19V5M5 12l7-7 7 7\"/></svg>\n            </button>\n          </div>\n        </div>\n      </div>\n      <p class=\"disclaimer\"><span data-i18n=\"disclaimer\">Personal AI puede equivocarse.</span></p>\n    </footer>\n  </main>\n\n  <aside class=\"proj-drawer\" id=\"proj-drawer\" aria-label=\"專案面板\" hidden>\n    <div class=\"proj-drawer-head\">\n      <strong>專案</strong>\n      <button type=\"button\" class=\"icon-btn\" id=\"proj-drawer-close\" title=\"關閉\" aria-label=\"關閉\">✕</button>\n    </div>\n    <div class=\"proj-drawer-body\" id=\"proj-drawer-body\"></div>\n  </aside>\n\n  <aside class=\"art-panel\" id=\"art-panel\" aria-label=\"Artifact\">\n    <div class=\"art-head\">\n      <div class=\"art-head-top\">\n        <div class=\"art-title-wrap\">\n          <textarea class=\"art-title-input\" id=\"art-title\" maxlength=\"72\" rows=\"2\" placeholder=\"簡短標題（最多 72 字）\" aria-label=\"標題\">Artifact</textarea>\n          <div class=\"art-title-count\" id=\"art-title-count\">0/72</div>\n        </div>\n        <button type=\"button\" class=\"icon-btn\" id=\"art-close-btn\" title=\"關閉\" aria-label=\"關閉\">✕</button>\n      </div>\n      <div class=\"art-toolbar\">\n        <select id=\"art-format\" class=\"art-format\" title=\"格式\" aria-label=\"Artifact 格式\"></select>\n        <button type=\"button\" class=\"topbar-action-btn\" id=\"art-copy-btn\" data-art-i18n=\"copy\">Copiar</button>\n        <button type=\"button\" class=\"topbar-action-btn\" id=\"art-save-btn\">儲存</button>\n      </div>\n      <div class=\"art-viewbar\">\n        <div class=\"art-view\" role=\"tablist\" aria-label=\"檢視\">\n          <button type=\"button\" class=\"art-view-btn active\" role=\"tab\" aria-selected=\"true\" data-view=\"preview\" id=\"art-view-preview\" data-art-i18n=\"preview\">Vista previa</button>\n          <button type=\"button\" class=\"art-view-btn\" role=\"tab\" aria-selected=\"false\" data-view=\"code\" id=\"art-view-code\" data-art-i18n=\"code\">Código</button>\n        </div>\n        <select id=\"art-version\" class=\"art-format art-version\" aria-label=\"版本\" hidden></select>\n        <span class=\"art-viewbar-spacer\"></span>\n        <button type=\"button\" class=\"icon-btn art-icon-btn\" id=\"art-download-btn\" data-art-i18n-title=\"download\" title=\"下載\" aria-label=\"下載\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 4v11\"/><path d=\"m7 10 5 5 5-5\"/><path d=\"M5 20h14\"/></svg></button>\n        <button type=\"button\" class=\"icon-btn art-icon-btn\" id=\"art-fs-btn\" data-art-i18n-title=\"fullscreen\" title=\"全螢幕\" aria-label=\"全螢幕\" aria-pressed=\"false\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 9V4h5\"/><path d=\"M20 9V4h-5\"/><path d=\"M4 15v5h5\"/><path d=\"M20 15v5h-5\"/></svg></button>\n      </div>\n      \n    </div>\n    <div class=\"art-extras\">\n      <button type=\"button\" class=\"art-extras-toggle\" id=\"art-extras-toggle\">來源、資源與小工具</button>\n      <div class=\"art-extras-body\" id=\"art-extras-body\" hidden>\n        <label for=\"art-sources\">自訂來源（每行一筆：標題 | https://…）</label>\n        <textarea id=\"art-sources\" placeholder=\"SEC 10-K | https://www.sec.gov/…\"></textarea>\n        <label for=\"art-resources\">資源（每行一筆）</label>\n        <textarea id=\"art-resources\" placeholder=\"Modelo Excel | https://…\"></textarea>\n        <label for=\"art-widgets\">Widgets (quote:MSFT · note:texto · https://…)</label>\n        <textarea id=\"art-widgets\" placeholder=\"quote:MSFT&#10;note:Riesgo: múltiplo elevado&#10;https://www.tradingview.com/symbols/MSFT/\"></textarea>\n      </div>\n    </div>\n    <div class=\"art-split\" id=\"art-split\">\n      <textarea class=\"art-editor\" id=\"art-editor\" spellcheck=\"false\" placeholder=\"在這裡編輯內容。\" aria-label=\"Artifact 編輯器\"></textarea>\n      <iframe class=\"art-preview\" id=\"art-preview\" hidden sandbox=\"allow-scripts allow-forms allow-modals allow-popups\" referrerpolicy=\"no-referrer\" title=\"Vista del artifact\"></iframe>\n    </div>\n  </aside>\n</div>\n\n<div class=\"modal-backdrop\" id=\"modal-settings\">\n  <div class=\"modal-card settings-wide\">\n    <div class=\"modal-header\"><div class=\"modal-title\" data-i18n=\"settings\">Ajustes</div><button class=\"modal-close-btn\" data-modal=\"modal-settings\" type=\"button\" aria-label=\"關閉\" data-i18n=\"close\" data-i18n-attr=\"aria-label\">✕</button></div>\n    <div class=\"settings-layout\">\n      <nav class=\"settings-nav\" aria-label=\"設定\">\n        <div class=\"settings-nav-label\">應用程式</div>\n        <button type=\"button\" class=\"settings-nav-btn active\" data-pane=\"pane-general\" data-i18n=\"tabGeneral\">一般</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-providers\">供應商與模型</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-params\">模型參數</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-search\">搜尋與網頁</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-appearance\" data-i18n=\"tabAppearance\">外觀</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-behavior\" data-i18n=\"tabBehavior\">行為</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-customize\" data-i18n=\"tabCustomize\">個人化</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-memory\">記憶</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-skills\">技能</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-mcp\">MCP 伺服器</button>\n        <div class=\"settings-nav-label\">資料</div>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-account\">密碼與登入</button>\n        <button type=\"button\" class=\"settings-nav-btn\" data-pane=\"pane-data\" data-i18n=\"tabData\">資料控制</button>\n      </nav>\n      <div class=\"settings-main\">\n        <div id=\"pane-general\" class=\"settings-pane active\">\n          <div class=\"settings-section-title\" data-i18n=\"tabGeneral\">General</div>\n          <p class=\"settings-section-desc\" data-i18n=\"generalDesc\">Idioma, modelo por defecto y longitud de respuesta.</p>\n          <div class=\"form-group\">\n            <label class=\"form-label\" data-i18n=\"language\">Idioma</label>\n            <div id=\"set-lang\" class=\"lang-picker open-down\"></div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"form-label\" data-i18n=\"setDefaultModel\">Modelo por defecto</label>\n            <select id=\"set-default-model\" class=\"form-input\"></select>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"form-label\" data-i18n=\"setDefaultLength\">Longitud por defecto</label>\n            <div class=\"choice-row\" id=\"set-default-length\">\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_len_mode\" data-value=\"corto\" data-i18n=\"short\">Corto</button>\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_len_mode\" data-value=\"normal\" data-i18n=\"normal\">Normal</button>\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_len_mode\" data-value=\"extendido\" data-i18n=\"long\">Largo</button>\n            </div>\n          </div>\n          <p class=\"settings-hint\" id=\"app-version-hint\">Personal AI</p>\n        </div>\n\n        <div id=\"pane-account\" class=\"settings-pane\">\n          <div class=\"settings-section-title\">密碼與登入</div>\n          <p class=\"settings-section-desc\">單一擁有者登入。在這裡變更密碼後，新密碼以 PBKDF2 雜湊存在 D1，取代 APP_PASSWORD。</p>\n          <div class=\"settings-card\">\n            <div class=\"form-group\">\n              <label class=\"form-label\" for=\"set-cur-pass\">目前密碼</label>\n              <input type=\"password\" id=\"set-cur-pass\" class=\"form-input\" autocomplete=\"current-password\">\n            </div>\n            <div class=\"form-group\">\n              <label class=\"form-label\" for=\"set-new-pass\">新密碼（至少 8 個字元）</label>\n              <input type=\"password\" id=\"set-new-pass\" class=\"form-input\" autocomplete=\"new-password\" minlength=\"8\">\n            </div>\n            <div class=\"form-group\">\n              <label class=\"form-label\" for=\"set-new-pass2\">再輸入一次新密碼</label>\n              <input type=\"password\" id=\"set-new-pass2\" class=\"form-input\" autocomplete=\"new-password\" minlength=\"8\">\n            </div>\n            <div class=\"settings-actions\">\n              <button type=\"button\" id=\"change-pass-btn\" class=\"topbar-action-btn primary\">變更密碼</button>\n            </div>\n            <p id=\"pass-status\" class=\"settings-hint\" style=\"min-height:18px\" role=\"status\"></p>\n          </div>\n          <p class=\"settings-hint\">忘記新密碼時，可在 D1 主控台執行 <code>DELETE FROM settings WHERE k = 'auth.password'</code> 改回 APP_PASSWORD。已登入的其他裝置在工作階段到期前仍保持登入。</p>\n          <div class=\"settings-block-title\">工作階段</div>\n          <div class=\"settings-card\" style=\"padding:16px\">\n            <p class=\"settings-kv-sub\">登出這個瀏覽器。本機聊天紀錄會保留。</p>\n            <button type=\"button\" id=\"settings-logout-btn\" class=\"logout-big-btn\">登出</button>\n          </div>\n        </div>\n\n        <div id=\"pane-appearance\" class=\"settings-pane\">\n          <div class=\"settings-section-title\" data-i18n=\"tabAppearance\">Apariencia</div>\n          <p class=\"settings-section-desc\" data-i18n=\"appearanceDesc\">Tema, tamaño de letra y densidad de la interfaz.</p>\n          <div class=\"form-group\">\n            <label class=\"form-label\" data-i18n=\"appearanceTheme\">Tema</label>\n            <div class=\"theme-grid\">\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"dark\"><span class=\"theme-swatch\" data-swatch=\"dark\"></span><span data-i18n=\"themeDark\">Oscuro</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"gray\"><span class=\"theme-swatch\" data-swatch=\"gray\"></span><span data-i18n=\"themeGray\">Gris</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"dim\"><span class=\"theme-swatch\" data-swatch=\"dim\"></span><span data-i18n=\"themeDim\">Carbón</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"navy\"><span class=\"theme-swatch\" data-swatch=\"navy\"></span><span data-i18n=\"themeNavy\">Marino</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"light\"><span class=\"theme-swatch\" data-swatch=\"light\"></span><span data-i18n=\"themeLight\">Claro</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"paper\"><span class=\"theme-swatch\" data-swatch=\"paper\"></span><span data-i18n=\"themePaper\">Papel</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"hacker\"><span class=\"theme-swatch\" data-swatch=\"hacker\"></span><span>Hacker</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"cyberpunk\"><span class=\"theme-swatch\" data-swatch=\"cyberpunk\"></span><span>Cyberpunk</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"sunset\"><span class=\"theme-swatch\" data-swatch=\"sunset\"></span><span>Sunset</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"ocean\"><span class=\"theme-swatch\" data-swatch=\"ocean\"></span><span>Ocean</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"forest\"><span class=\"theme-swatch\" data-swatch=\"forest\"></span><span>Forest</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"rose\"><span class=\"theme-swatch\" data-swatch=\"rose\"></span><span>Rose</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"lavender\"><span class=\"theme-swatch\" data-swatch=\"lavender\"></span><span>Lavender</span></button>\n              <button type=\"button\" class=\"theme-card\" data-pref=\"ta_theme\" data-value=\"system\"><span class=\"theme-swatch\" data-swatch=\"system\"></span><span data-i18n=\"themeSystem\">Sistema</span></button>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"form-label\" data-i18n=\"accentLabel\">Acento</label>\n            <div class=\"accent-row\">\n              <button type=\"button\" class=\"accent-dot accent-auto\" data-pref=\"ta_accent\" data-value=\"auto\" title=\"Neutro\" aria-label=\"Neutro\"></button>\n              <button type=\"button\" class=\"accent-dot\" data-pref=\"ta_accent\" data-value=\"#38bdf8\" style=\"background:#38bdf8\" title=\"Cielo\"></button>\n              <button type=\"button\" class=\"accent-dot\" data-pref=\"ta_accent\" data-value=\"#a1a1aa\" style=\"background:#a1a1aa\" title=\"Gris\"></button>\n              <button type=\"button\" class=\"accent-dot\" data-pref=\"ta_accent\" data-value=\"#34d399\" style=\"background:#34d399\" title=\"Menta\"></button>\n              <button type=\"button\" class=\"accent-dot\" data-pref=\"ta_accent\" data-value=\"#2dd4bf\" style=\"background:#2dd4bf\" title=\"Teal\"></button>\n              <button type=\"button\" class=\"accent-dot\" data-pref=\"ta_accent\" data-value=\"#818cf8\" style=\"background:#818cf8\" title=\"Índigo\"></button>\n              <button type=\"button\" class=\"accent-dot\" data-pref=\"ta_accent\" data-value=\"#a78bfa\" style=\"background:#a78bfa\" title=\"Violeta\"></button>\n              <button type=\"button\" class=\"accent-dot\" data-pref=\"ta_accent\" data-value=\"#f59e0b\" style=\"background:#f59e0b\" title=\"Ámbar\"></button>\n              <button type=\"button\" class=\"accent-dot\" data-pref=\"ta_accent\" data-value=\"#fb7185\" style=\"background:#fb7185\" title=\"Rosa\"></button>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"form-label\" data-i18n=\"fontSize\">Tamaño de letra</label>\n            <div class=\"choice-row\">\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_font\" data-value=\"sm\" data-i18n=\"fontSm\">Compacto</button>\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_font\" data-value=\"md\" data-i18n=\"fontMd\">Normal</button>\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_font\" data-value=\"lg\" data-i18n=\"fontLg\">Grande</button>\n            </div>\n          </div>\n          <div class=\"settings-card\">\n            <label class=\"toggle-row\"><span data-i18n=\"compactSidebar\">Barra lateral compacta</span><input type=\"checkbox\" id=\"set-compact-sb\"></label>\n            <label class=\"toggle-row\"><span data-i18n=\"reduceMotion\">Reducir movimiento</span><input type=\"checkbox\" id=\"set-reduce-motion\"></label>\n          </div>\n        </div>\n\n        <div id=\"pane-behavior\" class=\"settings-pane\">\n          <div class=\"settings-section-title\" data-i18n=\"tabBehavior\">Comportamiento</div>\n          <p class=\"settings-section-desc\" data-i18n=\"behaviorDesc\">Cómo envía, busca y confirma el workspace.</p>\n          <div class=\"settings-card\">\n            <label class=\"toggle-row\"><span data-i18n=\"enterToSend\">Enter envía el mensaje</span><input type=\"checkbox\" id=\"set-enter-send\" checked></label>\n            <label class=\"toggle-row\"><span data-i18n=\"autoSearch\">Buscar en la web por defecto</span><input type=\"checkbox\" id=\"set-auto-search\"></label>\n            <label class=\"toggle-row\"><span data-i18n=\"showTimestamps\">Mostrar hora en los mensajes</span><input type=\"checkbox\" id=\"set-show-time\"></label>\n            <label class=\"toggle-row\"><span data-i18n=\"confirmDeleteChat\">Confirmar al borrar un chat</span><input type=\"checkbox\" id=\"set-confirm-del\" checked></label>\n            <label class=\"toggle-row\"><span data-i18n=\"autoRead\">Leer en voz alta las respuestas</span><input type=\"checkbox\" id=\"set-auto-read\"></label>\n          </div>\n          <p class=\"settings-hint\" data-i18n=\"autoReadHint\">Al terminar cada respuesta, el navegador la lee. También puedes pulsar el altavoz del compositor o «Escuchar» en cada mensaje.</p>\n        </div>\n\n        <div id=\"pane-customize\" class=\"settings-pane\">\n          <div class=\"settings-section-title\" data-i18n=\"tabCustomize\">Personalizar</div>\n          <p class=\"settings-section-desc\" data-i18n=\"customizeDesc\">Instrucciones propias y tono de respuesta.</p>\n          <div class=\"form-group\">\n            <label class=\"form-label\" data-i18n=\"toneLabel\">Tono</label>\n            <div class=\"choice-row\">\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_tone\" data-value=\"auto\" data-i18n=\"toneAuto\">Auto</button>\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_tone\" data-value=\"direct\" data-i18n=\"toneDirect\">Directo</button>\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_tone\" data-value=\"technical\" data-i18n=\"toneTechnical\">Técnico</button>\n              <button type=\"button\" class=\"choice-pill\" data-pref=\"ta_tone\" data-value=\"concise\" data-i18n=\"toneConcise\">Conciso</button>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"form-label\" data-i18n=\"systemPrompt\">Instrucción de sistema</label>\n            <textarea id=\"custom-system-prompt\" class=\"form-textarea\" placeholder=\"Cómo debe responder Personal AI…\"></textarea>\n          </div>\n          <div class=\"settings-card\">\n            <label class=\"toggle-row\"><span data-i18n=\"useDocsContext\">Usar documentos como memoria</span><input type=\"checkbox\" id=\"set-use-docs\" checked></label>\n          </div>\n          <p class=\"settings-hint\">語氣與自訂指示存在 D1，所有裝置共用。</p>\n        </div>\n\n        <div id=\"pane-memory\" class=\"settings-pane\">\n          <div class=\"settings-section-title\">長期記憶</div>\n          <p class=\"settings-section-desc\">模型可用 remember / forget / recall 工具管理記憶；你也可以在這裡新增、編輯或刪除。全域記憶會帶入每個對話，專案記憶只在該專案使用。</p>\n          <div class=\"settings-card\">\n            <label class=\"toggle-row\"><span>啟用長期記憶</span><input type=\"checkbox\" id=\"set-memory-enabled\" checked></label>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"form-label\" for=\"memory-new-input\">新增一則記憶</label>\n            <div style=\"display:flex;gap:6px\">\n              <input type=\"text\" id=\"memory-new-input\" class=\"form-input\" style=\"flex:1\" maxlength=\"500\" placeholder=\"例如：偏好用 TypeScript 回答程式問題\">\n              <select id=\"memory-new-scope\" class=\"form-input\" style=\"max-width:160px\"><option value=\"global\">全域</option></select>\n              <button type=\"button\" id=\"memory-add-btn\" class=\"topbar-action-btn primary\">新增</button>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label class=\"form-label\" for=\"memory-filter\">顯示</label>\n            <select id=\"memory-filter\" class=\"form-input\"><option value=\"\">全部</option><option value=\"global\">全域</option></select>\n          </div>\n          <div id=\"memory-list\" class=\"settings-card memory-list\"></div>\n          <p id=\"memory-status\" class=\"settings-hint\" role=\"status\"></p>\n        </div>\n\n        <div id=\"pane-skills\" class=\"settings-pane\">\n          <div class=\"settings-section-title\">技能</div>\n          <p class=\"settings-section-desc\">可重複使用的說明。系統提示只放技能的名稱與用途，模型需要時用 load_skill 載入全文；在輸入框打 <code>/名稱</code> 可強制使用。可匯入／匯出 SKILL.md（frontmatter：name、description、allowed-tools）。</p>\n          <div id=\"skill-list\" class=\"provider-list\"></div>\n          <div class=\"settings-actions\" style=\"display:flex;gap:6px;flex-wrap:wrap\">\n            <button type=\"button\" id=\"skill-new-btn\" class=\"topbar-action-btn\">新增技能</button>\n            <button type=\"button\" id=\"skill-import-btn\" class=\"topbar-action-btn\">匯入 SKILL.md</button>\n            <input type=\"file\" id=\"skill-import-file\" accept=\".md,text/markdown,text/plain\" hidden>\n          </div>\n          <div class=\"settings-card\" id=\"skill-form\" hidden>\n            <div class=\"settings-block-title\" id=\"skill-form-title\" style=\"margin-top:0\">新增技能</div>\n            <label class=\"form-label\" for=\"skill-name\">名稱（小寫英數與 -，用於 /名稱）</label>\n            <input id=\"skill-name\" class=\"form-input\" maxlength=\"40\" placeholder=\"weekly-report\">\n            <label class=\"form-label\" for=\"skill-desc\">何時使用（會放進系統提示）</label>\n            <input id=\"skill-desc\" class=\"form-input\" maxlength=\"1000\" placeholder=\"寫週報時使用：依固定格式整理本週進度\">\n            <label class=\"form-label\" for=\"skill-instr\">完整說明</label>\n            <textarea id=\"skill-instr\" class=\"form-textarea\" rows=\"8\" maxlength=\"50000\"></textarea>\n            <label class=\"form-label\" for=\"skill-tools\">允許的工具（逗號分隔，留空代表不限；用 /名稱 時只開放這些工具）</label>\n            <input id=\"skill-tools\" class=\"form-input\" placeholder=\"read_file, write_file\">\n            <label class=\"toggle-row\"><span>啟用</span><input type=\"checkbox\" id=\"skill-enabled\" checked></label>\n            <div class=\"form-label\">參考檔（文字，每個最多 100,000 字）</div>\n            <div id=\"skill-files\" class=\"memory-list\"></div>\n            <input type=\"file\" id=\"skill-file-input\" multiple hidden accept=\".md,.txt,.json,.csv,.yaml,.yml,text/*\">\n            <div class=\"settings-actions\" style=\"display:flex;gap:6px;flex-wrap:wrap\">\n              <button type=\"button\" id=\"skill-file-add\" class=\"topbar-action-btn\">加入參考檔</button>\n              <button type=\"button\" id=\"skill-save-btn\" class=\"topbar-action-btn primary\">儲存</button>\n              <button type=\"button\" id=\"skill-cancel-btn\" class=\"topbar-action-btn\">取消</button>\n            </div>\n          </div>\n          <p id=\"skill-status\" class=\"settings-hint\" role=\"status\"></p>\n        </div>\n\n        <div id=\"pane-mcp\" class=\"settings-pane\">\n          <div class=\"settings-section-title\">MCP 伺服器</div>\n          <p class=\"settings-section-desc\">只支援遠端 Streamable HTTP（不支援 stdio 與舊版 HTTP+SSE，尚不支援 OAuth）。最多 5 個伺服器、合計 40 個啟用工具。「測試連線」會初始化並快取工具清單；對話中不會重新列出。工具名稱為 <code>mcp__伺服器__工具</code>。</p>\n          <div id=\"mcp-list\" class=\"provider-list\"></div>\n          <div class=\"settings-card\" id=\"mcp-form\">\n            <div class=\"settings-block-title\" id=\"mcp-form-title\" style=\"margin-top:0\">新增 MCP 伺服器</div>\n            <label class=\"form-label\" for=\"mcp-name\">名稱（小寫英數、_、-，最多 20 字）</label>\n            <input id=\"mcp-name\" class=\"form-input\" maxlength=\"20\" placeholder=\"github\">\n            <label class=\"form-label\" for=\"mcp-url\">URL（HTTPS）</label>\n            <input id=\"mcp-url\" class=\"form-input\" type=\"url\" placeholder=\"https://example.com/mcp\">\n            <label class=\"form-label\" for=\"mcp-auth\">驗證方式</label>\n            <select id=\"mcp-auth\" class=\"form-input\"><option value=\"none\">無</option><option value=\"bearer\">Bearer token</option><option value=\"header\">自訂標頭</option></select>\n            <input id=\"mcp-header\" class=\"form-input\" placeholder=\"標頭名稱，例如 X-API-Key\" hidden>\n            <input id=\"mcp-token\" class=\"form-input\" type=\"password\" autocomplete=\"off\" placeholder=\"金鑰（加密存在 D1）\">\n            <div class=\"settings-actions\" style=\"display:flex;gap:6px;flex-wrap:wrap\">\n              <button type=\"button\" id=\"mcp-save-btn\" class=\"topbar-action-btn primary\">儲存</button>\n              <button type=\"button\" id=\"mcp-new-btn\" class=\"topbar-action-btn\">新增另一個</button>\n            </div>\n          </div>\n          <p id=\"mcp-status\" class=\"settings-hint\" role=\"status\"></p>\n        </div>\n\n        <div id=\"pane-params\" class=\"settings-pane\">\n          <div class=\"settings-section-title\">模型參數</div>\n          <p class=\"settings-section-desc\">全域預設值，專案可以個別覆寫。留空代表使用供應商預設。供應商不支援某個參數時，系統會自動移除該參數重試一次。</p>\n          <div class=\"settings-card params-grid\">\n            <label class=\"form-label\" for=\"param-temperature\">temperature（0–2）</label>\n            <input type=\"number\" id=\"param-temperature\" class=\"form-input\" min=\"0\" max=\"2\" step=\"0.05\" placeholder=\"供應商預設\">\n            <label class=\"form-label\" for=\"param-top-p\">top_p（0–1）</label>\n            <input type=\"number\" id=\"param-top-p\" class=\"form-input\" min=\"0\" max=\"1\" step=\"0.05\" placeholder=\"供應商預設\">\n            <label class=\"form-label\" for=\"param-max-tokens\">max_tokens</label>\n            <input type=\"number\" id=\"param-max-tokens\" class=\"form-input\" min=\"256\" max=\"65536\" step=\"256\" placeholder=\"8192\">\n            <label class=\"form-label\" for=\"param-reasoning\">reasoning_effort</label>\n            <select id=\"param-reasoning\" class=\"form-input\"><option value=\"\">不指定</option><option value=\"none\">none</option><option value=\"minimal\">minimal</option><option value=\"low\">low</option><option value=\"medium\">medium</option><option value=\"high\">high</option></select>\n            <label class=\"form-label\" for=\"param-max-steps\">最多代理步數（1–20）</label>\n            <input type=\"number\" id=\"param-max-steps\" class=\"form-input\" min=\"1\" max=\"20\" step=\"1\" placeholder=\"8\">\n          </div>\n          <div class=\"settings-actions\"><button type=\"button\" id=\"params-save-btn\" class=\"topbar-action-btn primary\">儲存參數</button></div>\n          <p id=\"params-status\" class=\"settings-hint\" role=\"status\"></p>\n          <p class=\"settings-hint\">每次請求最多 40 次外部連線（每次模型呼叫算 1 次，工具讀網頁時每次轉址都算）與約 40 次資料庫查詢；用完時模型會被要求直接作答。</p>\n        </div>\n\n        <div id=\"pane-search\" class=\"settings-pane\">\n          <div class=\"settings-section-title\">搜尋與網頁</div>\n          <p class=\"settings-section-desc\">金鑰以 AES-GCM 加密存在 D1，畫面上只顯示遮罩後的提示。</p>\n          <div class=\"settings-card\">\n            <div class=\"settings-kv\">\n              <div class=\"settings-kv-label\">Tavily API Key</div>\n              <div class=\"settings-kv-control\" style=\"display:flex;gap:6px\">\n                <input id=\"secret-tavily\" class=\"form-input\" type=\"password\" autocomplete=\"off\" placeholder=\"tvly-…\" style=\"flex:1\">\n                <button type=\"button\" class=\"topbar-action-btn\" data-secret-save=\"search:tavily\" data-secret-input=\"secret-tavily\">儲存</button>\n                <button type=\"button\" class=\"topbar-action-btn btn-danger\" data-secret-del=\"search:tavily\">刪除</button>\n              </div>\n            </div>\n            <p class=\"settings-hint\" id=\"secret-tavily-status\"></p>\n            <div class=\"settings-kv\">\n              <div class=\"settings-kv-label\">Jina API Key</div>\n              <div class=\"settings-kv-control\" style=\"display:flex;gap:6px\">\n                <input id=\"secret-jina\" class=\"form-input\" type=\"password\" autocomplete=\"off\" placeholder=\"jina_…\" style=\"flex:1\">\n                <button type=\"button\" class=\"topbar-action-btn\" data-secret-save=\"search:jina\" data-secret-input=\"secret-jina\">儲存</button>\n                <button type=\"button\" class=\"topbar-action-btn btn-danger\" data-secret-del=\"search:jina\">刪除</button>\n              </div>\n            </div>\n            <p class=\"settings-hint\" id=\"secret-jina-status\"></p>\n          </div>\n          <p class=\"settings-hint\" id=\"search-backend-hint\">設定 Tavily 金鑰後，模型才能使用 web_search。fetch_url（讀取網頁）不需要金鑰。</p>\n        </div>\n\n        <div id=\"pane-providers\" class=\"settings-pane\">\n          <div class=\"settings-section-title\">供應商與模型</div>\n          <p class=\"settings-section-desc\">連線到任何 OpenAI 相容的 <code>/chat/completions</code> 服務。API Key 加密後存在 D1，所有裝置共用，畫面上只顯示遮罩提示。</p>\n          <div id=\"provider-list\" class=\"provider-list\"></div>\n          <div class=\"settings-card\" id=\"provider-form\">\n            <div class=\"settings-block-title\" id=\"provider-form-title\" style=\"margin-top:0\">新增供應商</div>\n            <div class=\"settings-kv\">\n              <div class=\"settings-kv-label\">名稱</div>\n              <div class=\"settings-kv-control\"><input id=\"provider-name\" class=\"form-input\" type=\"text\" maxlength=\"60\" placeholder=\"例如 Groq、OpenRouter\"></div>\n            </div>\n            <div class=\"settings-kv\">\n              <div class=\"settings-kv-label\">Base URL</div>\n              <div class=\"settings-kv-control\"><input id=\"provider-base\" class=\"form-input\" type=\"url\" placeholder=\"https://api.groq.com/openai/v1\" autocomplete=\"off\"></div>\n            </div>\n            <div class=\"settings-kv\">\n              <div class=\"settings-kv-label\">API Key</div>\n              <div class=\"settings-kv-control\"><input id=\"provider-key\" class=\"form-input\" type=\"password\" placeholder=\"sk-…\" autocomplete=\"off\"></div>\n            </div>\n            <div class=\"settings-kv\">\n              <div class=\"settings-kv-label\">預設模型</div>\n              <div class=\"settings-kv-control\"><input id=\"provider-model\" class=\"form-input\" type=\"text\" list=\"provider-model-list\" placeholder=\"先按「抓取模型」或直接輸入\" autocomplete=\"off\"><datalist id=\"provider-model-list\"></datalist></div>\n            </div>\n            <div class=\"settings-actions\" style=\"display:flex;gap:6px;flex-wrap:wrap\">\n              <button type=\"button\" id=\"provider-models-btn\" class=\"topbar-action-btn\">測試連線並抓取模型</button>\n              <button type=\"button\" id=\"provider-save-btn\" class=\"topbar-action-btn primary\">儲存</button>\n              <button type=\"button\" id=\"provider-new-btn\" class=\"topbar-action-btn\">新增另一個</button>\n              <button type=\"button\" id=\"provider-delete-btn\" class=\"topbar-action-btn btn-danger\" hidden>刪除</button>\n            </div>\n            <p id=\"provider-status\" class=\"settings-hint\" style=\"min-height:18px\" role=\"status\"></p>\n          </div>\n          <p class=\"settings-hint\">只允許公開 HTTPS 位址；localhost、私有 IP、<code>.local</code>、<code>.internal</code> 會被拒絕。若出現「請重新輸入」，代表 AUTH_SECRET 已更換、舊金鑰無法解密。</p>\n        </div>\n\n        <div id=\"pane-data\" class=\"settings-pane\">\n          <div class=\"settings-section-title\" data-i18n=\"tabData\">資料控制</div>\n          <p class=\"settings-section-desc\">一般對話存在這個瀏覽器，並透過 D1 在裝置間同步；設定、金鑰、記憶與專案直接存在 D1。</p>\n          <div class=\"settings-card\">\n            <label class=\"toggle-row\"><span data-i18n=\"sessionOnly\">No guardar chats al cerrar</span><input type=\"checkbox\" id=\"set-ephemeral\"></label>\n          </div>\n          <p class=\"settings-hint\" data-i18n=\"sessionOnlyHint\">Si está activo, el historial no se escribe en localStorage.</p>\n          <div class=\"settings-card\">\n            <div class=\"settings-actions\" style=\"display:flex;gap:6px;flex-wrap:wrap\">\n              <button type=\"button\" id=\"btn-clear-chats\" class=\"topbar-action-btn\" data-i18n=\"clearChats\">Vaciar historial de chats</button>\n              <button type=\"button\" id=\"btn-clear-docs\" class=\"topbar-action-btn\" data-i18n=\"empty\">Vaciar documentos</button>\n              <button type=\"button\" id=\"sync-now-btn\" class=\"topbar-action-btn\">立即同步</button>\n            </div>\n            <p id=\"sync-status\" class=\"settings-hint\" style=\"min-height:18px\" role=\"status\">同步尚未啟動</p>\n          </div>\n          <div class=\"settings-block-title\">危險區域</div>\n          <div class=\"settings-card danger-card\">\n            <p class=\"settings-kv-sub\">清除所有資料：刪除 D1 中的對話同步、設定、加密金鑰、供應商、記憶與專案，以及這個瀏覽器的本機資料。變更過的登入密碼會保留。此動作無法復原。</p>\n            <div class=\"settings-actions\"><button type=\"button\" id=\"btn-clear-all\" class=\"topbar-action-btn btn-danger\">清除所有資料…</button></div>\n            <p id=\"clear-all-status\" class=\"settings-hint\" role=\"status\"></p>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class=\"modal-footer\">\n      <span id=\"settings-status\" class=\"settings-status\"></span>\n      <button class=\"settings-foot-btn\" data-modal=\"modal-settings\" type=\"button\" data-i18n=\"cancel\">Cancelar</button>\n      <button id=\"save-settings-btn\" class=\"settings-foot-btn primary\" type=\"button\" data-i18n=\"save\">Guardar</button>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal-backdrop\" id=\"modal-knowledge\">\n  <div class=\"modal-card\">\n    <div class=\"modal-header\"><div class=\"modal-title\">新增文件</div><button class=\"modal-close-btn\" data-modal=\"modal-knowledge\" type=\"button\">✕</button></div>\n    <div class=\"modal-body\">\n      <div class=\"form-group\">\n        <label class=\"form-label\">標題</label>\n        <input type=\"text\" id=\"train-title\" class=\"form-input\" placeholder=\"規格、筆記、規則…\">\n      </div>\n      <div class=\"form-group\">\n        <label class=\"form-label\">內容</label>\n        <textarea id=\"train-content\" class=\"form-textarea\" placeholder=\"貼上文字…\"></textarea>\n      </div>\n      <div style=\"display:flex;justify-content:space-between;align-items:center\">\n        <input type=\"file\" id=\"import-rag-file\" style=\"display:none\" multiple accept=\".txt,.md,.json\">\n        <button type=\"button\" id=\"import-docs-btn\" class=\"topbar-action-btn\">匯入檔案</button>\n        <button id=\"save-knowledge-btn\" class=\"topbar-action-btn primary\" type=\"button\">儲存</button>\n      </div>\n      <div>\n        <div style=\"display:flex;justify-content:space-between;margin-bottom:8px\">\n          <span class=\"form-label\">已啟用（<span id=\"knowledge-count\">0</span>/20）</span>\n          <button id=\"clear-rag-btn\" type=\"button\" style=\"background:none;border:none;color:var(--red);font-size:0.72rem;cursor:pointer\">清空</button>\n        </div>\n        <div id=\"knowledge-list-box\"></div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"cmd-overlay\" id=\"cmd-overlay\" role=\"dialog\" aria-label=\"命令面板\">\n  <div class=\"cmd-box\">\n    <input id=\"cmd-input\" type=\"search\" autocomplete=\"off\" placeholder=\"Ir a un comando…\" data-i18n=\"palettePh\" data-i18n-attr=\"placeholder\">\n    <div id=\"cmd-list\"></div>\n  </div>\n</div>\n\n</div>";


  var currentChatId = Date.now().toString();
  var chats = {};
  try {
    var raw = localStorage.getItem('ta_ai_chats');
    if (raw) chats = JSON.parse(raw);
    if (!chats || typeof chats !== 'object' || Array.isArray(chats)) chats = {};
  } catch(e) { chats = {}; }

  var isGenerating = false;
  var isWebSearch = localStorage.getItem('ta_auto_search') === '1';
  var isImageMode = false;
  var currentLength = localStorage.getItem('ta_len_mode') || 'normal';
  var attachedFile = null;
  var currentUser = { name: 'Owner' };
  var authToken = 'cookie';
  var knowledge = [];
  try {
    var rawK = localStorage.getItem('ta_knowledge');
    if (rawK) knowledge = JSON.parse(rawK);
    if (!Array.isArray(knowledge)) knowledge = [];
  } catch(e) { knowledge = []; }
  var documents = [];
  try {
    var rawD = localStorage.getItem('ta_documents');
    if (rawD) documents = JSON.parse(rawD);
    if (!Array.isArray(documents)) documents = [];
  } catch(e) { documents = []; }
  if (!documents.length && knowledge.length) {
    documents = knowledge.map(function(k, i) {
      return { id: 'doc_mig_' + i, title: k.title || '筆記', content: k.content || '', type: 'note', created: Date.now(), projectId: null };
    });
  }

  var sidebarView = 'chats';
  var abortCtl = null;
  // ---- Server data layer (D1): providers, models, settings, memory -------------
  // Everything here is the source of truth in D1. API keys never come back to
  // the browser; only masked previews do.
  var server = { loaded: false, d1: null, settings: null, secrets: {}, providers: [], memories: [] };
  var selectedProviderId = '';
  var selectedModel = '';
  var MODELS = [];
  function apiJson(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', credentials: 'same-origin', headers: {} };
    if (opts.body !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opts.body); }
    if (opts.signal) init.signal = opts.signal;
    return fetch(path, init).then(function(r) {
      if (r.status === 401) { location.href = '/login'; throw new Error('請先登入'); }
      return r.json().catch(function() { return {}; }).then(function(d) {
        if (!r.ok || (d && d.ok === false)) {
          var e = new Error((d && d.error) || ('HTTP ' + r.status));
          e.code = d && d.code; e.status = r.status;
          throw e;
        }
        return d;
      });
    });
  }
  function providerById(id) {
    for (var i = 0; i < server.providers.length; i++) if (server.providers[i].id === id) return server.providers[i];
    return null;
  }
  function activeProvider() {
    return providerById(selectedProviderId) || server.providers[0] || null;
  }
  function modelKey(pid, model) { return pid + '\u0001' + model; }
  function rebuildModels() {
    MODELS = [];
    var seen = {};
    function add(p, m, desc) {
      if (!m) return;
      var key = modelKey(p.id, m);
      if (seen[key]) return;
      seen[key] = true;
      MODELS.push({ id: key, providerId: p.id, model: m, name: m, desc: desc || p.name });
    }
    var active = activeProvider();
    if (active) {
      add(active, selectedModel, active.name);
      add(active, active.default_model, active.name);
      (active.models || []).slice(0, 80).forEach(function(m) { add(active, m, active.name); });
    }
    server.providers.forEach(function(p) { if (!active || p.id !== active.id) add(p, p.default_model || (p.models || [])[0], p.name); });
  }
  function applyActiveFromSettings() {
    var act = (server.settings && server.settings.active) || {};
    var p = providerById(act.provider_id) || server.providers[0] || null;
    selectedProviderId = p ? p.id : '';
    selectedModel = p ? ((act.provider_id === p.id && act.model) || p.default_model || (p.models || [])[0] || '') : '';
    rebuildModels();
    renderModelPicker();
    updateNoProviderBanner();
  }
  function updateNoProviderBanner() {
    var box = document.getElementById('setup-banner');
    if (!box) return;
    var msg = '';
    if (server.d1 && !server.d1.ok) msg = '資料庫未就緒：' + (server.d1.error || 'D1 未綁定') + '。請依 README 綁定 D1（binding: DB）後重新部署。';
    else if (server.loaded && !server.providers.length) msg = '尚未設定模型供應商。';
    box.hidden = !msg;
    if (!msg) { box.innerHTML = ''; return; }
    box.innerHTML = '<span>' + escapeHtml(msg) + '</span>' + (server.d1 && !server.d1.ok ? '' : ' <button type="button" class="topbar-action-btn primary" data-open-settings="pane-providers">前往設定</button>');
  }
  function persistActive() {
    if (!server.loaded) return Promise.resolve();
    return apiJson('/api/settings', { method: 'PUT', body: { active: { provider_id: selectedProviderId, model: selectedModel } } })
      .then(function(d) { server.settings = d.settings; })
      .catch(function(e) { console.warn('save active model failed', e); });
  }
  function loadServerState() {
    return Promise.all([apiJson('/api/settings'), apiJson('/api/providers')]).then(function(res) {
      server.settings = res[0].settings;
      server.secrets = res[0].secrets || {};
      server.providers = res[1].providers || [];
      server.loaded = true;
      applyActiveFromSettings();
      renderProviderList();
      if (window.PAI_onServerState) try { window.PAI_onServerState(); } catch (e) {}
      return migrateLocalData();
    }).catch(function(e) {
      setProviderStatus(e.message || '讀取設定失敗', true);
      updateNoProviderBanner();
    });
  }
  // One-time move of data the old version kept in this browser into D1.
  function migrateLocalData() {
    var jobs = [];
    var oldProviders = [];
    try { oldProviders = JSON.parse(localStorage.getItem('ta_providers_v1') || '[]') || []; } catch (e) {}
    if (Array.isArray(oldProviders) && oldProviders.length) {
      oldProviders.filter(function(p) { return p && p.baseUrl && p.apiKey; }).slice(0, 10).forEach(function(p) {
        var dup = server.providers.some(function(sp) { return sp.base_url === String(p.baseUrl).replace(/\/+$/, ''); });
        if (dup) return;
        jobs.push(apiJson('/api/providers', { method: 'POST', body: { name: p.name || '供應商', base_url: p.baseUrl, api_key: p.apiKey, default_model: p.model || '' } }).catch(function() {}));
      });
    }
    var profile = null;
    try { profile = JSON.parse(localStorage.getItem('ta_profile') || 'null'); } catch (e) {}
    var notes = profile && Array.isArray(profile.notes) ? profile.notes.map(function(n) { return n && (n.fact || n.text); }).filter(Boolean) : [];
    if (notes.length) jobs.push(apiJson('/api/memory', { method: 'POST', body: { items: notes.slice(-20).map(function(n) { return { scope: 'global', content: String(n).slice(0, 500) }; }) } }).catch(function() {}));
    var oldPrompt = localStorage.getItem('ta_custom_prompt') || '';
    var oldTone = localStorage.getItem('ta_tone') || '';
    var prefs = (server.settings && server.settings.prefs) || {};
    if ((oldPrompt || oldTone) && !prefs.custom_prompt && !prefs.tone) {
      jobs.push(apiJson('/api/settings', { method: 'PUT', body: { prefs: { custom_prompt: oldPrompt, tone: oldTone } } }).then(function(d) { server.settings = d.settings; }).catch(function() {}));
    }
    if (!jobs.length) return Promise.resolve();
    return Promise.all(jobs).then(function() {
      try {
        localStorage.removeItem('ta_providers_v1');
        localStorage.removeItem('ta_provider_active');
        localStorage.removeItem('ta_profile');
        localStorage.removeItem('ta_custom_prompt');
        localStorage.removeItem('ta_tone');
      } catch (e) {}
      return apiJson('/api/providers').then(function(d) { server.providers = d.providers || []; applyActiveFromSettings(); renderProviderList(); });
    });
  }

  // ---- Provider settings pane ----
  var editingProviderId = '';
  function providerFormValues() {
    var get = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    return { name: get('provider-name'), base_url: get('provider-base'), api_key: get('provider-key'), default_model: get('provider-model') };
  }
  function setProviderStatus(text, bad) {
    var el = document.getElementById('provider-status');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = bad ? 'var(--red)' : 'var(--green)';
  }
  function fillModelDatalist(models) {
    var list = document.getElementById('provider-model-list');
    if (!list) return;
    list.innerHTML = '';
    (models || []).slice(0, 500).forEach(function(m) { var o = document.createElement('option'); o.value = m; list.appendChild(o); });
  }
  function loadProviderForm(id) {
    var p = id ? providerById(id) : null;
    editingProviderId = p ? p.id : '';
    var set = function(elId, value) { var el = document.getElementById(elId); if (el) el.value = value || ''; };
    set('provider-name', p ? p.name : '');
    set('provider-base', p ? p.base_url : '');
    set('provider-key', '');
    set('provider-model', p ? p.default_model : '');
    var keyEl = document.getElementById('provider-key');
    if (keyEl) keyEl.placeholder = p && p.key && p.key.set ? ('已儲存 ' + p.key.preview + '（留空保留）') : 'sk-…';
    fillModelDatalist(p ? p.models : []);
    var title = document.getElementById('provider-form-title');
    if (title) title.textContent = p ? ('編輯：' + p.name) : '新增供應商';
    var del = document.getElementById('provider-delete-btn');
    if (del) del.hidden = !p;
    setProviderStatus('', false);
  }
  function renderProviderList() {
    var box = document.getElementById('provider-list');
    if (!box) return;
    box.innerHTML = '';
    if (!server.providers.length) {
      var empty = document.createElement('p');
      empty.className = 'settings-hint';
      empty.textContent = '尚未新增供應商。新增後即可開始對話。';
      box.appendChild(empty);
    }
    server.providers.forEach(function(p) {
      var row = document.createElement('div');
      row.className = 'provider-row' + (p.id === selectedProviderId ? ' active' : '') + (p.id === editingProviderId ? ' editing' : '');
      var main = document.createElement('button');
      main.type = 'button';
      main.className = 'provider-row-main';
      var name = document.createElement('strong'); name.textContent = p.name;
      var meta = document.createElement('span'); meta.className = 'settings-hint';
      meta.textContent = p.base_url + ' · ' + (p.default_model || '未選模型') + ' · ' + (p.key && p.key.set ? ('金鑰 ' + p.key.preview) : '未設定金鑰');
      main.appendChild(name); main.appendChild(meta);
      main.onclick = function() { loadProviderForm(p.id); renderProviderList(); };
      var use = document.createElement('button');
      use.type = 'button';
      use.className = 'topbar-action-btn' + (p.id === selectedProviderId ? ' primary' : '');
      use.textContent = p.id === selectedProviderId ? '使用中' : '設為使用中';
      use.onclick = function() { selectedProviderId = p.id; selectedModel = p.default_model || (p.models || [])[0] || ''; rebuildModels(); renderModelPicker(); persistActive(); renderProviderList(); };
      row.appendChild(main); row.appendChild(use);
      box.appendChild(row);
    });
  }
  function saveProvider() {
    var v = providerFormValues();
    if (!v.name) v.name = '供應商';
    if (!/^https:\/\//i.test(v.base_url)) { setProviderStatus('Base URL 必須是 HTTPS', true); return; }
    if (!editingProviderId && v.api_key.length < 8) { setProviderStatus('請填寫有效的 API Key', true); return; }
    if (!v.default_model) { setProviderStatus('請填寫或抓取模型 ID', true); return; }
    var body = { name: v.name, base_url: v.base_url, default_model: v.default_model };
    if (v.api_key) body.api_key = v.api_key;
    setProviderStatus('儲存中…', false);
    var req = editingProviderId
      ? apiJson('/api/providers/' + encodeURIComponent(editingProviderId), { method: 'PUT', body: body })
      : apiJson('/api/providers', { method: 'POST', body: body });
    req.then(function(d) {
      server.providers = d.providers || [];
      var wasEmpty = !selectedProviderId;
      editingProviderId = d.id || editingProviderId;
      if (wasEmpty || editingProviderId === selectedProviderId) {
        selectedProviderId = editingProviderId;
        selectedModel = v.default_model;
        persistActive();
      }
      rebuildModels(); renderModelPicker(); renderProviderList(); updateNoProviderBanner();
      loadProviderForm(editingProviderId);
      setProviderStatus('已儲存：' + v.name, false);
    }).catch(function(e) { setProviderStatus(e.message || '儲存失敗', true); });
  }
  function deleteProvider() {
    if (!editingProviderId) return;
    var p = providerById(editingProviderId);
    if (!confirm('刪除供應商「' + (p ? p.name : '') + '」與它的加密金鑰？')) return;
    apiJson('/api/providers/' + encodeURIComponent(editingProviderId), { method: 'DELETE' }).then(function(d) {
      server.providers = d.providers || [];
      if (selectedProviderId === editingProviderId) { selectedProviderId = ''; applyActiveFromSettings(); persistActive(); }
      loadProviderForm('');
      rebuildModels(); renderModelPicker(); renderProviderList(); updateNoProviderBanner();
      setProviderStatus('已刪除', false);
    }).catch(function(e) { setProviderStatus(e.message || '刪除失敗', true); });
  }
  function fetchProviderModels() {
    var v = providerFormValues();
    var body = editingProviderId ? { id: editingProviderId } : {};
    if (v.base_url) body.base_url = v.base_url;
    if (v.api_key) body.api_key = v.api_key;
    if (!editingProviderId && (!v.base_url || !v.api_key)) { setProviderStatus('請先填寫 Base URL 與 API Key', true); return; }
    setProviderStatus('正在連線…', false);
    apiJson('/api/providers/models', { method: 'POST', body: body }).then(function(d) {
      var models = Array.isArray(d.models) ? d.models : [];
      fillModelDatalist(models);
      var input = document.getElementById('provider-model');
      if (input && !input.value && models.length) input.value = models[0];
      var p = providerById(editingProviderId);
      if (p) { p.models = models; rebuildModels(); renderModelPicker(); }
      setProviderStatus('連線成功，取得 ' + models.length + ' 個模型', false);
    }).catch(function(e) {
      setProviderStatus(e.code === 'secret_undecryptable' ? '舊金鑰無法解密（AUTH_SECRET 已更換），請重新輸入 API Key' : (e.message || '連線失敗'), true);
    });
  }
  function initProviderUI() {
    var bind = function(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    bind('provider-new-btn', function() { loadProviderForm(''); renderProviderList(); });
    bind('provider-save-btn', saveProvider);
    bind('provider-delete-btn', deleteProvider);
    bind('provider-models-btn', fetchProviderModels);
    loadProviderForm('');
  }
  // ---- Cross-device sync for main chats, documents and UI prefs ----------------
  // The cursor is the server's sequence number (never this device's clock), so
  // a device whose clock is behind is not skipped. Pushes go in small chunks
  // to stay inside the Worker's per-request D1 and body limits.
  var SYNC_META_KEY = 'ta_sync_meta_v2';
  var SYNC_SETTINGS = [['prompt','favs','ta_prompt_favs'],['prompt','recent','ta_prompt_recent'],['setting','len_mode','ta_len_mode'],['setting','auto_search','ta_auto_search'],['setting','use_docs','ta_use_docs']];
  var syncMeta = { enabled: false, cursor: 0, known: { chat: [], doc: [] }, sent: {}, values: {}, timer: 0, applying: false, busy: false };
  try {
    localStorage.removeItem('ta_sync_meta_v1');
    var savedSync = JSON.parse(localStorage.getItem(SYNC_META_KEY) || '{}');
    if (savedSync && typeof savedSync === 'object') {
      syncMeta.cursor = Number(savedSync.cursor) || 0;
      syncMeta.sent = savedSync.sent && typeof savedSync.sent === 'object' ? savedSync.sent : {};
      syncMeta.values = savedSync.values && typeof savedSync.values === 'object' ? savedSync.values : {};
      if (savedSync.known && typeof savedSync.known === 'object') {
        ['chat','doc'].forEach(function(k) { syncMeta.known[k] = Array.isArray(savedSync.known[k]) ? savedSync.known[k] : []; });
      }
    }
  } catch(eSync) {}
  function saveSyncMeta() {
    try { localStorage.setItem(SYNC_META_KEY, JSON.stringify({ cursor: syncMeta.cursor, known: syncMeta.known, sent: syncMeta.sent, values: syncMeta.values })); } catch(e) {}
  }
  function setSyncStatus(text, bad) {
    var el = document.getElementById('sync-status');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = bad ? 'var(--red)' : 'var(--muted)';
  }
  function syncJson(value) {
    try { return JSON.stringify(value); } catch(e) { return ''; }
  }
  function collectSyncChanges(force) {
    var changes = [];
    var present = { chat: {}, doc: {} };
    var now = Date.now();
    function add(key, value, at) {
      if (!force && syncMeta.sent[key] && Number(syncMeta.sent[key]) >= at) return;
      changes.push({ key: key, value: value, updatedAt: at, deleted: false });
    }
    Object.keys(chats).forEach(function(id) {
      var c = chats[id];
      if (!c || c.ephemeral || !/^[A-Za-z0-9_-]{1,100}$/.test(id)) return;
      present.chat[id] = true;
      add('chat:' + id, syncJson(c), Number(c.updatedAt || c.at || id) || now);
    });
    documents.forEach(function(d) {
      if (!d || !d.id || !/^[A-Za-z0-9_-]{1,100}$/.test(d.id)) return;
      present.doc[d.id] = true;
      add('doc:' + d.id, syncJson(d), Number(d.updatedAt || d.created || now) || now);
    });
    SYNC_SETTINGS.forEach(function(row) {
      var key = row[0] + ':' + row[1];
      var value = '';
      try { value = localStorage.getItem(row[2]) || ''; } catch(e) {}
      if (!force && syncMeta.values[key] === value) return;
      changes.push({ key: key, value: value, updatedAt: now, deleted: false });
    });
    ['chat','doc'].forEach(function(type) {
      (syncMeta.known[type] || []).forEach(function(id) {
        if (present[type][id]) return;
        changes.push({ key: type + ':' + id, value: '', updatedAt: now, deleted: true });
      });
    });
    return changes;
  }
  function applySyncItem(item, touched) {
    var key = String(item.key || '');
    var cut = key.indexOf(':');
    var type = key.slice(0, cut), id = key.slice(cut + 1);
    if (!id) return;
    if (item.deleted) {
      if (type === 'chat' && chats[id]) { delete chats[id]; touched.chats = true; }
      if (type === 'doc') { var nd = documents.filter(function(d) { return d.id !== id; }); if (nd.length !== documents.length) { documents = nd; touched.docs = true; } }
    } else if (type === 'chat') {
      try {
        var chat = JSON.parse(item.value);
        if (chat && typeof chat === 'object' && (!chats[id] || Number(item.updatedAt) >= Number(chats[id].updatedAt || 0))) { chats[id] = chat; touched.chats = true; }
      } catch(e) {}
    } else if (type === 'doc') {
      try {
        var doc = JSON.parse(item.value);
        if (!doc || typeof doc !== 'object') return;
        var found = false;
        for (var i = 0; i < documents.length; i++) if (documents[i].id === id) { found = true; if (Number(item.updatedAt) >= Number(documents[i].updatedAt || 0)) { documents[i] = doc; touched.docs = true; } break; }
        if (!found) { documents.push(doc); touched.docs = true; }
      } catch(e) {}
    } else if (type === 'prompt') {
      var pkey = id === 'favs' ? 'ta_prompt_favs' : id === 'recent' ? 'ta_prompt_recent' : '';
      if (pkey) { try { localStorage.setItem(pkey, item.value || '[]'); } catch(e) {} }
    } else if (type === 'setting') {
      var skey = { len_mode: 'ta_len_mode', auto_search: 'ta_auto_search', use_docs: 'ta_use_docs' }[id];
      if (skey) { try { localStorage.setItem(skey, item.value || ''); syncMeta.values[key] = item.value || ''; } catch(e) {} }
    }
    syncMeta.sent[key] = Number(item.updatedAt) || 0;
  }
  async function pullSync() {
    if (!syncMeta.enabled || syncMeta.busy) return false;
    syncMeta.busy = true;
    var total = 0;
    var touched = { chats: false, docs: false };
    try {
      for (var page = 0; page < 20; page++) {
        var data = await apiJson('/api/sync?since=' + encodeURIComponent(String(syncMeta.cursor || 0)) + '&limit=200');
        var items = Array.isArray(data.items) ? data.items : [];
        syncMeta.applying = true;
        items.forEach(function(item) { applySyncItem(item, touched); });
        syncMeta.applying = false;
        total += items.length;
        syncMeta.cursor = Math.max(syncMeta.cursor || 0, Number(data.cursor) || 0);
        if (!data.more) break;
      }
      syncMeta.applying = true;
      if (touched.chats) { saveChats(); renderSidebar(); if (chats[currentChatId]) loadChatView(); }
      if (touched.docs) { saveDocuments(); renderSidebar(); }
      syncMeta.applying = false;
      saveSyncMeta();
      setSyncStatus(total ? ('已同步 ' + total + ' 項') : '已同步', false);
      return true;
    } catch(e) {
      setSyncStatus('同步失敗：' + (e && e.message ? e.message : '網路錯誤'), true);
      return false;
    } finally {
      syncMeta.busy = false;
      syncMeta.applying = false;
    }
  }
  async function pushSync(force) {
    if (!syncMeta.enabled || syncMeta.busy) return false;
    var changes = collectSyncChanges(!!force);
    if (!changes.length) { setSyncStatus('已同步', false); return true; }
    syncMeta.busy = true;
    try {
      // Chunks of at most 40 items and ~1.5 MB per request.
      var chunk = [], size = 0;
      var flush = async function() {
        if (!chunk.length) return;
        await apiJson('/api/sync', { method: 'POST', body: { changes: chunk } });
        chunk.forEach(function(ch) {
          if (!ch.deleted) { syncMeta.sent[ch.key] = ch.updatedAt; syncMeta.values[ch.key] = ch.value; }
        });
        chunk = []; size = 0;
      };
      for (var i = 0; i < changes.length; i++) {
        var len = (changes[i].value || '').length;
        if (len > 900000) continue;
        if (chunk.length >= 40 || size + len > 1500000) await flush();
        chunk.push(changes[i]); size += len;
      }
      await flush();
      var present = { chat: Object.keys(chats).filter(function(id) { return chats[id] && !chats[id].ephemeral; }), doc: documents.filter(function(d) { return d && d.id; }).map(function(d) { return d.id; }) };
      syncMeta.known = present;
      saveSyncMeta();
      setSyncStatus('已同步 ' + changes.length + ' 項', false);
      return true;
    } catch(e) {
      setSyncStatus('同步失敗：' + (e && e.message ? e.message : '網路錯誤'), true);
      return false;
    } finally {
      syncMeta.busy = false;
    }
  }
  function scheduleSync() {
    if (!syncMeta.enabled || syncMeta.applying) return;
    clearTimeout(syncMeta.timer);
    syncMeta.timer = setTimeout(function() { pushSync(false); }, 1800);
  }
  async function syncBootstrap() {
    if (!syncMeta.enabled) { setSyncStatus('D1 未就緒，同步停用', true); return; }
    await pullSync();
    await pushSync(false);
  }
  function syncNow() {
    if (!syncMeta.enabled) { setSyncStatus('D1 未就緒，同步停用', true); return; }
    setSyncStatus('同步中…', false);
    pullSync().then(function() { return pushSync(true); });
  }

  function t(k) { return (window.TA && TA.t) ? TA.t(k) : k; }
  var THEME_COLORS = { dark: '#000000', gray: '#18181b', dim: '#0d1117', navy: '#0b1220', light: '#f4f4f5', paper: '#f4efe6', hacker: '#000000', cyberpunk: '#0d021a', sunset: '#1f101d', ocean: '#061325', forest: '#07130e', rose: '#fff1f2', lavender: '#f8f6fc' };
  var ACCENT_OK = { 'auto': 1, '#38bdf8': 1, '#a1a1aa': 1, '#34d399': 1, '#2dd4bf': 1, '#818cf8': 1, '#a78bfa': 1, '#f59e0b': 1, '#fb7185': 1 };
  function applyAppearance() {
    var theme = localStorage.getItem('ta_theme') || 'dark';
    var resolved = theme;
    if (theme === 'system') {
      resolved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    if (!THEME_COLORS[resolved]) resolved = 'dark';
    var accent = localStorage.getItem('ta_accent') || 'auto';
    if (!ACCENT_OK[accent]) accent = 'auto';
    document.documentElement.setAttribute('data-theme', resolved);
    if (accent === 'auto') document.documentElement.style.removeProperty('--blue');
    else document.documentElement.style.setProperty('--blue', accent);
    document.documentElement.setAttribute('data-font', localStorage.getItem('ta_font') || 'md');
    document.documentElement.classList.toggle('compact-sb', localStorage.getItem('ta_compact_sb') === '1');
    document.documentElement.classList.toggle('reduce-motion', localStorage.getItem('ta_reduce_motion') === '1');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[resolved] || '#000000');
  }
  applyAppearance();
  if (window.matchMedia) {
    try { window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyAppearance); } catch (e) {}
  }
  if (localStorage.getItem('ta_ephemeral') === '1') chats = {};
  var SEND_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  var STOP_ICON = '<svg width="14" height="14" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>';
  var currentArtifact = null;
  var artPreviewTimer = 0;
  var artifactDest = 'artifact';
  var shareReadOnly = false;
  var showArchived = false;

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function parseMarkdownFull(src) {
    if (!src) return '';
    var text = src;
    var codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, function(match, lang, code) {
      var placeholder = '§§CODEBLOCK_' + codeBlocks.length + '§§';
      var safeLang = lang.trim() || 'code';
      var html = '<div class="code-block-box"><div class="code-block-header"><span>' + escapeHtml(safeLang) + '</span>' +
        '<button class="code-copy-btn" data-code="' + encodeURIComponent(code) + '">複製</button></div>' +
        '<pre class="code-block-pre"><code>' + escapeHtml(code) + '</code></pre></div>';
      codeBlocks.push(html);
      return placeholder;
    });
    text = escapeHtml(text);
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, url) {
      return '<div class="ai-image-card"><img src="' + url + '" alt="' + alt + '" class="ai-image-img" data-img-url="' + url + '" loading="lazy">' +
        '<div class="ai-image-footer"><span style="font-size:0.75rem;font-weight:600">' + alt + '</span>' +
        '<a href="' + url + '" target="_blank" download="personal-ai-visual.jpg" class="topbar-action-btn" style="text-decoration:none;padding:3px 8px;font-size:0.7rem">下載</a></div></div>';
    });
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--blue);text-decoration:none">$1</a>');
    var lines = text.split(/\r?\n/);
    var inTable = false; var tableRows = []; var newLines = [];
    function buildHtmlTable(rows) {
      if (!rows.length) return '';
      var hasSep = rows.some(function(r) { return r.type === 'sep'; });
      var html = '<div class="table-wrapper"><table class="ta-table">';
      var headerDone = false; var tbodyOpen = false;
      for (var r = 0; r < rows.length; r++) {
        var item = rows[r];
        if (item.type === 'sep') { headerDone = true; continue; }
        if (!headerDone && hasSep && r === 0) {
          html += '<thead><tr>';
          for (var c = 0; c < item.cells.length; c++) html += '<th>' + item.cells[c] + '</th>';
          html += '</tr></thead>';
        } else {
          if (!tbodyOpen) { html += '<tbody>'; tbodyOpen = true; }
          html += '<tr>';
          for (var c2 = 0; c2 < item.cells.length; c2++) html += '<td>' + item.cells[c2] + '</td>';
          html += '</tr>';
        }
      }
      if (tbodyOpen) html += '</tbody>';
      return html + '</table></div>';
    }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) inTable = true;
        if (/^\|(\s*[-:]+[-| :]*)\|$/.test(line)) tableRows.push({ type: 'sep' });
        else tableRows.push({ type: 'row', cells: line.slice(1, -1).split('|').map(function(c) { return c.trim(); }) });
      } else {
        if (inTable) { newLines.push(buildHtmlTable(tableRows)); tableRows = []; inTable = false; }
        newLines.push(lines[i]);
      }
    }
    if (inTable) newLines.push(buildHtmlTable(tableRows));
    text = newLines.join('\n');
    text = text.replace(/(?:^|\n)(?:&gt;|>)\s*([\s\S]*?)(?=\n\n|\n(?!&gt;|>)|$)/g, function(match, quoteContent) {
      return '\n<blockquote class="ta-blockquote">' + quoteContent.replace(/^(?:&gt;|>)\s?/gm, '') + '</blockquote>\n';
    });
    text = text.replace(/^(?:---|___|\*\*\*)\s*$/gm, '<hr class="ta-hr">');
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>').replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^# (.*$)/gim, '<h1>$1</h1>');
    text = text.replace(/`([^`]+)`/g, '<code class="ta-inline-code">$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    text = text.replace(/(?:^|\n)[-•*]\s+([\s\S]*?)(?=\n\n|\n[^-•*\s]|$)/g, function(match) {
      var items = match.trim().split(/\n[-•*]\s+/);
      var listHtml = '<ul class="ta-ul">';
      for (var k = 0; k < items.length; k++) {
        var it = items[k].replace(/^[-•*]\s+/, '').trim();
        if (it) listHtml += '<li>' + it + '</li>';
      }
      return '\n' + listHtml + '</ul>\n';
    });
    text = text.replace(/(?:^|\n)\d+\.\s+([\s\S]*?)(?=\n\n|\n(?!\d+\.)|$)/g, function(match) {
      var items = match.trim().split(/\n\d+\.\s+/);
      var listHtml = '<ol class="ta-ol">';
      for (var k = 0; k < items.length; k++) {
        var it = items[k].replace(/^\d+\.\s+/, '').trim();
        if (it) listHtml += '<li>' + it + '</li>';
      }
      return '\n' + listHtml + '</ol>\n';
    });
    var blocks = text.split(/\n{2,}/);
    text = blocks.map(function(b) {
      var trimmed = b.trim();
      if (!trimmed) return '';
      if (/^<(div|table|blockquote|ul|ol|h[1-6]|hr|pre)/i.test(trimmed) || /^§§CODEBLOCK_\d+§§$/.test(trimmed)) return trimmed;
      return '<p>' + trimmed.replace(/\n/g, '<br>') + '</p>';
    }).join('\n\n');
    for (var c = 0; c < codeBlocks.length; c++) text = text.replace('§§CODEBLOCK_' + c + '§§', codeBlocks[c]);
    return text;
  }

  // Allowlist HTML sanitizer for model/shared content rendered with innerHTML.
  var SAFE_TAGS = { A:1, ABBR:1, B:1, BLOCKQUOTE:1, BR:1, BUTTON:1, CODE:1, DEL:1, DETAILS:1, DIV:1, EM:1, H1:1, H2:1, H3:1, H4:1, H5:1, H6:1, HR:1, I:1, IMG:1, INPUT:1, KBD:1, LI:1, MARK:1, OL:1, P:1, PRE:1, S:1, SMALL:1, SPAN:1, STRONG:1, SUB:1, SUMMARY:1, SUP:1, TABLE:1, TBODY:1, TD:1, TFOOT:1, TH:1, THEAD:1, TR:1, U:1, UL:1 };
  var DROP_TAGS = { SCRIPT:1, STYLE:1, IFRAME:1, OBJECT:1, EMBED:1, LINK:1, META:1, BASE:1, FORM:1, TEXTAREA:1, SELECT:1, SVG:1, MATH:1, TEMPLATE:1, NOSCRIPT:1, FRAME:1, FRAMESET:1, AUDIO:1, VIDEO:1, SOURCE:1, PORTAL:1 };
  var SAFE_ATTRS = { href:1, src:1, alt:1, title:1, 'class':1, style:1, target:1, rel:1, download:1, loading:1, colspan:1, rowspan:1, align:1, start:1, type:1, checked:1, disabled:1, open:1 };
  function safeUrl(v, isImg) {
    var u = String(v || '').replace(/[\u0000-\u0020\u007f-\u009f]+/g, '');
    if (/^(https?:|mailto:|#|\/(?!\/)|\.\/)/i.test(u)) return true;
    if (isImg && /^(data:image\/(png|jpe?g|gif|webp);|blob:)/i.test(u)) return true;
    return !/^[a-z][a-z0-9+.\-]*:/i.test(u) && u.indexOf('//') !== 0;
  }
  function sanitizeHtml(html) {
    // DOMParser documents have no browsing context: nothing runs or loads while we clean.
    var doc = new DOMParser().parseFromString('<!DOCTYPE html><body>' + String(html || ''), 'text/html');
    var root = doc.body;
    (function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      for (var i = 0; i < kids.length; i++) {
        var el = kids[i];
        if (el.nodeType === 8) { el.remove(); continue; }
        if (el.nodeType !== 1) continue;
        var tag = el.tagName;
        if (DROP_TAGS[tag]) { el.remove(); continue; }
        if (!SAFE_TAGS[tag]) { walk(el); while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el); el.remove(); continue; }
        Array.prototype.slice.call(el.attributes).forEach(function (a) {
          var n = a.name.toLowerCase();
          if (!(SAFE_ATTRS[n] || /^data-[\w-]+$/.test(n))) { el.removeAttribute(a.name); return; }
          if ((n === 'href' || n === 'src') && !safeUrl(a.value, tag === 'IMG')) { el.removeAttribute(a.name); return; }
          if (n.indexOf('data-') === 0 && /^\s*javascript:/i.test(a.value)) { el.removeAttribute(a.name); return; }
          if (n === 'style' && /url\s*\(|expression|@import|position\s*:\s*fixed/i.test(a.value)) el.removeAttribute(a.name);
        });
        if (tag === 'INPUT' && (el.getAttribute('type') || '').toLowerCase() !== 'checkbox') { el.remove(); continue; }
        if (tag === 'INPUT') el.setAttribute('disabled', '');
        if (tag === 'BUTTON') el.setAttribute('type', 'button');
        if (tag === 'A' && el.getAttribute('target')) el.setAttribute('rel', 'noopener noreferrer');
        walk(el);
      }
    })(root);
    return root.innerHTML;
  }
  function renderMarkdown(text) {
    if (!text) return '';
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
      try {
        var rawHtml = marked.parse(text, { gfm: true, breaks: true });
        rawHtml = rawHtml.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-wrapper"><table class="ta-table">$1</table></div>');
        rawHtml = rawHtml.replace(/<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g, function(match, lang, code) {
          var safeLang = (lang || 'code').trim();
          var rawCode = code.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
          return '<div class="code-block-box"><div class="code-block-header"><span>' + escapeHtml(safeLang) + '</span>' +
            '<button class="code-copy-btn" data-code="' + encodeURIComponent(rawCode) + '">複製</button></div>' +
            '<pre class="code-block-pre"><code>' + code + '</code></pre></div>';
        });
        rawHtml = rawHtml.replace(/<img\s+src="([^"]*)"\s+alt="([^"]*)"[^>]*>/g, function(match, src, alt) {
          return '<div class="ai-image-card"><img src="' + src + '" alt="' + alt + '" class="ai-image-img" data-img-url="' + src + '" loading="lazy">' +
            '<div class="ai-image-footer"><span style="font-size:0.75rem;font-weight:600">' + alt + '</span>' +
            '<a href="' + src + '" target="_blank" download="personal-ai-visual.jpg" class="topbar-action-btn" style="text-decoration:none;padding:3px 8px;font-size:0.7rem">下載</a></div></div>';
        });
        return sanitizeHtml(rawHtml);
      } catch(e) {}
    }
    return sanitizeHtml(parseMarkdownFull(text));
  }

  var currentUtterance = null;
  var speakKeepAlive = null;
  var speakQueue = [];
  var speakActiveBtn = null;

  function resetSpeakButtons() {
    document.querySelectorAll('.speak-msg-btn').forEach(function(b) {
      b.classList.remove('speaking');
      b.innerHTML = '<span>' + t('listen') + '</span>';
    });
    var dockSpeak = document.getElementById('speak-last-btn');
    if (dockSpeak) dockSpeak.classList.remove('speaking');
  }

  function stopSpeakKeepAlive() {
    if (speakKeepAlive) { clearInterval(speakKeepAlive); speakKeepAlive = null; }
  }

  function startSpeakKeepAlive() {
    stopSpeakKeepAlive();
    speakKeepAlive = setInterval(function() {
      if (!window.speechSynthesis || !window.speechSynthesis.speaking) {
        stopSpeakKeepAlive();
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 8000);
  }

  function uiLangBcp47() {
    var id = (window.TA && TA.lang) ? TA.lang() : 'zh-TW';
    var map = {
      es: 'es-ES', en: 'en-US', pt: 'pt-PT', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', ca: 'ca-ES',
      zh: 'zh-CN', 'zh-TW': 'zh-TW', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA', hi: 'hi-IN', ru: 'ru-RU',
      nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR', vi: 'vi-VN', th: 'th-TH', uk: 'uk-UA', he: 'he-IL',
      sv: 'sv-SE', da: 'da-DK', fi: 'fi-FI', nb: 'nb-NO', cs: 'cs-CZ', hu: 'hu-HU', ro: 'ro-RO',
      el: 'el-GR', id: 'id-ID', ms: 'ms-MY', fil: 'fil-PH', hr: 'hr-HR', bg: 'bg-BG', fa: 'fa-IR',
      ur: 'ur-PK', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN'
    };
    return map[id] || 'es-ES';
  }
  function pickUiVoice() {
    var want = uiLangBcp47().toLowerCase();
    var prefix = want.slice(0, 2);
    var voices = Array.prototype.slice.call(window.speechSynthesis.getVoices() || []);
    var exact = voices.filter(function(v) { return (v.lang || '').toLowerCase() === want; });
    if (exact.length) return exact[0];
    var pref = voices.filter(function(v) { return (v.lang || '').toLowerCase().indexOf(prefix) === 0; });
    if (pref.length) return pref[0];
    for (var j = 0; j < voices.length; j++) {
      if (voices[j].default) return voices[j];
    }
    return voices[0] || null;
  }

  function splitSpeakChunks(text) {
    var max = 180;
    var parts = [];
    var rest = (text || '').replace(/\s+/g, ' ').trim();
    while (rest.length > max) {
      var slice = rest.slice(0, max);
      var cut = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('? '), slice.lastIndexOf('! '), slice.lastIndexOf(', '), slice.lastIndexOf(' '));
      if (cut < 40) cut = max;
      parts.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) parts.push(rest);
    return parts;
  }

  function stopSpeaking() {
    speakQueue = [];
    speakActiveBtn = null;
    currentUtterance = null;
    stopSpeakKeepAlive();
    try { window.speechSynthesis.cancel(); } catch (e) {}
    resetSpeakButtons();
  }

  function speakNextChunk() {
    if (!speakQueue.length) {
      stopSpeakKeepAlive();
      resetSpeakButtons();
      currentUtterance = null;
      speakActiveBtn = null;
      return;
    }
    var chunk = speakQueue.shift();
    var ut = new SpeechSynthesisUtterance(chunk);
    var voice = pickUiVoice();
    if (voice) {
      ut.voice = voice;
      ut.lang = voice.lang;
    } else {
      ut.lang = uiLangBcp47();
    }
    ut.rate = 1.02;
    ut.volume = 1;
    currentUtterance = ut;
    ut.onend = function() {
      if (speakActiveBtn) speakNextChunk();
    };
    ut.onerror = function() {
      if (speakQueue.length) speakNextChunk();
      else {
        stopSpeakKeepAlive();
        resetSpeakButtons();
        currentUtterance = null;
        speakActiveBtn = null;
      }
    };
    startSpeakKeepAlive();
    window.speechSynthesis.speak(ut);
  }

  function speakText(text, btn) {
    if (!('speechSynthesis' in window)) return alert('Este navegador no puede leer en voz alta.');
    if (speakActiveBtn && btn && speakActiveBtn === btn && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    var clean = (text || '')
      .replace(/```[\s\S]*?```/g, ' bloque de código omitido. ')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, ' imagen. ')
      .replace(/https?:\/\/\S+/g, ' enlace. ')
      .replace(/[#*_>`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return;
    speakActiveBtn = btn;
    speakQueue = splitSpeakChunks(clean);
    if (btn) {
      btn.classList.add('speaking');
      if (!btn.classList.contains('dock-btn')) {
        btn.innerHTML = '<span>' + t('stopListen') + '</span>';
      }
    }
    window.speechSynthesis.getVoices();
    setTimeout(function() {
      if (!speakActiveBtn) return;
      try { window.speechSynthesis.cancel(); } catch (e) {}
      setTimeout(speakNextChunk, 60);
    }, 40);
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function() { window.speechSynthesis.getVoices(); };
  }

  function saveChats() {
    try {
      if (!syncMeta.applying && currentChatId && chats[currentChatId]) chats[currentChatId].updatedAt = Date.now();
      if (localStorage.getItem('ta_ephemeral') === '1') { localStorage.removeItem('ta_ai_chats'); return; }
      var persist = {};
      Object.keys(chats).forEach(function(k) {
        if (chats[k] && !chats[k].ephemeral) persist[k] = chats[k];
      });
      var dump = JSON.parse(JSON.stringify(persist));
      var kept = 0;
      Object.keys(dump).sort(function(a, b) { return Number(b) - Number(a); }).forEach(function(k) {
        var msgs = dump[k] && dump[k].messages;
        if (!Array.isArray(msgs)) return;
        for (var i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i] && msgs[i].image) {
            kept++;
            if (kept > 4) delete msgs[i].image;
          }
        }
      });
      localStorage.setItem('ta_ai_chats', JSON.stringify(dump));
    } catch(e) {}
    scheduleSync();
  }
  // ---- Memory pane (D1) ----
  function setMemoryStatus(text, bad) {
    var el = document.getElementById('memory-status');
    if (el) { el.textContent = text || ''; el.style.color = bad ? 'var(--red)' : 'var(--muted)'; }
  }
  function memoryScopeLabel(scope) {
    if (!scope || scope === 'global') return '全域';
    var p = (window.PAI_projectName && window.PAI_projectName(scope)) || '';
    return p ? ('專案：' + p) : '專案';
  }
  function loadMemories() {
    return apiJson('/api/memory').then(function(d) {
      server.memories = d.memories || [];
      renderMemoryPane();
    }).catch(function(e) { setMemoryStatus(e.message || '讀取記憶失敗', true); });
  }
  function renderMemoryPane() {
    var toggle = document.getElementById('set-memory-enabled');
    if (toggle && server.settings) toggle.checked = !!(server.settings.memory && server.settings.memory.enabled);
    var box = document.getElementById('memory-list');
    if (!box) return;
    var filterEl = document.getElementById('memory-filter');
    var filter = filterEl ? filterEl.value : '';
    var rows = server.memories.filter(function(m) { return !filter || m.scope === filter; });
    box.innerHTML = '';
    if (!rows.length) {
      var empty = document.createElement('p');
      empty.className = 'settings-hint';
      empty.textContent = '還沒有記憶。對模型說「記住…」或在上方新增。';
      box.appendChild(empty);
      return;
    }
    rows.forEach(function(m) {
      var row = document.createElement('div');
      row.className = 'memory-row';
      var text = document.createElement('div');
      text.className = 'memory-text';
      text.textContent = m.content;
      var meta = document.createElement('div');
      meta.className = 'settings-hint';
      meta.textContent = memoryScopeLabel(m.scope) + ' · ' + new Date(Number(m.updated_at) || Date.now()).toLocaleString();
      var body = document.createElement('div');
      body.style.flex = '1';
      body.style.minWidth = '0';
      body.appendChild(text); body.appendChild(meta);
      var edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'mini-x'; edit.textContent = '編輯'; edit.title = '編輯';
      edit.onclick = function() {
        var next = prompt('編輯記憶', m.content);
        if (next === null) return;
        next = next.trim();
        if (!next) return;
        apiJson('/api/memory/' + encodeURIComponent(m.id), { method: 'PUT', body: { content: next } })
          .then(loadMemories).catch(function(e) { setMemoryStatus(e.message, true); });
      };
      var del = document.createElement('button');
      del.type = 'button'; del.className = 'mini-x'; del.textContent = '✕'; del.title = '刪除';
      del.setAttribute('aria-label', '刪除記憶');
      del.onclick = function() {
        apiJson('/api/memory/' + encodeURIComponent(m.id), { method: 'DELETE' })
          .then(loadMemories).catch(function(e) { setMemoryStatus(e.message, true); });
      };
      row.appendChild(body); row.appendChild(edit); row.appendChild(del);
      box.appendChild(row);
    });
  }
  function addMemoryFromPane() {
    var inp = document.getElementById('memory-new-input');
    var scopeEl = document.getElementById('memory-new-scope');
    var text = inp ? inp.value.trim() : '';
    if (!text) return;
    apiJson('/api/memory', { method: 'POST', body: { scope: (scopeEl && scopeEl.value) || 'global', content: text } })
      .then(function() { if (inp) inp.value = ''; setMemoryStatus('已新增', false); return loadMemories(); })
      .catch(function(e) { setMemoryStatus(e.message, true); });
  }
  function initMemoryPane() {
    var add = document.getElementById('memory-add-btn');
    if (add) add.addEventListener('click', addMemoryFromPane);
    var inp = document.getElementById('memory-new-input');
    if (inp) inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); addMemoryFromPane(); } });
    var filter = document.getElementById('memory-filter');
    if (filter) filter.addEventListener('change', renderMemoryPane);
    var toggle = document.getElementById('set-memory-enabled');
    if (toggle) toggle.addEventListener('change', function() {
      apiJson('/api/settings', { method: 'PUT', body: { memory: { enabled: toggle.checked } } })
        .then(function(d) { server.settings = d.settings; setMemoryStatus(toggle.checked ? '記憶已開啟' : '記憶已關閉', false); })
        .catch(function(e) { setMemoryStatus(e.message, true); });
    });
  }

  // ---- Params & search panes ----
  function fillParamsPane() {
    var p = (server.settings && server.settings.params) || {};
    var set = function(id, v) { var el = document.getElementById(id); if (el) el.value = (v === null || v === undefined) ? '' : v; };
    set('param-temperature', p.temperature);
    set('param-top-p', p.top_p);
    set('param-max-tokens', p.max_tokens);
    set('param-reasoning', p.reasoning_effort || '');
    set('param-max-steps', p.max_steps);
  }
  function readParamsForm(prefix) {
    var get = function(id) { var el = document.getElementById(prefix + id); return el ? el.value.trim() : ''; };
    var n = function(v) { return v === '' ? null : Number(v); };
    return { temperature: n(get('temperature')), top_p: n(get('top-p')), max_tokens: n(get('max-tokens')), reasoning_effort: get('reasoning'), max_steps: n(get('max-steps')) };
  }
  function saveParams() {
    var st = document.getElementById('params-status');
    apiJson('/api/settings', { method: 'PUT', body: { params: readParamsForm('param-') } }).then(function(d) {
      server.settings = d.settings; fillParamsPane();
      if (st) { st.textContent = '已儲存'; st.style.color = 'var(--green)'; }
    }).catch(function(e) { if (st) { st.textContent = e.message; st.style.color = 'var(--red)'; } });
  }
  function fillSearchPane() {
    [['search:tavily', 'secret-tavily-status'], ['search:jina', 'secret-jina-status']].forEach(function(row) {
      var el = document.getElementById(row[1]);
      var s = server.secrets[row[0]] || {};
      if (el) el.textContent = s.set ? ('已儲存：' + s.preview) : '尚未設定';
    });
  }
  function initSearchPane() {
    document.querySelectorAll('[data-secret-save]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var name = btn.getAttribute('data-secret-save');
        var inp = document.getElementById(btn.getAttribute('data-secret-input'));
        var value = inp ? inp.value.trim() : '';
        if (value.length < 8) { alert('請輸入完整的金鑰'); return; }
        apiJson('/api/secrets/' + encodeURIComponent(name), { method: 'PUT', body: { value: value } }).then(function(d) {
          server.secrets = d.secrets || server.secrets; if (inp) inp.value = ''; fillSearchPane();
        }).catch(function(e) { alert(e.message); });
      });
    });
    document.querySelectorAll('[data-secret-del]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var name = btn.getAttribute('data-secret-del');
        if (!confirm('刪除這個金鑰？')) return;
        apiJson('/api/secrets/' + encodeURIComponent(name), { method: 'DELETE' }).then(function(d) {
          server.secrets = d.secrets || server.secrets; fillSearchPane();
        }).catch(function(e) { alert(e.message); });
      });
    });
    var ps = document.getElementById('params-save-btn');
    if (ps) ps.addEventListener('click', saveParams);
  }
  function isTempChat() {
    return !!(chats[currentChatId] && chats[currentChatId].ephemeral);
  }
  function updateTempBadge() {
    var badge = document.getElementById('temp-badge');
    if (badge) badge.classList.toggle('on', isTempChat() || localStorage.getItem('ta_ephemeral') === '1');
  }
  function startTempChat() {
    if (proj.current) leaveProject();
    if (shareReadOnly) { shareReadOnly = false; history.replaceState({}, '', '/'); }
    currentChatId = Date.now().toString();
    chats[currentChatId] = { title: t('tempChat'), messages: [], ephemeral: true };
    loadChatView();
    renderSidebar();
    updateTempBadge();
    if (window.innerWidth <= 860) toggleSidebar(false);
    var pi = document.getElementById('prompt-input');
    if (pi) pi.focus();
  }
  function saveDocuments() {
    var now = Date.now();
    if (!syncMeta.applying) documents.forEach(function(d) { if (d) d.updatedAt = now; });
    try { localStorage.setItem('ta_documents', JSON.stringify(documents)); } catch(e) {}
    knowledge = documents.map(function(d) { return { title: d.title, content: d.content }; });
    try { localStorage.setItem('ta_knowledge', JSON.stringify(knowledge)); } catch(e) {}
    scheduleSync();
  }
  function startNewChat() {
    if (proj.current) leaveProject();
    if (shareReadOnly) { shareReadOnly = false; history.replaceState({}, '', '/'); }
    currentChatId = Date.now().toString();
    loadChatView();
    renderSidebar();
    updateTempBadge();
    if (window.innerWidth <= 860) toggleSidebar(false);
  }

  var CHIP_STOP = {
    el:1, la:1, los:1, las:1, un:1, una:1, de:1, del:1, en:1, y:1, o:1, que:1, para:1, con:1, por:1,
    the:1, a:1, an:1, of:1, to:1, and:1, or:1, is:1, it:1, this:1, that:1, hola:1, hey:1, ok:1, si:1,
    me:1, mi:1, tu:1, su:1, al:1, lo:1, se:1, es:1, da:1, um:1, le:1, les:1, des:1, du:1, et:1,
    you:1, we:1, i:1, my:1, your:1, how:1, what:1, why:1, can:1, please:1, gracias:1, como:1
  };

  function chatStamp(id, chat) {
    return Number((chat && (chat.updatedAt || chat.updated)) || id) || 0;
  }

  function firstUserText(chat) {
    if (!chat || !Array.isArray(chat.messages)) return '';
    for (var i = 0; i < chat.messages.length; i++) {
      if (chat.messages[i] && chat.messages[i].role === 'user' && chat.messages[i].content) {
        return String(chat.messages[i].content).replace(/\s+/g, ' ').trim();
      }
    }
    return '';
  }

  function chipTokens(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/https?:\/\/\S+/g, ' ')
      .split(/[^a-z0-9$]+/)
      .filter(function(w) { return w.length > 2 && !CHIP_STOP[w]; });
  }

  function isGenericChipTitle(title) {
    var s = String(title || '').trim().toLowerCase();
    if (!s || s.length < 3) return true;
    return /^(conversaci[oó]n|nueva conversaci[oó]n|new chat|chat|untitled|sin t[ií]tulo|nova conversa)$/i.test(s);
  }

  function recentChatsForRecs(n) {
    return Object.keys(chats)
      .map(function(id) { return chats[id] ? { id: id, c: chats[id] } : null; })
      .filter(function(x) {
        return x && x.c && !x.c.ephemeral && !x.c.archived && x.c.messages && x.c.messages.length;
      })
      .sort(function(a, b) { return chatStamp(b.id, b.c) - chatStamp(a.id, a.c); })
      .slice(0, n)
      .map(function(x) { return x.c; });
  }

  function genericHeroChips() {
    return [
      { label: t('chipDoc'), prompt: t('chipDoc') },
      { label: t('chipArch'), prompt: t('chipArch') },
      { label: t('chipBtc'), prompt: t('chipBtc') },
      { label: t('chipImage'), prompt: t('chipImage') }
    ];
  }

  function recommendHeroChips() {
    var generic = genericHeroChips();
    var recent = recentChatsForRecs(5);
    if (!recent.length) return generic;
    var recs = [];
    var seen = {};
    recent.forEach(function(c) {
      var first = firstUserText(c);
      var title = String(c.title || '').replace(/\s+/g, ' ').trim();
      var label = !isGenericChipTitle(title) ? title.slice(0, 48) : first.slice(0, 48);
      if (!label) return;
      var sig = chipTokens(label).slice(0, 4).join(' ');
      if (!sig || seen[sig]) return;
      seen[sig] = 1;
      var prompt = first
        ? (first.length <= 220 ? first : ((t('chipContinue') || 'Continúa con esto:') + ' ' + label))
        : label;
      recs.push({ label: label, prompt: prompt });
    });
    generic.forEach(function(g) {
      if (recs.length >= 4) return;
      recs.push(g);
    });
    return recs.slice(0, 4);
  }

  function renderHeroChips() {
    return recommendHeroChips().map(function(c) {
      return '<button type="button" class="hero-chip" data-prompt="' + escapeHtml(c.prompt) + '">' + escapeHtml(c.label) + '</button>';
    }).join('');
  }

  function loadChatView() {
    var container = document.getElementById('chat-container');
    if (!container) return;
    var chat = chats[currentChatId];
    if (!chat || !Array.isArray(chat.messages) || chat.messages.length === 0) {
      container.innerHTML = '<div class="ta-hero">' +
        '<img src="/avatar.png" alt="Personal AI" class="hero-logo-img">' +
        '<h1 class="hero-heading">' + t('heroTitle') + '</h1>' +
        '<p class="hero-subheading">' + t('heroSub') + '</p>' +
        '<div class="hero-chips">' + renderHeroChips() + '</div></div>';
      if (window.TAP) { try { TAP.mountHero(); } catch (eTap) {} }
      return;
    }
    container.innerHTML = '';
    chat.messages.forEach(function(m, i) {
      if (m && m.content) {
        try {
          var refs = addMessageToDOM(m.role, m.content, m.sources, m.at, i, m.feedback, m.image);
          if (m.role !== 'user' && refs && refs.contentCol && m.steps && m.steps.length) {
            var stepBox = document.createElement('div');
            stepBox.innerHTML = stepsHtml(m.steps);
            if (stepBox.firstChild) refs.contentCol.insertBefore(stepBox.firstChild, refs.contentCol.firstChild);
          }
          if (m.role !== 'user' && refs && refs.contentCol) {
            var hArt = extractArtifact(m.content);
            if (hArt) appendArtifactChip(refs.contentCol, hArt);
          }
        } catch(e) {}
      }
    });
    scrollToEnd();
  }

  function sendQuick(text) {
    var inp = document.getElementById('prompt-input');
    if (!inp) return;
    inp.value = text;
    handleSend();
  }

  function formatMsgTime(at) {
    var d = at ? new Date(at) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function addMessageToDOM(role, content, sources, at, msgIndex, feedback, image, opts) {
    opts = opts || {};
    sources = sources || [];
    var container = document.getElementById('chat-container');
    if (!container) return { row: null, textContainer: null, contentCol: null };
    var hero = container.querySelector('.ta-hero');
    if (hero) hero.remove();
    var row = document.createElement('div');
    row.className = 'msg-row ' + (role === 'user' ? 'user' : 'ai');
    var textContainer, contentCol, bubble;
    var showTime = localStorage.getItem('ta_show_time') === '1';
    if (role === 'user') {
      var holder = document.createElement('div');
      holder.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;max-width:78%';
      bubble = document.createElement('div');
      bubble.className = 'user-bubble';
      bubble.style.maxWidth = '100%';
      if (image) {
        var im = document.createElement('img');
        im.src = image;
        im.alt = t('imageAttached') === 'imageAttached' ? '圖片' : t('imageAttached');
        im.style.cssText = 'max-width:220px;max-height:180px;object-fit:cover;border-radius:10px;margin:0 0 6px;display:block';
        holder.appendChild(im);
      }
      bubble.textContent = content || '';
      if (!content && image) bubble.style.display = 'none';
      holder.appendChild(bubble);
      var userActs = document.createElement('div');
      userActs.className = 'msg-actions';
      userActs.style.justifyContent = 'flex-end';
      var uCopy = document.createElement('button');
      uCopy.className = 'msg-action-btn';
      uCopy.textContent = t('copy');
      uCopy.onclick = function() {
        navigator.clipboard.writeText(content || '');
        uCopy.textContent = t('copied');
        setTimeout(function() { uCopy.textContent = t('copy'); }, 1800);
      };
      userActs.appendChild(uCopy);
      if (typeof msgIndex === 'number' && !shareReadOnly) {
        var uEdit = document.createElement('button');
        uEdit.className = 'msg-action-btn';
        uEdit.textContent = t('edit');
        uEdit.onclick = function() { editUserAt(msgIndex); };
        userActs.appendChild(uEdit);
      }
      holder.appendChild(userActs);
      if (showTime) {
        var tm = document.createElement('div');
        tm.className = 'msg-time';
        tm.textContent = formatMsgTime(at);
        holder.appendChild(tm);
      }
      row.appendChild(holder);
    } else {
      var avatarCol = document.createElement('div');
      avatarCol.className = 'ai-avatar-col';
      avatarCol.innerHTML = '<img src="/avatar.png" alt="Personal AI" class="ai-avatar-img">';
      contentCol = document.createElement('div');
      contentCol.className = 'ai-content-col';
      textContainer = document.createElement('div');
      textContainer.className = 'prose-ai';
      textContainer.innerHTML = renderMarkdown(content || '');
      contentCol.appendChild(textContainer);
      if (sources && sources.length > 0) {
        var srcBox = document.createElement('div');
        srcBox.className = 'sources-box';
        srcBox.innerHTML = '<div class="sources-title">' + t('sources') + '</div><div class="sources-list">' +
          sources.filter(function(s) { return s && /^https?:\/\//i.test(String(s.url || '')); }).map(function(s) { return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener noreferrer" class="source-tag">' + escapeHtml(s.title || s.url) + '</a>'; }).join('') +
          '</div>';
        contentCol.appendChild(srcBox);
      }
      var actions = document.createElement('div');
      actions.className = 'msg-actions';
      var copyBtn = document.createElement('button');
      copyBtn.className = 'msg-action-btn';
      copyBtn.innerHTML = '<span>' + t('copy') + '</span>';
      copyBtn.onclick = function() {
        navigator.clipboard.writeText(content || '');
        copyBtn.innerHTML = '<span style="color:var(--green)">' + t('copied') + '</span>';
        setTimeout(function() { copyBtn.innerHTML = '<span>' + t('copy') + '</span>'; }, 1800);
      };
      actions.appendChild(copyBtn);
      var voiceBtn = document.createElement('button');
      voiceBtn.className = 'msg-action-btn speak-msg-btn';
      voiceBtn.innerHTML = '<span>' + t('listen') + '</span>';
      voiceBtn.onclick = function() { speakText(content || '', voiceBtn); };
      actions.appendChild(voiceBtn);
      if (!opts.noRegen) {
        var regenBtn = document.createElement('button');
        regenBtn.className = 'msg-action-btn';
        regenBtn.innerHTML = '<span>' + t('regenerate') + '</span>';
        regenBtn.onclick = function() { regenerateLast(); };
        actions.appendChild(regenBtn);
      }
      if (typeof msgIndex === 'number' && !shareReadOnly) {
        var up = document.createElement('button');
        up.className = 'msg-action-btn' + (feedback === 'up' ? ' on' : '');
        up.textContent = t('useful');
        up.onclick = function() { setFeedback(msgIndex, 'up'); };
        var down = document.createElement('button');
        down.className = 'msg-action-btn' + (feedback === 'down' ? ' on' : '');
        down.textContent = t('notUseful');
        down.onclick = function() { setFeedback(msgIndex, 'down'); };
        actions.appendChild(up);
        actions.appendChild(down);
      }
      contentCol.appendChild(actions);
      if (showTime) {
        var tmAi = document.createElement('div');
        tmAi.className = 'msg-time';
        tmAi.textContent = formatMsgTime(at);
        contentCol.appendChild(tmAi);
      }
      row.appendChild(avatarCol);
      row.appendChild(contentCol);
    }
    if (opts.prepend) {
      var firstRow = container.querySelector('.msg-row');
      if (firstRow) container.insertBefore(row, firstRow); else container.appendChild(row);
    } else {
      container.appendChild(row);
      scrollToEnd();
    }
    return { row: row, textContainer: textContainer, contentCol: contentCol };
  }

  function extractArtifact(markdown) {
    if (!markdown) return null;
    var cands = [];
    var re = /```([a-zA-Z0-9_+-]*)[^\n]*\r?\n([\s\S]*?)(?:```|$(?![\s\S]))/g;
    var m;
    while ((m = re.exec(markdown))) {
      var body = (m[2] || '').replace(/\s+$/, '');
      var lang = (m[1] || 'text').trim() || 'text';
      var kind = artifactKind({ lang: lang, content: body });
      var rich = kind === 'html' || kind === 'svg' || kind === 'mermaid';
      if (body.split('\n').length >= 10 || body.length > 360 || (rich && body.length > 80)) {
        cands.push({ lang: lang, content: body, rich: rich, title: guessArtTitle(lang, body) });
      }
      if (m[0].length === 0) re.lastIndex++;
    }
    var best = null;
    cands.forEach(function(c) {
      if (!best || (c.rich && !best.rich) || (c.rich === best.rich && c.content.length > best.content.length)) best = c;
    });
    if (best) {
      var heading = (markdown.match(/^#{1,3}\s+(.+)/m) || [])[1];
      if (heading && /^[<!{\[]/.test((best.title || '').trim())) best.title = clampArtTitle(heading);
      if (/^(<!doctype|<html)/i.test(best.title || '')) {
        var tt = best.content.match(/<title[^>]*>([^<]{1,120})<\/title>/i);
        best.title = clampArtTitle(tt ? tt[1] : (heading || 'HTML · Personal'));
      }
      delete best.rich;
    }
    if (!best && /^#\s+.+/m.test(markdown) && markdown.length > 500) {
      best = { lang: 'markdown', content: markdown, title: clampArtTitle((markdown.match(/^#\s+(.+)/m) || [,'Document'])[1]) };
    }
    return best;
  }
  function guessArtTitle(lang, body) {
    var first = (body.split('\n').find(function(l) { return l.trim(); }) || '').replace(/^[#/*\s-]+/, '');
    return clampArtTitle(first) || ((lang || 'documento') + ' · Personal');
  }
  function clampArtTitle(value) {
    var s = String(value || '').replace(/\s+/g, ' ').trim();
    if (s.length <= 72) return s;
    var cut = s.slice(0, 72);
    var sp = cut.lastIndexOf(' ');
    return (sp >= 36 ? cut.slice(0, sp) : cut).replace(/[–—:,.-]+$/, '').trim();
  }
  function parseExtraLines(text, kind) {
    return String(text || '').split(/\n/).map(function(line) {
      line = line.trim();
      if (!line) return null;
      if (kind === 'widget') {
        var q = line.match(/^(?:quote|chart):?\s*\$?([A-Za-z0-9.=^-]{1,12})$/i);
        if (q) return { type: /^chart/i.test(line) ? 'chart' : 'quote', symbol: q[1].toUpperCase(), label: q[1].toUpperCase() };
        if (/^\$[A-Za-z]/.test(line)) return { type: 'quote', symbol: line.replace(/^\$/, '').toUpperCase().slice(0, 12) };
        if (/^note:\s*/i.test(line)) return { type: 'note', text: line.replace(/^note:\s*/i, '').slice(0, 280) };
        if (/^https?:\/\//i.test(line)) return { type: 'embed', url: line };
        var wp = line.split('|');
        if (wp.length >= 2) return { type: 'link', label: wp[0].trim(), url: wp.slice(1).join('|').trim() };
        return { type: 'note', text: line.slice(0, 280) };
      }
      var parts = line.split('|');
      if (parts.length >= 2) return { title: clampArtTitle(parts[0]), url: parts.slice(1).join('|').trim() };
      if (/^https?:\/\//i.test(line)) return { title: line, url: line };
      return { title: clampArtTitle(line), url: '' };
    }).filter(Boolean);
  }
  function extrasToText(list, kind) {
    return (list || []).map(function(it) {
      if (kind === 'widget') {
        if (it.type === 'quote' || it.type === 'chart') return (it.type === 'chart' ? 'chart:' : 'quote:') + (it.symbol || '');
        if (it.type === 'note') return 'note:' + (it.text || '');
        if (it.url && it.label) return it.label + ' | ' + it.url;
        return it.url || it.text || '';
      }
      if (it.title && it.url) return it.title + ' | ' + it.url;
      return it.url || it.title || '';
    }).join('\n');
  }
  function readArtExtras() {
    return {
      sources: parseExtraLines((document.getElementById('art-sources') || {}).value, 'source'),
      resources: parseExtraLines((document.getElementById('art-resources') || {}).value, 'resource'),
      widgets: parseExtraLines((document.getElementById('art-widgets') || {}).value, 'widget')
    };
  }
  function fillArtExtras(extras) {
    extras = extras || { sources: [], resources: [], widgets: [] };
    var s = document.getElementById('art-sources');
    var r = document.getElementById('art-resources');
    var w = document.getElementById('art-widgets');
    if (s) s.value = extrasToText(extras.sources, 'source');
    if (r) r.value = extrasToText(extras.resources, 'resource');
    if (w) w.value = extrasToText(extras.widgets, 'widget');
  }
  function updateTitleCount() {
    var title = document.getElementById('art-title');
    var count = document.getElementById('art-title-count');
    if (!title || !count) return;
    var n = (title.value || '').length;
    count.textContent = n + '/72';
  }
  var ART_FORMATS = [
    { id: 'html', label: 'HTML' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'plaintext', label: 'Texto' },
    { id: 'code', label: 'Código' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'json', label: 'JSON' },
    { id: 'csv', label: 'CSV / tabla' },
    { id: 'svg', label: 'SVG' },
    { id: 'mermaid', label: 'Mermaid' }
  ];
  function artifactKind(art) {
    var l = String((art && art.lang) || '').toLowerCase();
    var map = { html:'html', htm:'html', react:'html', jsx:'html', markdown:'markdown', md:'markdown', plaintext:'plaintext', text:'plaintext', txt:'plaintext', code:'code', javascript:'javascript', js:'javascript', ts:'javascript', typescript:'javascript', python:'python', py:'python', json:'json', csv:'csv', tsv:'csv', svg:'svg', mermaid:'mermaid', mmd:'mermaid' };
    if (map[l]) return map[l];
    var c = String((art && art.content) || '').trim();
    if (/^<svg[\s>]/i.test(c)) return 'svg';
    if (/^<!doctype html/i.test(c) || /^<html[\s>]/i.test(c)) return 'html';
    if (/^(graph|flowchart|sequenceDiagram|classDiagram|erDiagram|pie |gantt|mindmap)\b/m.test(c)) return 'mermaid';
    if (/^[\[{]/.test(c)) {
      try { JSON.parse(c); return 'json'; } catch (e) {}
    }
    return 'markdown';
  }
  function fillArtFormatSelect() {
    var sel = document.getElementById('art-format');
    if (!sel || sel.options.length) return;
    ART_FORMATS.forEach(function(f) {
      var o = document.createElement('option');
      o.value = f.id;
      o.textContent = f.label;
      sel.appendChild(o);
    });
  }
  function readArtifactDraft() {
    if (!currentArtifact) currentArtifact = { title: 'Artifact', content: '', lang: 'markdown' };
    var title = document.getElementById('art-title');
    var editor = document.getElementById('art-editor');
    var sel = document.getElementById('art-format');
    if (title) currentArtifact.title = clampArtTitle(title.value || '');
    currentArtifact.extras = readArtExtras();
    if (editor) currentArtifact.content = editor.value || '';
    if (sel && sel.value) currentArtifact.lang = sel.value;
    return currentArtifact;
  }
  function artPreviewShell(body, extraCss) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>html,body{margin:0;padding:0;background:#fff;color:#0f172a;font-family:Inter,ui-sans-serif,system-ui,sans-serif}body{padding:18px 20px;line-height:1.6}' +
      (extraCss || '') + '</style></head><body>' + body + '</body></html>';
  }
  function artCsvTable(text) {
    var rows = String(text || '').trim().split(/\r?\n/).filter(Boolean);
    if (!rows.length) return '<p>CSV vacío</p>';
    var cells = function(line, tag) {
      return line.split(',').map(function(cell) {
        return '<' + tag + '>' + escapeHtml(cell.trim()) + '</' + tag + '>';
      }).join('');
    };
    var html = '<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>' + cells(rows[0], 'th') + '</tr></thead><tbody>';
    rows.slice(1).forEach(function(r) { html += '<tr>' + cells(r, 'td') + '</tr>'; });
    return html + '</tbody></table>';
  }
  function artPreviewSrcdoc(kind, content) {
    var raw = content || '';
    if (kind === 'html') return raw;
    if (kind === 'svg') {
      return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>html,body{margin:0;height:100%;background:#fff;display:flex;align-items:center;justify-content:center}svg{max-width:96%;max-height:96%}</style></head><body>' + raw + '</body></html>';
    }
    if (kind === 'mermaid') {
      return '<!DOCTYPE html><html><head><meta charset="UTF-8"><script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"><\/script></head><body style="background:#080c14;margin:16px"><pre class="mermaid">' +
        String(raw).replace(/</g, '&lt;') + '</pre><script>mermaid.initialize({startOnLoad:true,theme:"dark",securityLevel:"strict"});<\/script></body></html>';
    }
    if (kind === 'markdown') {
      var html = raw;
      try {
        if (window.marked && typeof marked.parse === 'function') html = sanitizeHtml(marked.parse(raw));
        else html = '<pre>' + escapeHtml(raw) + '</pre>';
      } catch (e) { html = '<pre>' + escapeHtml(raw) + '</pre>'; }
      return artPreviewShell(html, 'pre{background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow:auto}code{font-family:ui-monospace,monospace}a{color:#0284c7}h1,h2,h3{margin:1.1em 0 .4em}th,td{border:1px solid #e2e8f0;padding:6px 8px}');
    }
    if (kind === 'csv') {
      return artPreviewShell(artCsvTable(raw), 'th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left}th{background:#f8fafc}');
    }
    if (kind === 'json') {
      var pretty = raw;
      try { pretty = JSON.stringify(JSON.parse(raw), null, 2); } catch (e) {}
      return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;background:#0c1220;color:#e2e8f0}pre{margin:0;padding:16px;font:13px/1.55 ui-monospace,monospace;white-space:pre-wrap}</style></head><body><pre>' + escapeHtml(pretty) + '</pre></body></html>';
    }
    if (kind === 'plaintext') {
      return artPreviewShell('<p style="white-space:pre-wrap;margin:0">' + escapeHtml(raw) + '</p>');
    }
    return '';
  }
  // Artifact previews load an isolated document from /sandbox/frame (own strict CSP,
  // opaque origin because the iframe sandbox lacks allow-same-origin) and receive
  // their HTML by postMessage. srcdoc would inherit the app's nonce CSP.
  var artFrameSeq = 0;
  function setPreviewFrame(frame, html) {
    if (!frame) return;
    frame._taHtml = typeof html === 'string' ? html : '';
    frame.removeAttribute('srcdoc');
    if (!frame._taHtml) { frame.src = 'about:blank'; return; }
    artFrameSeq += 1;
    frame.src = '/sandbox/frame?n=' + artFrameSeq;
  }
  window.addEventListener('message', function(e) {
    var d = e.data;
    if (!d || d.type !== 'ta-preview-ready') return;
    var frames = document.querySelectorAll('iframe.art-preview, iframe[data-ta-preview]');
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (f.contentWindow && e.source === f.contentWindow && typeof f._taHtml === 'string' && f._taHtml) {
        f.contentWindow.postMessage({ type: 'ta-preview', html: f._taHtml }, '*');
      }
    }
  });
  var artView = 'preview';
  var ART_I18N = {
    es: { preview: 'Vista previa', code: 'Código', download: 'Descargar', fullscreen: 'Pantalla completa', exitfs: 'Salir de pantalla completa', copied: 'Copiado', copy: 'Copiar', version: 'Versión', open: 'Abrir artifact' },
    en: { preview: 'Preview', code: 'Code', download: 'Download', fullscreen: 'Full screen', exitfs: 'Exit full screen', copied: 'Copied', copy: 'Copy', version: 'Version', open: 'Open artifact' },
    ca: { preview: 'Vista prèvia', code: 'Codi', download: 'Baixa', fullscreen: 'Pantalla completa', exitfs: 'Surt de pantalla completa', copied: 'Copiat', copy: 'Copia', version: 'Versió', open: 'Obre l\'artifact' }
  };
  function artT(k) {
    var l = String(document.documentElement.lang || 'zh-TW').slice(0, 2);
    var d = ART_I18N[l] || ART_I18N.es;
    return d[k] || ART_I18N.es[k] || k;
  }
  function localizeArtPanel() {
    document.querySelectorAll('[data-art-i18n]').forEach(function(el) { el.textContent = artT(el.getAttribute('data-art-i18n')); });
    document.querySelectorAll('[data-art-i18n-title]').forEach(function(el) {
      var v = artT(el.getAttribute('data-art-i18n-title'));
      el.title = v; el.setAttribute('aria-label', v);
    });
    var vs = document.getElementById('art-version');
    if (vs) vs.setAttribute('aria-label', artT('version'));
    var fs = document.getElementById('art-fs-btn');
    var panel = document.getElementById('art-panel');
    if (fs && panel && panel.classList.contains('fs')) { fs.title = artT('exitfs'); fs.setAttribute('aria-label', artT('exitfs')); }
  }
  function artIsLive(kind) {
    return kind === 'html' || kind === 'svg' || kind === 'mermaid' || kind === 'markdown' || kind === 'json' || kind === 'csv' || kind === 'plaintext';
  }
  function setArtView(view) {
    var live = artIsLive(artifactKind(currentArtifact));
    artView = (view === 'code' || !live) ? 'code' : 'preview';
    var split = document.getElementById('art-split');
    if (split) {
      split.classList.toggle('view-code', artView === 'code');
      split.classList.toggle('view-preview', artView === 'preview');
    }
    document.querySelectorAll('.art-view-btn').forEach(function(b) {
      var on = b.getAttribute('data-view') === artView;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      if (b.getAttribute('data-view') === 'preview') b.disabled = !live;
    });
    if (artView === 'preview') {
      if (artPreviewTimer) { clearTimeout(artPreviewTimer); artPreviewTimer = 0; }
      readArtifactDraft();
      refreshArtifactPreview();
    }
  }
  function artPushVersion(art, content) {
    if (!art) return;
    if (!Array.isArray(art.versions)) art.versions = [];
    var last = art.versions[art.versions.length - 1];
    if (last && last.content === content) return;
    art.versions.push({ at: Date.now(), content: content });
    if (art.versions.length > 20) art.versions.shift();
  }
  function renderArtVersions() {
    var sel = document.getElementById('art-version');
    if (!sel) return;
    var vs = (currentArtifact && currentArtifact.versions) || [];
    sel.hidden = vs.length < 2;
    sel.innerHTML = '';
    vs.forEach(function(v, i) {
      var o = document.createElement('option');
      o.value = String(i);
      var d = new Date(v.at);
      o.textContent = 'v' + (i + 1) + ' · ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      sel.appendChild(o);
    });
    var cur = currentArtifact ? currentArtifact.content : '';
    var idx = vs.length - 1;
    for (var i = vs.length - 1; i >= 0; i--) { if (vs[i].content === cur) { idx = i; break; } }
    if (vs.length) sel.value = String(idx);
  }
  var ART_EXT = { html: ['html', 'text/html'], svg: ['svg', 'image/svg+xml'], markdown: ['md', 'text/markdown'], json: ['json', 'application/json'], csv: ['csv', 'text/csv'], mermaid: ['mmd', 'text/plain'], python: ['py', 'text/x-python'], javascript: ['js', 'text/javascript'], plaintext: ['txt', 'text/plain'], code: ['txt', 'text/plain'] };
  function downloadArtifact() {
    readArtifactDraft();
    if (!currentArtifact) return;
    var kind = artifactKind(currentArtifact);
    var ext = ART_EXT[kind] || ['txt', 'text/plain'];
    var name = (slugifyArtifact(currentArtifact.title) || 'artifact') + '.' + ext[0];
    var blob = new Blob([currentArtifact.content || ''], { type: ext[1] + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function() { URL.revokeObjectURL(url); }, 1500);
  }
  function setArtFullscreen(on) {
    var panel = document.getElementById('art-panel');
    var btn = document.getElementById('art-fs-btn');
    if (!panel) return;
    panel.classList.toggle('fs', !!on);
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var v = artT(on ? 'exitfs' : 'fullscreen');
      btn.title = v; btn.setAttribute('aria-label', v);
    }
  }
  function appendArtifactChip(container, art) {
    if (!container || !art) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'art-chip';
    var kind = artifactKind(art);
    b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>' +
      '<span class="art-chip-title"></span><span class="art-chip-kind"></span>';
    b.querySelector('.art-chip-title').textContent = art.title || 'Artifact';
    b.querySelector('.art-chip-kind').textContent = kind;
    b.setAttribute('aria-label', artT('open') + ': ' + (art.title || 'Artifact'));
    b.addEventListener('click', function() { openArtifact(art); });
    container.appendChild(b);
  }
  function refreshArtifactPreview() {
    var kind = artifactKind(currentArtifact);
    var live = artIsLive(kind);
    var preview = document.getElementById('art-preview');
    var split = document.getElementById('art-split');
    if (split) split.classList.toggle('no-preview', !live);
    if (!preview) return;
    if (!live) {
      preview.hidden = true;
      setPreviewFrame(preview, '');
      return;
    }
    preview.hidden = false;
    if (artView === 'code') { setPreviewFrame(preview, ''); return; }
    setPreviewFrame(preview, artPreviewSrcdoc(kind, (currentArtifact && currentArtifact.content) || ''));
  }
  function scheduleArtifactPreview() {
    if (artPreviewTimer) clearTimeout(artPreviewTimer);
    artPreviewTimer = setTimeout(function() {
      artPreviewTimer = 0;
      readArtifactDraft();
      refreshArtifactPreview();
    }, 220);
  }
  function setArtifactDest(dest, persist) {
    artifactDest = 'artifact';
  }
  function syncArtifactActions() {}
  function openArtifact(art, opts) {
    currentArtifact = art || { title: 'Artifact', content: '', lang: 'markdown', dest: artifactDest };
    if (!currentArtifact.dest) currentArtifact.dest = artifactDest;
    setArtifactDest(currentArtifact.dest, false);
    fillArtFormatSelect();
    var kind = artifactKind(currentArtifact);
    currentArtifact.lang = kind;
    var panel = document.getElementById('art-panel');
    var title = document.getElementById('art-title');
    var editor = document.getElementById('art-editor');
    var sel = document.getElementById('art-format');
    if (title) title.value = clampArtTitle(currentArtifact.title || 'Artifact');
    if (editor) editor.value = currentArtifact.content || '';
    fillArtExtras(currentArtifact.extras);
    updateTitleCount();
    if (sel) sel.value = kind;
    artPushVersion(currentArtifact, currentArtifact.content || '');
    renderArtVersions();
    localizeArtPanel();
    artView = (opts && opts.view) || (artIsLive(kind) ? 'preview' : 'code');
    setArtView(artView);
    syncArtifactActions();
    if (panel) panel.classList.add('open');
    if (opts && opts.focus && editor) {
      editor.focus();
    }
  }
  function closeArtifact() {
    readArtifactDraft();
    var panel = document.getElementById('art-panel');
    var preview = document.getElementById('art-preview');
    if (preview) setPreviewFrame(preview, '');
    setArtFullscreen(false);
    if (panel) panel.classList.remove('open');
  }
  function slugifyArtifact(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }
  async function handleSend() {
    if (isGenerating || shareReadOnly) return;
    var input = document.getElementById('prompt-input');
    if (!input) return;
    var promptText = input.value.trim();
    if (!promptText && !attachedFile) return;
    if (window.TAP && promptText && !TAP.beforeSend(promptText)) return;
    if (proj.current) {
      if (attachedFile && attachedFile.kind === 'image') { alert('專案對話目前只支援文字；圖片請在一般對話使用。'); return; }
      var projText = promptText;
      if (attachedFile) { projText = '[附件：' + attachedFile.name + ']\n' + attachedFile.content + '\n\n' + (promptText || '請分析這份文件。'); removeAttachedFile(); }
      input.value = '';
      autoResize(input);
      return sendProjectMessage(projText);
    }
    isGenerating = true;
    abortCtl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    setGenerating(true);
    var nl = String.fromCharCode(10);
    var fullPrompt = promptText;
    var pendingImage = null;
    if (attachedFile) {
      if (attachedFile.kind === 'image') {
        pendingImage = attachedFile.dataUrl;
        fullPrompt = promptText || t('imageAttached');
      } else {
        fullPrompt = '[附件：' + attachedFile.name + ']' + nl + attachedFile.content + nl + nl + (promptText || '請分析這份文件。');
        addDocument({ title: attachedFile.name, content: attachedFile.content, type: 'upload' });
      }
      removeAttachedFile();
    }
    input.value = '';
    autoResize(input);
    if (!chats[currentChatId] || typeof chats[currentChatId] !== 'object') {
      chats[currentChatId] = { title: promptText.slice(0, 42) || t('newChat'), messages: [] };
    }
    if (!Array.isArray(chats[currentChatId].messages)) chats[currentChatId].messages = [];
    if ((chats[currentChatId].title === 'Nueva conversación' || chats[currentChatId].title === t('newChat')) && promptText) chats[currentChatId].title = promptText.slice(0, 42);
    var userLabel = promptText || (pendingImage ? t('imageAttached') : t('attached'));
    chats[currentChatId].messages.push({ role: 'user', content: userLabel, sent: fullPrompt !== userLabel ? String(fullPrompt).slice(0, 20000) : undefined, at: Date.now(), image: pendingImage || undefined });
    saveChats();
    renderSidebar();
    addMessageToDOM('user', userLabel, null, Date.now(), chats[currentChatId].messages.length - 1, null, pendingImage);
    var isImgRequest = isImageMode || /^(genera una imagen|dibuja|crea una imagen|haz una foto|imagen de|generate (an )?image|draw |畫一?[張幅個]|生成圖片|產生圖片|生成一張|產生一張)/i.test(promptText);
    var msgDom = addMessageToDOM('ai', '');
    var textContainer = msgDom.textContainer;
    var contentCol = msgDom.contentCol;
    if (textContainer) textContainer.innerHTML = '<span class="pulse-cursor"></span>';
    var fullText = '';
    var sources = [];
    var rememberedFacts = [];
    try {
      if (isImgRequest) {
        if (textContainer) textContainer.innerHTML = '<span style="color:var(--purple);font-weight:600;font-size:0.85rem">' + t('genImage') + '</span><span class="pulse-cursor"></span>';
        var imgRes = await fetch('/api/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abortCtl ? abortCtl.signal : undefined, body: JSON.stringify({ prompt: promptText }) });
        var imgData = await imgRes.json();
        if (imgData.ok && imgData.imageUrl) {
          var imgMd = '![' + (promptText.slice(0, 60) || t('image')) + '](' + (imgData.proxyUrl || imgData.imageUrl) + ')';
          if (textContainer) textContainer.innerHTML = renderMarkdown(imgMd);
          chats[currentChatId].messages.push({ role: 'ai', content: imgMd, sources: [], at: Date.now() });
          saveChats();
        } else {
          throw new Error(imgData.error || '圖片產生失敗');
        }
        return;
      }
      if (!server.loaded) await loadServerState();
      if (server.d1 && !server.d1.ok) throw new Error('D1 資料庫未就緒，請依 README 綁定後重新部署');
      var provider = activeProvider();
      if (!provider) { updateNoProviderBanner(); throw new Error('請先到「設定 → 供應商與模型」新增供應商'); }
      var headers = { 'Content-Type': 'application/json' };
      var snippets = [];
      if (localStorage.getItem('ta_use_docs') !== '0') {
        snippets = documents.filter(function(d) { return d && !d.projectId; }).slice(-20).map(function(d) { return { title: d.title, content: String(d.content || '').slice(0, 20000) }; });
      }
      var tzVal = localStorage.getItem('ta_timezone');
      var resolvedTz = (tzVal && tzVal !== 'auto') ? tzVal : (function() {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei'; } catch(e) { return 'Asia/Taipei'; }
      })();
      // Only ids, recent messages and toggles go up; the server loads the
      // provider key, params, instructions and memory from D1.
      var payload = {
          chat_id: currentChatId,
          provider_id: provider.id,
          model: selectedModel || provider.default_model,
          messages: chats[currentChatId].messages.slice(-24).map(function(m) {
            return { role: m.role === 'user' ? 'user' : 'assistant', content: m.sent || m.content };
          }).filter(function(m) { return m.content; }),
          role_context: window.TAP ? TAP.roleContext() : '',
          documents: snippets,
          search_web: isWebSearch && !pendingImage,
          length_mode: currentLength,
          locale: (window.TA && TA.lang) ? TA.lang() : 'zh-TW',
          timezone: resolvedTz,
          tools_off: (chats[currentChatId] && chats[currentChatId].toolsOff) || []
        };
      if (pendingImage) payload.image = { dataUrl: pendingImage };
      var response = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        signal: abortCtl ? abortCtl.signal : undefined,
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        var errJson = await response.json().catch(function() { return {}; });
        throw new Error(errJson.error || errJson.message || ('HTTP ' + response.status));
      }
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var srcHeader = response.headers.get('x-sources') || '';
      if (srcHeader) {
        try { sources = JSON.parse(decodeURIComponent(srcHeader)) || []; } catch(eSrc) {}
      }
      var toolSteps = [];
      var notices = [];
      var streamError = null;
      function toolHtml() { return stepsHtml(toolSteps); }
      function paint(done) {
        if (!textContainer) return;
        textContainer.innerHTML = toolHtml() + renderMarkdown(fullText) +
          (notices.length ? '<div class="msg-time">' + escapeHtml(notices.join(' ')) + '</div>' : '') +
          (done ? '' : '<span class="pulse-cursor"></span>');
        scrollToEnd();
      }
      function handleEvent(dataStr) {
        if (!dataStr || dataStr === '[DONE]') return;
        var p;
        try { p = JSON.parse(dataStr); } catch (eParse) { return; }
        if (!p || typeof p !== 'object') return;
        if (p.error) {
          streamError = typeof p.error === 'string' ? p.error : (p.error.message || '供應商錯誤');
          return;
        }
        if (p.sources) sources = p.sources;
        if (p.memory && p.memory.op === 'remember' && p.memory.text) rememberedFacts.push(p.memory.text);
        if (p.notice) { notices.push(String(p.notice)); paint(false); }
        if (p.tool && p.tool.id) {
          var found = null;
          for (var k = 0; k < toolSteps.length; k++) if (toolSteps[k].id === p.tool.id) found = toolSteps[k];
          if (found) Object.assign(found, p.tool);
          else toolSteps.push(Object.assign({}, p.tool));
          paint(false);
        }
        var delta = p.content;
        if (!delta && p.choices && p.choices[0]) {
          var choice = p.choices[0];
          delta = (choice.delta && (choice.delta.content || choice.delta.text)) || (choice.message && choice.message.content) || '';
        }
        if (delta) {
          fullText += delta;
          paint(false);
        }
      }
      while (true) {
        var chunkRes = await reader.read();
        if (chunkRes.done) break;
        buffer += decoder.decode(chunkRes.value, { stream: true });
        var lines = buffer.split(nl);
        buffer = lines.pop() || '';
        for (var i = 0; i < lines.length; i++) {
          var trimmed = lines[i].trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          handleEvent(trimmed.replace(/^data:\s*/, ''));
        }
      }
      buffer += decoder.decode();
      if (buffer.trim().startsWith('data:')) handleEvent(buffer.trim().replace(/^data:\s*/, ''));
      // Surface provider/agent errors instead of silently showing an empty reply.
      if (streamError && !fullText) throw new Error(streamError);
      if (streamError) notices.push(t('error') + ': ' + streamError);
      paint(true);
      if (rememberedFacts.length && contentCol) {
        var memNote = document.createElement('div');
        memNote.className = 'msg-time';
        memNote.textContent = t('adaptRemembered') + ' ' + rememberedFacts[0];
        contentCol.appendChild(memNote);
      }
      if (sources && sources.length > 0 && contentCol) {
        var srcBox = document.createElement('div');
        srcBox.className = 'sources-box';
        srcBox.innerHTML = '<div class="sources-title">' + t('sources') + '</div><div class="sources-list">' +
          sources.filter(function(s) { return s && /^https?:\/\//i.test(String(s.url || '')); }).map(function(s) { return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener noreferrer" class="source-tag">' + escapeHtml(s.title || s.url) + '</a>'; }).join('') +
          '</div>';
        contentCol.appendChild(srcBox);
      }
      chats[currentChatId].messages.push({ role: 'ai', content: fullText, sources: sources, at: Date.now(), steps: toolSteps.length ? toolSteps.map(function(st) { return { name: st.name, label: st.label, status: st.status, error: st.error, args: st.args ? String(st.args).slice(0, 600) : undefined, result: st.result ? String(st.result).slice(0, 1500) : undefined }; }) : undefined });
      saveChats();
      if (window.TAP && fullText && promptText) { try { TAP.recordSent(promptText); } catch (eTap2) {} }
      var art = extractArtifact(fullText);
      if (art) {
        var artPanelEl = document.getElementById('art-panel');
        if (currentArtifact && artPanelEl && artPanelEl.classList.contains('open') && artifactKind(currentArtifact) === artifactKind(art) && currentArtifact.content !== art.content && !currentArtifact.url) {
          readArtifactDraft();
          artPushVersion(currentArtifact, currentArtifact.content || '');
          art.versions = (currentArtifact.versions || []).slice();
        }
        appendArtifactChip(contentCol, art);
        openArtifact(art);
      }
      if (localStorage.getItem('ta_auto_read') === '1' && fullText) {
        var lastSpeak = document.querySelector('.msg-row.ai:last-child .speak-msg-btn');
        speakText(fullText, lastSpeak);
      }
    } catch(err) {
      var aborted = err && (err.name === 'AbortError' || /abort/i.test(err.message || ''));
      if (aborted) {
        if (fullText && chats[currentChatId]) {
          chats[currentChatId].messages.push({ role: 'ai', content: fullText, sources: sources || [], at: Date.now() });
          saveChats();
          if (textContainer) textContainer.innerHTML = renderMarkdown(fullText);
        } else if (textContainer) {
          textContainer.innerHTML = '<span style="color:var(--dim)">' + t('stopped') + '</span>';
        }
      } else if (textContainer) {
        textContainer.innerHTML = '<span style="color:var(--red);font-weight:600">' + t('error') + ': ' + escapeHtml(err.message) + '</span>';
      }
    } finally {
      isGenerating = false;
      abortCtl = null;
      setGenerating(false);
      scrollToEnd();
    }
  }

  function setGenerating(on) {
    isGenerating = on;
    var sendBtn = document.getElementById('send-btn');
    if (!sendBtn) return;
    sendBtn.innerHTML = on ? STOP_ICON : SEND_ICON;
    sendBtn.title = on ? t('stopGen') : t('send');
    sendBtn.classList.toggle('stopping', !!on);
    sendBtn.disabled = false;
  }
  function abortGeneration() {
    if (abortCtl) abortCtl.abort();
  }
  function currentModelMeta() {
    for (var i = 0; i < MODELS.length; i++) if (MODELS[i].providerId === selectedProviderId && MODELS[i].model === selectedModel) return MODELS[i];
    return { id: '', name: selectedModel || (server.loaded ? '尚未設定模型' : '…'), desc: '' };
  }
  function renderModelPicker() {
    var label = document.getElementById('model-picker-label');
    var menu = document.getElementById('model-menu');
    var meta = currentModelMeta();
    if (label) label.textContent = meta.name;
    if (!menu) return;
    // Model ids come from providers: build with textContent, never innerHTML.
    menu.innerHTML = '';
    if (!MODELS.length) {
      var none = document.createElement('button');
      none.type = 'button'; none.className = 'model-option'; none.setAttribute('data-open-settings', 'pane-providers');
      none.textContent = '新增供應商…';
      menu.appendChild(none);
      return;
    }
    MODELS.forEach(function(m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'model-option' + (m.providerId === selectedProviderId && m.model === selectedModel ? ' active' : '');
      b.setAttribute('data-model', m.id);
      b.setAttribute('role', 'option');
      var n = document.createElement('div'); n.className = 'model-option-name'; n.textContent = m.name;
      var d = document.createElement('div'); d.className = 'model-option-desc'; d.textContent = m.desc || '';
      b.appendChild(n); b.appendChild(d);
      menu.appendChild(b);
    });
  }
  function setModel(key) {
    var entry = null;
    for (var i = 0; i < MODELS.length; i++) if (MODELS[i].id === key) entry = MODELS[i];
    if (entry) {
      var changed = entry.providerId !== selectedProviderId || entry.model !== selectedModel;
      selectedProviderId = entry.providerId;
      selectedModel = entry.model;
      if (changed) { rebuildModels(); persistActive(); }
    }
    renderModelPicker();
    var picker = document.getElementById('model-picker');
    if (picker) picker.classList.remove('open');
    var btn = document.getElementById('model-picker-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var k = el.getAttribute('data-i18n');
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, t(k));
        if (attr === 'title') el.setAttribute('aria-label', t(k));
      } else el.textContent = t(k);
    });
    try { if (window.TAP && TAP.localizeRewrite) TAP.localizeRewrite(); } catch (e) {}
    try { localizeDockMenu(); } catch (e) {}
    renderModelPicker();
    var chat = chats[currentChatId];
    if (!chat || !chat.messages || !chat.messages.length) loadChatView();
    renderSidebar();
    updateUserUI();
    fillLangSelect();
  }
  window.TA_applyI18n = applyI18n;
  function fillLangSelect() {
    if (!window.TA || !TA.mountPicker) return;
    TA.mountPicker(document.getElementById('lang-select'));
    TA.mountPicker(document.getElementById('set-lang'));
  }
  function commandItems() {
    return [
      { id: 'new', label: t('newChat'), hint: '⌘K', run: startNewChat },
      { id: 'temp', label: t('tempChat'), hint: '⌘⇧N', run: startTempChat },
      { id: 'settings', label: t('settings'), hint: '⌘,', run: function() { openSettingsModal('pane-general'); } },
      { id: 'search', label: t('searchPh'), run: function() { var s = document.getElementById('history-search'); if (s) { toggleSidebar(true); s.focus(); } } }
    ];
  }
  function renderCommandPalette(q) {
    var list = document.getElementById('cmd-list');
    if (!list) return;
    q = (q || '').trim().toLowerCase();
    var items = commandItems().filter(function(c) { return !q || (c.label || '').toLowerCase().indexOf(q) !== -1; });
    list.innerHTML = '';
    items.forEach(function(c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cmd-item' + (i === 0 ? ' active' : '');
      b.innerHTML = '<span>' + escapeHtml(c.label) + '</span>' + (c.hint ? '<kbd>' + escapeHtml(c.hint) + '</kbd>' : '');
      b.onclick = function() { closeCommandPalette(); c.run(); };
      list.appendChild(b);
    });
  }
  function openCommandPalette() {
    var ov = document.getElementById('cmd-overlay');
    var inp = document.getElementById('cmd-input');
    if (!ov) return;
    ov.classList.add('open');
    renderCommandPalette('');
    if (inp) { inp.value = ''; inp.focus(); }
  }
  function closeCommandPalette() {
    var ov = document.getElementById('cmd-overlay');
    if (ov) ov.classList.remove('open');
  }
  function regenerateLast() {
    if (isGenerating) return;
    var chat = chats[currentChatId];
    if (!chat || !chat.messages || chat.messages.length < 2) return;
    var last = chat.messages[chat.messages.length - 1];
    if (last.role === 'ai' || last.role === 'assistant') chat.messages.pop();
    var userMsg = chat.messages[chat.messages.length - 1];
    if (!userMsg || userMsg.role !== 'user') return;
    chat.messages.pop();
    saveChats();
    var inp = document.getElementById('prompt-input');
    if (inp) inp.value = userMsg.content || '';
    handleSend();
  }
  function editUserAt(index) {
    if (isGenerating || shareReadOnly) return;
    var chat = chats[currentChatId];
    if (!chat || !chat.messages || !chat.messages[index] || chat.messages[index].role !== 'user') return;
    var text = chat.messages[index].content || '';
    chat.messages = chat.messages.slice(0, index);
    saveChats();
    loadChatView();
    var inp = document.getElementById('prompt-input');
    if (inp) {
      inp.value = text;
      autoResize(inp);
      inp.focus();
    }
  }
  function setFeedback(index, value) {
    var chat = chats[currentChatId];
    if (!chat || !chat.messages || !chat.messages[index]) return;
    chat.messages[index].feedback = chat.messages[index].feedback === value ? '' : value;
    saveChats();
    loadChatView();
  }
  function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = (el.value.trim() ? Math.min(el.scrollHeight, 180) : 44) + 'px';
  }
  function setLengthMode(mode) {
    currentLength = mode;
    try { localStorage.setItem('ta_len_mode', mode); } catch(e) {}
    ['corto', 'normal', 'extendido'].forEach(function(m) {
      var btn = document.getElementById('len-btn-' + m);
      if (btn) { if (m === mode) btn.classList.add('active'); else btn.classList.remove('active'); }
    });
  }
  var DPM_I18N = {
    es: { more: 'Más opciones', attach: 'Adjuntar archivo', web: 'Buscar en la web', image: 'Crear imagen', providers: 'Conectores' },
    en: { more: 'More options', attach: 'Attach a file', web: 'Search the web', image: 'Create an image', providers: 'Providers' },
    ca: { more: 'Més opcions', attach: 'Adjunta un fitxer', web: 'Cerca al web', image: 'Crea una imatge', providers: 'Providers' }
  };
  function localizeDockMenu() {
    var l = String(document.documentElement.lang || 'zh-TW').slice(0, 2);
    var d = DPM_I18N[l] || DPM_I18N.es;
    document.querySelectorAll('.dpm-item').forEach(function(it) {
      var lab = it.querySelector('.dpm-label');
      if (lab) lab.textContent = d[it.getAttribute('data-dpm')] || lab.textContent;
    });
    var b = document.getElementById('dock-plus-btn');
    if (b) { b.title = d.more; b.setAttribute('aria-label', d.more); }
  }
  function syncDockMenu() {
    var w = document.querySelector('.dpm-item[data-dpm="web"]');
    var im = document.querySelector('.dpm-item[data-dpm="image"]');
    if (w) w.setAttribute('aria-checked', isWebSearch ? 'true' : 'false');
    if (im) im.setAttribute('aria-checked', isImageMode ? 'true' : 'false');
    var dc = document.querySelector('.dock-controls');
    if (dc) dc.classList.toggle('has-mode', !!(isWebSearch || isImageMode));
  }
  function setDockMenu(open) {
    var m = document.getElementById('dock-plus-menu');
    var b = document.getElementById('dock-plus-btn');
    if (!m || !b) return;
    m.hidden = !open;
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { syncDockMenu(); var f = m.querySelector('.dpm-item'); if (f) f.focus(); }
  }
  function initDockMenu() {
    var b = document.getElementById('dock-plus-btn');
    var m = document.getElementById('dock-plus-menu');
    if (!b || !m) return;
    localizeDockMenu();
    b.addEventListener('click', function(e) { e.stopPropagation(); setDockMenu(m.hidden); });
    m.addEventListener('click', function(e) {
      var it = e.target.closest('.dpm-item');
      if (!it) return;
      var k = it.getAttribute('data-dpm');
      setDockMenu(false);
      var map = { attach: 'attach-file-btn', web: 'web-search-pill', image: 'image-gen-pill', providers: 'quick-providers-pill' };
      var tgt = document.getElementById(map[k]);
      if (tgt) tgt.click();
      syncDockMenu();
      if (k !== 'attach' && k !== 'providers') b.focus();
    });
    m.addEventListener('keydown', function(e) {
      var items = Array.prototype.slice.call(m.querySelectorAll('.dpm-item'));
      var i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setDockMenu(false); b.focus(); }
      else if (e.key === 'Tab') { setDockMenu(false); }
    });
    document.addEventListener('click', function(e) { if (!m.hidden && !e.target.closest('#dock-plus')) setDockMenu(false); });
    ['web-search-pill', 'image-gen-pill'].forEach(function(id) {
      var p = document.getElementById(id);
      if (p) p.addEventListener('click', function() { setTimeout(syncDockMenu, 0); });
    });
  }
  function toggleWebSearch() {
    isWebSearch = !isWebSearch;
    var btn = document.getElementById('web-search-pill');
    if (btn) { if (isWebSearch) btn.classList.add('active'); else btn.classList.remove('active'); }
  }
  function toggleImageMode() {
    isImageMode = !isImageMode;
    var btn = document.getElementById('image-gen-pill');
    var inp = document.getElementById('prompt-input');
    if (btn) {
      if (isImageMode) { btn.classList.add('active-purple'); if (inp) inp.placeholder = 'Describe la imagen…'; }
      else { btn.classList.remove('active-purple'); if (inp) inp.placeholder = t('askPh'); }
    }
  }
  function toggleSidebar(open) {
    var sb = document.getElementById('sidebar');
    var ov = document.getElementById('sidebar-overlay');
    var closeBtn = document.getElementById('sidebar-close-btn');
    if (!sb) return;
    if (open) { sb.classList.add('open'); if (ov) ov.classList.add('active'); if (closeBtn) closeBtn.style.display = 'flex'; }
    else { sb.classList.remove('open'); if (ov) ov.classList.remove('active'); if (closeBtn) closeBtn.style.display = 'none'; }
  }

  function dayBucket(ts) {
    var d = new Date(Number(ts));
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (d.getTime() >= start) return t('today');
    if (d.getTime() >= start - 86400000) return t('yesterday');
    if (d.getTime() >= start - 6 * 86400000) return t('week');
    return t('older');
  }

  function setSidebarView(view) {
    sidebarView = view;
    ['chats', 'projects', 'docs', 'artifacts', 'prompts'].forEach(function(v) {
      var el = document.getElementById('tab-' + v);
      if (el) { if (v === view) el.classList.add('active'); else el.classList.remove('active'); }
    });
    if (view === 'projects') loadProjectList();
    renderSidebar();
  }

  function renderSidebar(filterText) {
    filterText = (filterText || (document.getElementById('history-search') && document.getElementById('history-search').value) || '').trim().toLowerCase();
    var list = document.getElementById('history-list');
    if (!list) return;
    list.innerHTML = '';
    if (sidebarView === 'projects') return renderProjectsList(list, filterText);
    if (sidebarView === 'docs') return renderDocsList(list, filterText);
    if (sidebarView === 'prompts') { if (window.TAP) TAP.renderSidebar(list, filterText); return; }
    renderHistoryList(list, filterText);
  }

  function renderHistoryList(list, filterText) {
    var keys = Object.keys(chats).sort(function(a, b) {
      var pa = chats[a] && chats[a].pinned ? 1 : 0;
      var pb = chats[b] && chats[b].pinned ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return Number(b) - Number(a);
    });
    keys = keys.filter(function(k) {
      var c = chats[k];
      if (!c) return false;
      if (!!c.archived !== showArchived) return false;
      if (filterText && !(c.title || '').toLowerCase().includes(filterText)) return false;
      return true;
    });
    var archCount = Object.keys(chats).filter(function(k) { return chats[k] && chats[k].archived; }).length;
    if (archCount || showArchived) {
      var archBar = document.createElement('div');
      archBar.className = 'hist-bar';
      archBar.innerHTML = '<button type="button" class="hist-bar-btn" id="toggle-archived">' +
        (showArchived ? '← ' + t('chats') : t('archived') + (archCount ? ' (' + archCount + ')' : '')) + '</button>';
      list.appendChild(archBar);
    }
    if (!keys.length) {
      var emptyH = document.createElement('div');
      emptyH.className = 'empty-side';
      emptyH.textContent = t('noChats');
      list.appendChild(emptyH);
      return;
    }
    var lastBucket = '';
    keys.forEach(function(k) {
      var bucket = dayBucket(k);
      if (bucket !== lastBucket) {
        var h = document.createElement('div');
        h.className = 'history-section-title';
        h.textContent = bucket;
        list.appendChild(h);
        lastBucket = bucket;
      }
      var item = document.createElement('div');
      item.className = 'history-item' + (k === currentChatId ? ' active' : '');
      item.innerHTML = '<span class="history-title">' + (chats[k].pinned ? '• ' : '') + escapeHtml(chats[k].title || t('chats')) + '</span>' +
        '<button class="history-del-btn" data-arch-id="' + k + '" title="' + (chats[k].archived ? t('unarchive') : t('archive')) + '">▭</button>' +
        '<button class="history-del-btn" data-pin-id="' + k + '" title="' + t('pin') + '">*</button>' +
        '<button class="history-del-btn" data-del-id="' + k + '" title="✕">✕</button>';
      item.onclick = function(e) {
        if (e.target.getAttribute('data-arch-id')) {
          chats[k].archived = !chats[k].archived;
          saveChats();
          renderSidebar();
          return;
        }
        if (e.target.getAttribute('data-pin-id')) {
          chats[k].pinned = !chats[k].pinned;
          saveChats();
          renderSidebar();
          return;
        }
        if (e.target.classList.contains('history-del-btn')) {
          var delId = e.target.getAttribute('data-del-id') || k;
          if (localStorage.getItem('ta_confirm_del') !== '0' && !confirm(t('confirmDeleteOne'))) return;
          delete chats[delId];
          saveChats();
          if (delId === currentChatId) startNewChat();
          else renderSidebar();
          return;
        }
        if (proj.current) leaveProject();
        currentChatId = k;
        loadChatView();
        renderSidebar();
        updateTempBadge();
        if (window.innerWidth <= 860) toggleSidebar(false);
      };
      list.appendChild(item);
    });
  }

  var PROJ_ICON = '<svg class="proj-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.5h7.5A2.5 2.5 0 0 1 21 10v6.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z"/></svg>';

  // ---- Projects (D1): one folder + one permanent conversation per project ------
  var proj = { list: [], current: null, messages: [], oldestId: 0, newestId: 0, more: false, epoch: 0, rev: 0, treeRev: -1, tree: [], collapsed: {}, openFile: null, pollTimer: 0, drawerTab: '', loadingOlder: false, treeTimer: 0 };
  window.PAI_projectName = function(id) {
    for (var i = 0; i < proj.list.length; i++) if (proj.list[i].id === id) return proj.list[i].name;
    return '';
  };
  var PROJ_TOOL_GROUPS = [['web', '網頁（web_search、fetch_url）'], ['files', '檔案工具'], ['memory', '記憶（remember / forget / recall）'], ['history', '搜尋對話紀錄（search_history）'], ['utility', '計算與時間']];
  function projToast(text, bad) {
    var el = document.getElementById('proj-status');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = bad ? 'var(--red)' : 'var(--muted)';
    clearTimeout(projToast.timer);
    if (text) projToast.timer = setTimeout(function() { el.textContent = ''; }, 4000);
  }
  function loadProjectList() {
    return apiJson('/api/projects').then(function(d) {
      proj.list = d.projects || [];
      if (sidebarView === 'projects') renderSidebar();
      fillMemoryScopeOptions();
    }).catch(function(e) { console.warn('projects', e); });
  }
  function fillMemoryScopeOptions() {
    ['memory-new-scope', 'memory-filter'].forEach(function(id) {
      var sel = document.getElementById(id);
      if (!sel) return;
      var keep = sel.value;
      Array.prototype.slice.call(sel.querySelectorAll('option[data-proj]')).forEach(function(o) { o.remove(); });
      proj.list.forEach(function(p) {
        var o = document.createElement('option');
        o.value = p.id; o.textContent = '專案：' + p.name; o.setAttribute('data-proj', '1');
        sel.appendChild(o);
      });
      sel.value = keep;
      if (sel.value !== keep) sel.value = id === 'memory-filter' ? '' : 'global';
    });
  }
  window.PAI_onSettingsOpen = function() { fillMemoryScopeOptions(); };
  function renderProjectsList(list, filterText) {
    var head = document.createElement('button');
    head.type = 'button';
    head.className = 'new-chat-btn proj-new-btn';
    head.id = 'new-project-btn';
    head.innerHTML = '<span class="nc-main"><svg class="nc-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>新增專案</span></span>';
    head.onclick = createProjectPrompt;
    list.appendChild(head);
    var rows = proj.list.filter(function(p) { return !filterText || (p.name || '').toLowerCase().indexOf(filterText) !== -1; });
    if (!rows.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-side proj-empty';
      empty.textContent = '還沒有專案。每個專案是一個資料夾加一段永久對話。';
      list.appendChild(empty);
      return;
    }
    rows.forEach(function(p) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'history-item proj-item' + (proj.current && proj.current.id === p.id ? ' active' : '');
      item.innerHTML = PROJ_ICON + '<span class="history-title"></span><span class="proj-item-meta"></span>';
      item.querySelector('.history-title').textContent = p.name;
      item.querySelector('.proj-item-meta').textContent = (p.files || 0) + ' 個檔案';
      item.onclick = function() { openProject(p.id); if (window.innerWidth <= 860) toggleSidebar(false); };
      list.appendChild(item);
    });
  }
  function createProjectPrompt() {
    var name = prompt('專案名稱');
    if (!name || !name.trim()) return;
    apiJson('/api/projects', { method: 'POST', body: { name: name.trim().slice(0, 80) } }).then(function(d) {
      return loadProjectList().then(function() { openProject(d.project.id); });
    }).catch(function(e) { alert(e.message); });
  }
  function setProjectMode(on) {
    document.body.classList.toggle('in-project', !!on);
    var bar = document.getElementById('proj-header');
    if (bar) bar.hidden = !on;
    if (!on) closeDrawer();
  }
  function openProject(id) {
    stopProjectPoll();
    return apiJson('/api/projects/' + encodeURIComponent(id)).then(function(d) {
      proj.current = d.project;
      proj.messages = []; proj.oldestId = 0; proj.newestId = 0; proj.more = false;
      proj.epoch = d.project.epoch; proj.rev = d.project.rev; proj.treeRev = -1; proj.tree = []; proj.openFile = null;
      try { localStorage.setItem('ta_project_open', id); } catch (e) {}
      setProjectMode(true);
      renderProjectHeader();
      var container = document.getElementById('chat-container');
      if (container) container.innerHTML = '<div class="proj-loading">載入中…</div>';
      renderSidebar();
      return loadProjectMessages().then(function() {
        startProjectPoll();
        if (proj.drawerTab) renderDrawer();
      });
    }).catch(function(e) {
      try { localStorage.removeItem('ta_project_open'); } catch (er) {}
      alert(e.message || '無法開啟專案');
    });
  }
  function leaveProject() {
    stopProjectPoll();
    proj.current = null;
    try { localStorage.removeItem('ta_project_open'); } catch (e) {}
    setProjectMode(false);
  }
  function renderProjectHeader() {
    var name = document.getElementById('proj-header-name');
    if (name && proj.current) name.textContent = proj.current.name;
  }
  function projectMessageNode(m) {
    var refs = addMessageToDOM(m.role === 'user' ? 'user' : 'ai', m.content, (m.meta && m.meta.sources) || [], m.created_at, undefined, null, null, { noRegen: true, prepend: m.__prepend });
    if (refs && refs.row) refs.row.setAttribute('data-msg-id', String(m.id));
    if (m.role !== 'user' && refs && refs.contentCol && m.meta && m.meta.steps && m.meta.steps.length) {
      var box = document.createElement('div');
      box.innerHTML = stepsHtml(m.meta.steps);
      if (box.firstChild) refs.contentCol.insertBefore(box.firstChild, refs.contentCol.firstChild);
    }
    return refs;
  }
  var TOOL_LABELS = { web_search: '搜尋網頁', fetch_url: '讀取網頁', calculate: '計算', current_time: '查詢時間', document_search: '搜尋文件', remember: '記住', forget: '忘記', recall: '回想記憶', list_files: '列出檔案', read_file: '讀取檔案', write_file: '寫入檔案', edit_file: '編輯檔案', append_file: '附加內容', move_file: '移動', delete_file: '刪除', make_dir: '建立資料夾', search_files: '搜尋檔案', search_history: '搜尋對話紀錄', load_skill: '載入技能' };
  function stepsHtml(steps) {
    if (!steps || !steps.length) return '';
    return '<div class="tool-steps">' + steps.map(function(st) {
      var mark = st.status === 'running' ? '…' : (st.status === 'error' ? '✕' : '✓');
      var name = TOOL_LABELS[st.name] || (String(st.name || '').indexOf('mcp__') === 0 ? 'MCP ' + String(st.name).slice(5).replace('__', ' · ') : st.name);
      var label = name + (st.label ? '：' + st.label : '');
      var err = st.status === 'error' && st.error ? '（' + st.error + '）' : '';
      var detail = (st.args || st.result) ? '<div class="tool-step-detail">' +
        (st.args ? '<div class="tool-step-k">參數</div><pre>' + escapeHtml(st.args) + '</pre>' : '') +
        (st.result ? '<div class="tool-step-k">結果（截斷）</div><pre>' + escapeHtml(st.result) + '</pre>' : '') + '</div>' : '';
      return '<details class="tool-step ' + escapeHtml(st.status || '') + '"><summary>' + mark + ' ' + escapeHtml(label) + escapeHtml(err) + '</summary>' + detail + '</details>';
    }).join('') + '</div>';
  }
  function loadProjectMessages() {
    if (!proj.current) return Promise.resolve();
    var pid = proj.current.id;
    return apiJson('/api/projects/' + encodeURIComponent(pid) + '/messages?limit=30').then(function(d) {
      if (!proj.current || proj.current.id !== pid) return;
      proj.messages = d.messages || [];
      proj.more = !!d.more;
      proj.epoch = d.epoch; proj.rev = d.rev;
      proj.oldestId = proj.messages.length ? proj.messages[0].id : 0;
      proj.newestId = proj.messages.length ? proj.messages[proj.messages.length - 1].id : 0;
      renderProjectMessages();
    });
  }
  function renderProjectMessages() {
    var container = document.getElementById('chat-container');
    if (!container || !proj.current) return;
    container.innerHTML = '';
    if (!proj.messages.length) {
      container.innerHTML = '<div class="ta-hero proj-hero-empty"><h1 class="hero-heading"></h1><p class="hero-subheading">這是專案的永久對話。模型可以讀寫專案資料夾裡的檔案，也會記得專案指示與記憶。</p></div>';
      container.querySelector('.hero-heading').textContent = proj.current.name;
      return;
    }
    if (proj.more) {
      var more = document.createElement('button');
      more.type = 'button'; more.className = 'hist-bar-btn proj-more'; more.id = 'proj-load-older';
      more.textContent = '載入較早的訊息';
      more.onclick = loadOlderMessages;
      container.appendChild(more);
    }
    proj.messages.forEach(projectMessageNode);
    scrollToEnd();
  }
  function loadOlderMessages() {
    if (!proj.current || !proj.more || proj.loadingOlder) return;
    proj.loadingOlder = true;
    var scroller = document.getElementById('chat-scroll');
    var prevHeight = scroller ? scroller.scrollHeight : 0;
    var pid = proj.current.id;
    apiJson('/api/projects/' + encodeURIComponent(pid) + '/messages?limit=30&before=' + proj.oldestId).then(function(d) {
      if (!proj.current || proj.current.id !== pid) return;
      var older = d.messages || [];
      proj.more = !!d.more;
      if (!older.length) return;
      proj.oldestId = older[0].id;
      var container = document.getElementById('chat-container');
      var btn = document.getElementById('proj-load-older');
      if (btn) btn.remove();
      older.slice().reverse().forEach(function(m) { m.__prepend = true; projectMessageNode(m); });
      proj.messages = older.concat(proj.messages);
      if (proj.more && container) {
        var more = document.createElement('button');
        more.type = 'button'; more.className = 'hist-bar-btn proj-more'; more.id = 'proj-load-older';
        more.textContent = '載入較早的訊息';
        more.onclick = loadOlderMessages;
        container.insertBefore(more, container.firstChild);
      }
      if (scroller) scroller.scrollTop = scroller.scrollHeight - prevHeight;
    }).catch(function(e) { projToast(e.message, true); }).then(function() { proj.loadingOlder = false; });
  }
  function startProjectPoll() {
    stopProjectPoll();
    proj.pollTimer = setInterval(pollProject, 10000);
  }
  function stopProjectPoll() {
    if (proj.pollTimer) clearInterval(proj.pollTimer);
    proj.pollTimer = 0;
  }
  function pollProject() {
    if (!proj.current || isGenerating || document.hidden) return;
    var pid = proj.current.id;
    apiJson('/api/projects/' + encodeURIComponent(pid) + '/poll?after=' + proj.newestId).then(function(d) {
      if (!proj.current || proj.current.id !== pid || isGenerating) return;
      if (d.epoch !== proj.epoch) { proj.epoch = d.epoch; loadProjectMessages(); return; }
      var fresh = (d.messages || []).filter(function(m) { return m.id > proj.newestId; });
      if (fresh.length) {
        if (!proj.messages.length) { proj.messages = fresh; proj.newestId = fresh[fresh.length - 1].id; proj.oldestId = fresh[0].id; renderProjectMessages(); }
        else {
          fresh.forEach(function(m) { proj.messages.push(m); projectMessageNode(m); });
          proj.newestId = fresh[fresh.length - 1].id;
        }
      }
      if (d.rev !== proj.rev) { proj.rev = d.rev; if (proj.drawerTab === 'files') refreshTree(); }
    }).catch(function() {});
  }
  function scheduleTreeRefresh() {
    clearTimeout(proj.treeTimer);
    proj.treeTimer = setTimeout(function() { if (proj.drawerTab === 'files') refreshTree(); else proj.treeRev = -1; }, 400);
  }

  // Streams a project chat turn. The server saves both messages in D1.
  async function sendProjectMessage(text) {
    var p = proj.current;
    if (!p) return;
    isGenerating = true;
    abortCtl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    setGenerating(true);
    var hero = document.querySelector('#chat-container .proj-hero-empty');
    if (hero) hero.remove();
    var userRefs = addMessageToDOM('user', text, null, Date.now(), undefined, null, null, { noRegen: true });
    var msgDom = addMessageToDOM('ai', '', null, Date.now(), undefined, null, null, { noRegen: true });
    var textContainer = msgDom.textContainer;
    if (textContainer) textContainer.innerHTML = '<span class="pulse-cursor"></span>';
    var fullText = '', sources = [], steps = [], notices = [], streamError = null, savedIds = null;
    function paint(done) {
      if (!textContainer) return;
      textContainer.innerHTML = stepsHtml(steps) + renderMarkdown(fullText) +
        (notices.length ? '<div class="msg-time">' + escapeHtml(notices.join(' ')) + '</div>' : '') +
        (done ? '' : '<span class="pulse-cursor"></span>');
      scrollToEnd();
    }
    try {
      var tzVal = localStorage.getItem('ta_timezone');
      var tz = (tzVal && tzVal !== 'auto') ? tzVal : (function() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei'; } catch (e) { return 'Asia/Taipei'; } })();
      var payload = { project_id: p.id, message: text, search_web: isWebSearch, length_mode: currentLength, locale: (window.TA && TA.lang) ? TA.lang() : 'zh-TW', timezone: tz };
      if (window.PAI_toolsOff) payload.tools_off = window.PAI_toolsOff();
      if (window.PAI_forcedSkill) payload.skill = window.PAI_forcedSkill(text);
      var response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abortCtl ? abortCtl.signal : undefined, body: JSON.stringify(payload) });
      if (!response.ok) {
        var errJson = await response.json().catch(function() { return {}; });
        throw new Error(errJson.error || ('HTTP ' + response.status));
      }
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var handle = function(dataStr) {
        if (!dataStr || dataStr === '[DONE]') return;
        var ev; try { ev = JSON.parse(dataStr); } catch (e) { return; }
        if (!ev || typeof ev !== 'object') return;
        if (ev.error) { streamError = String(ev.error); return; }
        if (ev.sources) sources = ev.sources;
        if (ev.notice) { notices.push(String(ev.notice)); paint(false); }
        if (ev.memory && ev.memory.op === 'remember') notices.push('已記住：' + ev.memory.text);
        if (ev.fs_op) scheduleTreeRefresh();
        if (ev.saved) savedIds = Object.assign(savedIds || {}, ev.saved);
        if (ev.tool && ev.tool.id) {
          var found = null;
          for (var k = 0; k < steps.length; k++) if (steps[k].id === ev.tool.id) found = steps[k];
          if (found) Object.assign(found, ev.tool); else steps.push(Object.assign({}, ev.tool));
          paint(false);
        }
        if (ev.content) { fullText += ev.content; paint(false); }
      };
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (var i = 0; i < lines.length; i++) {
          var tl = lines[i].trim();
          if (tl.indexOf('data:') === 0) handle(tl.replace(/^data:\s*/, ''));
        }
      }
      if (buffer.trim().indexOf('data:') === 0) handle(buffer.trim().replace(/^data:\s*/, ''));
      if (streamError && !fullText) throw new Error(streamError);
      if (streamError) notices.push(t('error') + ': ' + streamError);
      paint(true);
      if (sources.length && msgDom.contentCol) {
        var srcBox = document.createElement('div');
        srcBox.className = 'sources-box';
        srcBox.innerHTML = '<div class="sources-title">' + t('sources') + '</div><div class="sources-list">' +
          sources.filter(function(s) { return s && /^https?:\/\//i.test(String(s.url || '')); }).map(function(s) { return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener noreferrer" class="source-tag">' + escapeHtml(s.title || s.url) + '</a>'; }).join('') + '</div>';
        msgDom.contentCol.appendChild(srcBox);
      }
    } catch (err) {
      var aborted = err && (err.name === 'AbortError' || /abort/i.test(err.message || ''));
      if (textContainer) textContainer.innerHTML = aborted ? '<span style="color:var(--dim)">' + escapeHtml(t('stopped')) + '（伺服器仍會完成並儲存這次回覆）</span>' : '<span style="color:var(--red);font-weight:600">' + escapeHtml(t('error') + ': ' + err.message) + '</span>';
    } finally {
      isGenerating = false;
      abortCtl = null;
      setGenerating(false);
      if (savedIds && proj.current && proj.current.id === p.id) {
        if (savedIds.user_id && userRefs.row) userRefs.row.setAttribute('data-msg-id', String(savedIds.user_id));
        if (savedIds.assistant_id && msgDom.row) msgDom.row.setAttribute('data-msg-id', String(savedIds.assistant_id));
        var newest = Math.max(savedIds.user_id || 0, savedIds.assistant_id || 0);
        if (savedIds.user_id) proj.messages.push({ id: savedIds.user_id, role: 'user', content: text, meta: {} });
        if (savedIds.assistant_id) proj.messages.push({ id: savedIds.assistant_id, role: 'assistant', content: fullText, meta: { steps: steps, sources: sources } });
        if (newest > proj.newestId) proj.newestId = newest;
        if (proj.drawerTab === 'chat') renderDrawer();
      }
      scrollToEnd();
    }
  }

  // ---- Project drawer: 對話 / 檔案 / 指示 / 設定 ----
  function openDrawer(tab) {
    proj.drawerTab = tab || 'files';
    var d = document.getElementById('proj-drawer');
    if (d) d.hidden = false;
    document.body.classList.add('proj-drawer-open');
    renderDrawer();
  }
  function closeDrawer() {
    proj.drawerTab = '';
    var d = document.getElementById('proj-drawer');
    if (d) d.hidden = true;
    document.body.classList.remove('proj-drawer-open');
    syncDrawerTabs();
  }
  function syncDrawerTabs() {
    document.querySelectorAll('[data-proj-tab]').forEach(function(b) {
      var on = b.getAttribute('data-proj-tab') === (proj.drawerTab || 'chat');
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function renderDrawer() {
    syncDrawerTabs();
    var body = document.getElementById('proj-drawer-body');
    if (!body || !proj.current) return;
    body.innerHTML = '';
    if (proj.drawerTab === 'chat') return renderChatTab(body);
    if (proj.drawerTab === 'files') return renderFilesTab(body);
    if (proj.drawerTab === 'instructions') return renderInstructionsTab(body);
    if (proj.drawerTab === 'settings') return renderProjectSettingsTab(body);
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function(k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'onclick') n.onclick = attrs[k];
      else if (k === 'className') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function(c) { if (c) n.appendChild(c); });
    return n;
  }
  function renderChatTab(body) {
    var p = proj.current;
    body.appendChild(el('p', { className: 'settings-hint', text: '這個專案只有一段永久對話。訊息存在 D1，在所有裝置同步；較早的內容會自動濃縮成摘要。' }));
    body.appendChild(el('div', { className: 'settings-block-title', text: '對話摘要' }));
    body.appendChild(el('pre', { className: 'proj-summary', text: p.summary || '（還沒有摘要；對話變長時會自動產生）' }));
    body.appendChild(el('div', { className: 'settings-actions proj-actions' }, [
      el('button', { type: 'button', className: 'topbar-action-btn', text: '壓縮（立即產生摘要）', onclick: compactProject }),
      el('button', { type: 'button', className: 'topbar-action-btn btn-danger', text: '清空對話', onclick: clearProjectChat }),
    ]));
    body.appendChild(el('p', { className: 'settings-hint', text: '清空對話只刪除訊息與摘要；檔案、指示與記憶不受影響。' }));
  }
  function compactProject() {
    if (!proj.current) return;
    projToast('壓縮中…');
    apiJson('/api/projects/' + encodeURIComponent(proj.current.id) + '/compact', { method: 'POST', body: {} }).then(function(d) {
      projToast(d.compacted ? '已更新摘要' : '訊息太少，不需要壓縮');
      return apiJson('/api/projects/' + encodeURIComponent(proj.current.id));
    }).then(function(d) { if (d && d.project) { proj.current = d.project; if (proj.drawerTab === 'chat') renderDrawer(); } })
      .catch(function(e) { projToast(e.message, true); });
  }
  function clearProjectChat() {
    if (!proj.current || !confirm('清空「' + proj.current.name + '」的所有對話訊息？檔案與記憶會保留。')) return;
    apiJson('/api/projects/' + encodeURIComponent(proj.current.id) + '/messages', { method: 'DELETE' }).then(function() {
      proj.current.summary = '';
      proj.epoch++;
      return loadProjectMessages();
    }).then(function() { projToast('已清空對話'); if (proj.drawerTab === 'chat') renderDrawer(); })
      .catch(function(e) { projToast(e.message, true); });
  }

  // Files tab: tree + editor.
  function refreshTree() {
    if (!proj.current) return Promise.resolve();
    var pid = proj.current.id;
    return apiJson('/api/projects/' + encodeURIComponent(pid) + '/files').then(function(d) {
      if (!proj.current || proj.current.id !== pid) return;
      proj.tree = d.entries || [];
      proj.treeRev = d.rev;
      proj.rev = d.rev;
      if (proj.drawerTab === 'files' && !proj.openFile) renderDrawer();
    });
  }
  function fsOp(body) {
    return apiJson('/api/projects/' + encodeURIComponent(proj.current.id) + '/fs', { method: 'POST', body: body }).then(refreshTree);
  }
  function askPath(question, def) {
    var v = prompt(question, def || '');
    if (v === null) return null;
    v = v.trim().replace(/^\/+/, '');
    return v || null;
  }
  function renderFilesTab(body) {
    if (proj.openFile) return renderEditor(body);
    if (proj.treeRev !== proj.rev || proj.treeRev < 0) { body.appendChild(el('p', { className: 'settings-hint', text: '載入中…' })); refreshTree(); return; }
    body.appendChild(el('div', { className: 'proj-actions' }, [
      el('button', { type: 'button', className: 'topbar-action-btn', text: '＋ 檔案', onclick: function() {
        var path = askPath('新檔案路徑（例如 notes/todo.md）');
        if (!path) return;
        apiJson('/api/projects/' + encodeURIComponent(proj.current.id) + '/file', { method: 'PUT', body: { path: path, content: '' } })
          .then(function() { return refreshTree(); }).then(function() { openFileInEditor(path); }).catch(function(e) { projToast(e.message, true); });
      } }),
      el('button', { type: 'button', className: 'topbar-action-btn', text: '＋ 資料夾', onclick: function() {
        var path = askPath('資料夾路徑');
        if (path) fsOp({ op: 'mkdir', path: path }).catch(function(e) { projToast(e.message, true); });
      } }),
      el('button', { type: 'button', className: 'topbar-action-btn', text: '重新整理', onclick: function() { proj.treeRev = -1; refreshTree(); } }),
    ]));
    if (!proj.tree.length) { body.appendChild(el('p', { className: 'settings-hint', text: '資料夾是空的。新增檔案，或請模型幫你建立。只支援文字檔，單檔上限 1 MB。' })); return; }
    var list = el('div', { className: 'file-tree', role: 'tree' });
    proj.tree.forEach(function(e) {
      var hidden = false;
      var parts = e.path.split('/');
      for (var i = 1; i < parts.length; i++) if (proj.collapsed[parts.slice(0, i).join('/')]) hidden = true;
      if (hidden) return;
      var depth = parts.length - 1;
      var name = parts[parts.length - 1];
      var row = el('div', { className: 'file-row' + (e.dir ? ' dir' : ''), role: 'treeitem' });
      row.style.paddingLeft = (6 + depth * 14) + 'px';
      var main = el('button', { type: 'button', className: 'file-name', title: e.path });
      main.textContent = (e.dir ? (proj.collapsed[e.path] ? '▸ ' : '▾ ') + '📁 ' : '📄 ') + name;
      main.onclick = function() {
        if (e.dir) { proj.collapsed[e.path] = !proj.collapsed[e.path]; renderDrawer(); }
        else openFileInEditor(e.path);
      };
      row.appendChild(main);
      if (!e.dir) row.appendChild(el('span', { className: 'file-size', text: e.size >= 1024 ? Math.round(e.size / 1024) + ' KB' : e.size + ' B' }));
      row.appendChild(el('button', { type: 'button', className: 'mini-x', title: '移動或重新命名', 'aria-label': '移動或重新命名 ' + e.path, text: '↗', onclick: function() {
        var to = askPath('移動或重新命名到：', e.path);
        if (to && to !== e.path) fsOp({ op: 'move', from: e.path, to: to }).catch(function(err) { projToast(err.message, true); });
      } }));
      row.appendChild(el('button', { type: 'button', className: 'mini-x', title: '刪除', 'aria-label': '刪除 ' + e.path, text: '✕', onclick: function() {
        if (!confirm('刪除 ' + e.path + (e.dir ? ' 與其中所有檔案' : '') + '？')) return;
        fsOp({ op: 'delete', path: e.path, recursive: !!e.dir }).catch(function(err) { projToast(err.message, true); });
      } }));
      list.appendChild(row);
    });
    body.appendChild(list);
  }
  function openFileInEditor(path) {
    if (!proj.current) return;
    apiJson('/api/projects/' + encodeURIComponent(proj.current.id) + '/file?path=' + encodeURIComponent(path)).then(function(d) {
      proj.openFile = { path: d.path, content: d.content, seq: d.seq };
      if (proj.drawerTab !== 'files') openDrawer('files'); else renderDrawer();
    }).catch(function(e) { projToast(e.message, true); });
  }
  function renderEditor(body) {
    var f = proj.openFile;
    body.appendChild(el('div', { className: 'proj-actions' }, [
      el('button', { type: 'button', className: 'topbar-action-btn', text: '← 檔案', onclick: function() { proj.openFile = null; renderDrawer(); } }),
      el('strong', { className: 'editor-path', text: f.path }),
    ]));
    var ta = el('textarea', { className: 'form-textarea file-editor', spellcheck: 'false', 'aria-label': f.path });
    ta.value = f.content;
    body.appendChild(ta);
    var info = el('p', { className: 'settings-hint', id: 'editor-info' });
    var updateInfo = function() { var n = new TextEncoder().encode(ta.value).length; info.textContent = n + ' bytes / 1,000,000'; info.style.color = n > 1000000 ? 'var(--red)' : ''; };
    ta.addEventListener('input', updateInfo); updateInfo();
    body.appendChild(info);
    body.appendChild(el('div', { className: 'proj-actions' }, [
      el('button', { type: 'button', className: 'topbar-action-btn primary', text: '儲存', onclick: function() {
        apiJson('/api/projects/' + encodeURIComponent(proj.current.id) + '/file', { method: 'PUT', body: { path: f.path, content: ta.value, seq: f.seq } })
          .then(function(d) { f.content = ta.value; f.seq = d.seq; projToast('已儲存'); proj.treeRev = -1; })
          .catch(function(e) {
            if (e.code === 'stale') { if (confirm('檔案已被其他裝置或模型修改。要覆蓋嗎？（取消則保留你的編輯）')) { apiJson('/api/projects/' + encodeURIComponent(proj.current.id) + '/file', { method: 'PUT', body: { path: f.path, content: ta.value } }).then(function(d) { f.seq = d.seq; projToast('已覆蓋儲存'); }).catch(function(e2) { projToast(e2.message, true); }); } }
            else projToast(e.message, true);
          });
      } }),
      el('button', { type: 'button', className: 'topbar-action-btn', text: '重新載入', onclick: function() { openFileInEditor(f.path); } }),
    ]));
  }
  function renderInstructionsTab(body) {
    body.appendChild(el('p', { className: 'settings-hint', text: '專案指示會加在每次對話的系統提示最後，優先於其他指示。' }));
    var ta = el('textarea', { className: 'form-textarea proj-instructions', 'aria-label': '專案指示', maxlength: '20000' });
    ta.value = proj.current.instructions || '';
    body.appendChild(ta);
    body.appendChild(el('div', { className: 'proj-actions' }, [el('button', { type: 'button', className: 'topbar-action-btn primary', text: '儲存指示', onclick: function() {
      apiJson('/api/projects/' + encodeURIComponent(proj.current.id), { method: 'PUT', body: { instructions: ta.value } })
        .then(function(d) { proj.current = d.project; projToast('已儲存指示'); }).catch(function(e) { projToast(e.message, true); });
    } })]));
  }
  function renderProjectSettingsTab(body) {
    var s = proj.current.settings || {};
    var name = el('input', { className: 'form-input', type: 'text', maxlength: '80', 'aria-label': '專案名稱' });
    name.value = proj.current.name;
    body.appendChild(el('label', { className: 'form-label', text: '名稱' }));
    body.appendChild(name);
    body.appendChild(el('div', { className: 'settings-block-title', text: '模型（留空使用全域設定）' }));
    var provSel = el('select', { className: 'form-input', 'aria-label': '供應商' });
    provSel.appendChild(el('option', { value: '', text: '使用全域供應商' }));
    server.providers.forEach(function(p) { var o = el('option', { value: p.id, text: p.name }); if (p.id === s.provider_id) o.selected = true; provSel.appendChild(o); });
    var model = el('input', { className: 'form-input', type: 'text', placeholder: '模型 ID（留空使用預設）', list: 'provider-model-list', 'aria-label': '模型' });
    model.value = s.model || '';
    body.appendChild(provSel); body.appendChild(model);
    body.appendChild(el('div', { className: 'settings-block-title', text: '參數覆寫（留空使用全域值）' }));
    var pp = s.params || {};
    var grid = el('div', { className: 'params-grid' });
    var fields = [['temperature', 'temperature', 'number'], ['top-p', 'top_p', 'number'], ['max-tokens', 'max_tokens', 'number'], ['max-steps', 'max_steps', 'number']];
    fields.forEach(function(f) {
      grid.appendChild(el('label', { className: 'form-label', for: 'pp-' + f[0], text: f[1] }));
      var inp = el('input', { className: 'form-input', type: 'number', id: 'pp-' + f[0], step: 'any' });
      inp.value = pp[f[1]] === undefined || pp[f[1]] === null ? '' : pp[f[1]];
      grid.appendChild(inp);
    });
    grid.appendChild(el('label', { className: 'form-label', for: 'pp-reasoning', text: 'reasoning_effort' }));
    var rs = el('select', { className: 'form-input', id: 'pp-reasoning' });
    ['', 'none', 'minimal', 'low', 'medium', 'high'].forEach(function(v) { var o = el('option', { value: v, text: v || '使用全域' }); if ((pp.reasoning_effort || '') === v) o.selected = true; rs.appendChild(o); });
    grid.appendChild(rs);
    body.appendChild(grid);
    body.appendChild(el('div', { className: 'settings-block-title', text: '啟用的工具' }));
    var off = s.tools_disabled || [];
    var checks = PROJ_TOOL_GROUPS.map(function(g) {
      var cb = el('input', { type: 'checkbox', 'data-group': g[0] });
      cb.checked = off.indexOf(g[0]) === -1;
      body.appendChild(el('label', { className: 'toggle-row' }, [el('span', { text: g[1] }), cb]));
      return cb;
    });
    if (window.PAI_projectSettingsExtra) try { window.PAI_projectSettingsExtra(body, s); } catch (e) {}
    body.appendChild(el('div', { className: 'proj-actions' }, [
      el('button', { type: 'button', className: 'topbar-action-btn primary', text: '儲存設定', onclick: function() {
        var params = readParamsForm('pp-');
        Object.keys(params).forEach(function(k) { if (params[k] === null || params[k] === '') delete params[k]; });
        var settings = { provider_id: provSel.value, model: model.value.trim(), params: params, tools_disabled: checks.filter(function(c) { return !c.checked; }).map(function(c) { return c.getAttribute('data-group'); }) };
        if (window.PAI_projectSettingsCollect) try { Object.assign(settings, window.PAI_projectSettingsCollect(body)); } catch (e) {}
        apiJson('/api/projects/' + encodeURIComponent(proj.current.id), { method: 'PUT', body: { name: name.value.trim(), settings: settings } })
          .then(function(d) { proj.current = d.project; renderProjectHeader(); loadProjectList(); projToast('已儲存設定'); })
          .catch(function(e) { projToast(e.message, true); });
      } }),
      el('button', { type: 'button', className: 'topbar-action-btn btn-danger', text: '刪除專案…', onclick: function() {
        var n = prompt('刪除專案會一併刪除它的對話、檔案與專案記憶，無法復原。\n請輸入專案名稱確認：');
        if (n === null) return;
        if (n.trim() !== proj.current.name) { projToast('名稱不符，未刪除', true); return; }
        apiJson('/api/projects/' + encodeURIComponent(proj.current.id), { method: 'DELETE' }).then(function() {
          leaveProject(); loadProjectList(); startNewChat();
        }).catch(function(e) { projToast(e.message, true); });
      } }),
    ]));
  }
  function initProjects() {
    document.querySelectorAll('[data-proj-tab]').forEach(function(b) {
      b.addEventListener('click', function() {
        var tab = b.getAttribute('data-proj-tab');
        if (tab === 'chat' && window.innerWidth <= 860) { closeDrawer(); return; }
        if (proj.drawerTab === tab && window.innerWidth > 860) { closeDrawer(); return; }
        openDrawer(tab);
      });
    });
    var closeBtn = document.getElementById('proj-drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    var exitBtn = document.getElementById('proj-exit-btn');
    if (exitBtn) exitBtn.addEventListener('click', function() { leaveProject(); startNewChat(); });
    var scroller = document.getElementById('chat-scroll');
    if (scroller) scroller.addEventListener('scroll', function() { if (proj.current && proj.more && scroller.scrollTop < 60) loadOlderMessages(); });
    document.addEventListener('visibilitychange', function() { if (!document.hidden && proj.current) pollProject(); });
  }

  // ---- Skills & MCP (settings panes, tools menu, /name) ----------------------------
  server.skills = [];
  server.mcp = [];
  function loadExtensions() {
    return Promise.all([
      apiJson('/api/skills').then(function(d) { server.skills = d.skills || []; }).catch(function() {}),
      apiJson('/api/mcp').then(function(d) { server.mcp = d.servers || []; }).catch(function() {}),
    ]).then(function() { renderSkillList(); renderMcpList(); });
  }
  function setPaneStatus(id, text, bad) {
    var el2 = document.getElementById(id);
    if (el2) { el2.textContent = text || ''; el2.style.color = bad ? 'var(--red)' : 'var(--green)'; }
  }
  // Skills pane
  var editingSkill = null;
  function renderSkillList() {
    var box = document.getElementById('skill-list');
    if (!box) return;
    box.innerHTML = '';
    if (!server.skills.length) { box.appendChild(el('p', { className: 'settings-hint', text: '還沒有技能。' })); return; }
    server.skills.forEach(function(sk) {
      var main = el('button', { type: 'button', className: 'provider-row-main' }, [
        el('strong', { text: '/' + sk.name + (sk.enabled ? '' : '（停用）') }),
        el('span', { className: 'settings-hint', text: sk.description + (sk.files.length ? ' · ' + sk.files.length + ' 個參考檔' : '') }),
      ]);
      main.onclick = function() { openSkillForm(sk.id); };
      var exp = el('a', { className: 'topbar-action-btn', href: '/api/skills/' + encodeURIComponent(sk.id) + '/export', download: sk.name + '.SKILL.md', text: '匯出' });
      var del = el('button', { type: 'button', className: 'topbar-action-btn btn-danger', text: '刪除', onclick: function() {
        if (!confirm('刪除技能 /' + sk.name + '？')) return;
        apiJson('/api/skills/' + encodeURIComponent(sk.id), { method: 'DELETE' }).then(loadExtensions).catch(function(e) { setPaneStatus('skill-status', e.message, true); });
      } });
      box.appendChild(el('div', { className: 'provider-row' }, [main, exp, del]));
    });
  }
  function renderSkillFiles() {
    var box = document.getElementById('skill-files');
    if (!box || !editingSkill) return;
    box.innerHTML = '';
    if (!editingSkill.files.length) box.appendChild(el('p', { className: 'settings-hint', text: '沒有參考檔' }));
    editingSkill.files.forEach(function(f, i) {
      box.appendChild(el('div', { className: 'memory-row' }, [
        el('div', { className: 'memory-text', text: f.name + '（' + String(f.content || '').length + ' 字）' }),
        el('button', { type: 'button', className: 'mini-x', text: '✕', 'aria-label': '移除 ' + f.name, onclick: function() { editingSkill.files.splice(i, 1); renderSkillFiles(); } }),
      ]));
    });
  }
  function openSkillForm(id) {
    var form = document.getElementById('skill-form');
    var fill = function(sk) {
      editingSkill = { id: sk ? sk.id : '', files: sk ? sk.files.slice() : [] };
      document.getElementById('skill-form-title').textContent = sk ? '編輯 /' + sk.name : '新增技能';
      document.getElementById('skill-name').value = sk ? sk.name : '';
      document.getElementById('skill-desc').value = sk ? sk.description : '';
      document.getElementById('skill-instr').value = sk ? (sk.instructions || '') : '';
      document.getElementById('skill-tools').value = sk ? (sk.allowed_tools || []).join(', ') : '';
      document.getElementById('skill-enabled').checked = sk ? !!sk.enabled : true;
      renderSkillFiles();
      form.hidden = false;
    };
    if (!id) return fill(null);
    apiJson('/api/skills/' + encodeURIComponent(id)).then(function(d) { fill(d.skill); }).catch(function(e) { setPaneStatus('skill-status', e.message, true); });
  }
  function saveSkillForm() {
    if (!editingSkill) return;
    var body = {
      name: document.getElementById('skill-name').value.trim(),
      description: document.getElementById('skill-desc').value.trim(),
      instructions: document.getElementById('skill-instr').value,
      allowed_tools: document.getElementById('skill-tools').value,
      enabled: document.getElementById('skill-enabled').checked,
      files: editingSkill.files,
    };
    var req = editingSkill.id ? apiJson('/api/skills/' + encodeURIComponent(editingSkill.id), { method: 'PUT', body: body }) : apiJson('/api/skills', { method: 'POST', body: body });
    req.then(function() { document.getElementById('skill-form').hidden = true; editingSkill = null; setPaneStatus('skill-status', '已儲存'); return loadExtensions(); })
      .catch(function(e) { setPaneStatus('skill-status', e.message, true); });
  }
  function readTextFiles(files) {
    return Promise.all(Array.prototype.slice.call(files || []).map(function(f) {
      if (f.size > 400000) return Promise.resolve(null);
      return f.text().then(function(text) { return { name: f.name, content: text }; });
    })).then(function(list) { return list.filter(Boolean); });
  }
  function initSkillsPane() {
    var bind = function(id, ev, fn) { var n = document.getElementById(id); if (n) n.addEventListener(ev, fn); };
    bind('skill-new-btn', 'click', function() { openSkillForm(''); });
    bind('skill-cancel-btn', 'click', function() { document.getElementById('skill-form').hidden = true; editingSkill = null; });
    bind('skill-save-btn', 'click', saveSkillForm);
    bind('skill-file-add', 'click', function() { document.getElementById('skill-file-input').click(); });
    bind('skill-file-input', 'change', function(e) {
      readTextFiles(e.target.files).then(function(list) {
        list.forEach(function(f) { if (editingSkill && editingSkill.files.length < 10) editingSkill.files.push(f); });
        e.target.value = '';
        renderSkillFiles();
      });
    });
    bind('skill-import-btn', 'click', function() { document.getElementById('skill-import-file').click(); });
    bind('skill-import-file', 'change', function(e) {
      readTextFiles(e.target.files).then(function(list) {
        e.target.value = '';
        return Promise.all(list.map(function(f) { return apiJson('/api/skills/import', { method: 'POST', body: { markdown: f.content } }); }));
      }).then(function(res) { setPaneStatus('skill-status', '已匯入 ' + res.length + ' 個技能'); return loadExtensions(); })
        .catch(function(err) { setPaneStatus('skill-status', err.message, true); });
    });
  }
  // MCP pane
  var editingMcp = '';
  function renderMcpList() {
    var box = document.getElementById('mcp-list');
    if (!box) return;
    box.innerHTML = '';
    if (!server.mcp.length) { box.appendChild(el('p', { className: 'settings-hint', text: '還沒有 MCP 伺服器。' })); return; }
    server.mcp.forEach(function(m) {
      var card = el('div', { className: 'settings-card mcp-card' });
      var head = el('div', { className: 'provider-row' }, [
        el('button', { type: 'button', className: 'provider-row-main', onclick: function() { loadMcpForm(m); } }, [
          el('strong', { text: m.name + (m.enabled ? '' : '（停用）') }),
          el('span', { className: 'settings-hint', text: m.url + ' · ' + (m.auth_type === 'none' ? '無驗證' : (m.token.set ? '金鑰 ' + m.token.preview : '未設定金鑰')) + (m.last_error ? ' · 錯誤：' + m.last_error : (m.last_tested_at ? ' · ' + m.tools.length + ' 個工具' : ' · 尚未測試')) }),
        ]),
        el('button', { type: 'button', className: 'topbar-action-btn', text: '測試連線', onclick: function() {
          setPaneStatus('mcp-status', '連線中…');
          apiJson('/api/mcp/' + encodeURIComponent(m.id) + '/test', { method: 'POST', body: {} }).then(function(d) {
            server.mcp = d.servers || server.mcp; renderMcpList();
            setPaneStatus('mcp-status', '連線成功' + (d.server_info ? '：' + d.server_info.name + ' ' + d.server_info.version : '') + '，' + d.tools + ' 個工具' + (d.disabled ? '（' + d.disabled + ' 個因超過 40 個上限而停用）' : ''));
          }).catch(function(e) { setPaneStatus('mcp-status', e.message, true); loadExtensions(); });
        } }),
        el('button', { type: 'button', className: 'topbar-action-btn', text: m.enabled ? '停用' : '啟用', onclick: function() {
          apiJson('/api/mcp/' + encodeURIComponent(m.id), { method: 'PUT', body: { enabled: !m.enabled } }).then(function(d) { server.mcp = d.servers; renderMcpList(); }).catch(function(e) { setPaneStatus('mcp-status', e.message, true); });
        } }),
        el('button', { type: 'button', className: 'topbar-action-btn btn-danger', text: '刪除', onclick: function() {
          if (!confirm('刪除 MCP 伺服器 ' + m.name + '？')) return;
          apiJson('/api/mcp/' + encodeURIComponent(m.id), { method: 'DELETE' }).then(function(d) { server.mcp = d.servers; renderMcpList(); }).catch(function(e) { setPaneStatus('mcp-status', e.message, true); });
        } }),
      ]);
      card.appendChild(head);
      if (m.tools.length) {
        var tl = el('div', { className: 'mcp-tools' });
        m.tools.forEach(function(tool) {
          var cb = el('input', { type: 'checkbox' });
          cb.checked = tool.enabled;
          cb.onchange = function() {
            var disabled = m.tools.filter(function(x) { return x.name === tool.name ? !cb.checked : !x.enabled; }).map(function(x) { return x.name; });
            apiJson('/api/mcp/' + encodeURIComponent(m.id) + '/tools', { method: 'PUT', body: { disabled_tools: disabled } })
              .then(function(d) { server.mcp = d.servers; renderMcpList(); })
              .catch(function(e) { cb.checked = !cb.checked; setPaneStatus('mcp-status', e.message, true); });
          };
          tl.appendChild(el('label', { className: 'toggle-row', title: tool.description || '' }, [el('span', { text: tool.name }), cb]));
        });
        card.appendChild(tl);
      }
      box.appendChild(card);
    });
  }
  function loadMcpForm(m) {
    editingMcp = m ? m.id : '';
    document.getElementById('mcp-form-title').textContent = m ? '編輯 ' + m.name : '新增 MCP 伺服器';
    document.getElementById('mcp-name').value = m ? m.name : '';
    document.getElementById('mcp-url').value = m ? m.url : '';
    document.getElementById('mcp-auth').value = m ? m.auth_type : 'none';
    document.getElementById('mcp-header').value = m ? m.header_name : '';
    document.getElementById('mcp-header').hidden = !(m && m.auth_type === 'header');
    var tok = document.getElementById('mcp-token');
    tok.value = '';
    tok.placeholder = m && m.token.set ? '已儲存 ' + m.token.preview + '（留空保留）' : '金鑰（加密存在 D1）';
  }
  function initMcpPane() {
    var auth = document.getElementById('mcp-auth');
    if (auth) auth.addEventListener('change', function() { document.getElementById('mcp-header').hidden = auth.value !== 'header'; });
    var nb = document.getElementById('mcp-new-btn');
    if (nb) nb.addEventListener('click', function() { loadMcpForm(null); });
    var sb = document.getElementById('mcp-save-btn');
    if (sb) sb.addEventListener('click', function() {
      var body = {
        name: document.getElementById('mcp-name').value.trim().toLowerCase(),
        url: document.getElementById('mcp-url').value.trim(),
        auth_type: document.getElementById('mcp-auth').value,
        header_name: document.getElementById('mcp-header').value.trim(),
      };
      var tok = document.getElementById('mcp-token').value.trim();
      if (tok) body.token = tok;
      var req = editingMcp ? apiJson('/api/mcp/' + encodeURIComponent(editingMcp), { method: 'PUT', body: body }) : apiJson('/api/mcp', { method: 'POST', body: body });
      req.then(function(d) { server.mcp = d.servers; renderMcpList(); loadMcpForm(null); setPaneStatus('mcp-status', '已儲存，請按「測試連線」載入工具清單'); })
        .catch(function(e) { setPaneStatus('mcp-status', e.message, true); });
    });
  }
  // Composer 工具 menu: per chat (main) or saved to the project (project).
  var MAIN_TOOL_GROUPS = [['web', '網頁搜尋與讀取'], ['memory', '記憶'], ['utility', '計算與時間'], ['docs', '文件搜尋']];
  function currentOff() {
    if (proj.current) {
      var st = proj.current.settings || {};
      return {
        groups: st.tools_disabled || [],
        skills: st.skills_disabled || [],
        mcp: st.mcp_disabled || [],
      };
    }
    var chat = chats[currentChatId];
    var off = (chat && chat.toolsOff) || [];
    return {
      groups: off.filter(function(x) { return x.indexOf(':') === -1 && x !== 'skills'; }),
      skills: off.indexOf('skills') !== -1 ? server.skills.map(function(s) { return s.name; }) : [],
      mcp: off.filter(function(x) { return x.indexOf('mcp:') === 0; }).map(function(x) { return x.slice(4); }),
    };
  }
  function saveOff(next) {
    if (proj.current) {
      var settings = { tools_disabled: next.groups, skills_disabled: next.skills, mcp_disabled: next.mcp };
      return apiJson('/api/projects/' + encodeURIComponent(proj.current.id), { method: 'PUT', body: { settings: settings } })
        .then(function(d) { proj.current = d.project; }).catch(function(e) { projToast(e.message, true); });
    }
    var chat = chats[currentChatId];
    if (!chat) { chats[currentChatId] = chat = { title: t('newChat'), messages: [] }; }
    chat.toolsOff = next.groups.concat(next.skills.length && next.skills.length >= server.skills.length ? ['skills'] : []).concat(next.mcp.map(function(n) { return 'mcp:' + n; }));
    saveChats();
    return Promise.resolve();
  }
  function renderToolsMenu() {
    var menu = document.getElementById('tools-menu');
    if (!menu) return;
    var off = currentOff();
    menu.innerHTML = '';
    menu.appendChild(el('div', { className: 'tools-menu-title', text: proj.current ? '這個專案的工具（會儲存到專案設定）' : '這段對話的工具' }));
    var groups = proj.current ? PROJ_TOOL_GROUPS : MAIN_TOOL_GROUPS;
    var addRow = function(label, checked, onchange, hint) {
      var cb = el('input', { type: 'checkbox' });
      cb.checked = checked;
      cb.onchange = function() { onchange(cb.checked); };
      menu.appendChild(el('label', { className: 'toggle-row', title: hint || '' }, [el('span', { text: label }), cb]));
    };
    groups.forEach(function(g) {
      addRow(g[1], off.groups.indexOf(g[0]) === -1, function(on) {
        var next = currentOff();
        next.groups = on ? next.groups.filter(function(x) { return x !== g[0]; }) : next.groups.concat([g[0]]);
        saveOff(next);
      });
    });
    if (server.skills.length) {
      menu.appendChild(el('div', { className: 'tools-menu-title', text: '技能' }));
      var enabledSkills = server.skills.filter(function(s) { return s.enabled; });
      if (proj.current) {
        enabledSkills.forEach(function(sk) {
          addRow('/' + sk.name, off.skills.indexOf(sk.name) === -1, function(on) {
            var next = currentOff();
            next.skills = on ? next.skills.filter(function(x) { return x !== sk.name; }) : next.skills.concat([sk.name]);
            saveOff(next);
          }, sk.description);
        });
      } else {
        addRow('技能（' + enabledSkills.length + ' 個）', !off.skills.length, function(on) {
          var next = currentOff();
          next.skills = on ? [] : server.skills.map(function(s) { return s.name; });
          saveOff(next);
        });
      }
    }
    var servers = server.mcp.filter(function(m) { return m.enabled && m.tools.length; });
    if (servers.length) {
      menu.appendChild(el('div', { className: 'tools-menu-title', text: 'MCP 伺服器' }));
      servers.forEach(function(m) {
        addRow(m.name + '（' + m.tools.filter(function(x) { return x.enabled; }).length + ' 個工具）', off.mcp.indexOf(m.name) === -1, function(on) {
          var next = currentOff();
          next.mcp = on ? next.mcp.filter(function(x) { return x !== m.name; }) : next.mcp.concat([m.name]);
          saveOff(next);
        });
      });
    }
    menu.appendChild(el('button', { type: 'button', className: 'hist-bar-btn', text: '管理技能與 MCP…', onclick: function() { toggleToolsMenu(false); openSettingsModal('pane-skills'); } }));
  }
  function toggleToolsMenu(open) {
    var menu = document.getElementById('tools-menu');
    var btn = document.getElementById('tools-pill');
    if (!menu || !btn) return;
    var show = open === undefined ? menu.hidden : open;
    if (show) renderToolsMenu();
    menu.hidden = !show;
    btn.setAttribute('aria-expanded', show ? 'true' : 'false');
  }
  // "/" suggestions for skills
  function renderSkillSuggest() {
    var box = document.getElementById('skill-suggest');
    var input = document.getElementById('prompt-input');
    if (!box || !input) return;
    var m = input.value.match(/^\/([a-z0-9-]*)$/);
    var list = m ? server.skills.filter(function(s) { return s.enabled && s.name.indexOf(m[1]) === 0; }).slice(0, 8) : [];
    box.innerHTML = '';
    box.hidden = !list.length;
    list.forEach(function(sk) {
      var b = el('button', { type: 'button', className: 'skill-suggest-item', role: 'option' }, [el('strong', { text: '/' + sk.name }), el('span', { text: sk.description })]);
      b.onclick = function() { input.value = '/' + sk.name + ' '; box.hidden = true; input.focus(); };
      box.appendChild(b);
    });
  }
  window.PAI_projectSettingsExtra = function(body, s) {
    if (!server.skills.length && !server.mcp.length) return;
    body.appendChild(el('div', { className: 'settings-block-title', text: '技能與 MCP' }));
    server.skills.forEach(function(sk) {
      var cb = el('input', { type: 'checkbox', 'data-skill': sk.name });
      cb.checked = (s.skills_disabled || []).indexOf(sk.name) === -1;
      body.appendChild(el('label', { className: 'toggle-row' }, [el('span', { text: '技能 /' + sk.name }), cb]));
    });
    server.mcp.forEach(function(m) {
      var cb = el('input', { type: 'checkbox', 'data-mcp': m.name });
      cb.checked = (s.mcp_disabled || []).indexOf(m.name) === -1;
      body.appendChild(el('label', { className: 'toggle-row' }, [el('span', { text: 'MCP ' + m.name }), cb]));
    });
  };
  window.PAI_projectSettingsCollect = function(body) {
    var pick = function(attr) { return Array.prototype.slice.call(body.querySelectorAll('input[' + attr + ']')).filter(function(c) { return !c.checked; }).map(function(c) { return c.getAttribute(attr); }); };
    return { skills_disabled: pick('data-skill'), mcp_disabled: pick('data-mcp') };
  };
  function initExtensions() {
    initSkillsPane();
    initMcpPane();
    var pill = document.getElementById('tools-pill');
    if (pill) pill.addEventListener('click', function(e) { e.stopPropagation(); toggleToolsMenu(); });
    document.addEventListener('click', function(e) {
      var wrap = document.getElementById('tools-menu-wrap');
      if (wrap && !wrap.contains(e.target)) toggleToolsMenu(false);
      var sug = document.getElementById('skill-suggest');
      if (sug && !sug.hidden && !sug.contains(e.target) && e.target.id !== 'prompt-input') sug.hidden = true;
    });
    var input = document.getElementById('prompt-input');
    if (input) input.addEventListener('input', renderSkillSuggest);
  }

  function renderDocsList(list, filterText) {
    var head = document.createElement('button');
    head.type = 'button';
    head.className = 'new-chat-btn';
    head.style.margin = '4px 4px 10px';
    head.innerHTML = '<span>+ ' + t('addDoc') + '</span>';
    head.onclick = function() { openKnowledgeModal(); };
    list.appendChild(head);
    var filtered = documents.filter(function(d) {
      if (d.projectId) return false;
      if (filterText && !(d.title || '').toLowerCase().includes(filterText)) return false;
      return true;
    });
    if (!filtered.length) {
      var emptyD = document.createElement('div');
      emptyD.className = 'empty-side';
      emptyD.textContent = t('noDocs');
      list.appendChild(emptyD);
      return;
    }
    filtered.slice().reverse().forEach(function(d) {
      var item = document.createElement('div');
      item.className = 'doc-item';
      item.innerHTML = '<span class="doc-title">' + escapeHtml(d.title || t('docs')) + '</span>' +
        '<button class="mini-x" data-del-doc="' + d.id + '">✕</button>';
      item.onclick = function(e) {
        if (e.target.getAttribute('data-del-doc')) {
          documents = documents.filter(function(x) { return x.id !== d.id; });
          saveDocuments();
          renderSidebar();
          return;
        }
        openArtifact({ title: d.title, content: d.content, lang: d.lang || 'text' }, { focus: true });
      };
      list.appendChild(item);
    });
  }


  function addDocument(doc) {
    documents.push({
      id: 'doc_' + Date.now(),
      title: doc.title || t('docs'),
      content: String(doc.content || '').slice(0, 20000),
      type: doc.type || 'note',
      lang: doc.lang || '',
      created: Date.now(),
      projectId: null
    });
    while (documents.length > 40) {
      var evict = documents.findIndex(function(x) { return !x.projectId; });
      documents.splice(evict === -1 ? 0 : evict, 1);
    }
    saveDocuments();
  }

  function scrollToEnd() {
    var s = document.getElementById('chat-scroll');
    if (s) s.scrollTop = s.scrollHeight;
  }

  function paintAttachedBadge(file) {
    var nameEl = document.getElementById('attached-name');
    var kindEl = document.getElementById('attached-kind');
    var thumb = document.getElementById('attached-thumb');
    var badge = document.getElementById('attached-badge');
    if (nameEl) nameEl.textContent = file.name;
    if (kindEl) kindEl.textContent = file.kind === 'image' ? t('image') : t('attached');
    if (thumb) {
      if (file.kind === 'image' && file.dataUrl) {
        thumb.src = file.dataUrl;
        thumb.hidden = false;
      } else {
        thumb.removeAttribute('src');
        thumb.hidden = true;
      }
    }
    if (badge) badge.classList.add('active');
  }
  function compressImageFile(file, maxDim, quality) {
    return new Promise(function(resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function() {
        var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = function() {
        URL.revokeObjectURL(url);
        reject(new Error('image'));
      };
      img.src = url;
    });
  }
  function attachDroppedFile(f) {
    if (!f) return;
    if (/^image\//.test(f.type)) {
      if (f.size > 8 * 1024 * 1024) return alert(t('maxImage'));
      compressImageFile(f, 1280, 0.72).then(function(dataUrl) {
        attachedFile = { name: f.name, kind: 'image', dataUrl: dataUrl, mime: 'image/jpeg' };
        paintAttachedBadge(attachedFile);
      }).catch(function() { alert(t('error')); });
      return;
    }
    if (f.size > 250000) return alert('Tamaño máximo: 250 KB.');
    var reader = new FileReader();
    reader.onload = function(ev) {
      attachedFile = { name: f.name, kind: 'text', content: ev.target.result };
      paintAttachedBadge(attachedFile);
    };
    reader.readAsText(f);
  }
  function handleFileUpload(e) {
    var f = e.target.files[0];
    attachDroppedFile(f);
  }
  function removeAttachedFile() {
    attachedFile = null;
    var badge = document.getElementById('attached-badge');
    if (badge) badge.classList.remove('active');
    var thumb = document.getElementById('attached-thumb');
    if (thumb) { thumb.hidden = true; thumb.removeAttribute('src'); }
    var up = document.getElementById('file-uploader');
    if (up) up.value = '';
  }

  var speechRec = null;
  var mediaRec = null;
  var mediaChunks = [];
  var mediaStream = null;
  function stopMicVisual() {
    var btn = document.getElementById('mic-btn');
    if (btn) btn.classList.remove('recording');
  }
  function appendTranscript(text) {
    if (!text) return;
    var inp = document.getElementById('prompt-input');
    if (!inp) return;
    inp.value = (inp.value ? inp.value.replace(/\s+$/, '') + ' ' : '') + text;
    autoResize(inp);
  }
  async function transcribeBlob(blob) {
    var headers = {};
    if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
    var userApiKey = localStorage.getItem('ta_custom_key') || '';
    if (userApiKey) headers['x-groq-user-key'] = userApiKey;
    var fd = new FormData();
    fd.append('file', blob, 'voice.webm');
    var lang = (window.TA && TA.lang) ? TA.lang() : 'zh-TW';
    var res = await fetch('/api/transcribe?lang=' + encodeURIComponent(lang), { method: 'POST', headers: headers, body: fd });
    var data = await res.json().catch(function() { return {}; });
    if (!res.ok) throw new Error(data.error || t('error'));
    return data.text || '';
  }
  function toggleSpeech() {
    var btn = document.getElementById('mic-btn');
    if (speechRec || mediaRec) {
      if (speechRec) { try { speechRec.stop(); } catch (e) {} speechRec = null; }
      if (mediaRec && mediaRec.state !== 'inactive') { try { mediaRec.stop(); } catch (e) {} }
      return;
    }
    stopSpeaking();
    var liveText = '';
    var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      speechRec = new SpeechRec();
      speechRec.lang = uiLangBcp47();
      speechRec.interimResults = true;
      speechRec.continuous = true;
      speechRec.onstart = function() { if (btn) btn.classList.add('recording'); };
      speechRec.onresult = function(ev) {
        var out = '';
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) out += ev.results[i][0].transcript;
        }
        if (out) { liveText += (liveText ? ' ' : '') + out; appendTranscript(out); }
      };
      speechRec.onerror = function() {};
      try { speechRec.start(); } catch (e) { speechRec = null; }
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (!speechRec) alert(t('voiceUnsupported'));
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
      mediaStream = stream;
      mediaChunks = [];
      var mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      mediaRec = new MediaRecorder(stream);
      mediaRec.ondataavailable = function(ev) { if (ev.data && ev.data.size) mediaChunks.push(ev.data); };
      mediaRec.onstart = function() { if (btn) btn.classList.add('recording'); };
      mediaRec.onstop = function() {
        stopMicVisual();
        if (mediaStream) mediaStream.getTracks().forEach(function(tr) { tr.stop(); });
        mediaStream = null;
        mediaRec = null;
        if (speechRec) { try { speechRec.stop(); } catch (e2) {} speechRec = null; }
        if (liveText.trim()) return;
        if (!mediaChunks.length) return;
        var blob = new Blob(mediaChunks, { type: mime });
        mediaChunks = [];
        var inp = document.getElementById('prompt-input');
        if (inp) inp.placeholder = t('transcribing');
        transcribeBlob(blob).then(function(text) {
          appendTranscript(text);
          if (inp) inp.placeholder = t('askPh');
        }).catch(function() {
          if (inp) inp.placeholder = t('askPh');
          alert(t('error'));
        });
      };
      mediaRec.start();
      setTimeout(function() {
        if (mediaRec && mediaRec.state === 'recording') mediaRec.stop();
      }, 45000);
    }).catch(function() {
      if (!speechRec) alert(t('voiceUnsupported'));
    });
  }
  function speakLastReply() {
    var chat = chats[currentChatId];
    if (!chat || !chat.messages) return;
    for (var i = chat.messages.length - 1; i >= 0; i--) {
      if (chat.messages[i].role === 'ai' || chat.messages[i].role === 'assistant') {
        var btn = document.getElementById('speak-last-btn');
        speakText(chat.messages[i].content || '', btn);
        return;
      }
    }
  }

  function openModal(id) { var m = document.getElementById(id); if (m) m.classList.add('active'); }
  function closeModal(id) { var m = document.getElementById(id); if (m) m.classList.remove('active'); }
  function showSettingsPane(id) {
    document.querySelectorAll('.settings-pane').forEach(function(p) { p.classList.toggle('active', p.id === id); });
    document.querySelectorAll('.settings-nav-btn').forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-pane') === id); });
  }
  function setChoice(pref, value) {
    document.querySelectorAll('[data-pref="' + pref + '"]').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-value') === value);
    });
  }
  function openSettingsModal(tab) {
    if (typeof tab !== 'string') tab = 'pane-general';
    var prefs = (server.settings && server.settings.prefs) || {};
    var pEl = document.getElementById('custom-system-prompt');
    if (pEl) pEl.value = prefs.custom_prompt || '';
    var enterEl = document.getElementById('set-enter-send');
    var autoEl = document.getElementById('set-auto-search');
    if (enterEl) enterEl.checked = localStorage.getItem('ta_enter_send') !== '0';
    if (autoEl) autoEl.checked = localStorage.getItem('ta_auto_search') === '1';
    var autoReadEl = document.getElementById('set-auto-read');
    if (autoReadEl) autoReadEl.checked = localStorage.getItem('ta_auto_read') === '1';
    var timeEl = document.getElementById('set-show-time');
    var confEl = document.getElementById('set-confirm-del');
    var compactEl = document.getElementById('set-compact-sb');
    var motionEl = document.getElementById('set-reduce-motion');
    var docsEl = document.getElementById('set-use-docs');
    var ephEl = document.getElementById('set-ephemeral');
    if (timeEl) timeEl.checked = localStorage.getItem('ta_show_time') === '1';
    if (confEl) confEl.checked = localStorage.getItem('ta_confirm_del') !== '0';
    if (compactEl) compactEl.checked = localStorage.getItem('ta_compact_sb') === '1';
    if (motionEl) motionEl.checked = localStorage.getItem('ta_reduce_motion') === '1';
    if (docsEl) docsEl.checked = localStorage.getItem('ta_use_docs') !== '0';
    if (ephEl) ephEl.checked = localStorage.getItem('ta_ephemeral') === '1';
    setChoice('ta_theme', localStorage.getItem('ta_theme') || 'dark');
    setChoice('ta_accent', localStorage.getItem('ta_accent') || 'auto');
    setChoice('ta_font', localStorage.getItem('ta_font') || 'md');
    setChoice('ta_len_mode', localStorage.getItem('ta_len_mode') || 'normal');
    setChoice('ta_tone', prefs.tone || 'auto');
    if (window.TA && TA.mountPicker) TA.mountPicker(document.getElementById('set-lang'));
    var modelSel = document.getElementById('set-default-model');
    if (modelSel) {
      modelSel.innerHTML = '';
      MODELS.forEach(function(m) {
        var o = document.createElement('option');
        o.value = m.id; o.textContent = m.name + (m.desc ? ' · ' + m.desc : '');
        if (m.providerId === selectedProviderId && m.model === selectedModel) o.selected = true;
        modelSel.appendChild(o);
      });
    }
    var curPass = document.getElementById('set-cur-pass');
    var neu = document.getElementById('set-new-pass');
    var neu2 = document.getElementById('set-new-pass2');
    [curPass, neu, neu2].forEach(function(el) { if (el) el.value = ''; });
    var vh = document.getElementById('app-version-hint');
    if (vh) vh.textContent = 'Personal AI ' + (server.version || '');
    var st = document.getElementById('settings-status');
    if (st) st.style.display = 'none';
    renderProviderList();
    fillParamsPane();
    fillSearchPane();
    renderMemoryPane();
    if (server.loaded) { loadMemories(); loadExtensions(); }
    if (window.PAI_onSettingsOpen) try { window.PAI_onSettingsOpen(); } catch (e) {}
    showSettingsPane(tab || 'pane-general');
    openModal('modal-settings');
  }
  async function saveSettings() {
    var pEl = document.getElementById('custom-system-prompt');
    var p = pEl ? pEl.value.trim() : '';
    var toneBtn = document.querySelector('[data-pref="ta_tone"].active');
    var tone = toneBtn ? toneBtn.getAttribute('data-value') : 'auto';
    var enterEl = document.getElementById('set-enter-send');
    var autoEl = document.getElementById('set-auto-search');
    localStorage.setItem('ta_enter_send', enterEl && enterEl.checked ? '1' : '0');
    localStorage.setItem('ta_auto_search', autoEl && autoEl.checked ? '1' : '0');
    var autoReadEl = document.getElementById('set-auto-read');
    localStorage.setItem('ta_auto_read', autoReadEl && autoReadEl.checked ? '1' : '0');
    var timeEl = document.getElementById('set-show-time');
    var confEl = document.getElementById('set-confirm-del');
    var compactEl = document.getElementById('set-compact-sb');
    var motionEl = document.getElementById('set-reduce-motion');
    var docsEl = document.getElementById('set-use-docs');
    var ephEl = document.getElementById('set-ephemeral');
    localStorage.setItem('ta_show_time', timeEl && timeEl.checked ? '1' : '0');
    localStorage.setItem('ta_confirm_del', confEl && confEl.checked ? '1' : '0');
    localStorage.setItem('ta_compact_sb', compactEl && compactEl.checked ? '1' : '0');
    localStorage.setItem('ta_reduce_motion', motionEl && motionEl.checked ? '1' : '0');
    localStorage.setItem('ta_use_docs', docsEl && docsEl.checked ? '1' : '0');
    localStorage.setItem('ta_ephemeral', ephEl && ephEl.checked ? '1' : '0');
    var modelSel = document.getElementById('set-default-model');
    if (modelSel && modelSel.value) setModel(modelSel.value);
    applyAppearance();
    if (ephEl && ephEl.checked) saveChats();
    if (autoEl) isWebSearch = !!autoEl.checked;
    var webBtn = document.getElementById('web-search-pill');
    if (webBtn) { if (isWebSearch) webBtn.classList.add('active'); else webBtn.classList.remove('active'); }
    scheduleSync();
    var st = document.getElementById('settings-status');
    try {
      if (server.loaded) {
        var d = await apiJson('/api/settings', { method: 'PUT', body: { prefs: { custom_prompt: p, tone: tone === 'auto' ? '' : tone } } });
        server.settings = d.settings;
      }
      if (st) { st.textContent = t('saved'); st.style.display = 'block'; }
      setTimeout(function() { closeModal('modal-settings'); }, 500);
    } catch (e) {
      if (st) { st.textContent = e.message || '儲存失敗'; st.style.display = 'block'; }
    }
  }
  async function changePasswordFromSettings() {
    var cur = (document.getElementById('set-cur-pass') || {}).value || '';
    var neu = (document.getElementById('set-new-pass') || {}).value || '';
    var neu2 = (document.getElementById('set-new-pass2') || {}).value || '';
    var st = document.getElementById('pass-status');
    var say = function(text, bad) { if (st) { st.textContent = text; st.style.color = bad ? 'var(--red)' : 'var(--green)'; } };
    if (neu.length < 8) return say('新密碼至少 8 個字元', true);
    if (neu !== neu2) return say('兩次輸入的新密碼不同', true);
    try {
      await apiJson('/api/password', { method: 'POST', body: { current: cur, next: neu } });
      ['set-cur-pass', 'set-new-pass', 'set-new-pass2'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
      say('密碼已變更。下次登入請使用新密碼。', false);
    } catch (err) { say(err.message || '變更失敗', true); }
  }
  async function clearAllData() {
    var st = document.getElementById('clear-all-status');
    var phrase = prompt('這會刪除 D1 與這個瀏覽器中的所有資料（登入密碼保留），無法復原。\n請輸入「清除所有資料」確認：');
    if (phrase === null) return;
    if (phrase.trim() !== '清除所有資料') { if (st) st.textContent = '確認文字不符，未執行'; return; }
    try {
      await apiJson('/api/data/clear', { method: 'POST', body: { confirm: '清除所有資料' } });
      var keep = { ta_theme: 1, ta_accent: 1, ta_font: 1, ta_lang: 1 };
      Object.keys(localStorage).forEach(function(k) { if (!keep[k]) { try { localStorage.removeItem(k); } catch (e) {} } });
      location.reload();
    } catch (e) { if (st) { st.textContent = e.message || '清除失敗'; st.style.color = 'var(--red)'; } }
  }
  function logout() {
    authToken = ''; currentUser = null;
    try { fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }).catch(function() {}); } catch (e) {}
    setTimeout(function() { location.href = '/login'; }, 120);
  }
  function updateUserUI() {
    var nameEl = document.getElementById('user-display-name');
    var tierEl = document.getElementById('user-display-tier');
    var topText = document.getElementById('topbar-auth-text');
    var letter = document.getElementById('user-letter');
    if (nameEl) nameEl.textContent = 'Owner';
    if (tierEl) tierEl.textContent = server.d1 && !server.d1.ok ? 'D1 未就緒' : (activeProvider() ? (activeProvider().name) : '尚未設定供應商');
    if (topText) topText.textContent = '設定';
    if (letter) letter.textContent = 'O';
  }

  function openKnowledgeModal() { renderKnowledgeList(); openModal('modal-knowledge'); }
  function renderKnowledgeList() {
    var count = document.getElementById('knowledge-count');
    var box = document.getElementById('knowledge-list-box');
    if (count) count.textContent = documents.length;
    if (!box) return;
    if (!documents.length) { box.innerHTML = '<div class="empty-side">沒有文件。</div>'; return; }
    box.innerHTML = documents.map(function(item) {
      return '<div style="background:var(--elev);border:1px solid var(--line);padding:6px 8px;border-radius:8px;display:flex;justify-content:space-between;gap:8px">' +
        '<div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:0.75rem">' + escapeHtml(item.title) + '</div>' +
        '<button data-del-doc="' + item.id + '" class="del-rag-item-btn mini-x" style="opacity:1" type="button">✕</button></div>';
    }).join('');
  }
  function saveKnowledge() {
    var titleEl = document.getElementById('train-title');
    var contentEl = document.getElementById('train-content');
    var title = titleEl ? titleEl.value.trim() : '';
    var content = contentEl ? contentEl.value.trim() : '';
    if (!content) return alert('請輸入內容。');
    addDocument({ title: title || '筆記', content: content, type: 'note' });
    if (titleEl) titleEl.value = '';
    if (contentEl) contentEl.value = '';
    renderKnowledgeList();
    renderSidebar();
  }
  function deleteKnowledgeById(id) {
    documents = documents.filter(function(d) { return d.id !== id; });
    saveDocuments();
    renderKnowledgeList();
    renderSidebar();
  }
  function clearAllKnowledge() {
    if (!confirm(t('confirmClear'))) return;
    documents = [];
    saveDocuments();
    renderKnowledgeList();
    renderSidebar();
  }
  async function handleImportKnowledge(e) {
    var files = e.target.files;
    if (!files || !files.length) return;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (f.size > 200000) continue;
      var txt = await f.text();
      addDocument({ title: f.name.replace(/\.[^/.]+$/, ''), content: txt.slice(0, 8000), type: 'upload' });
    }
    e.target.value = '';
    renderKnowledgeList();
    renderSidebar();
  }

  function initApp() {
    try {
      setLengthMode(currentLength);
      fillLangSelect();
      renderModelPicker();
      initProviderUI();
      applyI18n();
      var syncBtn = document.getElementById('sync-now-btn');
      if (syncBtn) syncBtn.addEventListener('click', syncNow);
      initMemoryPane();
      initSearchPane();
      initProjects();
      initExtensions();
      fetch('/api/me', { credentials: 'same-origin' })
        .then(function(r) {
          if (r.status === 401) { location.href = '/login'; return null; }
          return r.json();
        })
        .then(function(d) {
          if (!d || !d.user) return;
          currentUser = d.user;
          server.d1 = (d.config && d.config.d1) || { ok: false, error: 'D1 未綁定' };
          server.version = (d.config && d.config.version) || '';
          syncMeta.enabled = !!server.d1.ok;
          updateNoProviderBanner();
          if (!server.d1.ok) { updateUserUI(); setSyncStatus('D1 未就緒，同步停用', true); return; }
          setArtifactDest(artifactDest, false);
          loadServerState().then(function() {
            updateUserUI();
            loadExtensions();
            return loadProjectList();
          }).then(function() {
            var openId = localStorage.getItem('ta_project_open');
            if (openId && proj.list.some(function(p) { return p.id === openId; })) openProject(openId);
          });
          syncBootstrap();
        }).catch(function(e) { console.error('bootstrap failed', e); });
      if (isWebSearch) {
        var wsb = document.getElementById('web-search-pill');
        if (wsb) wsb.classList.add('active');
      }
    } catch(initErr) { console.error('Init error:', initErr); }

    var newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);
    var tempChatBtn = document.getElementById('temp-chat-btn');
    if (tempChatBtn) tempChatBtn.addEventListener('click', startTempChat);
    var cmdOpenBtn = document.getElementById('cmd-open-btn');
    if (cmdOpenBtn) cmdOpenBtn.addEventListener('click', openCommandPalette);
    var cmdOverlay = document.getElementById('cmd-overlay');
    if (cmdOverlay) cmdOverlay.addEventListener('click', function(e) { if (e.target === cmdOverlay) closeCommandPalette(); });
    var cmdInput = document.getElementById('cmd-input');
    if (cmdInput) {
      cmdInput.addEventListener('input', function() { renderCommandPalette(this.value); });
      cmdInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { e.preventDefault(); closeCommandPalette(); }
        if (e.key === 'Enter') {
          e.preventDefault();
          var first = document.querySelector('#cmd-list .cmd-item');
          if (first) first.click();
        }
      });
    }
    updateTempBadge();
    var historySearch = document.getElementById('history-search');
    if (historySearch) historySearch.addEventListener('input', function() { renderSidebar(this.value.trim()); });
    var sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', function() { toggleSidebar(true); });
    var sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', function() { toggleSidebar(false); });
    var sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', function() { toggleSidebar(false); });
    document.querySelectorAll('.sb-tab').forEach(function(t) {
      t.addEventListener('click', function() { setSidebarView(this.getAttribute('data-view')); });
    });
    document.addEventListener('click', function(e) {
      var n = e.target && e.target.closest ? e.target.closest('[data-open-settings]') : null;
      if (!n) return;
      e.preventDefault();
      var tab = n.getAttribute('data-open-settings') || 'pane-general';
      if (n.id === 'topbar-auth-btn' && !(currentUser && authToken)) {
        window.location.href = '/login';
        return;
      }
      openSettingsModal(tab);
    });
    var sendBtn = document.getElementById('send-btn');
    if (sendBtn) sendBtn.addEventListener('click', function() {
      if (isGenerating) abortGeneration();
      else handleSend();
    });
    var pickerBtn = document.getElementById('model-picker-btn');
    var picker = document.getElementById('model-picker');
    if (pickerBtn && picker) {
      pickerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var open = picker.classList.toggle('open');
        pickerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    var promptInput = document.getElementById('prompt-input');
    if (promptInput) {
      promptInput.addEventListener('keydown', function(e) {
        var enterSends = localStorage.getItem('ta_enter_send') !== '0';
        if (e.key === 'Enter' && !e.shiftKey) {
          if (enterSends && !e.ctrlKey && !e.metaKey) { e.preventDefault(); handleSend(); }
          else if (!enterSends && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); }
        }
      });
      promptInput.addEventListener('input', function() { autoResize(this); });
    }
    var webSearchPill = document.getElementById('web-search-pill');
    if (webSearchPill) webSearchPill.addEventListener('click', toggleWebSearch);
    var imageGenPill = document.getElementById('image-gen-pill');
    if (imageGenPill) imageGenPill.addEventListener('click', toggleImageMode);
    initDockMenu();
    var attachFileBtn = document.getElementById('attach-file-btn');
    var fileUploader = document.getElementById('file-uploader');
    if (attachFileBtn && fileUploader) {
      attachFileBtn.addEventListener('click', function() { fileUploader.click(); });
      fileUploader.addEventListener('change', handleFileUpload);
    }
    var removeFileBtn = document.getElementById('remove-file-btn');
    if (removeFileBtn) removeFileBtn.addEventListener('click', removeAttachedFile);
    var micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.addEventListener('click', toggleSpeech);
    var speakLastBtn = document.getElementById('speak-last-btn');
    if (speakLastBtn) speakLastBtn.addEventListener('click', speakLastReply);
    var autoReadLive = document.getElementById('set-auto-read');
    if (autoReadLive) autoReadLive.addEventListener('change', function() {
      localStorage.setItem('ta_auto_read', this.checked ? '1' : '0');
    });
    var capsule = document.querySelector('.capsule-box');
    if (capsule) {
      ;['dragenter', 'dragover'].forEach(function(ev) {
        capsule.addEventListener(ev, function(e) { e.preventDefault(); capsule.classList.add('drag-over'); });
      });
      ;['dragleave', 'drop'].forEach(function(ev) {
        capsule.addEventListener(ev, function(e) { e.preventDefault(); capsule.classList.remove('drag-over'); });
      });
      capsule.addEventListener('drop', function(e) {
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) attachDroppedFile(f);
      });
      capsule.addEventListener('paste', function(e) {
        var items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') === 0) {
            var f = items[i].getAsFile();
            if (f) { e.preventDefault(); attachDroppedFile(f); }
            break;
          }
        }
      });
    }
    var saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
    document.querySelectorAll('.settings-nav-btn[data-pane]').forEach(function(btn) {
      btn.addEventListener('click', function() { showSettingsPane(this.getAttribute('data-pane')); });
    });
    document.querySelectorAll('.choice-pill[data-pref], .theme-card[data-pref], .accent-dot[data-pref]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var pref = btn.getAttribute('data-pref');
        var val = btn.getAttribute('data-value');
        localStorage.setItem(pref, val);
        setChoice(pref, val);
        if (pref === 'ta_theme' || pref === 'ta_font' || pref === 'ta_accent') applyAppearance();
        if (pref === 'ta_len_mode') setLengthMode(val);
      });
    });
    var compactEl = document.getElementById('set-compact-sb');
    if (compactEl) compactEl.addEventListener('change', function() {
      localStorage.setItem('ta_compact_sb', this.checked ? '1' : '0');
      applyAppearance();
    });
    var motionEl = document.getElementById('set-reduce-motion');
    if (motionEl) motionEl.addEventListener('change', function() {
      localStorage.setItem('ta_reduce_motion', this.checked ? '1' : '0');
      applyAppearance();
    });
    function doLogout() {
      if (!confirm(t('logoutConfirm'))) return;
      logout();
    }
    var settingsLogout = document.getElementById('settings-logout-btn');
    if (settingsLogout) settingsLogout.addEventListener('click', doLogout);
    var navLogout = document.getElementById('nav-logout-btn');
    if (navLogout) navLogout.addEventListener('click', doLogout);
    var clearChatsBtn = document.getElementById('btn-clear-chats');
    if (clearChatsBtn) clearChatsBtn.addEventListener('click', function() {
      if (!confirm(t('clearChatsConfirm'))) return;
      chats = {};
      saveChats();
      startNewChat();
      var st = document.getElementById('settings-status');
      if (st) { st.textContent = t('clearChatsOk'); st.style.display = 'block'; }
    });
    var clearDocsBtn = document.getElementById('btn-clear-docs');
    if (clearDocsBtn) clearDocsBtn.addEventListener('click', clearAllKnowledge);
    var changePassBtn = document.getElementById('change-pass-btn');
    if (changePassBtn) changePassBtn.addEventListener('click', changePasswordFromSettings);
    var clearAllBtn = document.getElementById('btn-clear-all');
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllData);
    var saveKnowledgeBtn = document.getElementById('save-knowledge-btn');
    if (saveKnowledgeBtn) saveKnowledgeBtn.addEventListener('click', saveKnowledge);
    var clearRagBtn = document.getElementById('clear-rag-btn');
    if (clearRagBtn) clearRagBtn.addEventListener('click', clearAllKnowledge);
    var importRagFile = document.getElementById('import-rag-file');
    if (importRagFile) importRagFile.addEventListener('change', handleImportKnowledge);
    var importDocsBtn = document.getElementById('import-docs-btn');
    if (importDocsBtn && importRagFile) importDocsBtn.addEventListener('click', function() { importRagFile.click(); });
    document.getElementById('art-close-btn').addEventListener('click', closeArtifact);
    document.getElementById('art-copy-btn').addEventListener('click', function() {
      readArtifactDraft();
      if (!currentArtifact) return;
      var cb = this;
      var done = function() { cb.textContent = artT('copied'); setTimeout(function() { cb.textContent = artT('copy'); }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(currentArtifact.content || '').then(done, function() {});
    });
    document.querySelectorAll('.art-view-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setArtView(btn.getAttribute('data-view')); });
    });
    document.getElementById('art-download-btn').addEventListener('click', downloadArtifact);
    document.getElementById('art-fs-btn').addEventListener('click', function() {
      var panel = document.getElementById('art-panel');
      setArtFullscreen(!(panel && panel.classList.contains('fs')));
    });
    document.getElementById('art-version').addEventListener('change', function() {
      if (!currentArtifact || !currentArtifact.versions) return;
      var v = currentArtifact.versions[Number(this.value)];
      if (!v) return;
      var ed = document.getElementById('art-editor');
      if (ed) ed.value = v.content;
      currentArtifact.content = v.content;
      refreshArtifactPreview();
    });
    document.getElementById('art-save-btn').addEventListener('click', function() {
      readArtifactDraft();
      if (!currentArtifact) return;
      artPushVersion(currentArtifact, currentArtifact.content || '');
      renderArtVersions();
      addDocument({ title: currentArtifact.title, content: currentArtifact.content, type: 'artifact', lang: currentArtifact.lang });
      renderSidebar();
    });
    fillArtFormatSelect();
    document.querySelectorAll('.art-dest-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setArtifactDest(btn.getAttribute('data-dest'), true); });
    });
    var artFormat = document.getElementById('art-format');
    if (artFormat) {
      artFormat.addEventListener('change', function() {
        readArtifactDraft();
        refreshArtifactPreview();
      });
    }
    var artTitle = document.getElementById('art-title');
    if (artTitle) {
      artTitle.addEventListener('input', function() {
        if (artTitle.value.length > 72) artTitle.value = artTitle.value.slice(0, 72);
        updateTitleCount();
        readArtifactDraft();
      });
    }
    var extrasToggle = document.getElementById('art-extras-toggle');
    var extrasBody = document.getElementById('art-extras-body');
    if (extrasToggle && extrasBody) {
      extrasToggle.addEventListener('click', function() {
        extrasBody.hidden = !extrasBody.hidden;
      });
    }
    ['art-sources', 'art-resources', 'art-widgets'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function() { readArtifactDraft(); });
    });
    var artEditor = document.getElementById('art-editor');
    if (artEditor) {
      artEditor.addEventListener('input', scheduleArtifactPreview);
    }
    syncArtifactActions();
    document.querySelectorAll('.length-opt-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { var mode = this.getAttribute('data-len'); if (mode) setLengthMode(mode); });
    });
    document.addEventListener('click', function(e) {
      var modelOpt = e.target.closest('.model-option');
      if (modelOpt) { setModel(modelOpt.getAttribute('data-model')); return; }
      var pickerEl = document.getElementById('model-picker');
      if (pickerEl && !pickerEl.contains(e.target)) pickerEl.classList.remove('open');
      if (e.target && e.target.id === 'toggle-archived') { showArchived = !showArchived; renderSidebar(); return; }
      var closeBtn = e.target.closest('[data-modal]');
      if (closeBtn && closeBtn.tagName === 'BUTTON') { var mId = closeBtn.getAttribute('data-modal'); if (mId) closeModal(mId); return; }
      if (e.target && e.target.id === 'logout-btn') { logout(); return; }
      var chipBtn = e.target.closest('.hero-chip');
      if (chipBtn) { var p = chipBtn.getAttribute('data-prompt'); if (p) sendQuick(p); return; }
      var imgEl = e.target.closest('.ai-image-img');
      if (imgEl) { var u = imgEl.getAttribute('data-img-url'); if (u) window.open(u, '_blank'); return; }
      var codeCopy = e.target.closest('.code-copy-btn');
      if (codeCopy) {
        navigator.clipboard.writeText(decodeURIComponent(codeCopy.getAttribute('data-code') || '')).then(function() {
          codeCopy.textContent = '已複製';
          setTimeout(function() { codeCopy.textContent = '複製'; }, 1800);
        }).catch(function() {});
        return;
      }
      var delRag = e.target.closest('.del-rag-item-btn');
      if (delRag) { var id = delRag.getAttribute('data-del-doc'); if (id) deleteKnowledgeById(id); return; }
    });
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); openSettingsModal('pane-general'); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); openCommandPalette(); return; }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') { e.preventDefault(); startTempChat(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); startNewChat(); }
      if (e.key === 'Escape') {
        var openM = document.querySelectorAll('.modal-backdrop.active');
        if (openM.length) { openM[openM.length - 1].classList.remove('active'); return; }
        closeCommandPalette();
        var artP = document.getElementById('art-panel');
        if (artP && artP.classList.contains('fs')) { setArtFullscreen(false); return; }
        closeArtifact();
        var p = document.getElementById('model-picker');
        if (p) p.classList.remove('open');
        if (isGenerating) abortGeneration();
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        var pi = document.getElementById('prompt-input');
        if (pi) pi.focus();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
  else initApp();
})();
