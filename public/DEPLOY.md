# MerakAi Website Package — June 18, 2026

Four updates ready to deploy. All edits done in your browser via GitHub.com — no local files needed.

## What's in this package

| File | Purpose | Item # |
|------|---------|--------|
| `privacy.html` | New Privacy Policy page | #3 |
| `og-image.png` (and `og-image.svg`) | Social-share preview image | #7 |
| `success-message-fix.md` | CSS bug fix for form-state issue | #6 |
| `footer-snippet.html` | Privacy link to add to existing footer | #3 |

---

## Deployment steps — all via GitHub web editor

### Step 1 — Upload `privacy.html` to `public/`

1. Go to `https://github.com/bienyam/merakai-site/tree/main/public`
2. Click **Add file → Upload files**
3. Drag `privacy.html` from this package into the upload area
4. Scroll down to the commit message — type: `Add Privacy Policy page`
5. Click **Commit changes**

### Step 2 — Upload `og-image.png` to `public/`

1. Same folder: `https://github.com/bienyam/merakai-site/tree/main/public`
2. Click **Add file → Upload files**
3. Drag `og-image.png` (the file, not the svg)
4. Commit message: `Add OG image for social sharing`
5. Click **Commit changes**

### Step 3 — Add the Privacy link to your footer

Your existing `index.html` has a footer section. You need to add ONE link.

1. Go to `https://github.com/bienyam/merakai-site/blob/main/public/index.html`
2. Click the pencil icon (Edit)
3. Use Ctrl+F to find: `support@merakidiscovery.com`
4. Look at the line(s) near it — you should see a footer block with email and maybe copyright
5. After the email link line, paste this:
   ```html
   <a href="/privacy.html" class="footer-link">Privacy</a>
   ```
6. Commit message: `Add Privacy link to footer`
7. Click **Commit changes**

**If you can't find the right spot, send me the exact lines around `support@merakidiscovery.com` and I'll give you the exact paste.**

### Step 4 — Fix the form-state CSS bug

1. Go to your CSS file — likely `https://github.com/bienyam/merakai-site/blob/main/public/styles.css`
2. Click the pencil icon (Edit)
3. Use Ctrl+F to find: `.waitlist-success`
4. After the existing `.waitlist-success { ... }` block ends, add:
   ```css
   .waitlist-success[hidden] {
     display: none;
   }
   ```
5. Commit message: `Fix form-state bug: hide success message until submit`
6. Click **Commit changes**

(Full explanation in `success-message-fix.md` if you want context.)

---

## Verification — after all 4 commits

Wait ~60 seconds for Vercel to deploy, then hard-refresh `merakidiscovery.com` (Ctrl+Shift+R):

1. **Privacy Policy:** Footer should show a "Privacy" link. Click it → loads `/privacy.html` with the new branded page.
2. **OG image:** Open `https://www.opengraph.xyz/url/https%3A%2F%2Fmerakidiscovery.com` — should show the branded preview ("BUILT TO WIN.", "The first eDiscovery platform that reads the case.", etc.)
3. **Form-state bug:** Scroll to "Get in touch" — the "Thanks. We'll be in touch." message should NOT be visible. Only the email input form.

---

## What's NOT in this package (and why)

- **Item 2 — `merakai.com` domain:** You don't own it yet. When you register, we'll do the switchover.
- **Item 4 — Formspree:** Requires you to create a Formspree account. Quick to do; once you have the endpoint, drop it into the form's `action="..."` attribute. Happy to walk through it next session.
- **Item 5 — ZDR with Anthropic:** Separate workstream. Want me to draft the email to Anthropic for this next?
- **Item 8 — Vercel Analytics:** Single click in your Vercel dashboard. Project → Analytics → Enable.
- **Item 9 — Redirect direction:** Vercel project → Settings → Domains → Edit primary. Low priority.

---

## Quick sanity check before you deploy

Open `privacy.html` in any browser by double-clicking it. The styling won't be exactly right (it references `/styles.css` which isn't there in the local file), but you can read through the policy text to make sure you're comfortable with what we're publishing. **The policy is a public legal commitment — read it before it ships.**

A few specific things worth confirming:
- Section 1: Your address is correct (13018 Legacy Creek Parkway, Blaine, MN 55449)
- Section 5: List of infrastructure providers (AWS, Supabase, Vercel, Anthropic) — accurate?
- Section 7: Data retention language — generic but workable. If you have specific contractual retention periods, this could be tightened
- Section 8: 30-day response window for data rights requests — comfortable with that?

If anything is off, tell me and I'll revise before you upload.
