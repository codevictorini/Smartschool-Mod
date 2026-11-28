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

// ─── Lettertype ───────────────────────────────────────────────────────────────

const MOD_FONT_FAMILIES = {
  arial:      "Arial, Helvetica, sans-serif",
  georgia:    'Georgia, "Times New Roman", serif',
  verdana:    "Verdana, Geneva, sans-serif",
  trebuchet:  '"Trebuchet MS", sans-serif',
  times:      '"Times New Roman", Times, serif',
  monospace:  '"Courier New", monospace',
};

function modApplyFontFamily(fontFamily) {
  const styleId = "smod-font";
  let el = document.getElementById(styleId);
  const font = MOD_FONT_FAMILIES[fontFamily];
  if (!font) { el?.remove(); return; }
  if (!el) {
    el = document.createElement("style");
    el.id = styleId;
    document.head.appendChild(el);
  }
  el.textContent = `body, body *:not(#smod-modal):not(#smod-modal *) { font-family: ${font} !important; }`;
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
  // Alleen syntactisch geldige selectors — niet checken of ze iets vinden
  const valid = list.filter((s) => {
    try { document.querySelector(s); return true; } catch { return false; }
  });
  el.textContent = valid.length ? valid.map((s) => s + "{display:none !important;}").join("\n") : "";
}

function modApplyCustomTitle(title) {
  if (title) document.title = title;
}

// ─── Fake tellers ────────────────────────────────────────────────────────────

/**
 * Badge-counter gebaseerd op de echte Smartschool DOM-structuur:
 *   Berichten:    .js-badge-msg   op/in  a[data-id="messages"]
 *   Notificaties: .js-badge-notifs op/in button.js-btn-notifs of button[title="Meldingen"]
 *   Nieuws:       .js-badge-news  op/in  a[data-id="news"]
 *
 * Strategie:
 * 1. Zoek de parent-link/button via exacte selectors.
 * 2. Zoek de bestaande badge erin (of maak er een aan).
 * 3. Houd de original value bij zodat revert werkt.
 * 4. Een MutationObserver bewaakt de parent zodat Smartschool de waarde
 *    niet stilletjes terugzet na een XHR-update.
 */

function modMakeBadgeCounter(cfg) {
  let _enabled = false;
  let _count   = 0;

  function findLinks() {
    const seen = new Set();
    const out  = [];
    for (const sel of cfg.linkSels) {
      try {
        document.querySelectorAll(sel).forEach((el) => {
          if (!seen.has(el)) { seen.add(el); out.push(el); }
        });
      } catch {}
    }
    return out;
  }

  function assertOn(link) {
    if (!link || !_enabled) return;
    const value = String(_count);

    // Al gemarkeerde badge updaten
    const existing = link.querySelector(`[${cfg.markAttr}]`);
    if (existing) {
      if (existing.textContent !== value) existing.textContent = value;
      existing.removeAttribute("hidden");
      existing.style.removeProperty("display");
      existing.style.removeProperty("visibility");
      return;
    }

    // Bestaande Smartschool-badge overnemen
    const smsc = link.querySelector(`.${cfg.badgeClass}, .topnav__badge`);
    if (smsc) {
      if (!smsc.hasAttribute("data-smod-orig")) {
        smsc.setAttribute("data-smod-orig",     smsc.textContent.trim());
        smsc.setAttribute("data-smod-origdisp", smsc.style.display || "");
      }
      smsc.setAttribute(cfg.markAttr, "1");
      smsc.textContent = value;
      smsc.removeAttribute("hidden");
      smsc.style.removeProperty("display");
      smsc.style.removeProperty("visibility");
      return;
    }

    // Zelf een badge aanmaken
    const badge = document.createElement("span");
    badge.className  = `${cfg.badgeClass} topnav__badge`;
    badge.setAttribute(cfg.markAttr, "created");
    badge.textContent = value;
    badge.style.cssText = "display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:#e53935;color:#fff;font-size:11px;font-weight:700;line-height:1;vertical-align:middle;margin-left:3px";
    link.appendChild(badge);
  }

  return {
    apply(n) {
      _count   = n;
      _enabled = true;
      findLinks().forEach(assertOn);
    },
    revert() {
      _enabled = false;
      _count   = 0;
      document.querySelectorAll(`[${cfg.markAttr}]`).forEach((el) => {
        if (el.getAttribute(cfg.markAttr) === "created") { el.remove(); return; }
        el.textContent   = el.getAttribute("data-smod-orig") || "";
        el.style.display = el.getAttribute("data-smod-origdisp") || "";
        if (!el.textContent || el.textContent === "0") el.setAttribute("hidden", "");
        el.removeAttribute(cfg.markAttr);
        el.removeAttribute("data-smod-orig");
        el.removeAttribute("data-smod-origdisp");
      });
    },
  };
}

const _smodMsgCounter   = modMakeBadgeCounter({
  linkSels:   ['a[data-id="messages"]', 'a.js-link-msg', 'a[href*="messages"]'],
  badgeClass: "js-badge-msg",
  markAttr:   "data-smod-msg",
  label:      " ongelezen berichten",
});

const _smodNotifCounter = modMakeBadgeCounter({
  linkSels:   ['button.js-btn-notifs', 'button[title="Meldingen"]', 'a[data-id="notifications"]', 'a[href*="notification"]'],
  badgeClass: "js-badge-notifs",
  markAttr:   "data-smod-notif",
  label:      " meldingen",
});

function modApplyFakeCounters(settings) {
  if (settings.fakeMessages !== null && settings.fakeMessages !== undefined)
    _smodMsgCounter.apply(Number(settings.fakeMessages));
  else
    _smodMsgCounter.revert();

  if (settings.fakeNotifications !== null && settings.fakeNotifications !== undefined)
    _smodNotifCounter.apply(Number(settings.fakeNotifications));
  else
    _smodNotifCounter.revert();
}



// ─── Pik modus ───────────────────────────────────────────────────────────────

let _smodPickActive = false;
let _smodPickTarget = null;

const _smodPickStyle = document.createElement("style");
_smodPickStyle.id = "smod-pick-style";
_smodPickStyle.textContent = `
  body.smod-picking * { cursor: crosshair !important; }
  .smod-pick-hover {
    outline: 2px solid #e53935 !important;
    outline-offset: 1px !important;
    background-color: rgba(229,57,53,0.08) !important;
  }
`;

function modBuildSelector(el) {
  // Stap 1: eigen id
  if (el.id) return "#" + CSS.escape(el.id);

  // Stap 2: data-attributen (stabiel over page loads)
  for (const attr of ["data-id", "data-module", "data-name", "data-key", "name", "role"]) {
    const val = el.getAttribute(attr);
    if (val) return el.tagName.toLowerCase() + "[" + attr + "=" + JSON.stringify(val) + "]";
  }

  // Stap 3: klassen filteren — sla hash-klassen over (letters+cijfers door elkaar, >6 chars)
  const stableClasses = [...el.classList].filter((c) => {
    if (c.length < 2) return false;
    if (/[0-9]{3,}/.test(c)) return false;         // hash-klasse
    if (/^[a-z0-9]{7,}$/i.test(c)) return false;   // puur alphanumeriek = waarschijnlijk hash
    return true;
  });
  if (stableClasses.length) {
    return el.tagName.toLowerCase() + "." + stableClasses.map((c) => CSS.escape(c)).join(".");
  }

  // Stap 4: pad naar boven opbouwen tot we iets unieks hebben
  const parts = [];
  let cur = el;
  while (cur && cur !== document.body) {
    let part = cur.tagName.toLowerCase();
    if (cur.id) { parts.unshift("#" + CSS.escape(cur.id)); break; }
    const siblings = cur.parentElement
      ? [...cur.parentElement.children].filter((c) => c.tagName === cur.tagName)
      : [];
    if (siblings.length > 1) part += ":nth-of-type(" + (siblings.indexOf(cur) + 1) + ")";
    parts.unshift(part);
    cur = cur.parentElement;
  }
  return parts.join(" > ");
}

function modStartPick() {
  if (_smodPickActive) return;
  _smodPickActive = true;
  if (!document.getElementById("smod-pick-style")) {
    document.head.appendChild(_smodPickStyle);
  }
  document.body.classList.add("smod-picking");
  document.addEventListener("mouseover", _smodPickOver,  true);
  document.addEventListener("mouseout",  _smodPickOut,   true);
  document.addEventListener("click",     _smodPickClick, true);
  document.addEventListener("keydown",   _smodPickEsc,   true);
}

function modStopPick() {
  _smodPickActive = false;
  document.body.classList.remove("smod-picking");
  if (_smodPickTarget) {
    _smodPickTarget.classList.remove("smod-pick-hover");
    _smodPickTarget = null;
  }
  document.removeEventListener("mouseover", _smodPickOver,  true);
  document.removeEventListener("mouseout",  _smodPickOut,   true);
  document.removeEventListener("click",     _smodPickClick, true);
  document.removeEventListener("keydown",   _smodPickEsc,   true);
}

function _smodPickOver(e) {
  if (_smodPickTarget) _smodPickTarget.classList.remove("smod-pick-hover");
  _smodPickTarget = e.target;
  _smodPickTarget.classList.add("smod-pick-hover");
}
function _smodPickOut(e) {
  e.target.classList.remove("smod-pick-hover");
}
function _smodPickClick(e) {
  e.preventDefault();
  e.stopPropagation();
  const target = e.target;
  const sel = modBuildSelector(target);
  modStopPick();

  // Verberg het element direct — geen wachten op storage of CSS
  target.style.setProperty("display", "none", "important");

  // Sla op in storage en pas de hide-CSS aan voor persistentie
  chrome.storage.local.get(MOD_KEY, (data) => {
    const settings = data[MOD_KEY] || {};
    const list = Array.isArray(settings.hideElements) ? settings.hideElements : [];
    if (!list.includes(sel)) list.push(sel);
    settings.hideElements = list;
    chrome.storage.local.set({ [MOD_KEY]: settings, smod_picked_selector: sel });
    modApplyHideElements(list);
  });
}
function _smodPickEsc(e) {
  if (e.key === "Escape") modStopPick();
}

// ─── Alles toepassen ─────────────────────────────────────────────────────────

function modApplySettings(settings) {
  if (!settings) return;
  modApplyName(settings.displayName);
  modApplyProfilePhotos(settings.avatarDataUrl);
  modApplyColors(settings.navColor, settings.bgColor);
  modApplyFontFamily(settings.fontFamily);
  modApplyFavicon(settings.faviconDataUrl || "");
  modApplyCustomCSS(settings.customCSS);
  modApplyHideElements(settings.hideElements);
  modApplyCustomTitle(settings.customTitle);
  modApplyFakeCounters(settings);
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
  }, 1500);
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
  if (message.action === "startPick") {
    modStartPick();
    sendResponse({ ok: true });
    return true;
  }
  if (message.action === "ping") {
    sendResponse({ ok: true });
    return true;
  }
});
