// Smartschool Mod – Popup
"use strict";

const MOD_KEY = "smartschool_mod_settings";

let state = {
  displayName:       "",
  avatarDataUrl:     "",
  customTitle:       "",
  faviconDataUrl:    "",
  navColor:          "",
  bgColor:           "",
  fontFamily:        "",
  customCSS:         "",
  hideElements:      [],
  fakeMessages:      null,
  fakeNotifications: null,
  fakeNews:          null,
};

const byId = (id) => document.getElementById(id);

// ─── Discord ──────────────────────────────────────────────────────────────────

byId("btnDiscord").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://discord.gg/FWTsX9wSXx" });
});

byId("btnGithub").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://github.com/codevictorini/Smartschool-Mod" });
});

byId("btnUpdates").addEventListener("click", () => {
  window.location.href = "updates.html";
});

// ─── Review ───────────────────────────────────────────────────────────────────

byId("btnReview").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://chromewebstore.google.com/detail/smartschool-mod/ljckdkmlkanjmldpecjahangpfnpaldh/reviews" });
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    byId("tab-" + btn.dataset.tab).classList.add("active");
  });
});

// ─── Kleur helpers ────────────────────────────────────────────────────────────

function validHex(c) {
  return typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? c : "";
}

// ─── Kleurpickers ─────────────────────────────────────────────────────────────

byId("navColor").addEventListener("input", () => {
  state.navColor = byId("navColor").value;
  byId("navColorHex").textContent = byId("navColor").value;
  syncPresets("navPresets", state.navColor);
});
byId("bgColor").addEventListener("input", () => {
  state.bgColor = byId("bgColor").value;
  byId("bgColorHex").textContent = byId("bgColor").value;
  syncPresets("bgPresets", state.bgColor);
});

byId("btnResetNav").addEventListener("click", () => {
  state.navColor = "";
  byId("navColor").value = "#ff520e";
  byId("navColorHex").textContent = "—";
  syncPresets("navPresets", "");
});
byId("btnResetBg").addEventListener("click", () => {
  state.bgColor = "";
  byId("bgColor").value = "#f6f7f8";
  byId("bgColorHex").textContent = "—";
  syncPresets("bgPresets", "");
});

byId("navPresets").querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.navColor = btn.dataset.color;
    byId("navColor").value = btn.dataset.color;
    byId("navColorHex").textContent = btn.dataset.color;
    syncPresets("navPresets", state.navColor);
  });
});
byId("bgPresets").querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.bgColor = btn.dataset.color;
    byId("bgColor").value = btn.dataset.color;
    byId("bgColorHex").textContent = btn.dataset.color;
    syncPresets("bgPresets", state.bgColor);
  });
});

function syncPresets(id, color) {
  byId(id).querySelectorAll(".preset").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.color === color);
  });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

byId("btnUploadAvatar").addEventListener("click", () => {
  byId("avatarUrl").style.display = "none";
  byId("avatarFile").click();
});
byId("avatarFile").addEventListener("change", () => {
  const file = byId("avatarFile").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { state.avatarDataUrl = e.target.result; setAvatarPreview(e.target.result); };
  reader.readAsDataURL(file);
});
byId("btnUrlAvatar").addEventListener("click", () => {
  const u = byId("avatarUrl");
  u.style.display = u.style.display === "none" ? "block" : "none";
});
byId("avatarUrl").addEventListener("input",  syncAvatarUrl);
byId("avatarUrl").addEventListener("change", syncAvatarUrl);
function syncAvatarUrl() {
  const url = byId("avatarUrl").value.trim();
  if (url) { state.avatarDataUrl = url; setAvatarPreview(url); }
}
byId("btnClearAvatar").addEventListener("click", () => {
  state.avatarDataUrl = "";
  byId("avatarImg").src = "";
  byId("avatarImg").style.display = "none";
  byId("avatarPlaceholder").style.display = "";
  byId("avatarUrl").value = "";
  byId("avatarUrl").style.display = "none";
  byId("avatarFile").value = "";
});
function setAvatarPreview(src) {
  byId("avatarImg").src = src;
  byId("avatarImg").style.display = "block";
  byId("avatarPlaceholder").style.display = "none";
}

// ─── Favicon ──────────────────────────────────────────────────────────────────

byId("btnFaviconMod").addEventListener("click", () => {
  fetch(chrome.runtime.getURL("icons/icon48.png"))
    .then((r) => r.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        state.faviconDataUrl = e.target.result;
        setFaviconPreview(e.target.result);
      };
      reader.readAsDataURL(blob);
    });
});

byId("btnFaviconUpload").addEventListener("click", () => byId("faviconFile").click());
byId("faviconFile").addEventListener("change", () => {
  const file = byId("faviconFile").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.faviconDataUrl = e.target.result;
    setFaviconPreview(e.target.result);
  };
  reader.readAsDataURL(file);
});

byId("btnFaviconReset").addEventListener("click", () => {
  state.faviconDataUrl = "";
  byId("faviconImg").style.display = "none";
  byId("faviconPlaceholder").style.display = "";
  byId("faviconFile").value = "";
});

function setFaviconPreview(src) {
  byId("faviconImg").src = src;
  byId("faviconImg").style.display = "block";
  byId("faviconPlaceholder").style.display = "none";
}

// ─── Elementen verbergen ──────────────────────────────────────────────────────

byId("btnAddHide").addEventListener("click", addHideSelector);
byId("hideSelector").addEventListener("keydown", (e) => { if (e.key === "Enter") addHideSelector(); });

function addHideSelector() {
  const sel = byId("hideSelector").value.trim();
  if (!sel || state.hideElements.includes(sel)) return;
  try { document.querySelector(sel); } catch {
    showStatus("Ongeldige CSS-selector.", "error"); return;
  }
  state.hideElements.push(sel);
  byId("hideSelector").value = "";
  renderHideList();
}

// ─── Element pikken ───────────────────────────────────────────────────────────

let _pickPollTimer = null;

byId("btnPickElement").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.url?.includes("smartschool.be")) {
      showStatus("Open eerst een Smartschool-pagina.", "error"); return;
    }
    // Wis eventuele vorige pick
    chrome.storage.local.remove("smod_picked_selector");
    // Zeg aan de content script dat pik-modus start
    chrome.tabs.sendMessage(tabs[0].id, { action: "startPick" }, (resp) => {
      if (chrome.runtime.lastError || !resp?.ok) {
        showStatus("Herlaad de Smartschool-pagina.", "error"); return;
      }
      byId("btnPickElement").textContent = "⏳ Klik op een element...";
      byId("btnPickElement").classList.add("actief");
      // Poll storage tot de content script een selector terugschrijft
      _pickPollTimer = setInterval(() => {
        chrome.storage.local.get("smod_picked_selector", (data) => {
          if (!data.smod_picked_selector) return;
          const sel = data.smod_picked_selector;
          chrome.storage.local.remove("smod_picked_selector");
          clearInterval(_pickPollTimer);
          byId("btnPickElement").textContent = "🎯 Klik op een element";
          byId("btnPickElement").classList.remove("actief");
          if (!state.hideElements.includes(sel)) {
            state.hideElements.push(sel);
            renderHideList();
            showStatus("Element toegevoegd.", "success");
          } else {
            showStatus("Al in de lijst.", "");
          }
        });
      }, 300);
    });
  });
});

function renderHideList() {
  const hideListEl = byId("hideList");
  hideListEl.innerHTML = "";
  state.hideElements.forEach((sel, i) => {
    const tag = document.createElement("div");
    tag.className = "hide-tag";
    const span = document.createElement("span");
    span.textContent = sel;
    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.title = "Verwijder";
    btn.addEventListener("click", () => { state.hideElements.splice(i, 1); renderHideList(); });
    tag.appendChild(span);
    tag.appendChild(btn);
    hideListEl.appendChild(tag);
  });
}

// ─── Toepassen ────────────────────────────────────────────────────────────────

byId("btnApply").addEventListener("click", () => {
  state.displayName = byId("displayName").value.trim();
  state.customTitle = byId("customTitle").value.trim();
  state.customCSS   = byId("customCSS").value;
  state.navColor    = validHex(byId("navColor").value) ? byId("navColor").value : "";
  state.bgColor     = validHex(byId("bgColor").value)  ? byId("bgColor").value  : "";
  state.fontFamily  = byId("fontFamily").value;

  const parseCounter = (id) => {
    const v = byId(id).value.trim();
    if (v === "") return null;
    const n = parseInt(v, 10);
    return (!isNaN(n) && n >= 0 && n <= 9999) ? n : null;
  };
  state.fakeMessages      = parseCounter("fakeMessages");
  state.fakeNotifications = parseCounter("fakeNotifications");

  const toSave = JSON.parse(JSON.stringify(state));
  chrome.storage.local.set({ [MOD_KEY]: toSave }, () => {
    if (chrome.runtime.lastError) { showStatus("Opslaan mislukt.", "error"); return; }
    sendToPage(toSave);
  });
});

function sendToPage(settings) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) { showStatus("Geen actief tabblad.", "error"); return; }
    if (!tabs[0].url || !tabs[0].url.includes("smartschool.be")) {
      showStatus("Open eerst een Smartschool-pagina.", "error"); return;
    }
    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { action: "applySettings", settings }, (response) => {
      if (chrome.runtime.lastError) {
        if (chrome.scripting) {
          chrome.scripting.executeScript({ target: { tabId }, files: ["content/content.js"] }, () => {
            if (chrome.runtime.lastError) { showStatus("Herlaad de pagina.", "error"); return; }
            chrome.scripting.insertCSS({ target: { tabId }, files: ["content/content.css"] });
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { action: "applySettings", settings }, (r) => {
                if (chrome.runtime.lastError || !r?.ok) showStatus("Herlaad de pagina.", "error");
                else showStatus("Toegepast!", "success");
              });
            }, 300);
          });
        } else {
          showStatus("Herlaad de Smartschool-pagina.", "error");
        }
        return;
      }
      if (response?.ok) showStatus("Toegepast!", "success");
      else showStatus("Iets ging mis.", "error");
    });
  });
}

// ─── Resetten ─────────────────────────────────────────────────────────────────

byId("btnReset").addEventListener("click", () => {
  if (!confirm("Alle instellingen wissen?")) return;
  chrome.storage.local.remove([MOD_KEY], () => {
    state = {
      displayName: "", avatarDataUrl: "", customTitle: "", faviconDataUrl: "",
      navColor: "", bgColor: "", fontFamily: "", customCSS: "", hideElements: [],
      fakeMessages: null, fakeNotifications: null, fakeNews: null,
    };
    loadUI();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "applySettings", settings: state }, () => void chrome.runtime.lastError);
      }
    });
    showStatus("Gereset.", "success");
  });
});

// ─── UI laden ─────────────────────────────────────────────────────────────────

function loadUI() {
  byId("displayName").value = state.displayName || "";
  byId("customTitle").value = state.customTitle || "";
  byId("customCSS").value   = state.customCSS   || "";

  if (validHex(state.navColor)) {
    byId("navColor").value = state.navColor;
    byId("navColorHex").textContent = state.navColor;
  } else {
    byId("navColor").value = "#ff520e";
    byId("navColorHex").textContent = "—";
  }
  if (validHex(state.bgColor)) {
    byId("bgColor").value = state.bgColor;
    byId("bgColorHex").textContent = state.bgColor;
  } else {
    byId("bgColor").value = "#f6f7f8";
    byId("bgColorHex").textContent = "—";
  }
  syncPresets("navPresets", state.navColor);
  syncPresets("bgPresets",  state.bgColor);
  byId("fontFamily").value = state.fontFamily || "";

  if (state.avatarDataUrl) {
    setAvatarPreview(state.avatarDataUrl);
    if (state.avatarDataUrl.startsWith("http")) byId("avatarUrl").value = state.avatarDataUrl;
  } else {
    byId("avatarImg").style.display = "none";
    byId("avatarPlaceholder").style.display = "";
  }

  if (state.faviconDataUrl) {
    setFaviconPreview(state.faviconDataUrl);
  } else {
    byId("faviconImg").style.display = "none";
    byId("faviconPlaceholder").style.display = "";
  }

  renderHideList();

  byId("fakeMessages").value      = state.fakeMessages      != null ? state.fakeMessages      : "";
  byId("fakeNotifications").value = state.fakeNotifications != null ? state.fakeNotifications : "";
}

chrome.storage.local.get(MOD_KEY, (data) => {
  if (data[MOD_KEY]) state = { ...state, ...data[MOD_KEY] };
  loadUI();
});

// ─── Status ───────────────────────────────────────────────────────────────────

function showStatus(msg, type = "") {
  byId("status").textContent = msg;
  byId("status").className   = "status " + type;
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => {
    byId("status").textContent = "";
    byId("status").className   = "status";
  }, 2800);
}
