// Baylos shipping quotation: trusted product data only; indicative, not checkout authorization.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const postalCode = (v: unknown): string | null => {
  const s = String(v ?? '').trim();
  return /^\d{5}$/.test(s) ? s : null;
};
serve(async req => {
  if (req.method !== 'POST') return respond(405, { error: 'POST required' });
  const url = Deno.env.get('SUPABASE_URL'), anon = Deno.env.get('SUPABASE_ANON_KEY');
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const key = Deno.env.get('BITESHIP_API_KEY');
  // Prefer postal code so Test-mode users do not need a saved Biteship Location.
  // Area ID remains supported as a backward-compatible fallback.
  const originPostal = postalCode(Deno.env.get('BITESHIP_ORIGIN_POSTAL_CODE'));
  const originArea = String(Deno.env.get('BITESHIP_ORIGIN_AREA_ID') || '').trim();
  if (!url || !anon || !service || !key || (!originPostal && !/^[a-zA-Z0-9_-]{1,80}$/.test(originArea)))
    return respond(503, { error: 'Shipping not configured' });
  const authorization = req.headers.get('authorization');
  if (!authorization) return respond(401, { error: 'Login required' });
  const authClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return respond(401, { error: 'Invalid session' });
  let body: any;
  try { body = await req.json(); } catch { return respond(400, { error: 'Invalid JSON' }); }
  const destinationPostal = postalCode(body?.destination_postal_code);
  const destinationArea = String(body?.destination_area_id || '').trim();
  const validDestinationArea = /^[a-zA-Z0-9_-]{1,80}$/.test(destinationArea);
  const validOriginArea = /^[a-zA-Z0-9_-]{1,80}$/.test(originArea);
  const usePostalOrArea = Boolean((originPostal || validOriginArea) && (destinationPostal || validDestinationArea));
  const items = body?.items;
  if (!usePostalOrArea || !Array.isArray(items) || items.length < 1 || items.length > 50)
    return respond(400, { error: 'Provide a valid origin and destination postal code or area ID, and 1–50 items' });
  const ids = new Set<string>();
  for (const item of items) {
    if (!item || typeof item.product_id !== 'string' || !uuid.test(item.product_id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100 || ids.has(item.product_id))
      return respond(400, { error: 'Invalid or duplicate product' });
    ids.add(item.product_id);
  }
  // Missing weight_grams column, null weights, or inactive products must fail closed.
  const db = createClient(url, service, { auth: { persistSession: false } });
  const { data: products, error: dbError } = await db.from('products').select('id,name,retail_price,weight_grams,is_active').in('id', [...ids]);
  if (dbError || !products || products.length !== ids.size) return respond(503, { error: 'Trusted shipping product data unavailable' });
  const byId = new Map(products.map(p => [p.id, p]));
  const shippingItems = [];
  for (const item of items) {
    const p = byId.get(item.product_id);
    if (!p || p.is_active !== true || !Number.isSafeInteger(p.weight_grams) || p.weight_grams < 1 || p.weight_grams > 100000 || !Number.isFinite(Number(p.retail_price)) || Number(p.retail_price) < 0)
      return respond(422, { error: 'Product shipping data incomplete; admin must verify weights' });
    shippingItems.push({ name: String(p.name).slice(0, 100), quantity: item.quantity, weight: p.weight_grams, value: Number(p.retail_price) });
  }
  const locationFields: Record<string, string | number> = {};
  if (originPostal) locationFields.origin_postal_code = Number(originPostal);
  else locationFields.origin_area_id = originArea;
  if (destinationPostal) locationFields.destination_postal_code = Number(destinationPostal);
  else locationFields.destination_area_id = destinationArea;
  try {
    const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST', signal: AbortSignal.timeout(12000),
      headers: { Authorization: key.startsWith('Bearer ') ? key : `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...locationFields, couriers: 'jne,jnt,sicepat,anteraja,pos,tiki', items: shippingItems })
    });
    if (!response.ok) return respond(502, { error: 'Shipping provider unavailable' });
    const data = await response.json();
    return respond(200, { pricing: Array.isArray(data?.pricing) ? data.pricing : [], indicative_only: true, checkout_enabled: false });
  } catch { return respond(502, { error: 'Shipping provider timeout or network error' }); }
});
