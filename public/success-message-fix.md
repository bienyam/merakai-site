# Form-state CSS bug fix

## The bug

On the live site, the success message (`Thanks. We'll be in touch.`) currently displays alongside the form **before** the user submits anything. It should only appear after a successful form submission.

**Root cause:** The CSS rule `.waitlist-success { display: flex; }` has higher specificity than the HTML `[hidden]` attribute. So even though the success message has `hidden` set in the HTML, the CSS overrides it and renders it visible.

## The fix

In `public/styles.css` (or wherever your CSS lives), add this single rule:

```css
.waitlist-success[hidden] {
  display: none;
}
```

That's it. This one line tells the browser: when the success message has the `hidden` attribute, override the `display: flex` rule and hide it. Once the form submits successfully, your JavaScript removes the `hidden` attribute and the original `display: flex` kicks back in to show the message.

## Where to add it

Best placement: right after the existing `.waitlist-success { ... }` rule in your stylesheet. Searching the file for `waitlist-success` will jump you to the spot.

If your stylesheet has the rule like this:

```css
.waitlist-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* ... other properties ... */
}
```

Make it look like this:

```css
.waitlist-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* ... other properties ... */
}

.waitlist-success[hidden] {
  display: none;
}
```

## How to verify the fix

1. Commit and push the CSS change
2. Wait ~60 seconds for Vercel to deploy
3. Hard-refresh `merakidiscovery.com` (Ctrl+Shift+R)
4. Scroll to the "Get in touch" CTA section
5. The success message should NOT be visible — only the email input form
6. Submit a test email
7. The success message ("Thanks. We'll be in touch.") should now appear

## Why this works (1-minute primer)

CSS specificity: `[hidden]` is an HTML attribute. By default, browsers apply `[hidden] { display: none; }` as a low-specificity user-agent rule. When your stylesheet says `.waitlist-success { display: flex; }`, the class selector has higher specificity than the attribute selector, so `display: flex` wins.

Adding `.waitlist-success[hidden]` combines BOTH selectors — class + attribute — which raises the specificity high enough to override the bare `.waitlist-success` rule. So when `hidden` is present, the element gets `display: none`. When `hidden` is removed (after form submit), the element gets `display: flex` again.
