import { browser } from "webextension-polyfill-ts";
import { Message } from "../utils/messages";

const main = () => {
  console.log("Do something... Content script");
  setInterval(() => {
    console.log("Content...");

    // Find all of the loaded fonts on the page
    const fonts = new Map();

    const all = document.getElementsByTagName("*");
    for (const node of all) {
      const font = window.getComputedStyle(node).fontFamily;
      if (!fonts.has(font)) {
        fonts.set(font, 0);
      }
      fonts.set(font, fonts.get(font) + 1);
    }

    console.log(fonts);
  }, 5_000);
};

// @ts-ignore
const sendBackground = async (request: Message): Promise<string> => {
  return await browser.runtime.sendMessage(request);
};

main();
