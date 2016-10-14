(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const helpers = require('./shared/helpers.js');

const EXTENSION_ID = 'ljpbgjanncoihbfakkppncfoghpmkpno';

// Changes made to options
let selectedOption;

// Listens to option changes
// Each option change should render a preview
const organizeTypeDropdownEl = document.getElementById('organize-type-dropdown');
organizeTypeDropdownEl.addEventListener('change', () => {
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
        const contentEl = document.getElementById('content');

        // Use the index to handle what preview render function to run
        selectedOption = organizeTypeDropdownEl.selectedIndex;
        switch (selectedOption) {
            case 0:
                contentEl.innerHTML = '';
                break;
            case 1:
                const taggedDomains = helpers.getTaggedDomains(superO);

                // Append a list of tagged items
                const taggedDomainListEl = document.createElement('ul');
                taggedDomainListEl.id = 'preview-list';
                taggedDomainListEl.className = 'list-group';

                for (let domain in taggedDomains) {
                    // Skip unknown domains
                    if (domain === 'undefined') continue;

                    const taggedDomainListItemEl = document.createElement('li');
                    taggedDomainListItemEl.className = 'list-group-item';

                    const taggedDomainListItemSpanEl = document.createElement('span');
                    taggedDomainListItemSpanEl.className = 'tag tag-default tag-pill pull-xs-right';
                    taggedDomainListItemSpanElText = document.createTextNode(taggedDomains[domain]);
                    taggedDomainListItemSpanEl.appendChild(taggedDomainListItemSpanElText);
                    taggedDomainListItemEl.appendChild(taggedDomainListItemSpanEl);

                    const textNode = document.createTextNode(domain);
                    taggedDomainListItemEl.appendChild(textNode);
                    taggedDomainListEl.appendChild(taggedDomainListItemEl);
                }

                contentEl.appendChild(taggedDomainListEl);
                break;
        }
    });
});

// On button click, it should sort our tabs
// TODO: refactor so callback is dynamic
const organizeTabsBtnEl = document.getElementById('organize-tab-btn');

organizeTabsBtnEl.addEventListener('click', () => {
    switch (selectedOption) {
        case 1:
            chrome.runtime.sendMessage(EXTENSION_ID, 'sortByTagName');
            break;
        default:
            chrome.runtime.sendMessage(EXTENSION_ID, 'sortByBaseDomain');
    }
});

},{"./shared/helpers.js":2}],2:[function(require,module,exports){
/*** Classes ***/
class Tab {
    constructor(id, url) {
        this.id = id;
        this.url = url;
    }
}

// Get base domain
const getBaseDomain = url => {
    // thanks to anubhava on Stack Overflow: http://stackoverflow.com/questions/25703360/regular-expression-extract-subdomain-domain
    let domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
    let baseDomain = domainRegex.exec(url)[1];
    let baseDomainArr = baseDomain.split('.');

    return baseDomainArr[baseDomainArr.length - 2];
};

// Gather all urls and separate by domain
const getAllTabIds = windows => {
    const urls = {
        singles: []
    };

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

    // After updating our urls, we will have a bunch of single base domains
    // By design, we will push all of these to a single key
    for (let base in urls) {
        if (urls[base].length <= 1 && base !== 'singles') {
            urls.singles.push(urls[base][0]);
            delete urls[base];
        }
    }

    return urls;
};

// Restructure our data to have tags
// TODO: This data will need to persist in local storage or the cloud
const getTaggedDomains = superO => {
    // The tags we should tag our root domains with
    // TODO: Our tagData should ultimately be located in local storage or cloud storage
    const tagData = {
        developer: ['stackoverflow', 'github', 'stackexchange', 'chaijs'],
        social: ['facebook', 'instagram', 'twitter'],
        news: ['nbc', 'yahoo'],
        sports: ['nba', 'nfl']
    };

    const taggedDomains = {};

    // Simply goes through each url and tag it
    for (let base in superO) {
        superO[base].forEach(tab => {
            for (let tag in tagData) {
                if (tagData[tag].includes(tab.url)) {
                    taggedDomains[tab.url] = tag;
                    break;
                } else taggedDomains[tab.url] = 'untagged';
            }
        });
    }

    return taggedDomains;
};

module.exports = {
    getBaseDomain,
    getAllTabIds,
    getTaggedDomains
};

},{}]},{},[1]);
