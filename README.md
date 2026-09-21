# Cyber Insight

Cybersecurity articles by Poorna Sujampathi Rathnayaka.

Live site: https://ceylonroameryt-bit.github.io/the-digital-watch/

## Development and checks

Use Node.js 22 or later:

```sh
npm ci
npm test
npm run build
python -m http.server 8000 --directory dist
```

The tests exercise the actual page scripts against a DOM implementation: blocked/corrupt storage, stale content, article routing, filters, menu state, email draft encoding, clipboard fallback, personal reactions, triage checklist retention, and local links. They do not measure browser rendering, mobile layout, or the third-party translation service.

## Publishing

The single GitHub Pages workflow validates pull requests and publishes `dist/` after a passing change reaches `main`. The build includes only reader-facing files, including `.well-known/security.txt`, and excludes the local editor, development dependencies, tests, and source-control metadata.

For Netlify, the configured build command produces `dist/`. For a manual upload, run `npm run build` and upload the contents of `dist/`, not the repository root.

Public article metadata comes from the deployed `DEFAULT_POSTS` and `DEFAULT_SETTINGS` in `js/cms.js`; article bodies and the illustrated homepage cards are static HTML. Update both when publishing a new episode, add its route in `articleHref`, and add the new HTML file to `scripts/build-public.mjs`.

## Feedback and reactions

Feedback prepares an email to the address already published on the site. The reader reviews and sends it in their email app, or copies the draft into webmail. Preparing or copying does not send or publish anything. There is no hosted comment service or shared reaction database.

Likes and claps are personal, stored on the reader's device where available. Public audience counters are hidden. With storage blocked, reactions work for the current page session. Previously saved local comments are left intact in the browser but are no longer presented as delivered feedback.

## Local editor

`admin.html` is a legacy browser-only drafting tool and is excluded from deployments. Its client-side login is not server authentication. Saved drafts/settings affect only that editor; they do not change the published site. Deploy changes through Git. The CMS is scoped independently so the editor's helper functions cannot recursively call themselves.

## Translation

Translation depends on Google's external widget. If it is blocked or unavailable, the site offers the external translation link without reloading and losing a feedback draft. Rendering and translation quality still depend on the provider.
