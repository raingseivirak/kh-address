import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    villages: "src/villages.ts",
    geo: "src/geo.ts",
    react: "src/react/index.ts",
    "web-component": "src/web-component/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: false,
  external: ["react", "react-dom"],
});
