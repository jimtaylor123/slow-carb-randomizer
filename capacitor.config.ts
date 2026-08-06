import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jimtaylor.slowcarbrandomizer",
  appName: "Slow Carb Randomizer",
  webDir: "out",
  backgroundColor: "#09090b",
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: "#09090b",
      showSpinner: false,
    },
  },
};

export default config;
