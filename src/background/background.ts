import { browserAPI } from "@shared/browser-api";
import { runCopyPageContext } from "@shared/copy-runner";
import {
  COMMAND_COPY_PAGE_CONTEXT,
  CONTEXT_MENU_COPY_PAGE,
  CONTEXT_MENU_COPY_SELECTION,
} from "@shared/constants";

browserAPI.runtime.onInstalled.addListener((details) => {
  browserAPI.contextMenus.create({
    id: CONTEXT_MENU_COPY_PAGE,
    title: "Copy page context",
    contexts: ["page"],
  });
  browserAPI.contextMenus.create({
    id: CONTEXT_MENU_COPY_SELECTION,
    title: "Copy selected context",
    contexts: ["selection"],
  });

  if (details.reason === "install") {
    void browserAPI.tabs.create({
      url: browserAPI.runtime.getURL("options/index.html?welcome=1"),
    });
  }
});

browserAPI.commands.onCommand.addListener((command, tab) => {
  if (command !== COMMAND_COPY_PAGE_CONTEXT) return;
  void runCopyPageContext("page", tab?.id ? { id: tab.id, url: tab.url } : undefined);
});

browserAPI.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  const knownTab = { id: tab.id, url: tab.url };
  if (info.menuItemId === CONTEXT_MENU_COPY_PAGE) {
    void runCopyPageContext("page", knownTab);
  } else if (info.menuItemId === CONTEXT_MENU_COPY_SELECTION) {
    void runCopyPageContext("selection", knownTab);
  }
});
