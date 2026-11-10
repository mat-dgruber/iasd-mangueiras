const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const outDir = path.resolve(__dirname, '../frontend/public/icons');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const svgIcon = (size, isMaskable) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${size}px;
            height: ${size}px;
            background: #0a3b66;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: ${isMaskable ? '18%' : '10%'};
          }
          svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
          }
        </style>
      </head>
      <body>
        <div class="container">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Bíblia aberta na base -->
            <path d="M100 150 C75 140 45 142 25 155 L25 110 C45 98 75 96 100 108 C125 96 155 98 175 110 L175 155 C155 142 125 140 100 150 Z" fill="#ffffff" fill-opacity="0.95" />
            <path d="M100 110 L100 150" stroke="#0a3b66" stroke-width="3" stroke-linecap="round" />
            <!-- Chama central (Espírito Santo / Dourado) -->
            <path d="M100 25 C100 25 115 55 105 75 C120 60 135 80 130 105 C125 90 115 88 110 98 C115 75 95 65 100 25 Z" fill="#c59b27" />
            <path d="M100 45 C100 45 85 68 95 88 C82 74 70 92 75 112 C80 98 90 96 93 104 C88 84 105 76 100 45 Z" fill="#f59e0b" />
            <!-- Cruz central estilizada no meio da chama -->
            <path d="M100 40 L100 112 M88 65 L112 65" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
          </svg>
        </div>
      </body>
    </html>
  `;

  const sizes = [
    { name: 'icon-192.png', size: 192, maskable: false },
    { name: 'icon-512.png', size: 512, maskable: false },
    { name: 'icon-maskable-192.png', size: 192, maskable: true },
    { name: 'icon-maskable-512.png', size: 512, maskable: true },
  ];

  for (const { name, size, maskable } of sizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(svgIcon(size, maskable));
    const targetPath = path.join(outDir, name);
    await page.screenshot({ path: targetPath, type: 'png', omitBackground: false });
    console.log(`Generated: ${name} (${size}x${size})`);
  }

  await browser.close();
}

generateIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
