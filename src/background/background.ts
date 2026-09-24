import { browserAPI } from "@shared/browser-api";
import { EXTENSION_NAME } from "@shared/constants";

browserAPI.runtime.onInstalled.addListener(() => {
  console.log(`${EXTENSION_NAME} installed.`);
});
