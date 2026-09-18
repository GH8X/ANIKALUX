AL-ANIQA LUX — OFFICIAL LOGO
============================

Put the official logo file in THIS folder with one of these exact names:

  /brand/logo.png      (preferred — use a transparent PNG if you have one)
  /brand/logo.svg      (best quality when available)
  /brand/logo.webp
  /brand/logo.jpg
  /brand/logo.jpeg

Use the highest-resolution original you have. The site picks the first file
that exists and renders it with `object-contain`, so the logo's proportions,
colours and artwork are never modified, stretched, cropped or recoloured.
Nothing is drawn in its place when the file is missing.

WHERE IT APPEARS

  header (desktop + laptop)      src/components/layout/Header.tsx
  mobile header + menu           src/components/layout/Header.tsx
  footer                         src/components/layout/Footer.tsx
  homepage hero, About, sign-in  src/pages/*
  browser tab / favicon          src/components/brand/LogoFavicon.tsx

Every placement reads the same source, so replacing the file updates all of
them at once — there is no second copy to keep in step.

THIS FILE vs. THE ADMIN UPLOAD — read this before choosing

  • A file in this folder is part of the build. It ships to every visitor and
    is the correct way to publish the logo for production.

  • "Admin → Brand → Official logo → Upload logo" stores the image in the CMS,
    which currently persists to localStorage. That is per-browser: the logo
    would show for whoever uploaded it, but NOT for visitors on other devices.

  So: use the upload to preview and try a logo, then commit the file here (or
  move the store to a database) to publish it for everyone.
