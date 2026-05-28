import { beforeAll } from "vitest";
import { initializeI18n } from "./index";

// Mock window object for SSR testing
// @ts-ignore - global is available in Node.js environment
if (typeof window === "undefined" && typeof global !== "undefined") {
  // @ts-ignore
  global.window = {
    innerWidth: 1920,
    innerHeight: 1080,
    location: {
      search: "",
    },
    confirm: () => false,
    addEventListener: () => {},
    removeEventListener: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    setTimeout: () => 0,
    clearTimeout: () => {},
  };
}

beforeAll(async () => {
  await initializeI18n("zh-CN");
});
