import React, { useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";
import { createRoot } from "react-dom/client";

const createPage = () => {
  const root = document.getElementById("root")!;
  const reactRoot = createRoot(root);

  reactRoot.render(<PopupPage />);
};
createPage();

const MINIMUM_POPUP_SIZE = {
  minWidth: 400,
  minHeight: 400,
};

function PopupPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    browser.tabs.getCurrent().then((tab) => {
      setIsFullscreen(Boolean(tab));
    });
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
      <div>Hi</div>
    </div>
  );
}
