# Custom Domain Setup — Step by Step

This guide assumes you bought a domain like `rohithdhanala.com` from Namecheap,
GoDaddy, Cloudflare, or any registrar. The same steps work for any domain.

You can point the **same domain** at GitHub Pages **or** Netlify, but not both
simultaneously. Pick one as the primary. **Recommendation:** use Netlify as the
primary (better CDN, instant cache invalidation, easier domain UI), and keep the
GitHub Pages URL as a backup.

---

## Option A — Custom domain on Netlify (recommended)

### 1. Add the domain in Netlify
- Open your site in Netlify → **Site settings → Domain management → Add a domain**
- Enter `rohithdhanala.com` and click **Verify**
- Netlify will also offer to add `www.rohithdhanala.com` — accept it

### 2. Update DNS at your registrar
Two ways. Pick **one**.

**Easiest — use Netlify DNS (recommended):**
- In Netlify, click **Set up Netlify DNS** for the domain
- Netlify shows you 4 nameservers, e.g.
  `dns1.p01.nsone.net`, `dns2.p01.nsone.net`, `dns3.p01.nsone.net`, `dns4.p01.nsone.net`
- At your registrar (Namecheap/GoDaddy/etc.), open your domain → **Nameservers**
- Switch from "Default / Registrar nameservers" to **Custom**
- Paste the 4 Netlify nameservers, save
- Done. DNS, SSL, and `www` redirect all handled automatically.

**If you prefer to keep DNS at your registrar:**
At your registrar's DNS panel, add these records:

| Type  | Host / Name | Value                          | TTL  |
| ----- | ----------- | ------------------------------ | ---- |
| A     | `@`         | `75.2.60.5`                    | 3600 |
| CNAME | `www`       | `<your-site>.netlify.app`      | 3600 |

(Replace `<your-site>` with the actual subdomain Netlify assigned, e.g.
`rohith-portfolio.netlify.app`.)

### 3. HTTPS — automatic
- Netlify automatically provisions a free **Let's Encrypt** certificate within
  a few minutes of DNS propagating
- Go to **Domain management → HTTPS** and confirm "Your site has HTTPS enabled"
- Tick **Force HTTPS** so all `http://` requests redirect to `https://`

### 4. Verify
- Open `https://rohithdhanala.com` in a fresh tab — should load over HTTPS
- Open `https://www.rohithdhanala.com` — should also load
- You're done.

DNS changes can take from 5 minutes to 24 hours to propagate worldwide,
though most registrars now propagate in under 30 minutes.

---

## Option B — Custom domain on GitHub Pages

### 1. Add the domain in GitHub
- Open the repo → **Settings → Pages → Custom domain**
- Enter `rohithdhanala.com` and click **Save**
- GitHub commits a `CNAME` file to the repo root automatically

### 2. Update DNS at your registrar
Add these records at your registrar:

| Type  | Host / Name | Value                                       | TTL  |
| ----- | ----------- | ------------------------------------------- | ---- |
| A     | `@`         | `185.199.108.153`                           | 3600 |
| A     | `@`         | `185.199.109.153`                           | 3600 |
| A     | `@`         | `185.199.110.153`                           | 3600 |
| A     | `@`         | `185.199.111.153`                           | 3600 |
| CNAME | `www`       | `rodhanala-creator.github.io`               | 3600 |

These are GitHub's official Pages IPs. The four A records give the apex
(`rohithdhanala.com`) high availability.

### 3. HTTPS — automatic
- After DNS propagates (~10–60 min), return to **Settings → Pages**
- Tick the **Enforce HTTPS** checkbox once it becomes available
- GitHub provisions a free certificate via Let's Encrypt automatically

### 4. Verify
- `https://rohithdhanala.com` — should load over HTTPS
- `https://www.rohithdhanala.com` — should redirect to apex

---

## Domain registrar shopping list

If you don't own a domain yet, decent options:

- **Cloudflare Registrar** — at-cost pricing, free WHOIS privacy. Best long-term value.
- **Namecheap** — cheap first year, simple UI.
- **Porkbun** — cheap, free WHOIS privacy, clean UI.

For a personal brand, prefer:
- `rohithdhanala.com` (best — first.last)
- `rohithdhanala.co.uk` (UK-local credibility)
- `rohithdhanala.io` or `rohith.dev` (tech-forward)

Avoid `.xyz`, `.online`, `.site` — they read as spammy to small-business clients.

---

## Troubleshooting

**"DNS_PROBE_FINISHED_NXDOMAIN"** — DNS hasn't propagated yet. Wait 30 min, then
flush your DNS: `sudo dscacheutil -flushcache` on Mac, `ipconfig /flushdns` on Windows.

**HTTPS warning / "not secure"** — the certificate is still being issued. Give it
up to 24 hours. If it doesn't resolve, remove and re-add the domain.

**Site loads at apex but not `www`** (or vice versa) — you're missing one of
the records above. Add the missing record and wait again.

**Want to switch the primary host later?** Change the DNS records to point at
the new host. The other host's URL still works (e.g. `*.netlify.app` and
`*.github.io` always work as backup URLs).
