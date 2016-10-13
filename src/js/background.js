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
          chrome.tabs.move(arrOfTabs, { windowId : window.id, index : -1  });
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

  function sortTabsByTags(windows){
    let urls = helpers.getAllTabIds(windows);
  }
});
