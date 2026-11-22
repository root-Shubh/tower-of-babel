import type { CapacitorConfig } from "@capacitor/cli";

// Offline app: no server.url, no remote content. Everything ships inside the bundle.
const config: CapacitorConfig = {
  appId: "com.towerofbabel",
  appName: "Tower of Babel",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
};

export default config;
