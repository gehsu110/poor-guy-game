import courtyard from './assets/academy-art/storybook-v2/courtyard.webp'
import apprentice from './assets/academy-art/storybook-v2/apprentice.webp'
import idle from './assets/academy-art/storybook-v2/apprentice-idle.webp'
import greet from './assets/academy-art/storybook-v2/apprentice-greet.webp'
import owl from './assets/academy-art/storybook-v2/owl.webp'
import monsters from './assets/academy-art/storybook-v2/monsters.webp'
import star from './assets/academy-art/storybook-v2/star-uniform.webp'
import starIdle from './assets/academy-art/storybook-v2/star-uniform-idle.webp'
import starGreet from './assets/academy-art/storybook-v2/star-uniform-greet.webp'
export const STORYBOOK_ART = { courtyard, apprentice, idle, greet, owl, monsters }
export const STORYBOOK_OUTFIT_ART = { mint: { still: apprentice, idle, greet }, star: { still: star, idle: starIdle, greet: starGreet } }
export const getStorybookArt = profile => STORYBOOK_OUTFIT_ART[profile?.equipped?.storybookOutfit] ?? STORYBOOK_OUTFIT_ART.mint
