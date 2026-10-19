// Builds the MooDeals site from deals.json. Netlify runs this automatically.
const fs = require("fs");
const path = require("path");

const SITE = "MooDeals";
const TAGLINE = "Deals I find, so you don’t have to.";
const deals = JSON.parse(fs.readFileSync("deals.json", "utf8")).filter((d) => !/REPLACE_ME/.test(d.url || ""));
const isAmazon = (u) => /(^|\.)(amazon\.[a-z.]+|amzn\.to|a\.co)(\/|$)/i.test(String(u).replace(/^https?:\/\//i, ""));

const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const NOTICE = "Deals and coupons can end at any time, may have limits, and can sell out. Check the store for the current offer.";

const DISCLOSURES = `<p class="disc"><strong>#ad</strong> As an Amazon Associate, I earn from qualifying purchases. Prices and availability are subject to change.</p>`;

const CSS = `
:root{--navy:#0b1b4d;--blue:#1f4bff;--yellow:#ffd23f;--red:#e5173f;--ink:#0b1b4d;--muted:#55607f;--bg:#f3f5fb;--card:#ffffff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif}
header{background:var(--navy);color:#fff;padding:22px 16px 20px;border-bottom:6px solid var(--yellow)}
header .in{max-width:760px;margin:0 auto}
header a{color:#fff;text-decoration:none}
h1{margin:0;font:900 2.4rem/1 "Arial Black","Helvetica Neue",Arial,sans-serif;letter-spacing:-.02em}
h1 span{color:var(--yellow)}
.tag{margin:6px 0 0;color:#c9d3ff}
.wrap{max-width:760px;margin:0 auto;padding:20px 16px 48px}
h2{font:900 1.5rem/1.15 "Arial Black","Helvetica Neue",Arial,sans-serif;margin:4px 0 16px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media (min-width:640px){.grid{grid-template-columns:repeat(3,1fr)}}
.card{display:flex;flex-direction:column;background:var(--card);border-radius:12px;overflow:hidden;text-decoration:none;color:var(--ink);box-shadow:0 2px 0 rgba(11,27,77,.12)}
.card:focus-visible,.btn:focus-visible{outline:3px solid var(--blue);outline-offset:2px}
.pic{position:relative;aspect-ratio:1/1;background:#e6ebff;display:flex;align-items:center;justify-content:center}
.pic img{width:100%;height:100%;object-fit:contain;padding:8px}
.pic .ph{color:#fff;font:900 1.35rem/1.1 "Arial Black",Arial,sans-serif;text-align:center;text-transform:uppercase;padding:14px;overflow-wrap:anywhere}
.badge{position:absolute;top:8px;left:8px;background:var(--red);color:#fff;font:800 .85rem system-ui,sans-serif;padding:4px 9px;border-radius:6px}
.info{padding:10px 12px 14px;display:flex;flex-direction:column;gap:6px;flex:1}
.info b{font-size:.98rem;line-height:1.25}
.info small{color:var(--muted)}
.get{margin-top:auto;display:block;text-align:center;background:var(--yellow);color:var(--navy);font:800 .95rem system-ui,sans-serif;padding:10px;border-radius:8px}
.big .pic{border-radius:12px;max-width:420px}
.notice{background:#fff3c4;border-left:5px solid var(--yellow);padding:10px 12px;border-radius:6px;font-size:.92rem;margin:14px 0}
.price{font:900 1.6rem "Arial Black",Arial,sans-serif;margin:10px 0 0}
.btn{display:block;text-align:center;margin:18px 0 8px;padding:16px 22px;background:var(--yellow);color:var(--navy);border-radius:10px;text-decoration:none;font:900 1.1rem system-ui,sans-serif;box-shadow:0 3px 0 #c9a200}
.back{color:var(--blue);font-weight:700}
.disc{margin-top:22px;font-size:.82rem;color:var(--muted)}
footer{max-width:760px;margin:0 auto;padding:0 16px 40px}
footer a{color:var(--blue);font-weight:700}
.nav{float:right;margin-top:6px;font-size:.9rem}
.nav a{color:#c9d3ff;text-decoration:none;margin-left:14px;font-weight:700}
.top{background:#fff3c4;border-bottom:3px solid var(--yellow);padding:9px 16px;font-size:.88rem}
.top .in{max-width:760px;margin:0 auto}
.top b{background:var(--red);color:#fff;padding:2px 7px;border-radius:5px;margin-right:6px;font-size:.8rem}
.top a{color:var(--navy);font-weight:800}
.search{width:100%;padding:14px;border:2px solid #cfd6ee;border-radius:10px;font-size:16px;margin:0 0 14px;background:#fff;color:var(--navy)}
.none{color:var(--muted);padding:10px 0}
.search{margin:0 0 14px}
.search input{width:100%;padding:13px 14px;border:2px solid #cfd6ee;border-radius:10px;font-size:16px;background:#fff;color:var(--navy)}
#none,.empty{display:none;color:var(--muted);margin:16px 0}
.empty{display:block}
.tile{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:14px;color:#fff;font:900 1.35rem/1.1 "Arial Black","Helvetica Neue",Arial,sans-serif;word-break:break-word}
.tile em{position:absolute;bottom:8px;left:0;right:0;font:800 .65rem system-ui,sans-serif;letter-spacing:.18em;opacity:.8;font-style:normal}
.big .pic{aspect-ratio:16/10}
.listed{color:var(--muted);font-size:.85rem;margin:4px 0}
.doc h3{font:900 1.05rem "Arial Black",Arial,sans-serif;margin:22px 0 6px}
.doc p{margin:0 0 10px}
.list{display:flex;flex-direction:column;gap:10px}
.row{flex-direction:row;align-items:center;gap:12px;border-left:6px solid var(--navy);padding:12px}
.row .thumb{width:64px;height:64px;object-fit:contain;background:#e6ebff;border-radius:8px;flex:none}
.row .txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.row .txt b{font-size:1rem;line-height:1.25}
.row .txt small{color:var(--muted)}
.chip{align-self:flex-start;display:inline-block;color:#fff;font:800 .72rem system-ui,sans-serif;padding:2px 8px;border-radius:5px;text-transform:uppercase;margin-bottom:2px}
.row .get{margin:0;white-space:nowrap;padding:10px 14px}
.list{gap:14px}
.link{display:block;text-align:center;color:#fff;padding:18px 16px;border-radius:14px;box-shadow:0 5px 0 rgba(0,0,0,.28);text-decoration:none;border-left:0}
.link:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.28)}
.link .t{display:block;font:900 1.2rem/1.25 system-ui,-apple-system,Arial,sans-serif}
.link .n{display:block;font-size:.88rem;margin-top:4px;opacity:.95}
.link .bdg{display:inline-block;background:#fff;color:var(--navy);font:800 .7rem system-ui,sans-serif;padding:2px 9px;border-radius:999px;margin-bottom:7px;text-transform:uppercase}
`;

const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style></head><body>
<div class="top"><div class="in"><b>#ad</b>As an Amazon Associate, I earn from qualifying purchases. <a href="/disclosure">Details</a></div></div>
<header><div class="in"><span class="nav"><a href="/">Deals</a><a href="/about">About</a><a href="/disclosure">Disclosure</a></span><a href="/"><h1>Moo<span>Deals</span></h1></a><p class="tag">${TAGLINE}</p></div></header>
${body}
<footer>${DISCLOSURES}<p><a href="/disclosure">Affiliate disclosure</a></p></footer></body></html>`;

const listed = (d) => { if (!d.added) return ""; const t = new Date(d.added + "T12:00:00Z"); return isNaN(t) ? "" : `<p class="listed">Listed: ${t.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}</p>`; };

const COLORS = ["#1f4bff", "#e5173f", "#0b8f5a", "#7a2cff", "#d95b00", "#0b1b4d"];
const colorFor = (d) => COLORS[[...String(d.code)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % COLORS.length];
const tileText = (d) => { const t = (d.badge || String(d.title).split(/\s+/).slice(0, 3).join(" ")).toUpperCase(); return t.length > 30 ? t.slice(0, 29) + "…" : t; };
const pic = (d) => {
  if (d.image) return `<div class="pic"><img src="${esc(d.image)}" alt="${esc(d.title)}" loading="lazy" referrerpolicy="no-referrer">${d.badge ? `<span class="badge">${esc(d.badge)}</span>` : ""}</div>`;
  const c = COLORS[[...String(d.code)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % COLORS.length];
  return `<div class="pic"><div class="tile" style="background:${c}"><span>${esc(tileText(d))}</span><em>MOODEALS</em></div></div>`;
};

const out = "dist";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Home page
const cards = deals.map((d) => `<a class="card link" data-s="${esc((d.title + " " + (d.note || "")).toLowerCase())}" href="/${esc(d.code)}" style="background:${colorFor(d)}">${d.badge ? `<span class="bdg">${esc(d.badge)}</span>` : ""}<span class="t">${esc(d.title)}</span>${d.note ? `<span class="n">${esc(d.note)}</span>` : ""}</a>`).join("");
const searchJs = `<script>(function(){var q=document.getElementById("q");if(!q)return;q.addEventListener("input",function(){var v=q.value.toLowerCase().trim(),n=0;document.querySelectorAll(".card").forEach(function(c){var m=!v||c.getAttribute("data-s").indexOf(v)>-1;c.style.display=m?"":"none";if(m)n++});document.getElementById("none").style.display=n?"none":"block"})})();</script>`;
const homeBody = deals.length
  ? `<div class="wrap"><h2>Today’s deals</h2><p class="notice">${NOTICE}</p><div class="search"><input id="q" type="search" placeholder="Search deals…" aria-label="Search deals" autocomplete="off"></div><div class="list">${cards}</div><p id="none">No deals match your search.</p></div>${searchJs}`
  : `<div class="wrap"><h2>Today’s deals</h2><p class="empty">New deals are coming soon. Check back shortly.</p></div>`;
fs.writeFileSync(path.join(out, "index.html"), page(`${SITE} – Today’s deals`, homeBody));

// Deal pages + redirects
let redirects = "";
for (const d of deals) {
  const dir = path.join(out, d.code);
  fs.mkdirSync(dir, { recursive: true });
  const body = `<div class="wrap big"><h2>${esc(d.title)}</h2>
${d.image ? pic(d) : d.badge ? `<span class="chip" style="background:${colorFor(d)}">${esc(d.badge)}</span>` : ""}
${listed(d)}
${d.price ? `<p class="price">${esc(d.price)}</p>` : ""}
${d.note ? `<p>${esc(d.note)}</p>` : ""}
<p class="notice">${NOTICE}</p>
<a class="btn" href="${esc(d.url)}" rel="nofollow sponsored noopener">${isAmazon(d.url) ? "Get this deal on Amazon" : "Get this deal"}</a>
<p><a class="back" href="/">See all deals</a></p></div>`;
  fs.writeFileSync(path.join(dir, "index.html"), page(`${d.title} – ${SITE}`, body));
  redirects += `/go/${d.code} ${d.url} 302\n`;
}
fs.writeFileSync(path.join(out, "_redirects"), redirects);

// Uploaded images
if (fs.existsSync("images")) fs.cpSync("images", path.join(out, "images"), { recursive: true });

// About page at /about
const about = `<div class="wrap doc"><h2>About MooDeals</h2>
<p>MooDeals is a small deal board. I spot deals and coupons on Amazon and post the product with a link to the listing.</p>
<p>I’m an Amazon Associate, so I may earn a commission when you buy through my links. It costs you nothing extra. See the <a class="back" href="/disclosure">affiliate disclosure</a> for details.</p>
<p>I’m not the seller and I don’t process orders. Price, availability, shipping, payment and returns are all handled by Amazon or the seller on the product page.</p>
<p>Deals and coupons can end at any time, may have limits, and can sell out.</p>
<p><a class="back" href="/">Back to deals</a></p></div>`;
fs.mkdirSync(path.join(out, "about"), { recursive: true });
fs.writeFileSync(path.join(out, "about", "index.html"), page(`About – ${SITE}`, about));

// Disclosure page at /disclosure
const disclosure = `<div class="wrap doc"><h2>Affiliate disclosure</h2>
<p><strong>#ad</strong> MooDeals is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a way for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, I earn from qualifying purchases.</p>
<h3>How the links work</h3>
<p>When you click a deal link on this site or in my posts and buy something on Amazon, I may earn a small commission. It comes from Amazon and costs you nothing extra. It doesn’t change the price you pay.</p>
<p>I may also share links from other affiliate programs. If you buy through those links, I may earn a commission there too, also at no extra cost to you.</p>
<h3>My promise to you</h3>
<p>I only share deals I think are worth a look. Links that earn me a commission are marked #ad, and this notice appears on every page.</p>
<h3>Prices and availability</h3>
<p>Prices and availability are subject to change without notice. Always check the current price and details on Amazon before you buy.</p>
<h3>FTC notice</h3>
<p>In line with Federal Trade Commission guidelines, I disclose that I have a financial relationship with Amazon through its affiliate program, and I may be compensated when you buy through my links.</p>
<h3>Trademarks</h3>
<p>Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. MooDeals is not owned by or affiliated with Amazon.</p>
<p><a class="back" href="/">Back to deals</a></p></div>`;
fs.mkdirSync(path.join(out, "disclosure"), { recursive: true });
fs.writeFileSync(path.join(out, "disclosure", "index.html"), page(`Affiliate disclosure – ${SITE}`, disclosure));

// Private add-deal page at /admin
if (fs.existsSync("admin.html")) {
  fs.mkdirSync(path.join(out, "admin"), { recursive: true });
  fs.copyFileSync("admin.html", path.join(out, "admin", "index.html"));
}
console.log(`Built ${deals.length} deal(s).`);
