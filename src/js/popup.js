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
                        // // Skip unknown domains      Is this Necesary? [MT]
                        if (domain === 'undefined') continue;
                        // Append a list of tagged items
                        //create tagged listitems
                        const taggedDomainListItemEl = document.createElement('li');
                        taggedDomainListItemEl.className = 'list-group-item';
                        const taggedDomainListItemSpanEl = document.createElement('span');
                        taggedDomainListItemSpanEl.className = 'tag tag-default tag-pill pull-xs-right';

                        // Add change textbox event listener 
                        console.log("1 " + domain);
                        const getTagClickListener = (domain) => {
                            console.log("in " + domain);
                            return (event) => {
                                console.log( "event listener: " + domain);
                                event.stopPropagation();
                                event.target.removeEventListener('click', tagClickListener);
                                const inputStyle = `max-width:${event.target.offsetWidth}px; max-height:${event.target.offsetHeight}px; background-color:rgba(0,0,0,0); border:0px; font-size:10; font-color:grey;`;
                                const taggedDomainListItemTagEditInput = document.createElement('input');
                                taggedDomainListItemTagEditInput.value = event.target.innerText;
                                taggedDomainListItemTagEditInput.setAttribute("style", inputStyle);
                                event.target.innerHTML = "";
                                event.target.appendChild(taggedDomainListItemTagEditInput);
                                let spanDivTarget = event.target;
                                taggedDomainListItemTagEditInput.addEventListener('keypress', (event) => {
                                    event.stopPropagation();
                                    let keyCode = event.keyCode || event.which;
                                    if (keyCode == '13') {
                                        let newText = event.target.value;
                                        event.target.parentNode.addEventListener('click', tagClickListener);
                                        event.target.parentNode.innerHTML = newText;
                                        console.log("enter: " + domain);
                                        // TODO update tag in cloud
                                        chrome.storage.sync.get(tagData => {
                                            console.log("storing new cloud tag: " + newText);
                                            console.log("setting " + domain + " old " + tagData[domain]);
                                            tagData[domain] = newText;
                                            console.log("new: " + tagData[domain]);
                                            chrome.storage.sync.set(tagData);
                                        }); 
                                    }

                                });
                            };
                        };
                        let tagClickListener = getTagClickListener(domain);
                        taggedDomainListItemSpanEl.addEventListener('click', tagClickListener);
                        //tag text eg. news developer, ...
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
