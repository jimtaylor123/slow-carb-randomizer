import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local Vercel CLI artifacts:
    ".vercel/**",
    // Capacitor copies the static export into the native projects:
    "ios/**/public/**",
    "android/**/public/**",
  ]),
  {
    files: ["src/hooks/useHydrated.ts"],
    rules: {
      // Reading localStorage must be deferred until after hydration so the
      // static-export SSR HTML and the client render stay in sync.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
