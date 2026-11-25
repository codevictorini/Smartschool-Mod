# ⚡ Smartschool Mod

Een Chrome/Edge-browserextensie die je Smartschool-omgeving aanpast met coole features.

> **Let op:** alle wijzigingen zijn puur visueel en lokaal in jouw browser. Ze worden **niet** opgeslagen op de Smartschool-servers.

---

## 🚀 Features

| Feature | Beschrijving |
|---|---|
| 👤 **Naam veranderen** | Pas je weergavenaam aan op alle plekken in Smartschool |
| 🖼️ **Profielfoto veranderen** | Upload een afbeelding of geef een URL op |
| 🔢 **Berichtteller** | Zet de berichtteller op een getal naar keuze |
| 📝 **Paginatitel** | Verander de browsertabblad-titel |
| 🌙 **Donker thema** | Voeg een donker thema toe |
| ⚡ **Neon thema** | Cyberspace-stijl met gloeiende kleuren |
| 🌸 **Pastel thema** | Zachte, zachte pastelkleuren |
| 💻 **Hacker thema** | Groene tekst op zwart, zoals in de films |
| 🔧 **Eigen CSS** | Schrijf je eigen CSS voor volledige controle |
| 🙈 **Elementen verbergen** | Verberg onderdelen via CSS-selectors |

---

## 📦 Installatie

### Chrome / Edge (ongepakt)

1. Open Chrome en ga naar `chrome://extensions`
2. Zet **Ontwikkelaarsmodus** aan (rechtsboven)
3. Klik op **Uitgepakte extensie laden**
4. Selecteer de map `mod`
5. De extensie verschijnt in je balk — klaar!

### Firefox

1. Ga naar `about:debugging#/runtime/this-firefox`
2. Klik op **Tijdelijke add-on laden**
3. Selecteer het bestand `manifest.json` in de `mod`-map

---

## 🛠️ Gebruik

1. Ga naar een Smartschool-pagina (bijv. `jouwschool.smartschool.be`)
2. Klik op het ⚡-icoontje in de extensiebalk
3. Pas je instellingen aan en klik **Toepassen**

---

## 📁 Bestandsstructuur

```
mod/
├── manifest.json          # Extensie-configuratie (Manifest V3)
├── background.js          # Service worker
├── content/
│   ├── content.js         # DOM-aanpassingen op Smartschool-pagina's
│   └── content.css        # Thema's en stijlen
├── popup/
│   ├── popup.html         # Extensie-popup
│   ├── popup.css          # Popup stijlen
│   └── popup.js           # Popup logica
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
