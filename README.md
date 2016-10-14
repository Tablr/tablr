# tablr
tablr is a chrome extension that uses intelligent sorting algorithms to organize your tabs into new windows. Tablr was created at the CodeSmith Cohort-10 Hackathon by [Martin-Ting](https://github.com/Martin-Ting) and [chengsieuly](https://github.com/chengsieuly) using pair programming. Tablr won fist place and we are going to be doing some further work to release it on the Chrome App Store. We are open to contributors -- contact [Martin-Ting](https://github.com/Martin-Ting) if you'd like to join the tablr organization. 

======
# How to use tablr
1. Navigate to the directory you would like to store the project
2. Pull the repository
3. Run npm install to install all dependancies
4. Set tablr up in chrome
  - Navigate to the extensions page [Extensions](chrome://extensions/)
  - Check developer mode to allow unpaced extensions
  - Click load unpacked extension... and navigate to the tablr/dist directory
  - Copy the unique extension ID for your version of tablr 
  - Paste that extension ID to src/js/background.js EXTENSION_ID variable
5. Run gulp to build tablr
6. Navigate to the extensions page and reload tablr
7. tablr is now set up and ready to run!
