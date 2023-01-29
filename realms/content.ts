import { browser } from "webextension-polyfill-ts";
import { ExtensionMessage, Fonts } from "../utils/messages";

const getFonts = (): Fonts => {
  // Find all of the loaded fonts on the page
  const fontMap = new Map();

  const all = document.getElementsByTagName("*");
  for (const node of all) {
    const font = window.getComputedStyle(node).fontFamily;
    if (!fontMap.has(font)) {
      fontMap.set(font, 0);
    }
    fontMap.set(font, fontMap.get(font) + 1);
  }

  const entries = fontMap.entries();

  return Array.from(entries)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

// Receive message from Popup
const listenToPopup = () => {
  browser.runtime.onMessage.addListener(function (request, sender) {
    console.log(
      JSON.stringify({ request, sender, message: "got message...." }, null, 2)
    );

    const fonts = getFonts();
    const message: ExtensionMessage = {
      __type: "get-fonts-response",
      fonts,
    };

    browser.runtime.sendMessage(message);
  });
};

const main = () => {
  console.log("Do something... Content script");
  listenToPopup();
};

// @ts-ignore
const sendBackground = async (request: ExtensionMessage): Promise<string> => {
  return await browser.runtime.sendMessage(request);
};

main();
