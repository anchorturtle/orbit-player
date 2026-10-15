# Fonts and third-party licenses (v3)

All fonts are self-hosted in `fonts/` as woff2 latin subsets, taken from the Fontsource npm packages (v5.3.0). The full license text for each font is in `fonts/LICENSE-*.txt`.

| Font | Used for | License |
|---|---|---|
| Fraunces (variable, roman and italic; Undercase Type) | Hero, history-era display serif, quantum italic, finale closing line | SIL OFL 1.1 |
| Inter (variable; Rasmus Andersson) | Body text | SIL OFL 1.1 |
| Space Grotesk (variable; Florian Karsten) | PC and network era headings, glossary terms | SIL OFL 1.1 |
| Bricolage Grotesque (variable; Mathieu Triay) | AI-era headings, finale title, dive scale numbers | SIL OFL 1.1 |
| IBM Plex Mono (IBM) | Theory, codebreaker and transistor headings; dates, labels, UI | SIL OFL 1.1 |
| VT323 (Peter Hull) | Terminal faces for the ENIAC and software eras | SIL OFL 1.1 |

The OFL allows free use, embedding and redistribution with a website. The fonts must not be sold on their own.

## Paper Shaders (Apache-2.0)
The ordered Bayer dithering and grain approach, and the "warp" ribbon loop in the background shader (`app.js`), are adapted from Paper Shaders (`@paper-design/shaders` v0.0.81, https://github.com/paper-design/shaders). They were ported to WebGL1 GLSL, so file:// works with no modules. The Apache-2.0 license and Paper's NOTICE are in `vendor/paper-shaders/`. Powered by Paper Shaders: https://shaders.paper.design
