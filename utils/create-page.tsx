import { createRoot } from "react-dom/client";
import React from "react";

export const createPage = (node: React.ReactNode) => {
  const root = document.getElementById("root")!;
  const reactRoot = createRoot(root);

  reactRoot.render(node);
};
