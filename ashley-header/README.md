# Ashley Savvie header background

The My One of a Kind glitch-background canvas, scoped to the Squarespace Ashley Savvie page only (`/ashleysavvie`, collection `6aefb320e7defe1c4dfda59f`). It paints behind the nav tabs on `.header-announcement-bar-wrapper` and does not change header height, tab borders, the soft yellow glow, or the caution bar.

Add this one line to sitewide Code Injection (Header or Footer):

```html
<script src="https://therapytoaster.github.io/tt-live/ashley-header/header-bg.js" defer></script>
```

The script also applies the white-bar gap fix under the nav (`[data-section-id="6aefb3e0dd29691c2e41cf91"]`). It is a no-op on every other page and cleans up after itself on Squarespace soft navigation. Do not load this folder as a page.
