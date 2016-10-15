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
    getTaggedDomains,
};
