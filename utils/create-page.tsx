import { createRoot } from "react-dom/client";
import React from "react";

// @ts-ignore: We're using esbuild plugin to bundle scss and inject it as string here
import appCssText from "../styles/app.scss";

export const createPage = (node: React.ReactNode) => {
  const root = document.getElementById("root")!;
  const reactRoot = createRoot(root);

  addStyle();

  reactRoot.render(node);
};

const addStyle = () => {
  // Add global CSS styles (styles/*.scss)
  const head = document.head;
  const style = document.createElement("style");
  style.textContent = appCssText;
  head.appendChild(style);
};
