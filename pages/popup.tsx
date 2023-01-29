import React, { useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";
import { createPage } from "../utils/create-page";

createPage(<PopupPage />);

const MINIMUM_POPUP_SIZE = {
  minWidth: 200,
  maxWidth: 400,
  minHeight: 300,
  maxHeight: 500,
};

function PopupPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [state, setState] = useState<any>(null);

  useEffect(() => {
    async function func() {
      const curr = await browser.tabs.getCurrent();
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      let [tab] = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

      setState(tab);
      console.log(curr);
    }

    func();
  });

  return (
    <div
      className="flex-column"
      style={{
        ...MINIMUM_POPUP_SIZE,

        height: "100%",

        // The popup can open in full screen if the browser is in full screen
        // so we want to give it a little more breathing room without taking up
        // the full screen
        width: isFullscreen ? `var(--popup-max-width)` : `var(--popup-width)`,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div>Hi this is the popup.</div>

      <pre>{JSON.stringify(state || "HMM", null, 2)}</pre>
    </div>
  );
}
