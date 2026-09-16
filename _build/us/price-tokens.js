/* price-tokens.js — the shared resolver for price tokens in body copy.

   WHY THIS EXISTS
   regen.mjs owns whole REGIONS (a price table, a FAQ block, the head). It cannot help
   with a price that appears mid-sentence in an article: "full front from $1,900 in NAR".
   Baking such a number by hand breaks the single-source-of-truth rule the whole spec is
   built on, and a plain {{TOKEN}} baked once can never be refreshed.

   So a resolved token keeps its own key next to it:

       {{PRICE:full-front.essential}}   ->   <!--P:PRICE:full-front.essential-->$1,900<!--/P-->

   The marker is what makes this idempotent AND re-resolvable: a later run finds the
   marker, recomputes from assets/pricing.js and rewrites the value in place. Change a
   number in pricing.js, re-run, and every sentence on the site follows.

   TOKENS
     {{PRICE:<id>}}                    single-price item      -> "$450"  (or "on request")
     {{PRICE:<id>.essential}}          PPF Essential column   -> "$1,900"
     {{PRICE:<id>.signature}}          PPF Signature column   -> "$2,150"
     {{STARTING:<group>}}              cheapest published     -> "from $1,000"
     {{PERMONTH:<id>[.<tier>]:<years>} amortised, 2 dp        -> "$31.67"

   PERMONTH exists so derived arithmetic is COMPUTED, never typed. The blog articles
   carried $31.67 / $15.83 / $41.63 / $33.33 as literals; they were right, but nothing
   would have caught them going stale.
*/
'use strict';
const path = require('path');

function load(root) {
  return require(path.join(path.resolve(root), 'assets', 'pricing.js'));
}

/* resolve one token key (the part inside {{ }}) to its display string */
function resolveKey(P, key) {
  let m;

  if ((m = /^PRICE:([A-Za-z0-9-]+)\.(essential|signature)$/.exec(key))) {
    const it = P.byId(m[1]);
    if (!it) throw new Error(`unknown price id "${m[1]}"`);
    const field = m[2] === 'essential' ? 'priceEssential' : 'priceSignature';
    if (it[field] === undefined) throw new Error(`"${m[1]}" has no ${field} (not a two-tier PPF row)`);
    return P.usd(it[field]);
  }

  if ((m = /^PRICE:([A-Za-z0-9-]+)$/.exec(key))) {
    const it = P.byId(m[1]);
    if (!it) throw new Error(`unknown price id "${m[1]}"`);
    if (it.price === undefined && it.priceEssential !== undefined) return P.usd(it.priceEssential);
    return P.usd(it.price);          // null -> "on request"
  }

  if ((m = /^STARTING:([A-Za-z0-9]+)$/.exec(key))) {
    if (!P.groups()[m[1]]) throw new Error(`unknown price group "${m[1]}"`);
    return P.startingAtLabel(m[1]);
  }

  if ((m = /^PERMONTH:([A-Za-z0-9-]+)(?:\.(essential|signature))?:(\d+)$/.exec(key))) {
    const it = P.byId(m[1]);
    if (!it) throw new Error(`unknown price id "${m[1]}"`);
    const v = m[2]
      ? it[m[2] === 'essential' ? 'priceEssential' : 'priceSignature']
      : (it.price !== undefined && it.price !== null ? it.price : it.priceEssential);
    if (typeof v !== 'number') throw new Error(`"${m[1]}" has no numeric price to amortise`);
    const months = Number(m[3]) * 12;
    return '$' + (v / months).toFixed(2);
  }

  throw new Error(`unrecognised price token "{{${key}}}"`);
}

const RAW = /\{\{\s*((?:PRICE|STARTING|PERMONTH):[^}]+?)\s*\}\}/g;
const MARKED = /<!--P:([^>]+?)-->[\s\S]*?<!--\/P-->/g;

/* Resolve every raw token AND refresh every already-marked one. Idempotent. */
function resolveHtml(P, html, onError) {
  let n = 0;
  const wrap = (key) => {
    const value = resolveKey(P, key);
    n++;
    return `<!--P:${key}-->${value}<!--/P-->`;
  };
  let out = html.replace(MARKED, (m, key) => {
    try { return wrap(key.trim()); } catch (e) { onError && onError(key, e); return m; }
  });
  out = out.replace(RAW, (m, key) => {
    try { return wrap(key.trim()); } catch (e) { onError && onError(key, e); return m; }
  });
  return { html: out, count: n };
}

/* every (key, value) pair currently marked in a document — used by the price gate */
function markedPairs(html) {
  const pairs = [];
  const re = /<!--P:([^>]+?)-->([\s\S]*?)<!--\/P-->/g;
  let m;
  while ((m = re.exec(html))) pairs.push({ key: m[1].trim(), value: m[2] });
  return pairs;
}

module.exports = { load, resolveKey, resolveHtml, markedPairs, RAW };
