# Third-party notices

Installed versions are recorded exactly in `package-lock.json`. This document records imported software and fonts, not an assertion that every external design-reference website is open source.

## Runtime software

- React / React DOM — Meta Platforms, Inc. and affiliates, MIT. https://github.com/facebook/react
- Radix Primitives and their installed supporting packages — WorkOS / Radix contributors, MIT. https://github.com/radix-ui/primitives
- Motion / motion-dom / motion-utils — Motion contributors, MIT. https://github.com/motiondivision/motion

Package copyright and license texts are retained by npm in each installed package. These packages are bundled by Vite; their original MIT license notices are also copied into `public/licenses/runtime-MIT.txt` for distribution with the static site.

## Local fonts

The files are obtained through the installed @fontsource packages, with their unmodified license texts retained and copied to the distributable `public/licenses` directory:

- Fraunces — SIL Open Font License 1.1 (`Fraunces-OFL.txt`). Authors and reserved-name details are in that file.
- Source Sans 3 — SIL Open Font License 1.1 (`Source-Sans-3-OFL.txt`). Adobe copyright retained.
- Special Elite — Copyright (c) 2010 by Brian J. Bonislawsky DBA Astigmatic (AOETI). All rights reserved. Apache License 2.0 (`Special-Elite-Apache.txt`). The complete supplied license is retained.

No font modifications or external font requests. CSS uses Latin subsets with named local/system fallbacks.

## Development tools

Vite and its React plugin, Vitest, TypeScript, tsx, Prettier, jsdom, React Testing Library, jest-dom, user-event, Playwright and axe-core/Playwright integration are development dependencies. Their packages retain upstream licenses. They are not imported into the application bundle. Playwright and Chromium use their own upstream licenses.

## Original material

All game illustration SVGs, CSS surfaces, Web Audio sounds, recipient reactions, and implementation code were authored for this project. Institutional source candidates are linked for further reading; no institutional source prose or assets were copied into the game. Editorial verification remains outstanding.
