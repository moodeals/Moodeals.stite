// Builds the MooDeals site from deals.json. Netlify runs this automatically.
const fs = require("fs");
const path = require("path");

const SITE = "MooDeals";
const TAGLINE = "Deals I find, so you don’t have to.";
const deals = JSON.parse(fs.readFileSync("deals.json", "utf8"));

const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const NOTICE = "Deals and coupons can end at any time, may have limits, and can sell out. Check Amazon for the current offer.";

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
.pic .ph{font:900 1.1rem "Arial Black",Arial,sans-serif;color:var(--blue)}
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
.nav{float:right;margin-top:6px;font-size:.9rem;color:#c9d3ff!important;text-decoration:underline!important}
.doc h3{font:900 1.05rem "Arial Black",Arial,sans-serif;margin:22px 0 6px}
.doc p{margin:0 0 10px}
`;

const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style></head><body>
<header><div class="in"><a class="nav" href="/disclosure">Disclosure</a><a href="/"><h1>Moo<span>Deals</span></h1></a><p class="tag">${TAGLINE}</p></div></header>
${body}
<footer>${DISCLOSURES}<p><a href="/disclosure">Affiliate disclosure</a></p></footer></body></html>`;

const pic = (d) => `<div class="pic">${d.image ? `<img src="${esc(d.image)}" alt="${esc(d.title)}" loading="lazy" referrerpolicy="no-referrer">` : `<span class="ph">MooDeals</span>`}${d.badge ? `<span class="badge">${esc(d.badge)}</span>` : ""}</div>`;

const out = "dist";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Home page
const cards = deals.map((d) => `<a class="card" href="/${esc(d.code)}">${pic(d)}<div class="info"><b>${esc(d.title)}</b>${d.note ? `<small>${esc(d.note)}</small>` : ""}<span class="get">Get deal</span></div></a>`).join("");
fs.writeFileSync(path.join(out, "index.html"), page(`${SITE} – Today’s deals`, `<div class="wrap"><h2>Today’s deals</h2><p class="notice">${NOTICE}</p><div class="grid">${cards}</div></div>`));

// Deal pages + redirects
let redirects = "";
for (const d of deals) {
  const dir = path.join(out, d.code);
  fs.mkdirSync(dir, { recursive: true });
  const body = `<div class="wrap big"><h2>${esc(d.title)}</h2>
${pic(d)}
${d.price ? `<p class="price">${esc(d.price)}</p>` : ""}
${d.note ? `<p>${esc(d.note)}</p>` : ""}
<p class="notice">${NOTICE}</p>
<a class="btn" href="${esc(d.url)}" rel="nofollow sponsored noopener">Get this deal on Amazon</a>
<p><a class="back" href="/">See all deals</a></p></div>`;
  fs.writeFileSync(path.join(dir, "index.html"), page(`${d.title} – ${SITE}`, body));
  redirects += `/go/${d.code} ${d.url} 302\n`;
}
fs.writeFileSync(path.join(out, "_redirects"), redirects);

// Disclosure page at /disclosure
const disclosure = `<div class="wrap doc"><h2>Affiliate disclosure</h2>
<p><strong>#ad</strong> MooDeals is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a way for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, I earn from qualifying purchases.</p>
<h3>How the links work</h3>
<p>When you click a deal link on this site or in my posts and buy something on Amazon, I may earn a small commission. It comes from Amazon and costs you nothing extra. It doesn’t change the price you pay.</p>
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
