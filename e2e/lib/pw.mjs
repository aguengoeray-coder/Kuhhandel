// Playwright laden: im Workflow per „npm i --no-save playwright“, lokal auch global (NODE_PATH=$(npm root -g)).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const { chromium } = require('playwright');

// Bildschirmgrößen (Querformat), die jede Ansicht bestehen muss
export const VIEWPORTS = [
  { name: 'iphone-pro', width: 852, height: 393 },
  { name: 'iphone-se', width: 667, height: 375 },
  { name: 'iphone-max', width: 932, height: 430 },
  { name: 'android', width: 800, height: 360 },
];
