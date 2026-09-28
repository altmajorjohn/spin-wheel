# Spin Wheel Template

A 1080×1920 spin wheel that exports as a video. You can change the colors, text, spin speed and background.

**Live:** https://altmajorjohn.github.io/spin-wheel/

## Using it
- **E** opens settings. **Space** or a click on the wheel spins it. **R** resets it. **H** toggles clean mode.
- **⏺ Export video** (or **V**) records one spin and downloads it: MP4 in Chrome, Edge and Safari, WebM in Firefox. Keep the tab visible while it records.
- Settings are saved in your own browser. To give someone your setup, send a **Copy share link** URL or an **Export JSON** file. Setups with an uploaded background image are too long for a share link, so send those as JSON.

## Offline renderer (optional, frame-perfect)
    npm install
    node render.mjs example-config.json --out wheel.mp4 [--winner "Pizza"] [--preset "Rainbow palette"]
Needs Node and ffmpeg.
