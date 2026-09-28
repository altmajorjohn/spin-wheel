# Spin Wheel Template

A 1080×1920 spin wheel that exports as a video. You can change the colors, text, spin speed and background.

**Live:** https://altmajorjohn.github.io/spin-wheel/

## Using it
1. Pick a template, then edit it on the left. **Slices** holds the names and their chances, **Colors** and **Background** change the look, **Text** covers the badge, result text and font, and **Spin & video** sets the speed and the winner.
2. Click the wheel or press **Spin** to preview it.
3. Press **Download video** to record one spin as a vertical 1080×1920 video: MP4 in Chrome, Edge and Safari, WebM in Firefox. Keep the tab open while it records.

Your changes save automatically in your own browser. To give someone your wheel, use **Share link**, or **Save** a settings file that they can **Open**. Uploaded photos only travel inside a saved file, not a link.

## Offline renderer (optional, frame-perfect)
    npm install
    node render.mjs example-config.json --out wheel.mp4 [--winner "Pizza"] [--preset "Type of God"]
Needs Node and ffmpeg.
