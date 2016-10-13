const helpers = require('./shared/helpers.js');

/**********************************************************************/
// We need super wrapper that does the initial gather of our data
// that everything will use

chrome.runtime.onMessage.addListener(() => {
  new Promise((resolve, reject) => {
    // Sets window filter options
    const windowOptions = {
      populate: true,
      windowTypes: [ 'normal' ]
    };

    chrome.windows.getAll(windowOptions, windows => {
      resolve(helpers.getAllTabIds(windows));
    });
  }).then(superO => {
    // super --> { baseDomain: [Tab] }

    /* HELPERS */
    // Restructure our data to have tags
    // TODO: This data will need to persist in local storage or the cloud
    const getTaggedDomains = () => {
      // The tags we should tag our root domains with
      // TODO: Our tagData should ultimately be located in local storage or cloud storage
      const tagData = {
        developer : [ 'stackoverflow', 'github', 'stackexchange', 'promisesaplus', 'chaijs' ],
        social: [ 'facebook' ],
        news: [ 'nbc', 'yahoo' ]
      };

      const taggedDomains = {};

      // Simply goes through each url and tag it
      for (let base in superO) {
        superO[base].forEach(tab => {
          for (let tag in tagData) {
            if (tagData[tag].includes(tab.url)) {
              taggedDomains[tab.url] = tag;
              break;
            }
            else taggedDomains[tab.url] = 'untagged';
          }
        });
      }

      return taggedDomains;
    };

    // Use the index to handle what preview render function to run
    let selectedOption;

    /* FEATURES */
    // Default functionality - sort tabs by base domain
    let sequence = Promise.resolve();
    const sortTabsByBaseDomain = () => {
      for (let base in superO) {
        // We need to get the first tab to set as the first tab in the new window
        const firstTab = superO[base].pop();

        // We should check for when there are no single domains
        if (!firstTab) continue;

        new Promise(resolve => {
          sequence = sequence.then(() => {
            chrome.windows.create({ tabId: firstTab.id }, window => {
              // Set up the array of tabs to move to the new window
              const arrOfTabs = superO[base].map(tab => tab.id);
              arrOfTabs.forEach(tabId => chrome.tabs.move(tabId, { windowId : window.id, index : -1  }));
              resolve();
            });
          });
        });
      };
    };
    // Sort Tabs by Tag Name
    // TODO:
    const sortTabsByTagName = () => {
      const taggedDomains = getTaggedDomains();
    };

    sortTabsByBaseDomain();
  });

  function sortTabsByTags(windows){
    let urls = helpers.getAllTabIds(windows);
  }
});
