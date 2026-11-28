// Playwright laden: im Workflow per „npm i --no-save playwright“, lokal auch global (NODE_PATH=$(npm root -g)).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const { chromium } = require('playwright');

// Bildschirmgrößen (Querformat), die jede Ansicht bestehen muss
export const VIEWPORTS = [ // v1.3 (Alp 28.11.): gespielt wird nur auf iPhone Pro und iPad → nur diese Größen, Tests ~15 statt ~45 min
  { name: 'iphone-pro', width: 852, height: 393 },
  { name: 'ipad', width: 1180, height: 820 },
];
