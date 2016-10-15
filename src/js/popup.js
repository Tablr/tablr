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
