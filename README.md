# MerakAi marketing site

Single-page placeholder site at MerakiDiscovery.com, branded as MerakAi.

Plain HTML/CSS/JS. No framework. Hosted on Vercel.

---

## What's in here

```
merakai-site/
├── public/
│   ├── index.html       ← The site
│   ├── styles.css       ← All styles
│   ├── script.js        ← Logo injection + form handling
│   ├── favicon.svg      ← Site icon
│   └── 404.html         ← Branded 404 page
├── vercel.json          ← Vercel config (security headers)
├── .gitignore
└── README.md            ← This file
```

That's it. Five files in `public/` — that's the entire site.

---

## Deploy in 6 steps (~30 minutes total)

### Step 1 — Set up Formspree (5 min)

The waitlist form needs a backend to receive emails. Formspree is free up to 50/month.

1. Go to [formspree.io](https://formspree.io) and sign up
2. Create a new form, name it "MerakAi waitlist"
3. Set destination email to `support@merakidiscovery.com`
4. Copy the form's endpoint URL — looks like `https://formspree.io/f/abcdwxyz`
5. Open `public/index.html` in a text editor
6. Find this line:
   ```html
   <form id="waitlistForm" class="waitlist-form" action="https://formspree.io/f/FORMSPREE_ENDPOINT_HERE" method="POST">
   ```
7. Replace `FORMSPREE_ENDPOINT_HERE` with your endpoint ID (just the part after `/f/`)
8. Save

**If you skip this step:** the form will fall back to opening the user's email client. Less polished, but works. Definitely set up Formspree before going live.

### Step 2 — Push to GitHub (5 min)

```bash
# In your terminal, from the merakai-site folder:
git init
git add .
git commit -m "Initial commit: MerakAi marketing site v1"
git branch -M main

# Create a new repo on github.com (private is fine)
# Copy the remote URL it gives you, then:
git remote add origin https://github.com/YOUR_USERNAME/merakai-site.git
git push -u origin main
```

### Step 3 — Connect to Vercel (3 min)

1. Go to [vercel.com/new](https://vercel.com/new) (sign in with GitHub)
2. Click "Import" next to the `merakai-site` repo
3. Framework Preset: **Other** (it will auto-detect static)
4. Root Directory: leave as default (`./`)
5. Build Command: leave empty
6. Output Directory: `public`
7. Click **Deploy**

Within 30 seconds, you'll have a temporary URL like `merakai-site-abc123.vercel.app`. Open it. Verify everything works.

### Step 4 — Add custom domain (5 min)

1. In your Vercel project dashboard → Settings → Domains
2. Click "Add"
3. Type `merakidiscovery.com` and click Add
4. Vercel will also offer to add `www.merakidiscovery.com` — accept that too
5. Vercel will show you DNS records to add

### Step 5 — Update DNS at your registrar (5 min, then wait)

Where you bought the domain (Cloudflare, Namecheap, GoDaddy, etc.), find the DNS settings.

**Add these two records exactly as Vercel shows them:**

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Some notes:
- The `@` in the Name field means "the root domain" (merakidiscovery.com itself). On some registrars, leave Name blank or put the full domain.
- Delete or replace any existing A or CNAME records that conflict.
- Don't touch your MX records (those are for your M365 email — leave them alone).

**Save and wait.** DNS propagation typically takes 5–30 minutes, occasionally up to 24 hours. You can check status at [whatsmydns.net](https://www.whatsmydns.net) — paste in `merakidiscovery.com` and select A.

When it's propagated:
- Vercel auto-issues an SSL certificate (HTTPS works automatically)
- The site is live at `https://merakidiscovery.com`

### Step 6 — Verify the live site (5 min)

Open `https://merakidiscovery.com` and check:
- ✅ Hero loads with the logo animating once
- ✅ Refresh — logo no longer animates (session persisted)
- ✅ Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) — should still NOT animate (sessionStorage holds for the tab)
- ✅ Open in a new tab or incognito — animates again (new session)
- ✅ Submit the waitlist form with a test email
- ✅ Check `support@merakidiscovery.com` for the test submission
- ✅ Test on mobile (open the URL on your phone)
- ✅ Test the 404: visit `merakidiscovery.com/anything-not-real` — should show branded 404

---

## Updates after launch

Any change is just:

```bash
# Edit the file you want to change
git add .
git commit -m "Describe what changed"
git push
```

Vercel auto-deploys on push. Live in ~30 seconds.

---

## What's NOT in here yet (future work)

When you're ready to grow this from placeholder → real marketing platform:

- Convert to Next.js (real routing, SEO improvements, content management)
- Separate Platform / Security / Pricing pages (currently anchor links)
- Real signup flow tied to the MerakAi app
- Privacy Policy + Terms of Service (legally required before paid acquisition)
- Cookie consent banner (EU/US compliance)
- Analytics (Plausible, PostHog, or Vercel Analytics)
- Open Graph image (the `og-image.png` referenced in meta tags — design later)
- Apple touch icon (180×180 PNG of the mark)
- Blog / case studies / customer logos (when there's real content)

---

## Tech notes

- **No build step.** This is plain static HTML — open `public/index.html` in any browser to preview locally.
- **The logo SVG is generated in JavaScript** rather than embedded as a file. This means the animation works (SVG `<img>` tags disable scripts).
- **Animation plays once per browser session.** Stored in `sessionStorage` under key `merakai:brand-animation-played`. Closes/clears when the tab closes.
- **Respects `prefers-reduced-motion`.** Users with that accessibility setting see static logo, no animation.
- **Mobile responsive** down to 360px wide.
- **No external JS dependencies.** Everything is in `script.js`.
- **Fonts loaded from Google Fonts.** Falls back to Georgia (display) and system sans (body) if Google Fonts is blocked.

---

*Built to win. Read the case.*
