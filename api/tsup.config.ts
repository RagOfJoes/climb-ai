// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "tsup";

export default defineConfig({
	clean: true,
	dts: false,
	entry: ["./src/index.ts"],
	format: ["cjs"],
	sourcemap: false,
	splitting: false,
});
