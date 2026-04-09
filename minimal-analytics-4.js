(function() {
    /* --- The Control Centre (Config) --- */
    const config = {
        tid: "G-XXXXXXXXXX", // Set your Measurement ID here
        timeout: 1800000,    // 30 minutes in milliseconds
        ext: ["pdf", "xls", "xlsx", "doc", "docx", "txt", "rtf", "csv", "exe", "key", "pps", "ppt", "pptx", "7z", "pkg", "rar", "gz", "zip", "avi", "mov", "mp4", "mpe", "mpeg", "wmv", "mid", "midi", "mp3", "wav", "wma"]
    };
    /* --- The Internal Variables --- */
    const pageId = Math.floor(Math.random() * 1000000000) + 1;
    const pageStartTime = Date.now();
    let lastEventTime = pageStartTime;

    /* Housekeeping Flags */
    let enScroll = false;
    let enFdl = false;
    let enEngagement = false;
    let extCurrent, filename, targetText, splitOrigin;
    let enClick = false; // Add this with your other flags

    // Safe Storage Check
    // This checks if localStorage is available. If not, it creates a "fake" version so the script doesn't crash.
    const lStor = (function() { 
        try { 
            localStorage.setItem('t', 't'); 
            localStorage.removeItem('t'); 
            return localStorage; 
        } catch(e) { 
            return { 
                getItem: () => null, 
                setItem: () => null, 
                removeItem: () => null 
            }; 
        } 
    })();
    
    /* DOM Constants */
    const doc = document;
    const docEl = document.documentElement;
    const docBody = document.body;
    const docLoc = document.location;
    const w = window;
    const s = screen;
    const nav = navigator || {};

    /* --- Logic starts after this point --- */
    function a(extCurrent, filename, targetText, splitOrigin) {

        // debug options to clean cache
        // localStorage.clear();
        // sessionStorage.clear();

        // Calculate time since the last event (or page load)
        const engagementTime = Date.now() - lastEventTime;

        // RESET the timer so the next event starts from zero
        lastEventTime = Date.now();

        // 10-ish digit number generator
        const generateId = () => Math.floor(Math.random() * 1000000000) + 1;
        // UNIX datetime generator
        const dategenId = () => Math.floor(Date.now() / 1000);
        
        const generatecidId = () => generateId() + "." + dategenId();
        const cidId = () => {
            if (!lStor.cid_v4) {
                lStor.cid_v4 = generatecidId();
            }
            return lStor.cid_v4;
        };

        const cidCheck = lStor.getItem("cid_v4");
        const _fvId = () => {
            if(cidCheck) {
                return undefined;
            }
            else if(enScroll==true) {
                return undefined;
            }
            else {
                return "1";
            }
        };


        // --- Session Management ---
        const now = dategenId();
        const lastActive = lStor.getItem("_ga_last") || 0;
        let sid = lStor.getItem("_ga_sid");
        let sct = lStor.getItem("_ga_sct") || 0;
        let isNewSession = false;

        // If no session exists OR it's been more than 30 mins (1800s) since last activity
        if (!sid || (now - lastActive) > (config.timeout / 1000)) {
            isNewSession = true;
            sid = now; // Use current timestamp as Session ID
            sct = Number(sct) + 1;
            
            lStor.setItem("_ga_sid", sid);
            lStor.setItem("_ga_sct", sct);
            lStor.setItem("_ga_hits", "0"); // Reset hit counter for new session
        }

        // Update heartbeat and hit counter
        lStor.setItem("_ga_last", now);
        const hits = Number(lStor.getItem("_ga_hits") || 0) + 1;
        lStor.setItem("_ga_hits", hits);


        // Default GA4 Search Term Query Parameter: q,s,search,query,keyword
        const searchString = docLoc.search;
        const searchParams = new URLSearchParams(searchString);
        //const searchString = "?search1=test&query1=1234&s=dsf"; // test search string

        // --- UTM / Campaign Attribution ---
        const getUtm = (key) => searchParams.get("utm_" + key);
        let utmSrc = getUtm("source");
        let utmMed = getUtm("medium");
        let utmCam = getUtm("campaign");

        // If it's a new session, we decide what campaign data to use
        if (isNewSession) {
            if (utmSrc) {
                // New campaign found in URL: save it!
                lStor.setItem("_ga_utm_source", utmSrc);
                lStor.setItem("_ga_utm_medium", utmMed || "");
                lStor.setItem("_ga_utm_campaign", utmCam || "");
            } else {
                // New session but no UTMs: clear old campaign data to avoid "bleeding" attribution
                lStor.removeItem("_ga_utm_source");
                lStor.removeItem("_ga_utm_medium");
                lStor.removeItem("_ga_utm_campaign");
            }
        }

        const sT = ["q", "s", "search", "query", "keyword"];
        const sR = sT.some(si => searchString.includes("&"+si+"=") || searchString.includes("?"+si+"="));
        
        const eventId = () => {
            if (sR == true) return "view_search_results";
            if (enScroll == true) return "scroll";
            if (enFdl == true) return "file_download";
            if (enEngagement == true) return "user_engagement";
            if (enClick == true) return "click";
            return "page_view";
        };

        const eventParaId = () => {
            if(enScroll==true) {
                return "90";
            }
            else {
                return undefined;
            }
        };

        // get search_term
        const searchId = () => {
            if (eventId() == "view_search_results") {
                //Iterate the search parameters.
                for (let p of searchParams) {
                    //console.log(p); // for debuging
                    if (sT.includes(p[0])) {
                        return p[1];
                    }
                }
            }
            else {
                return undefined;
            }
        };

        const encode = encodeURIComponent;
        const serialize = (obj) => {
            let str = [];
            for (let p in obj) {
                if (obj.hasOwnProperty(p)) {
                    if(obj[p] !== undefined) {
                        str.push(encode(p) + "=" + encode(obj[p]));
                    }
                }
            }
            return str.join("&");
        };

        const debug = false;  // enable analytics debuging
        
        // url 
        const url = "https://www.google-analytics.com/g/collect";
        // payload
        const data = serialize({
            v: "2", // Measurement Protocol Version 2 for GA4
            tid: config.tid, // Measurement ID for GA4 or Stream ID
            //gtm: gtmId, // Google Tag Manager (GTM) Hash Info. If the current hit is coming was generated from GTM, it will contain a hash of current GTM/GTAG config (not in use, currently under investigation)
            _p: pageId, // random number
            sr: (s.width + "x" + s.height), // Screen Resolution using logical pixels
            ul: (nav.language || undefined).toLowerCase(), // User Language
            cid: cidId(), // client ID, hold in localStorage
            _fv: _fvId(), // first_visit, identify returning users based on existance of client ID in localStorage
            dl: docLoc.origin + docLoc.pathname + searchString, // Document location
            dt: doc.title || undefined, // document title
            dr: doc.referrer || undefined, // document referrer
            seg: (hits > 1 || (Date.now() - pageStartTime) > 10000) ? "1" : undefined,
            "epn.percent_scrolled": eventParaId(),// event parameter, used for scroll event
            "ep.search_term": searchId(), // search_term reported for view_search_results from search parameter
            "ep.file_extension": extCurrent || undefined,
            "ep.file_name": filename || undefined,
            "ep.link_text": targetText || undefined,
            "ep.link_url": splitOrigin || undefined,
            _s: hits,                         // Use our new incrementing hit counter
            sid: sid,                         // Use the sid from our Session Manager
            sct: sct,                         // Use the sct from our Session Manager
            _ss: isNewSession ? "1" : undefined, // Only send "1" if it's a brand new session
            en: eventId(),
            _et: engagementTime, // Engagement time in msec
            cs: lStor.getItem("_ga_utm_source") || undefined,
            cm: lStor.getItem("_ga_utm_medium") || undefined,
            cn: lStor.getItem("_ga_utm_campaign") || undefined,
            "ep.outbound": enClick ? "true" : undefined,
            _dbg: debug ? 1 : undefined,  // console debug
        });

        const fullurl = (url+"?"+data);

        // for debug purposes
        // console.log(data);
        // console.log(url, data);
        // console.log(fullurl);

        if(nav.sendBeacon) {
                nav.sendBeacon(fullurl);
            } else {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", (fullurl), true);
            }
        }
    a();

    // Scroll Percent
    function sPr() {
        return (docEl.scrollTop||docBody.scrollTop) / ((docEl.scrollHeight||docBody.scrollHeight) - docEl.clientHeight) * 100;
    }
    // add scroll listener
    doc.addEventListener("scroll", sEv, { passive: true });

    // scroll Event
    function sEv() {
        const percentage = sPr();
        
        if (percentage < 90) {
            return;
        }
        enScroll = true;
        // fire analytics script
        a();
        // remove scroll listener
        doc.removeEventListener("scroll", sEv, { passive: true });
        enScroll = false;
    }

    // Global Click Listener (Event Delegation, Outbound Link Tracking)
    doc.addEventListener("click", function(e) {
        const el = e.target.closest("a");
        
        if (el && el.getAttribute("href")) {
            const url = el.getAttribute("href");
            const file = url.substring(url.lastIndexOf("/") + 1);
            const ext = file.split(".").pop();

            if (el.hasAttribute("download") || config.ext.includes(ext)) {
                enFdl = true;
                a(ext, file.replace("." + ext, ""), el.innerText || el.textContent, url.replace(docLoc.origin, ""));
                enFdl = false;
            } 
            /* NEW: Check if the link's hostname is different from yours */
            else if (el.hostname && el.hostname !== docLoc.hostname) {
                enClick = true;
                // We send 'undefined' for extension/filename, but the full URL for link_url
                a(undefined, undefined, el.innerText || el.textContent, url);
                enClick = false;
            }
        }
    });

    // Exit Ping: Fires when the tab is closed or hidden
    doc.addEventListener("visibilitychange", function() {
        if (doc.visibilityState === "hidden") {
            enEngagement = true;
            a(); // This sends the final "lap" of engagement time
            enEngagement = false;
        }
    });

})();