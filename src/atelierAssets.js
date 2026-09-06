import mintMotion from "./assets/academy-art/wind-atelier/mint-idle.webm";
import nightMotion from "./assets/academy-art/wind-atelier/night-idle.webm";
import owl from "./assets/academy-art/wind-atelier/owl.webp";
import cat from "./assets/academy-art/wind-atelier/cat.webp";
import mint from "./assets/academy-art/wind-atelier/mint.webp";
import night from "./assets/academy-art/wind-atelier/night.webp";
import beret from "./assets/academy-art/wind-atelier/beret.webp";
import ribbon from "./assets/academy-art/wind-atelier/ribbon.webp";
import book from "./assets/academy-art/wind-atelier/book.webp";
import satchel from "./assets/academy-art/wind-atelier/satchel.webp";
export { default as ATELIER_SCENE } from "./assets/academy-art/wind-atelier/terrace.webp";
export const ATELIER_OUTFITS = {
  top_mint: { poster: mint, motion: mintMotion },
  top_starlight: { poster: night, motion: nightMotion },
};
export const ATELIER_ITEMS = {
  top_mint: mint,
  top_starlight: night,
  hat_beret: beret,
  hat_ribbon: ribbon,
  prop_book: book,
  prop_satchel: satchel,
};
// All body variants share the original 1696 × 2528 image coordinates.
// Props have their own images; an outfit change never replaces these slots.
export const ATELIER_ATTACHMENTS = {
  hat_beret: {
    src: beret,
    left: "39.2%",
    top: "1.8%",
    width: "25.8%",
    rotate: "-10deg",
  },
  hat_ribbon: {
    src: ribbon,
    left: "36.9%",
    top: "10.8%",
    width: "8.5%",
    rotate: "18deg",
  },
  prop_book: {
    src: book,
    left: "52.6%",
    top: "39.8%",
    width: "15.7%",
    rotate: "-12deg",
  },
  prop_satchel: {
    src: satchel,
    left: "52.5%",
    top: "39.4%",
    width: "17%",
    rotate: "0deg",
  },
};

export { default as ATELIER_SCENE_MOTION } from "./assets/academy-art/wind-atelier/terrace-living.mp4";

export const ATELIER_FRIENDS = { owl, cat };
