#!/usr/bin/env node -r esbuild-register
/// <reference types="node" />

import * as esbuild from "esbuild";
import * as jsonc from "jsonc-parser";
import { DateTime } from "luxon";
import child_process from "node:child_process";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { sassPlugin } from "esbuild-sass-plugin";

declare global {
  type Process = {
    exit: (code: number) => void;
    env: {
      BUILD_FOR_PROD?: string;
      RELEASE?: string;
      NODE_ENV?: "production" | "development";
    };
  };
}

const production = process.env.BUILD_FOR_PROD === "true";
const env = production ? "production" : "development";

/**
 * User defined variables here. We can update thise to modify how the build works.
 */
const entryPoints = [
  "realms/content.ts",
  "realms/background.ts",
  "pages/popup.tsx",
];
const baseOutdir = production ? "dist-prod" : "dist-dev";
const images = ["icon-256.png"];
const pages = [["popup.html", "pages/popup.js"]];

/**
 * We build for both MV2 and MV3.
 *
 * Firefox only supports MV2 even though they said they were switching to MV3
 * years ago...
 */
const main = async () => {
  await Promise.all([buildExtension("mv2"), buildExtension("mv3")]);
};

type ManifestVersion = "mv2" | "mv3";

async function buildExtension(manifestVersion: ManifestVersion) {
  try {
    await createOutDir(manifestVersion);

    await buildTs(manifestVersion);
    await writePages(manifestVersion);
    await writeManifest(manifestVersion);
    await copyImages(manifestVersion);

    if (production) {
      await createZip(manifestVersion);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function getOutDir(manifestVersion: ManifestVersion): string {
  return `${baseOutdir}/extension-${manifestVersion}`;
}

async function createOutDir(manifestVersion: ManifestVersion): Promise<void> {
  const outdir = getOutDir(manifestVersion);
  if (production && fs.existsSync(outdir)) {
    await fsPromises.rm(outdir, { recursive: true });
  }
  await fsPromises.mkdir(outdir, { recursive: true });
}

async function buildTs(manifestVersion: ManifestVersion): Promise<void> {
  const outdir = getOutDir(manifestVersion);

  await esbuild.build({
    bundle: true,
    minify: production,
    tsconfig: "tsconfig.json",
    target: "safari15",
    sourcemap: "external",
    metafile: true,
    plugins: [
      sassPlugin({
        type: "css-text",
        style: production ? "compressed" : "expanded",
      }),
    ],
    define: {
      "process.env.SENTRY_RELEASE": production ? `"${getGitHash()}"` : `""`,
      "process.env.NODE_ENV": `"${env}"`,
      "global.process": "{ 'browser': true }",
      global: "globalThis",
    },
    entryPoints,
    outdir: outdir,
  });
}

const getPackageJson = async (): Promise<any> => {
  const packageJsonBuffer = await fsPromises.readFile("package.json");
  return JSON.parse(packageJsonBuffer.toString("utf-8"));
};

async function writeManifest(manifestVersion: ManifestVersion): Promise<void> {
  const outdir = getOutDir(manifestVersion);
  const commonManifestBuffer = await fsPromises.readFile(
    "templates/manifest-common.jsonc"
  );
  const versionManifestBuffer = await fsPromises.readFile(
    `templates/manifest-${manifestVersion}.jsonc`
  );
  const packageJson = await getPackageJson();
  const commonManifest = jsonc.parse(commonManifestBuffer.toString("utf-8"));
  const versionManifest = jsonc.parse(versionManifestBuffer.toString("utf-8"));
  const manifest = {
    version: packageJson.version,
    description: packageJson.description,
    ...commonManifest,
    ...versionManifest,
  };
  const manifestString = JSON.stringify(manifest, null, 4);

  await fsPromises.writeFile(`${outdir}/manifest.json`, manifestString);
}

const now = DateTime.now();

const getZipFileName = (manifestVersion: ManifestVersion): string => {
  const date = now.toFormat("yyyy-MM-dd-HH-mm");
  return `extension-${manifestVersion}-${date}.zip`;
};

async function createZip(manifestVersion: ManifestVersion): Promise<void> {
  const outdir = getOutDir(manifestVersion);
  const name = getZipFileName(manifestVersion);

  // We pass in `-x *.map` to exclude JS sourcemaps which should go to Sentry but not to browsers
  child_process.execSync(`(cd ${outdir} && zip -r ../../${name} . -x "*.map")`);
}

async function copyImages(manifestVersion: ManifestVersion): Promise<void> {
  const outdir = getOutDir(manifestVersion);
  await Promise.all(
    images.map((image) =>
      fsPromises.copyFile(`images/${image}`, `${outdir}/${image}`)
    )
  );
}

async function writePages(manifestVersion: ManifestVersion): Promise<void> {
  const outdir = getOutDir(manifestVersion);
  await Promise.all(
    pages.map(async ([htmlName, scriptName]) => {
      const indexBuffer = await fsPromises.readFile("templates/index.html");
      const index = indexBuffer.toString();
      const indexContent = index.replace(
        "__REPLACE_WITH_JS_SCRIPT__",
        scriptName
      );
      await fsPromises.writeFile(`${outdir}/${htmlName}`, indexContent);
    })
  );
}

const getGitHash = (): string => {
  return child_process.execSync("git rev-parse HEAD").toString().trim();
};

main();
