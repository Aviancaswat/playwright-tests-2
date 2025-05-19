import { test, expect, webkit } from '@playwright/test';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

// Aplica el plugin stealth para minimizar detección
chromium.use(stealth());

type Lang = 'es' | 'en' | 'pt' | 'fr';

type copysType = {
    idioma: Lang,
    pais: string,
    fecha_salida: string,
    fecha_llegada: string,
    ciudad_origen: string,
    ciudad_destino: string,
    es: { origen: string; destino: string; buscar: string; vuelta: string; pagar: string },
    en: { origen: string; destino: string; buscar: string; vuelta: string; pagar: string },
    pt: { origen: string; destino: string; buscar: string; vuelta: string; pagar: string },
    fr: { origen: string; destino: string; buscar: string; vuelta: string; pagar: string },
    getLang: () => Lang
}

const copys: copysType = {
    idioma: 'es',
    pais: 'CO',
    fecha_salida: 'may 24',
    fecha_llegada: 'may 28',
    ciudad_origen: 'CLO',
    ciudad_destino: 'BOG',
    es:    { origen: 'Origen',   destino: 'Hacia',     buscar: 'Buscar',     vuelta: 'Vuelta',     pagar: 'Ir a pagar' },
    en:    { origen: 'Origin',   destino: 'Destination', buscar: 'Search',    vuelta: 'Return',    pagar: 'Go to payment' },
    pt:    { origen: 'Origem',   destino: 'Destino',     buscar: 'Buscar voos',vuelta: 'Regresso',  pagar: 'Vá pagar' },
    fr:    { origen: 'Origen',   destino: 'Destination', buscar: 'Rechercher', vuelta: 'Retour',    pagar: 'Continuer' },
    getLang: () => copys.idioma
};

test.describe('Comenzó prueba avianca (undetectable)', () => {

    test('prueba home avianca', async ({ }, testInfo) => {
        test.setTimeout(300_000);
        let step = 0;

        // Genera timestamp para los screenshots
        const getTimestamp = () => {
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `fecha-${pad(now.getDate())}-${pad(now.getMonth()+1)}-${now.getFullYear()}_hora-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        };

        // Toma screenshot y lo adjunta al reporte
        const takeScreenshot = async (label: string) => {
            step++;
            const timestamp = getTimestamp();
            const name = `step${step}-${label}-${timestamp}.png`;
            const buffer = await page.screenshot({ path: name });
            await testInfo.attach(`${label} (${timestamp})`, { body: buffer, contentType: 'image/png' });
        };

        // Helpers para simular comportamiento humano
        const getRandomDelay = () => Math.random() * (200 - 50) + 50;
        const humanClick = async (sel: string) => {
            const btn = page.locator(sel);
            const box = await btn.boundingBox();
            if (box) {
                const x = box.x + Math.random() * box.width;
                const y = box.y + Math.random() * box.height;
                await page.mouse.move(x, y, { steps: 5 });
            }
            await page.waitForTimeout(getRandomDelay());
            await page.click(sel);
        };
        const humanType = (sel: string, text: string) => page.type(sel, text, { delay: getRandomDelay() });

        const idioma = copys.getLang();

        // Lanzamiento del navegador con flags de stealth y hardware
        const browser = await chromium.launch({
            headless: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--enable-webgl',
                '--use-gl=swiftshader',
                '--enable-accelerated-2d-canvas'
            ]
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                       'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                       'Chrome/91.0.4472.124 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            deviceScaleFactor: 1,
            locale: 'es-CO',
            timezoneId: 'America/Bogota'
        });
        const page = await context.newPage();

        // Oculta navigator.webdriver
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        // Flujo de prueba con interacciones humanas
        await page.goto(`https://www.avianca.com/${idioma}/`);
        await takeScreenshot('01-goto-avianca');

        // Consentimiento
        const consentBtn = page.locator('#onetrust-pc-btn-handler');
        if (await consentBtn.isVisible()) {
            await humanClick('#onetrust-pc-btn-handler');
            await humanClick('.save-preference-btn-handler.onetrust-close-btn-handler');
        }

        // Origen
        await expect(page.locator('.content-wrap')).toBeVisible();
        await humanClick('button#originBtn');
        await humanType(`input[placeholder="${copys[idioma].origen}"]`, copys.ciudad_origen);
        await page.keyboard.press('Enter');
        await humanClick(`#${copys.ciudad_origen}`);
        await takeScreenshot('03-ciudad-origen');

        // Destino
        await humanClick(`input[placeholder="${copys[idioma].destino}"]`);
        await humanType(`input[placeholder="${copys[idioma].destino}"]`, copys.ciudad_destino);
        await page.keyboard.press('Enter');
        await humanClick(`#${copys.ciudad_destino}`);
        await takeScreenshot('04-ciudad-destino');

        // Fechas
        await humanClick('#departureInputDatePickerId');
        await humanClick(`span:has-text("${copys.fecha_salida}")`);
        await takeScreenshot('05-fecha-ida');
        await humanClick(`span:has-text("${copys.fecha_llegada}")`);
        await takeScreenshot('06-fecha-vuelta');

        // Pasajeros
        for (let i = 1; i <= 3; i++) {
            await humanClick(`button[name=""] >> nth=${i}`);
        }
        await humanClick('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button');
        await takeScreenshot('07-seleccion-pasajeros');

        // Buscar
        await expect(page.getByRole('button', { name: copys[idioma].buscar, exact: true })).toBeVisible();
        await humanClick(`button:has-text("${copys[idioma].buscar}")`);
        await takeScreenshot('08-buscar');

        // Selección de vuelo ida
        await page.waitForSelector('#pageWrap');
        await expect(page.locator('.journey_price_fare-select_label-text').first()).toBeVisible();
        await humanClick('.journey_price_fare-select_label-text:first-child');
        await page.waitForSelector('.journey_fares');
        await humanClick('.journey_fares .light-basic.cro-new-basic-button:first-child');
        await takeScreenshot('09-seleccion-vuelo-ida');

        // Upsell modal ida
        await page.waitForTimeout(1500);
        if (await page.locator('#FB310').first().isVisible()) {
            await expect(page.locator('.cro-button.cro-no-accept-upsell-button')).toBeVisible();
            await humanClick('.cro-button.cro-no-accept-upsell-button:first-child');
        }

        // Selección vuelo regreso
        await page.waitForSelector('#journeysContainerId_1', { timeout: 15000 });
        await expect(page.locator('#journeysContainerId_1')).toBeVisible();
        await humanClick('#journeysContainerId_1 .journey_price_fare-select_label-text:first-child');
        await takeScreenshot('13-seleccion-vuelo-regreso');
        await humanClick('#journeysContainerId_1 .journey_fares .light-basic.cro-new-basic-button:first-child');
        await page.waitForTimeout(1500);

        // Upsell modal regreso
        if (await page.locator('#FB310').first().isVisible()) {
            await expect(page.locator('.cro-button.cro-no-accept-upsell-button')).toBeVisible();
            await humanClick('.cro-button.cro-no-accept-upsell-button:first-child');
        }
        await takeScreenshot('13-resumen-de-vuelos-seleccionados');

        await browser.close();
    });
});
