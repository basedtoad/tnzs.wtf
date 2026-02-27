# tnzs.wtf — Portfolio

Static portfolio site. No build step required — push to `main` and GitHub Pages deploys automatically.

## Structure

```
/
├── index.html          # Grid / home page
├── project.html        # Single project template (JS renders from ?p=slug)
├── CNAME               # Custom domain: tnzs.wtf
├── data/
│   ├── config.json     # Site config, colors, categories
│   └── projects.json   # All project data
└── assets/
    ├── css/
    │   ├── main.css    # Global styles, header, footer
    │   ├── grid.css    # Masonry grid, filter bar
    │   └── project.css # Project page layout
    ├── js/
    │   ├── main.js     # Page transitions
    │   ├── grid.js     # Grid rendering + filtering
    │   └── project.js  # Project page rendering
    ├── images/
    │   └── projects/
    │       └── {project-slug}/   # Images per project
    └── fonts/          # Optional custom fonts
```

## Adding a Project

1. Add a project object to `data/projects.json` (copy the example structure)
2. Set `status: "published"` when ready to show
3. Upload images to `/assets/images/projects/{your-slug}/`
4. Follow naming conventions:
   - `{slug}-thumb.webp` — grid thumbnail
   - `{slug}-hero.webp`  — project page hero
   - `{slug}-01.webp`, `{slug}-02.webp`, … — gallery images

## Image Specs

| Use       | Size      | Format | Max size |
|-----------|-----------|--------|----------|
| Thumbnail small  | 400px wide | webp  | 150 KB  |
| Thumbnail medium | 600px wide | webp  | 250 KB  |
| Thumbnail large  | 900px wide | webp  | 400 KB  |
| Hero / gallery   | 2400px max | webp  | 400–500 KB |

Recommended quality: 80–85%.

## Aspect Ratios (grid_item.aspect_ratio)

| Value     | Ratio | Example     |
|-----------|-------|-------------|
| square    | 1:1   | 600×600     |
| portrait  | 3:4   | 600×800     |
| landscape | 4:3   | 800×600     |
| tall      | 9:16  | 600×1067    |
| wide      | 16:9  | 900×506     |

## Deployment

- Branch: `main`
- GitHub Pages custom domain: `tnzs.wtf`
- DNS: point your domain's A records to GitHub Pages IPs, add CNAME for `www`
