import { ClientApp } from "@/components/ClientApp";

// Force this route to render at request time only — it's fully
// client-side/auth-gated and must never be statically prerendered
// (prerendering would run createClient() with no real env vars at
// build time and fail).
export const dynamic = "force-dynamic";

export default function Page() {
  return <ClientApp />;
}
