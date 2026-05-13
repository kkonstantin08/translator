import { translate } from "../shared/translation/service";
import { testApiKey } from "../shared/mistral/client";
import type { TranslationRequest } from "../shared/types";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-selection",
    title: "Перевести выделенное",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "translate-selection" &&
    info.selectionText &&
    tab?.id
  ) {
    chrome.tabs
      .sendMessage(tab.id, {
        type: "CONTEXT_MENU_TRANSLATE",
        text: info.selectionText,
      })
      .catch(() => {
        // Tab may not have content script loaded
      });
  }
});

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "translate-selection" && tab?.id) {
    chrome.tabs
      .sendMessage(tab.id, { type: "KEYBOARD_SHORTCUT_TRANSLATE" })
      .catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "TRANSLATE") {
    const req = request.data as TranslationRequest;
    translate(req)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error: Error) => {
        console.error("[LinguaPop] Translation error:", error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.type === "TEST_API_KEY") {
    testApiKey()
      .then(() => sendResponse({ success: true }))
      .catch((error: Error) => {
        console.error("[LinguaPop] API key test error:", error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.type === "TRANSLATE_PAGE") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "START_PAGE_TRANSLATION" })
          .catch(() => {});
      }
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === "RESTORE_PAGE") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "RESTORE_PAGE" })
          .catch(() => {});
      }
    });
    sendResponse({ success: true });
    return true;
  }

  return false;
});
