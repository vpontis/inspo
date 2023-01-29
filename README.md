# Inspo

This extension helps you curate websites for sources of design inspiration.

Right now, you can open the popup to see the list of fonts used.

## Installation

If you want to install, you can download the latest version of the extension from the [Releases tab](https://github.com/vpontis/inspo/releases).

You're going to want to use `mv3` unless you are on Firefox in which case you'll use `mv2`.

Once you have the Zip file, you can:

1. Open [chrome://extensions/](chrome://extensions/)
2. Turn on Developer Mode
3. Drag the Zip file into the Chrome Extension dashboard
4. Click on the Puzzle Piece in the toolbar and pin the extension to your toolbar

## Chrome Extension Architecture

Chrome extensions are a bit weird in that they have a few different _realms_ that they can run in.

The realms that we are using here are:

- The `content` realm runs in the context of the page you are visiting. The `content` realm can securely communicate with the `background` and `popup` realms.
- The `popup` realm renders the popup that you see when you click on the Chrome Extension in your menubar. In the `manifest.json` this is known as the `default_popup`.
- The `background` realm runs as a service worker separate from any existing tabs. It's where we can run timers and other background tasks. We aren't using it here yet.
