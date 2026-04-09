# Minimal Analytics 4

A high-performance, privacy-conscious Google Analytics 4 implementation using the Measurement Protocol. Designed for static websites where speed and transparency are paramount.

For a detailed breakdown of the logic behind this script, read the full article:
👉 **[A very Minimal Google Analytics 4 Snippet](https://dariusz.wieckiewicz.org/en/minimal-google-analytics-4-snippet/)**

---

## ✨ Key Features
* **Full Session Support:** 30-minute inactivity timeouts and cross-tab session persistence using `localStorage`.
* **Accurate Engagement:** Tracks "Average Engagement Time" using incremental lap timers and the Visibility API (Exit Pings).
* **Campaign Attribution:** Captures and persists UTM parameters throughout the session, fixing "Direct" attribution bugs.
* **Outbound Link Tracking:** Automatically records when users leave your site, including the destination URL and link text.
* **Event Delegation:** Uses a single high-performance global click listener instead of looping through DOM elements.
* **Safe Storage:** Built-in `try/catch` safety for `localStorage` to support private/incognito browsing without errors.

## 🚀 Installation
1. Copy the raw code from `minimal-analytics-4.js`.
2. Paste it into the `<head>` or at the end of the `<body>` of your website between `<script> </script>` tag.
3. For the production - ready minified version, check the [Latest Release](https://github.com/idarek/minimal-analytics-4/releases).

## ⚙️ Configuration
The script is designed to be configured at the very top of the file. You do not need to touch the internal logic unless you know what you are doing.

```javascript
const config = {
    tid: "G-XXXXXXXXXX", // Your GA4 Measurement ID
    timeout: 1800000,    // Session timeout (default 30 mins)
    ext: ["pdf", "zip", "docx", ...] // File extensions to track as downloads
};
```

## 📊 What it Tracks
| Event | Trigger | Parameters Captured |
| :--- | :--- | :--- |
| `page_view` | Initial page load | `dl` (Location), `dt` (Title), `dr` (Referrer) |
| `scroll` | User reaches 90% depth | `epn.percent_scrolled` |
| `file_download` | Click on configured extensions | `ep.file_name`, `ep.file_extension`, `ep.link_url` |
| `click` | Click on external domains | `ep.link_url`, `ep.link_text`, `ep.outbound: true` |
| `user_engagement` | Tab closed or hidden | `_et` (Engagement time in milliseconds) |
| `view_search_results` | URL contains search queries | `ep.search_term` |

## 🛠️ Developer Notes
* **Variable Leakage:** The entire script is wrapped in an IIFE to prevent global scope pollution.
* **Page ID (`_p`):** Unique per page load, ensuring event consistency within a single session.
* **Screen Resolution:** Reports resolution in logical pixels for accurate cross-device data.

## 📦 Production Deployment
To keep your site's performance at its peak, it is recommended to use a minified version of the script. 

I use the [Taco de Wolff Minifier](https://go.tacodewolff.nl/minify) to compress the raw code. This removes comments and whitespace while preserving the logic, ensuring the smallest possible footprint for your production environment.

## ⚖️ License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.