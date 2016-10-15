(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const helpers = require('./shared/helpers');
const Tab = require('./shared/Tab');

/**********************************************************************/
// We need super wrapper that does the initial gather of our data
// that everything will use

chrome.runtime.onMessage.addListener(message => {
    new Promise((resolve, reject) => {
        // Sets window filter options
        const windowOptions = {
            populate: true,
            windowTypes: ['normal']
        };

        chrome.windows.getAll(windowOptions, windows => {
            resolve(helpers.getAllTabIds(windows));
        });
    }).then(superO => {
        switch (message) {
            case 'sortByBaseDomain':
                sortTabsByBaseDomain(superO);
                break;
            case 'sortByTagName':
                sortTabsByTagName(superO);
                break;
            default:
                break;
        };
    });
});

/* FEATURES */
// Default functionality - sort tabs by base domain
function sortTabsByBaseDomain(superO) {
    const normalized = Object.assign({}, superO, {
        singles: []
    });

    // After updating our urls, we will have a bunch of single base domains
    // By design, we will push all of these to a single key
    for (let base in superO) {
        if (superO[base].length <= 1) normalized.singles.push(superO[base][0]);
    }

    sort(normalized);
}

// Sort Tabs by Tag Name
function sortTabsByTagName(superO) {
    helpers.getTaggedDomains(superO).then(taggedDomains => {
        const normalized = {};

        for (let domain in taggedDomains) {
            if (domain === undefined) continue;
            if (domain in superO) {
                const tag = taggedDomains[domain];
                if (!normalized[tag]) normalized[tag] = [];
                normalized[tag] = normalized[tag].concat(superO[domain]);
            }
        }

        // superO.singles.forEach(tab => {
        //     const tag = taggedDomains[tab.url];
        //     if (!normalized[tag]) normalized[tag] = [];
        //     normalized[tag] = normalized[tag].concat(new Tab(tab.id, tab.url));
        // });

        sort(normalized);
    }).catch(() => console.log('Error retrieving data'));
};

// Normalized objects should take the form of
// { [any] = [ Tab:(id, url) ] }
function sort(normalizedObject) {
    for (let base in normalizedObject) {
        // We need to get the first tab to set as the first tab in the new window
        const firstTab = normalizedObject[base].pop();

        // We should check for when there are no single domains
        if (!firstTab) continue;

        chrome.windows.create({
            tabId: firstTab.id
        }, window => {
            // Set up the array of tabs to move to the new window
            const arrOfTabs = normalizedObject[base].map(tab => tab.id);
            chrome.tabs.move(arrOfTabs, {
                windowId: window.id,
                index: -1
            });
        });
    }
}

},{"./shared/Tab":2,"./shared/helpers":3}],2:[function(require,module,exports){
class Tab {
    constructor(id, url) {
        this.id = id;
        this.url = url;
    }
}

module.exports = Tab;

},{}],3:[function(require,module,exports){
const Tab = require('./Tab');

// Get base domain
const getBaseDomain = url => {
    // thanks to anubhava on Stack Overflow:
    // http://stackoverflow.com/questions/25703360/regular-expression-extract-subdomain-domain
    let domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
    let baseDomain = domainRegex.exec(url)[1];
    let baseDomainArr = baseDomain.split('.');

    return baseDomainArr[baseDomainArr.length - 2];
};

// Gather all urls and separate by domain
const getAllTabIds = windows => {
    const urls = {};

    // Structuring our urls with base urls and all their associated tabs
    windows.forEach(window => {
        window.tabs.forEach(tab => {
            // Get the base domain for the url
            // Ex. 'http://meta.stackoverflow.com/test' --> 'stackoverflow'
            const baseDomain = getBaseDomain(tab.url);

            // Update our urls with base domains and all associated Tabs
            if (!urls[baseDomain]) urls[baseDomain] = [];
            urls[baseDomain].push(new Tab(tab.id, baseDomain));
        });
    });

    return urls;
};

// Restructure our data to have tags
// This is ASYNCHRONOUS it returns a Promise, so handle it properly =)
const getTaggedDomains = superO => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(tagData => {
            const tagDomains = {};

            for (let domain in superO) {
                if (!(domain in tagData)) tagData[domain] = 'untagged';
                tagDomains[domain] = tagData[domain];
            }

            // Update our storage with new urls
            // TODO: Perhaps only sync if there are any changes
            chrome.storage.sync.set(tagData);
            resolve(tagDomains);
        });
    });
};

module.exports = {
    getBaseDomain,
    getAllTabIds,
    getTaggedDomains
};

},{"./Tab":2}]},{},[1]);
