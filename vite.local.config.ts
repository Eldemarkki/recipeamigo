import baseConfig from "./vite.config";
import { mergeConfig } from "vitest/config";

export default mergeConfig(baseConfig, {
  test: {
    globalSetup: ["./src/tests/setup.ts"],
  },
});
