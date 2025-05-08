// Pruebas en local
// import { defineConfig } from '@playwright/test';

// export default defineConfig({
//     use: {
//         headless: false,
//         viewport: { width: 1280, height: 800 },
//         viewport: { width: 1600, height: 1200 },
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
//         locale: 'es-ES',
//         ignoreHTTPSErrors: true,
//         screenshot: 'on',
//         video: 'off',
//         extraHTTPHeaders: {
//             'accept-language': 'es-ES,es;q=0.9',
//         },
//         launchOptions: {
//             args: ['--disable-http2']
//         }
//     },
//     projects: [
//         {
//             name: 'chrome',
//             use: {
//                 browserName: 'chromium',
//             },
//         },
//     ],
//     reporter: [['html', { outputFolder: 'reportHTML' }]],
//     timeout: 60000,
//     testDir: './tests',
//     outputDir: 'test-results',
// });

// Github Actions

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  reporter: 'html',
  outputDir: 'test-results',
  use: {
    headless: true,
    screenshot: 'on',
    video: 'on',
    ignoreHTTPSErrors: true,
    launchOptions: {
        args: ['--disable-http2']
    }
  },
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        viewport: { width: 1700, height: 1600 },
        locale: 'es-ES',
        extraHTTPHeaders: {
          'accept-language': 'es-ES,es;q=0.9',
        },
        video: 'on'
      },
    },
  ],
});