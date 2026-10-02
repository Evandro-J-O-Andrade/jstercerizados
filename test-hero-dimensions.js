const { chromium } = require('playwright');

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-414', width: 414, height: 896 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1280', width: 1280, height: 720 },
  { name: 'laptop-1366', width: 1366, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1536', width: 1536, height: 864 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Use the dev server URL - assuming vite dev server on 5173
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500); // wait for layout
    
    // Get Hero image dimensions
    const heroImg = page.locator('section:has-text("Transformamos") + section img, section.relative img').first();
    // Try more specific selector
    const img = page.locator('section:has(h1:has-text("Transformamos")) + section img, section:has-text("Transformamos") ~ section img').first();
    
    // Actually let's find the HeroSplit component image
    const heroImgEl = page.locator('section[id="hero"] img, section:has(h1:has-text("Transformamos")) + div img').first();
    
    // Fallback: find any img in hero area
    const images = await page.locator('img').all();
    let heroImage = null;
    for (const im of images) {
      const box = await im.boundingBox();
      if (box && box.y < 800 && box.width > 50) { // likely hero image
        heroImage = im;
        break;
      }
    }
    
    if (heroImage) {
      const box = await heroImage.boundingBox();
      const gridCol = await page.locator('section:has(h1:has-text("Transformamos")) + div').first().boundingBox();
      console.log(`${vp.name} (${vp.width}x${vp.height}): Hero img=${box?.width.toFixed(0)}x${box?.height.toFixed(0)} | Grid col=${gridCol?.width.toFixed(0)}x${gridCol?.height.toFixed(0)}`);
    } else {
      console.log(`${vp.name}: No hero image found`);
    }
  }
  
  await browser.close();
}

run().catch(console.error);