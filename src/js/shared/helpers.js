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
// This is ASYNCHRONOUS it returns a Promise, so handle it properly =)
const getTaggedDomains = superO => {
    // Get remote storage data
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(tagData => {
        // The tags we should tag our root domains with
        // TODO: Our tagData should ultimately be located in local storage or cloud storage
        // const tagData = {
        //   developer: ['stackoverflow', 'github', 'stackexchange', 'chaijs'],
        //   social: ['facebook', 'instagram', 'twitter'],
        //   news: ['nbc', 'yahoo'],
        //   sports: ['nba', 'nfl']
        // };
        resolve(tagData);
    });
};


module.exports = {
    getBaseDomain,
    getAllTabIds,
    getTaggedDomains,
};
