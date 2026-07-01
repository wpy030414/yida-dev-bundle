/// <reference types="vite" />
import { defineConfig } from "vite"
import { readFileSync } from "fs"
import { resolve } from "path"
import viteCompression from "vite-plugin-compression"

const { version } = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8"))

let counter = 0

export default defineConfig((env) => {
  switch (env.mode) {
    default:
      return {
        define: {
          "import.meta.env.VITE_APP_VERSION": JSON.stringify(version),
        },

        build: {
          emptyOutDir: false,
          write: true,

          lib: {
            entry: "./src/index.ts",
            name: "YidaDevBundle",
            formats: ["iife", "iife"],
            fileName: () => `${counter++ ? "latest" : version}.js`,
          },

          target: "es2022",
        },

        plugins: [
          viteCompression({
            filter: (file) => ["latest", version].some((e) => file.endsWith(`${e}.js`)),
          }),
        ],
      }
    case "canary":
      return {
        define: {
          "import.meta.env.VITE_APP_VERSION": JSON.stringify(version + "-canary"),
        },

        build: {
          emptyOutDir: false,
          write: true,

          lib: {
            entry: "./src/index.ts",
            name: "YidaDevBundle",
            formats: ["iife"],
            fileName: () => "canary.js",
          },
          target: "es2022",
        },

        plugins: [
          viteCompression({
            filter: (file) => file.endsWith("canary.js"),
          }),
        ],
      }
  }
})
