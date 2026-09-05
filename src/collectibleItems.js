import { PAPER_DOLL_ITEMS } from './paperDoll'
import { STORYBOOK_ITEMS } from './storybookCatalog'
export const collectibleItem = part => part?.[0] === 'storybook' ? STORYBOOK_ITEMS[part[1]] : PAPER_DOLL_ITEMS[part?.[0]]?.[part?.[1]]
