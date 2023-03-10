import React, { useState } from "react";
import Papa from "papaparse";
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
  onFonts: (
    data: ExtensionMessage & { __type: "get-fonts-response" }
  ) => unknown;
}) => {
  await browser.runtime.onMessage.addListener((rawMessage) => {
    const message = ExtensionMessageZ.safeParse(rawMessage);

    if (message.success && message.data.__type === "get-fonts-response") {
      onFonts(message.data);
    }
  });
};

function PopupPage() {
  const [state, setState] = useState<{ fonts: Fonts; host: string } | null>(
    null
  );

  useOnMount(() => {
    setupListener({ onFonts: setState });
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
      <div className="p-3">
        {!state && <div>Loading...</div>}

        {state && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div className={"mono text-lg break-all"}>{state.host}</div>

            {state.fonts.length === 0 && <div>No fonts found</div>}

            {state.fonts.map((f) => {
              const parsed = Papa.parse(f.name).data as string[][];
              const names = parsed[0];

              const primary = names[0];
              const secondary = names.slice(1);

              return (
                <div key={f.name}>
                  <div className={"flex-center spread"}>
                    <div className={"font-weight-medium"}>{primary}</div>
                    <div className={"text-secondary-alpha"}>
                      {f.count.toLocaleString()}
                    </div>
                  </div>

                  {secondary.length > 0 && (
                    <div className={"text-secondary-alpha text-sm"}>
                      {secondary.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
