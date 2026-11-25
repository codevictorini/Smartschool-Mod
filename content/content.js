// Smartschool Mod – content script
"use strict";

const MOD_KEY = "smartschool_mod_settings";

// ─── Naam/foto detectie ──────────────────────────────────────────────────────

function modFindNameElement(root) {
  const explicit = root.querySelector(
    ".smsc-user-name,.smsc-profile-name,[class*='user-name'],[class*='profile-name']"
  );
  if (explicit && !explicit.children.length) return explicit;

  const photoEl = root.querySelector(
    'img[src*="userpicture" i],img[src*="userimage" i],img[src*="profile" i],img[class*="avatar" i]'
  );
  const profileControl = photoEl?.closest("a,button,[role='button']");
  if (!profileControl) return null;

  return (
    [...profileControl.querySelectorAll("span,div,p")].find((el) => {
      const text = el.textContent.trim();
      return (
        !el.children.length &&
        text.length >= 3 &&
        text.length <= 60 &&
        /\s/.test(text) &&
        /^[A-Za-zÀ-ÿ\s\-'.]+$/.test(text) &&
        !/^(start|berichten|resultaten|tabel|rapporten|feedback|ga naar|help|zoek|afmelden)/i.test(text)
      );
    }) || null
  );
}

function modFindPhotoElements() {
  const isAvatar = (img) =>
    /userpicture|userimage|profile|avatar/i.test(
      `${img.currentSrc || img.src || ""} ${img.className || ""} ${img.alt || ""}`
    );
  const roots = document.querySelectorAll(
    '.smsc-top-bar,.smsc-top,#smsc-top,.smsc-header,.topnav,[role="banner"]'
  );
  const images = new Set();
  for (const root of roots) {
    root.querySelectorAll("img").forEach((img) => { if (isAvatar(img)) images.add(img); });
  }
  for (const item of document.querySelectorAll(
    '.smsc-top-bar a,.smsc-top-bar button,.smsc-top [role="menuitem"],#smsc-top a,#smsc-top button,.smsc-header a,.smsc-header button,.topnav a,.topnav button,[role="banner"] a,[role="banner"] button'
  )) {
    const label = (item.innerText || item.textContent || "").replace(/\s+/g, " ").trim();
    if (/^(profiel|profile)(\b|$)/i.test(label)) {
      item.querySelectorAll("img").forEach((img) => { if (isAvatar(img)) images.add(img); });
    }
  }
  return [...images];
}

const modTrackedPhotoElements = new Set();

function modApplyProfilePhotos(photo) {
  const found = modFindPhotoElements();
  found.forEach((el) => modTrackedPhotoElements.add(el));
  for (const el of [...modTrackedPhotoElements]) {
    if (!el.isConnected) { modTrackedPhotoElements.delete(el); continue; }
    if (!el.dataset.smodOrig) el.dataset.smodOrig = el.src;
    const next = photo || el.dataset.smodOrig;
    if (el.src !== next) el.src = next;
  }
}

function modApplyName(name) {
  const root = document.querySelector(
    ".smsc-top-bar,.smsc-top,#smsc-top,.smsc-header,header,[role='banner'],.topnav"
  ) || document.body;
  const el = modFindNameElement(root);
  if (!el) return;
  if (!el.dataset.smodOrig) el.dataset.smodOrig = el.textContent.trim();
  const display = name || el.dataset.smodOrig;
  if (el.textContent !== display) el.textContent = display;
}

// ─── Kleuren ─────────────────────────────────────────────────────────────────

function modValidColor(color) {
  return typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color) ? color : "";
}

function modApplyColors(navColor, bgColor) {
  const styleId = "smod-colors";
  let style = document.getElementById(styleId);
  const nav = modValidColor(navColor);
  const bg  = modValidColor(bgColor);
  if (!nav && !bg) { style?.remove(); return; }
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = [
    nav ? `:is(.smsc-top-bar,.smsc-top,#smsc-top,.smsc-header,.topnav,[role="banner"],nav){background-color:${nav} !important;color:#fff !important;}` : "",
    bg  ? `:is(body,#smscMain,main,.smsc-main,.smsc-content){background-color:${bg} !important;}` : "",
  ].join("\n");
}

// ─── Favicon ─────────────────────────────────────────────────────────────────

function modApplyFavicon(dataUrl) {
  // Verwijder bestaande favicon-override
  const existing = document.getElementById("smod-favicon");
  if (existing) existing.remove();

  if (!dataUrl) {
    // Herstel originele favicon: verwijder alleen de override,
    // de browser laadt de originele <link rel="icon"> dan opnieuw.
    // Forceer herlaad door de originele href even aan te raken.
    document.querySelectorAll('link[rel~="icon"]').forEach((link) => {
      if (link.dataset.smodOrig) {
        link.href = link.dataset.smodOrig;
        delete link.dataset.smodOrig;
      }
    });
    return;
  }

  // Bewaar originele href van alle bestaande favicon-links
  document.querySelectorAll('link[rel~="icon"]').forEach((link) => {
    if (!link.dataset.smodOrig) link.dataset.smodOrig = link.href;
    link.href = dataUrl;
  });

  // Als er nog geen favicon-link is, maak er een aan
  if (!document.querySelector('link[rel~="icon"]')) {
    const link = document.createElement("link");
    link.id   = "smod-favicon";
    link.rel  = "icon";
    link.type = "image/png";
    link.href = dataUrl;
    document.head.appendChild(link);
  }
}

// ─── Custom CSS / hide ────────────────────────────────────────────────────────

function modApplyCustomCSS(css) {
  let el = document.getElementById("smod-custom-css");
  if (!el) { el = document.createElement("style"); el.id = "smod-custom-css"; document.head.appendChild(el); }
  el.textContent = css || "";
}

function modApplyHideElements(list) {
  let el = document.getElementById("smod-hide-css");
  if (!el) { el = document.createElement("style"); el.id = "smod-hide-css"; document.head.appendChild(el); }
  if (!list || !list.length) { el.textContent = ""; return; }
  const valid = list.filter((s) => { try { document.querySelector(s); return true; } catch { return false; } });
  el.textContent = valid.length ? valid.join(",") + "{display:none !important;}" : "";
}

function modApplyCustomTitle(title) {
  if (title) document.title = title;
}

// ─── Alles toepassen ─────────────────────────────────────────────────────────

function modApplySettings(settings) {
  if (!settings) return;
  modApplyName(settings.displayName);
  modApplyProfilePhotos(settings.avatarDataUrl);
  modApplyColors(settings.navColor, settings.bgColor);
  modApplyFavicon(settings.faviconDataUrl || "");
  modApplyCustomCSS(settings.customCSS);
  modApplyHideElements(settings.hideElements);
  modApplyCustomTitle(settings.customTitle);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function modInit() {
  chrome.storage.local.get(MOD_KEY, (data) => {
    if (data[MOD_KEY]) modApplySettings(data[MOD_KEY]);
  });
}

modInit();

// ─── MutationObserver ────────────────────────────────────────────────────────

let modDebounceTimer = null;
const modObserverConfig = { childList: true, subtree: true };

const modObserver = new MutationObserver(() => {
  clearTimeout(modDebounceTimer);
  modDebounceTimer = setTimeout(() => {
    chrome.storage.local.get(MOD_KEY, (data) => {
      modObserver.disconnect();
      if (data[MOD_KEY]) modApplySettings(data[MOD_KEY]);
      modObserver.observe(document.body, modObserverConfig);
    });
  }, 500);
});

modObserver.observe(document.body, modObserverConfig);

// ─── Berichten van popup ──────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "applySettings") {
    modObserver.disconnect();
    modApplySettings(message.settings);
    modObserver.observe(document.body, modObserverConfig);
    sendResponse({ ok: true });
    return true;
  }
  if (message.action === "ping") {
    sendResponse({ ok: true });
    return true;
  }
});
