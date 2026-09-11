"use client";

import nextDynamic from "next/dynamic";
import { HashRouter } from "react-router-dom";
import { AuthGate } from "@/components/AuthGate";

// react-router-dom's HashRouter and the app's browser-only APIs (Supabase
// Storage, canvas rendering in ModelExplorer) don't play well with SSR,
// so the whole app is loaded client-side only.
const App = nextDynamic(() => import("@/App"), { ssr: false });

export function ClientApp() {
  return (
    <AuthGate>
      <HashRouter>
        <App />
      </HashRouter>
    </AuthGate>
  );
}
