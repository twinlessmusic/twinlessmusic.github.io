# TWINLΞSS – official website

Live: https://durdumuazzez.github.io/twinless/

Static site hosted for free on GitHub Pages.

```
index.html              page content
css/style.css           design (colors, fonts, layout)
js/gigs.js              ← the gigs list (edit this to add/remove gigs)
js/main.js              small helpers (header, YouTube player)
images/                 logo files, photos, icons, Open Graph image
favicon.svg             Ξ browser icon
TWINLESS_EPK_final.pdf  EPK download
```

## Update the gigs

1. Open `js/gigs.js` (on github.com: click the file, then the pencil ✏️ icon).
2. Each gig is one line in the `GIGS` list:

   ```js
   { date: "2026-12-04", venue: "unter freunden", event: "Anniversary Night", city: "Cologne", link: "" },
   ```

   - **Add** a gig: copy a line, paste it below, change the values.
   - **Remove** a gig: delete its line.
   - `date` is always `YYYY-MM-DD`. `link` is a ticket/event URL, or `""` if none.
3. Click **Commit changes**. The site updates in about a minute.

Past gigs disappear automatically and the list is sorted by date. If no gigs are left, the site shows "New dates coming soon".

## Replace the EPK

Upload a new file with the exact same name `TWINLESS_EPK_final.pdf` (Add file → Upload files) and commit.
