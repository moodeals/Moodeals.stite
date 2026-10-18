// Builds the MooDeals site from deals.json. Netlify runs this automatically.
const fs = require("fs");
const path = require("path");

const SITE = "MooDeals";
const TAGLINE = "Deals I find, so you don’t have to.";
const deals = JSON.parse(fs.readFileSync("deals.json", "utf8"));

const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const DISCLOSURES = `<p class="disc"><strong>#ad</strong> As an Amazon Associate, I earn from qualifying purchases. Prices and availability are subject to change.</p>`;

const CSS = `
:root{--bg:#ffffff;--ink:#1c2a22;--muted:#5b6b62;--green:#2f6b4f;--soft:#eef4f0;--line:#d9e3dc}
@media (prefers-color-scheme:dark){:root{--bg:#121a15;--ink:#eaf2ec;--muted:#9fb0a5;--green:#6fc59a;--soft:#1b2620;--line:#2b3a31}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 Georgia,"Times New Roman",serif}
.wrap{max-width:640px;margin:0 auto;padding:0 20px 48px}
header{padding:36px 20px 28px;background:radial-gradient(circle at 12% 30%,var(--ink) 0 22px,transparent 23px),radial-gradient(circle at 86% 70%,var(--ink) 0 30px,transparent 31px),radial-gradient(circle at 70% 18%,var(--ink) 0 14px,transparent 15px),var(--soft);border-bottom:1px solid var(--line)}
header .in{max-width:640px;margin:0 auto}
header a{color:var(--ink);text-decoration:none}
h1{margin:0;font-size:2.4rem;line-height:1.1;letter-spacing:-.01em}
.tag{margin:6px 0 0;color:var(--muted)}
h2{font-size:1.6rem;line-height:1.2;margin:28px 0 8px}
.deal{display:block;padding:16px 0;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none}
.deal b{display:block;font-size:1.1rem}
.deal span{color:var(--muted);font-size:.95rem}
.btn{display:inline-block;margin:18px 0 6px;padding:14px 22px;background:var(--green);color:#fff;border-radius:8px;text-decoration:none;font:600 1rem system-ui,sans-serif}
@media (prefers-color-scheme:dark){.btn{color:#0d1510}}
.btn:focus-visible,.deal:focus-visible{outline:3px solid var(--green);outline-offset:3px}
img.pic{max-width:100%;height:auto;border-radius:8px;margin-top:14px}
.price{font-weight:700;margin:6px 0}
.disc{margin-top:20px;font-size:.85rem;color:var(--muted)}
footer{margin-top:32px;padding-top:14px;border-top:1px solid var(--line)}
.back{color:var(--green)}
`;

const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style></head><body>
<header><div class="in"><a href="/"><h1>${SITE}</h1></a><p class="tag">${TAGLINE}</p></div></header>
<div class="wrap">${body}
<footer>${DISCLOSURES}</footer></div></body></html>`;

const out = "dist";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Home page
const list = deals.map((d) => `<a class="deal" href="/${esc(d.code)}"><b>${esc(d.title)}</b><span>${esc(d.note)}</span></a>`).join("");
fs.writeFileSync(path.join(out, "index.html"), page(`${SITE} – Today’s deals`, `<h2>Today’s deals</h2>${list}`));

// Deal pages + redirects
let redirects = "";
for (const d of deals) {
  const dir = path.join(out, d.code);
  fs.mkdirSync(dir, { recursive: true });
  const body = `<h2>${esc(d.title)}</h2>
${d.image ? `<img class="pic" src="${esc(d.image)}" alt="${esc(d.title)}">` : ""}
${d.price ? `<p class="price">${esc(d.price)}</p>` : ""}
${d.note ? `<p>${esc(d.note)}</p>` : ""}
<a class="btn" href="${esc(d.url)}" rel="nofollow sponsored noopener">View on Amazon</a>
<p><a class="back" href="/">See all deals</a></p>`;
  fs.writeFileSync(path.join(dir, "index.html"), page(`${d.title} – ${SITE}`, body));
  redirects += `/go/${d.code} ${d.url} 302\n`;
}
fs.writeFileSync(path.join(out, "_redirects"), redirects);
console.log(`Built ${deals.length} deal(s).`);
