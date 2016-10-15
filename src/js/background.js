const helpers = require('./shared/helpers');
const Tab = require('./shared/Tab');

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
    sort(superO);
}

// Sort Tabs by Tag Name
function sortTabsByTagName(superO) {
    helpers.getTaggedDomains(superO)
        .then(taggedDomains => {
            const normalized = {};

            for (let domain in taggedDomains) {
                if (domain === undefined) continue;
                if (domain in superO) {
                    const tag = taggedDomains[domain];
                    if (!normalized[tag]) normalized[tag] = [];
                    normalized[tag] = normalized[tag].concat(superO[domain]);
                }
            }

            superO.singles.forEach(tab => {
                const tag = taggedDomains[tab.url];
                if (!normalized[tag]) normalized[tag] = [];
                normalized[tag] = normalized[tag].concat(new Tab(tab.id, tab.url));
            });

            sort(normalized);
        })
        .catch(() => console.log('Error retrieving data'));
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
