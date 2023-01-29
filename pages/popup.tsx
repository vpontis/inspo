import React, { useState } from "react";
import { browser } from "webextension-polyfill-ts";
import { createPage } from "../utils/create-page";
import { ExtensionMessage, ExtensionMessageZ, Fonts } from "../utils/messages";
import { useOnMount } from "../hooks/useOnMount";

createPage(<PopupPage />);

const MINIMUM_POPUP_SIZE = {
  minWidth: 320,
  maxWidth: 600,
  minHeight: 300,
  maxHeight: 500,
};

const requestFonts = async () => {
  const [tab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  const message: ExtensionMessage = {
    __type: "get-fonts-request",
  };

  if (tab.id) {
    await browser.tabs.sendMessage(tab.id, message);
  }
};

const setupListener = async ({
  onFonts,
}: {
  onFonts: (fonts: Fonts) => unknown;
}) => {
  await browser.runtime.onMessage.addListener((rawMessage) => {
    console.log("rawmessage", rawMessage);
    const message = ExtensionMessageZ.safeParse(rawMessage);

    if (message.success && message.data.__type === "get-fonts-response") {
      onFonts(message.data.fonts);
    }
  });
};

function PopupPage() {
  const [fonts, setFonts] = useState<Fonts | null>(null);

  useOnMount(() => {
    setupListener({ onFonts: setFonts });
    requestFonts();
  });

  return (
    <div
      className="flex-column"
      style={{
        ...MINIMUM_POPUP_SIZE,

        height: "100%",

        marginLeft: "auto",
        marginRight: "auto",

        // The popup can open in full screen if the browser is in full screen
        // so we want to give it a little more breathing room without taking up
        // the full screen
        // width: isFullscreen ? `var(--popup-max-width)` : `var(--popup-width)`,
      }}
    >
      <div>Hi this is the popup.</div>

      {!fonts && <div>Loading...</div>}

      {fonts && fonts.length === 0 && <div>No fonts found</div>}
      {fonts && fonts.length > 0 && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {fonts.map((f) => (
            <div key={f.name}>
              {f.name} - {f.count}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
