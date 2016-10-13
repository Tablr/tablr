(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const helpers = require('./shared/helpers.js');

/**********************************************************************/
// We need super wrapper that does the initial gather of our data
// that everything will use

chrome.runtime.onMessage.addListener(() => {
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
    // super --> { baseDomain: [Tab] }
    // Use the index to handle what preview render function to run
    let selectedOption;

    /* FEATURES */
    // Default functionality - sort tabs by base domain
    const sortTabsByBaseDomain = () => {
      for (let base in superO) {
        // We need to get the first tab to set as the first tab in the new window
        const firstTab = superO[base].pop();

        // We should check for when there are no single domains
        if (!firstTab) continue;

        chrome.windows.create({ tabId: firstTab.id }, window => {
          // Set up the array of tabs to move to the new window
          const arrOfTabs = superO[base].map(tab => tab.id);
          chrome.tabs.move(arrOfTabs, { windowId: window.id, index: -1 });
        });
      };
    };
    // Sort Tabs by Tag Name
    // TODO:
    const sortTabsByTagName = () => {
      const taggedDomains = helpers.getTaggedDomains(superO);
    };

    sortTabsByBaseDomain();
  });

  function sortTabsByTags(windows) {
    let urls = helpers.getAllTabIds(windows);
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
  const urls = { singles: [] };

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
    developer: ['stackoverflow', 'github', 'stackexchange', 'promisesaplus', 'chaijs'],
    social: ['facebook'],
    news: ['nbc', 'yahoo']
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
