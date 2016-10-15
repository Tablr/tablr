(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const EXTENSION_ID = 'ijokkjbnhbcajjlnpokiaeinkcaaband';

module.exports = {
  EXTENSION_ID
};

},{}],2:[function(require,module,exports){
const helpers = require('./shared/helpers');
const config = require('./config');

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
                helpers.getTaggedDomains(superO).then(taggedDomains => {
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
                    return;
                });
            default:
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
            chrome.runtime.sendMessage(config.EXTENSION_ID, 'sortByTagName');
            break;
        default:
            chrome.runtime.sendMessage(config.EXTENSION_ID, 'sortByBaseDomain');
    }
});

},{"./config":1,"./shared/helpers":4}],3:[function(require,module,exports){
class Tab {
    constructor(id, url) {
        this.id = id;
        this.url = url;
    }
}

module.exports = Tab;

},{}],4:[function(require,module,exports){
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

// This is ASYNCHRONOUS it returns a Promise, so handle it properly =)
const getTaggedDomains = superO => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(tagData => {
            const tagDomains = {};

            for (let domain in superO) {
                if (domain === 'singles') continue;
                if (!(domain in tagData)) tagData[domain] = 'untagged';
                tagDomains[domain] = tagData[domain];
            }

            superO.singles.forEach(tab => {
                if (!(tab.url in tagData)) tagData[tab.url] = 'untagged';
                tagDomains[tab.url] = tagData[tab.url];
            });

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

},{"./Tab":3}]},{},[2]);
