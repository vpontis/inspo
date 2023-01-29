import { browser } from "webextension-polyfill-ts";
import { Message } from "../utils/messages";

const main = () => {
  console.log("Do something... Content script");
};

// @ts-ignore
const sendBackground = async (request: Message): Promise<string> => {
  return await browser.runtime.sendMessage(request);
};

main();
