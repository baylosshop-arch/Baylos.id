import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  const url = Deno.env.get("SUPABASE_URL"), anon = Deno.env.get("SUPABASE_ANON_KEY"), key = Deno.env.get("BITESHIP_API_KEY"), origin = Deno.env.get("BITESHIP_ORIGIN_AREA_ID");
  if (!url || !anon || !key || !origin) return json({ error: "Shipping is not configured yet" }, 503);
  const auth = req.headers.get("Authorization"); if (!auth) return json({ error: "Authentication required" }, 401);
  const supabase = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError || !user) return json({ error: "Invalid session" }, 401);
  let body: any; try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const destination = String(body?.destination_area_id ?? "").trim(), items = Array.isArray(body?.items) ? body.items : [];
  if (!destination || !items.length || items.length > 50) return json({ error: "Destination and 1–50 items required" }, 400);
  // TODO production: map submitted product IDs to trusted DB weights/values; never trust client prices/weights.
  const cleanItems = items.map((x: any) => ({ name: String(x.name ?? "Baylos item").slice(0, 100), quantity: Math.max(1, Math.min(100, Number(x.quantity) || 1)), weight: Math.max(1, Math.min(100000, Number(x.weight) || 500)), value: Math.max(0, Number(x.value) || 0) }));
  const resp = await fetch("https://api.biteship.com/v1/rates/couriers", { method: "POST", headers: { Authorization: key.startsWith("Bearer ") ? key : `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ origin_area_id: origin, destination_area_id: destination, couriers: "jne,jnt,sicepat,anteraja,pos,tiki", items: cleanItems }) });
  const data = await resp.json().catch(() => ({})); if (!resp.ok) return json({ error: "Biteship rate request failed", provider_status: resp.status, details: data }, 502);
  return json({ pricing: data.pricing ?? [], disclaimer: "Indicative quote only; server must revalidate products, weights and destination before order creation." });
});
