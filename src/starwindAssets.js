import mint from "./assets/academy-art/starwind/mint.glb?url";
import night from "./assets/academy-art/starwind/night.glb?url";
import beret from "./assets/academy-art/starwind/beret.glb?url";
import ribbon from "./assets/academy-art/starwind/ribbon.glb?url";
import journal from "./assets/academy-art/starwind/journal.glb?url";
import satchel from "./assets/academy-art/starwind/satchel.glb?url";
import mintPoster from "./assets/academy-art/starwind/mint.webp";
import nightPoster from "./assets/academy-art/starwind/night.webp";
import mintFace from "./assets/academy-art/starwind/mint-face.webp";
import nightFace from "./assets/academy-art/starwind/night-face.webp";
import beretPoster from "./assets/academy-art/starwind/beret.webp";
import ribbonPoster from "./assets/academy-art/starwind/ribbon.webp";
import journalPoster from "./assets/academy-art/starwind/journal.webp";
import satchelPoster from "./assets/academy-art/starwind/satchel.webp";

export const STARWIND_OUTFITS = {
  top_mint: { url: mint, poster: mintPoster, portrait: mintFace },
  top_starlight: { url: night, poster: nightPoster, portrait: nightFace },
};
export const STARWIND_ACCESSORIES = {
  hat_beret: {
    url: beret,
    width: 0.3,
    scaleY: 0.65,
    position: [0, 0.185, 0.015],
    rotation: [0, 0, -0.1],
  },
  hat_ribbon: {
    url: ribbon,
    width: 0.16,
    position: [-0.09, 0.105, -0.045],
    rotation: [0, -0.6, 0.2],
  },
  prop_book: { url: journal, width: 0.13, position: [0.17, -0.055, 0.04] },
  prop_satchel: {
    url: satchel,
    width: 0.18,
    anchor: "hand",
    position: [0.035, -0.085, 0.015],
    rotation: [0, 0.15, 0],
  },
};
export const STARWIND_THUMBNAILS = {
  top_mint: mintPoster,
  top_starlight: nightPoster,
  hat_beret: beretPoster,
  hat_ribbon: ribbonPoster,
  prop_book: journalPoster,
  prop_satchel: satchelPoster,
};
