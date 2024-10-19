// ==UserScript==
// @name         Survey Helper
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  A survey assistant userscript
// @author       You

// @match        https://*/*
// @match        http://*/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

// Configuration flags to enable or disable specific functions
console.log("Survey Helper Loaded...");

const ENABLE_SELECT_BUTTON = true;
const ENABLE_HIGHLIGHT_TEXT = true;
const ENABLE_CUSTOM_STYLES = true;

// Function to find and click a button based on specified texts
const selectButton = (textsToMatch) => {
  if (!ENABLE_SELECT_BUTTON) return; // Exit if the function is disabled
  const button = Array.from(document.querySelectorAll("label > span")).find(
    (e) =>
      textsToMatch.some(
        (text) => e.textContent.trim().toLowerCase() === text.toLowerCase()
      )
  );

  if (button) {
    button.parentElement.click(); // Click the parent element (label) if found
  }
};

// Function to highlight specific words or phrases
const highlightText = (textsToHighlight) => {
  if (!ENABLE_HIGHLIGHT_TEXT) return; // Exit if the function is disabled
  textsToHighlight.forEach((textToHighlight) => {
    const elements = Array.from(document.querySelectorAll("*")) // Get all elements on the page
      .filter(
        (e) =>
          e.childNodes.length &&
          Array.from(e.childNodes).some((n) => n.nodeType === Node.TEXT_NODE)
      ); // Filter elements with text nodes

    elements.forEach((element) => {
      element.childNodes.forEach((node) => {
        if (
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.toLowerCase().includes(textToHighlight.toLowerCase())
        ) {
          const regex = new RegExp(`(${textToHighlight})`, "gi"); // Create a case-insensitive regex for the text
          const newNode = document.createElement("span");
          newNode.innerHTML = node.textContent.replace(
            regex,
            (match) => `<span class="highlighted-text">${match}</span>` // Wrap matches in a span for styling
          );
          element.replaceChild(newNode, node); // Replace the original text node with the new node
        }
      });
    });
  });
};

// Add custom styles for highlighting
const addCustomStyles = () => {
  if (!ENABLE_CUSTOM_STYLES) return; // Exit if the function is disabled
  GM_addStyle(`
        .highlighted-text {
            background-color: red;
            font-weight: bold;
        }
    `);
};

// MutationObserver to catch dynamic changes in the DOM
const observeDOMChanges = () => {
  const observer = new MutationObserver(() => {
    if (ENABLE_HIGHLIGHT_TEXT) {
      // Rerun highlightText when the DOM changes
      highlightText([
        "select",
        "Please identify",
        "Please select",
        "Important",
      ]);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// Initialize the script
const initSurveyHelper = () => {
  console.log("Survey Helper loaded.");
  if (ENABLE_SELECT_BUTTON) {
    console.log("Button Select loaded");
    // Use waitForKeyElements to ensure the script runs when the elements are available
    waitForKeyElements(
      "label > span", // Selector to monitor
      () =>
        selectButton([
          "male",
          "man",
          "white",
          "highest status",
          "less than $10",
          "Go to Survey",
        ]) // Call selectButton with the array of texts to match
    );
  }

  if (ENABLE_HIGHLIGHT_TEXT) {
    console.log("Text Highlighting Loaded.");
    // Highlight text on initial load
    highlightText(["select", "Please identify", "Please select", "Important"]);
  }

  if (ENABLE_CUSTOM_STYLES) {
    console.log("Custom Styles Loaded");
    addCustomStyles(); // Apply custom styles if enabled
  }

  // Observe the DOM for changes to handle dynamic content
  observeDOMChanges();
};

// Run the script when the page is fully loaded
window.addEventListener("load", initSurveyHelper);
