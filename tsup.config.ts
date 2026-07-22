import { defineConfig } from "tsup";
import { cp } from "fs/promises";
import { join } from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: false,
  noExternal: [],
  async onSuccess() {
    await cp(
      join("src", "data", "villages"),
      join("dist", "villages"),
      { recursive: true }
    );
    console.log("Copied village chunks to dist/villages/");
  },
});
