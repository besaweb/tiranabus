const Pro = (() => {
  const DAY = 864e5;
  const PLANS = [
    { id: 'tourist', name: 'TOURIST PASS', sku: 'pro_tourist_7d', type: 'inapp', days: 7, price: '1,99 €' },
    { id: 'annual', name: 'ANNUAL PREMIUM', sku: 'pro_annual', type: 'subs', days: 365, price: '4,99 €', best: true },
    { id: 'lifetime', name: 'LIFETIME PREMIUM', sku: 'pro_lifetime', type: 'inapp', days: 0, price: '19,99 €' }
  ];
  const FEATURES = ['rt', 'pre', 'poi', 'ext'];
  const FREE = ['cmpTimes', 'cmpLines', 'cmpStops', 'cmpPlan', 'cmpMap'];
  const RANK = { free: 0, tourist: 1, annual: 2, lifetime: 3 };
  const bySku = sku => PLANS.find(p => p.sku === sku);

  function parse(raw) {
    let d = raw;
    if (typeof raw === 'string') try { d = JSON.parse(raw); } catch (e) { d = null; }
    const ok = d && typeof d === 'object';
    const list = ok && Array.isArray(d.purchases) ? d.purchases : [];
    return {
      ready: !!(ok && d.ready),
      purchases: list.filter(p => p && bySku(p.sku) && p.state === 'purchased' && Number.isFinite(+p.time) && +p.time > 0).map(p => ({ sku: p.sku, time: +p.time, auto: !!p.auto }))
    };
  }

  function until(pl, p, now) {
    if (!pl.days) return Infinity;
    const len = pl.days * DAY;
    if (pl.type !== 'subs' || !p.auto) return p.time + len;
    return p.time + (Math.max(0, Math.floor((now - p.time) / len)) + 1) * len;
  }

  function state(raw, now) {
    const d = parse(raw);
    let best = { plan: 'free', until: null, auto: false };
    for (const p of d.purchases) {
      const pl = bySku(p.sku), u = until(pl, p, now);
      if (p.time > now + DAY || u <= now) continue;
      if (RANK[pl.id] > RANK[best.plan] || (pl.id === best.plan && u > best.until)) best = { plan: pl.id, until: u === Infinity ? null : u, auto: pl.type === 'subs' && p.auto };
    }
    return Object.assign(best, { active: best.plan !== 'free', billing: d.ready });
  }

  const can = (st, enforce) => !enforce || !!(st && st.active);

  const ads = st => !(st && st.active);

  return { PLANS, FEATURES, FREE, DAY, parse, state, can, ads };
})();
if (typeof module !== 'undefined') module.exports = Pro;
