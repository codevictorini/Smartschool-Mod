// Smartschool Mod – Popup
"use strict";

const MOD_KEY = "smartschool_mod_settings";

let state = {
  displayName:  "",
  avatarDataUrl: "",
  customTitle:  "",
  faviconDataUrl: "",
  navColor:     "",
  bgColor:      "",
  customCSS:    "",
  hideElements: [],
};

const byId = (id) => document.getElementById(id);

const displayNameInput  = byId("displayName");
const avatarImg         = byId("avatarImg");
const avatarFile        = byId("avatarFile");
const avatarUrlInput    = byId("avatarUrl");
const titleInput        = byId("customTitle");
const cssInput          = byId("customCSS");
const hideListEl        = byId("hideList");
const hideSelectorInput = byId("hideSelector");
const statusEl          = byId("status");
const navColorInput     = byId("navColor");
const navColorHex       = byId("navColorHex");
const bgColorInput      = byId("bgColor");
const bgColorHex        = byId("bgColorHex");

// ─── Discord ──────────────────────────────────────────────────────────────────

byId("btnDiscord").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://discord.gg/FWTsX9wSXx" });
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

navColorInput.addEventListener("input", () => {
  state.navColor = navColorInput.value;
  navColorHex.textContent = navColorInput.value;
  syncPresets("navPresets", state.navColor);
});
bgColorInput.addEventListener("input", () => {
  state.bgColor = bgColorInput.value;
  bgColorHex.textContent = bgColorInput.value;
  syncPresets("bgPresets", state.bgColor);
});

byId("btnResetNav").addEventListener("click", () => {
  state.navColor = "";
  navColorInput.value = "#ff520e";
  navColorHex.textContent = "—";
  syncPresets("navPresets", "");
});
byId("btnResetBg").addEventListener("click", () => {
  state.bgColor = "";
  bgColorInput.value = "#f6f7f8";
  bgColorHex.textContent = "—";
  syncPresets("bgPresets", "");
});

byId("navPresets").querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.navColor = btn.dataset.color;
    navColorInput.value = btn.dataset.color;
    navColorHex.textContent = btn.dataset.color;
    syncPresets("navPresets", state.navColor);
  });
});
byId("bgPresets").querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.bgColor = btn.dataset.color;
    bgColorInput.value = btn.dataset.color;
    bgColorHex.textContent = btn.dataset.color;
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
  avatarUrlInput.style.display = "none";
  avatarFile.click();
});
avatarFile.addEventListener("change", () => {
  const file = avatarFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { state.avatarDataUrl = e.target.result; setAvatarPreview(e.target.result); };
  reader.readAsDataURL(file);
});
byId("btnUrlAvatar").addEventListener("click", () => {
  avatarUrlInput.style.display = avatarUrlInput.style.display === "none" ? "block" : "none";
});
avatarUrlInput.addEventListener("input", syncAvatarUrl);
avatarUrlInput.addEventListener("change", syncAvatarUrl);
function syncAvatarUrl() {
  const url = avatarUrlInput.value.trim();
  if (url) { state.avatarDataUrl = url; setAvatarPreview(url); }
}
byId("btnClearAvatar").addEventListener("click", () => {
  state.avatarDataUrl = "";
  avatarImg.src = "";
  avatarImg.style.display = "none";
  byId("avatarPlaceholder").style.display = "";
  avatarUrlInput.value = "";
  avatarUrlInput.style.display = "none";
  avatarFile.value = "";
});
function setAvatarPreview(src) {
  avatarImg.src = src;
  avatarImg.style.display = "block";
  byId("avatarPlaceholder").style.display = "none";
}

// ─── Favicon ──────────────────────────────────────────────────────────────────

const faviconFile = byId("faviconFile");

// Mod-logo knop: gebruik icon48.png als data-URL
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

// Eigen upload
byId("btnFaviconUpload").addEventListener("click", () => faviconFile.click());
faviconFile.addEventListener("change", () => {
  const file = faviconFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.faviconDataUrl = e.target.result;
    setFaviconPreview(e.target.result);
  };
  reader.readAsDataURL(file);
});

// Reset
byId("btnFaviconReset").addEventListener("click", () => {
  state.faviconDataUrl = "";
  byId("faviconImg").style.display = "none";
  byId("faviconPlaceholder").style.display = "";
  faviconFile.value = "";
});

function setFaviconPreview(src) {
  const img = byId("faviconImg");
  img.src = src;
  img.style.display = "block";
  byId("faviconPlaceholder").style.display = "none";
}

// ─── Elementen verbergen ──────────────────────────────────────────────────────

byId("btnAddHide").addEventListener("click", addHideSelector);
hideSelectorInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addHideSelector(); });

function addHideSelector() {
  const sel = hideSelectorInput.value.trim();
  if (!sel || state.hideElements.includes(sel)) return;
  try { document.querySelector(sel); } catch {
    showStatus("Ongeldige CSS-selector.", "error"); return;
  }
  state.hideElements.push(sel);
  hideSelectorInput.value = "";
  renderHideList();
}

function renderHideList() {
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
  state.displayName    = displayNameInput.value.trim();
  state.customTitle    = titleInput.value.trim();
  state.customCSS      = cssInput.value;
  state.navColor       = validHex(navColorInput.value) ? navColorInput.value : "";
  state.bgColor        = validHex(bgColorInput.value)  ? bgColorInput.value  : "";

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
        chrome.scripting.executeScript({ target: { tabId }, files: ["content/content.js"] }, () => {
          chrome.scripting.insertCSS({ target: { tabId }, files: ["content/content.css"] });
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: "applySettings", settings }, (r) => {
              if (chrome.runtime.lastError || !r?.ok) showStatus("Herlaad de pagina.", "error");
              else showStatus("Toegepast!", "success");
            });
          }, 300);
        });
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
    state = { displayName: "", avatarDataUrl: "", customTitle: "", faviconDataUrl: "",
              navColor: "", bgColor: "", customCSS: "", hideElements: [] };
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
  displayNameInput.value = state.displayName || "";
  titleInput.value       = state.customTitle || "";
  cssInput.value         = state.customCSS   || "";

  if (validHex(state.navColor)) {
    navColorInput.value = state.navColor; navColorHex.textContent = state.navColor;
  } else {
    navColorInput.value = "#ff520e"; navColorHex.textContent = "—";
  }
  if (validHex(state.bgColor)) {
    bgColorInput.value = state.bgColor; bgColorHex.textContent = state.bgColor;
  } else {
    bgColorInput.value = "#f6f7f8"; bgColorHex.textContent = "—";
  }
  syncPresets("navPresets", state.navColor);
  syncPresets("bgPresets",  state.bgColor);

  if (state.avatarDataUrl) {
    setAvatarPreview(state.avatarDataUrl);
    if (state.avatarDataUrl.startsWith("http")) avatarUrlInput.value = state.avatarDataUrl;
  } else {
    avatarImg.style.display = "none";
    byId("avatarPlaceholder").style.display = "";
  }

  if (state.faviconDataUrl) {
    setFaviconPreview(state.faviconDataUrl);
  } else {
    byId("faviconImg").style.display = "none";
    byId("faviconPlaceholder").style.display = "";
  }

  renderHideList();
}

chrome.storage.local.get(MOD_KEY, (data) => {
  if (data[MOD_KEY]) state = { ...state, ...data[MOD_KEY] };
  loadUI();
});

// ─── Status ───────────────────────────────────────────────────────────────────

function showStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className   = "status " + type;
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => { statusEl.textContent = ""; statusEl.className = "status"; }, 2800);
}
