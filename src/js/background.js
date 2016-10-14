const helpers = require('./shared/helpers.js');

/**********************************************************************/
// We need super wrapper that does the initial gather of our data
// that everything will use

chrome.runtime.onMessage.addListener((message) => {
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
    for (let base in superO) {
        // We need to get the first tab to set as the first tab in the new window
        const firstTab = superO[base].pop();

        // We should check for when there are no single domains
        if (!firstTab) continue;

        chrome.windows.create({
            tabId: firstTab.id
        }, window => {
            // Set up the array of tabs to move to the new window
            const arrOfTabs = superO[base].map(tab => tab.id);
            chrome.tabs.move(arrOfTabs, {
                windowId: window.id,
                index: -1
            });
        });
    }
}


// Sort Tabs by Tag Name
// TODO:
function sortTabsByTagName(superO) {
    const taggedDomains = helpers.getTaggedDomains(superO);
    const taggedIds = {};
    for (domain in taggedDomains) {
        if (domain === undefined || superO[domain] === undefined) {
            continue;
        }
        //handle domains
        if (!taggedIds[taggedDomains[domain]]) {
            taggedIds[taggedDomains[domain]] = [];
        }
        taggedIds[taggedDomains[domain]] = taggedIds[taggedDomains[domain]].concat(superO[domain]);
    };
    //handle singles
    superO["singles"].forEach(domainObj => {
        if (domainObj[taggedDomains[domainObj.url]]) {
            taggedIds[taggedDomains[domainObj.url]].concat([domainObj]);
        }
    });
    sortTabsByBaseDomain(taggedIds);
};
