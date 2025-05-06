import { test, expect, webkit, chromium } from '@playwright/test';

type copysType = {
    idioma: string,
    pais: string,
    fecha_salida: string,
    fecha_llegada: string,
    ciudad_origen: string,
    ciudad_destino: string,
    es: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
    },
    en: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
    },
    pt: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
    },
    fr: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
    },
    getLang: () => string
}

const copys: copysType = {
    idioma: 'es',
    pais: 'CO',
    fecha_salida: 'may 14',
    fecha_llegada: 'may 20',
    ciudad_origen: 'CLO',
    ciudad_destino: 'BOG',
    es: {
        origen: 'Origen',
        destino: 'Hacia',
        buscar: 'Buscar',
        vuelta: 'Vuelta',
    },
    en: {
        origen: 'Origin',
        destino: 'Destination',
        buscar: 'Search',
        vuelta: 'Return',
    },
    pt: {
        origen: 'Origem',
        destino: 'Destino',
        buscar: 'Buscar voos',
        vuelta: 'Regresso',
    },
    fr: {
        origen: 'Origen',
        destino: 'Destination',
        buscar: 'Rechercher',
        vuelta: 'Retour',
    },
    getLang: () => copys.idioma
};

test.describe('Comenzo prueba avianca', () => {

    test('prueba home avianca', async ({ page }, testInfo) => {
        test.setTimeout(100_000);
        // const browser = await chromium.launch({ headless: true })
        // const context = await browser.newContext({
        //     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        //     viewport: { width: 1280, height: 800 },
        //     locale: 'es-ES',
        //     extraHTTPHeaders: {
        //         'accept-language': 'es-ES,es;q=0.9',
        //     },
        // });
        // const page = await context.newPage();
        let step = 0;

        const getTimestamp = () => {
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            const dd = pad(now.getDate());
            const mm = pad(now.getMonth() + 1);
            const yyyy = now.getFullYear();
            const hh = pad(now.getHours());
            const mi = pad(now.getMinutes());
            const ss = pad(now.getSeconds());
            return `fecha-${dd}-${mm}-${yyyy}_hora-${hh}-${mi}-${ss}`;
        };

        const takeScreenshot = async (label: string) => {
            step++;
            const timestamp = getTimestamp();
            const name = `step${step}-${label}-${timestamp}.png`;
            const buffer = await page.screenshot({ path: name });
            await testInfo.attach(`${label} (${timestamp})`, {
                body: buffer,
                contentType: 'image/png',
            });
        };

        const idioma = copys.getLang();
        const pais = copys['pais'];

        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        await page.goto('https://www.avianca.com/');
        await takeScreenshot('01-goto-avianca');

        const consentBtn = page.locator('#onetrust-pc-btn-handler');

        if (await consentBtn.isVisible()) {
            await consentBtn.click();
            await page.locator('.save-preference-btn-handler.onetrust-close-btn-handler').click();
        }

        //setear solo ida
        // const fechaSoloIda = page.locator("#journeytypeId_1")
        // // expect(page.locator("#journeytypeId_1"));
        // // expect(page.locator("#journeytypeId_1")).toBeVisible(); // espera hasta 10s si es necesario
        // await fechaSoloIda.scrollIntoViewIfNeeded();
        // await page.locator("#journeytypeId_1").click();

        await expect(page.locator('.content-wrap')).toBeVisible();
        await expect(page.locator('#originBtn')).toBeVisible();
        //@ts-ignore
        const origen = page.getByPlaceholder((copys[idioma]).origen);
        await page.locator('button#originBtn').click();
        await origen.fill(copys['ciudad_origen']);
        await origen.press('Enter');
        await (page.locator('id=' + copys['ciudad_origen'])).click()
        await takeScreenshot('03-ciudad-origen');
        //@ts-ignore
        const destino = page.getByPlaceholder(copys[idioma].destino);
        await destino.click();
        await destino.fill(copys['ciudad_destino']);
        await destino.press('Enter');
        await (page.locator('id=' + copys['ciudad_destino'])).click()
        await takeScreenshot('04-ciudad-destino');

        const fechaIda = page.locator('id=departureInputDatePickerId')
        fechaIda.click();
        await page.locator('span').filter({ hasText: copys['fecha_salida'] }).click();
        await takeScreenshot('05-fecha-ida');

        await page.locator('span').filter({ hasText: copys['fecha_llegada'] }).click();
        await takeScreenshot('06-fecha-vuelta');

        // await page.getByRole('button', { name: '' }).nth(1).click();
        // await page.getByRole('button', { name: '' }).nth(2).click();
        // await page.getByRole('button', { name: '' }).nth(3).click();
        // const confirmar = page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
        // confirmar.click()
        await takeScreenshot('07-seleccion-pasajeros');
        //@ts-ignore
        await expect(page.getByRole('button', { name: copys[idioma].buscar, exact: true })).toBeVisible()
        //@ts-ignore
        await page.getByRole('button', { name: copys[idioma].buscar, exact: true }).click();
        await takeScreenshot('08-buscar');

        await page.waitForSelector('#pageWrap');
        await expect(page.locator(".journey_price_fare-select_label-text").first()).toBeVisible();
        await page.locator('.journey_price_fare-select_label-text').first().click();
        await page.waitForSelector(".journey_fares");
        await page.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click();
        //  await page.locator('.journey_fares').first().locator('.fare-flex').click();
        await takeScreenshot('09-seleccion-vuelo-ida');
        //@ts-ignore
        
        await page.waitForSelector("#journeysContainerId_1", {timeout: 15000});
        const containerVuelta = page.locator("#journeysContainerId_1");
        await expect(containerVuelta).toBeVisible();
        // await expect(page.locator('.journey_price_fare-select_label-text').nth(22)).toBeVisible();
        await containerVuelta.locator(".journey_price_fare-select_label-text").first().click();
        await takeScreenshot('13-seleccion-vuelo-regreso');
        await containerVuelta.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click();
        await page.waitForTimeout(3000);
        await takeScreenshot('13-resumen-de-vuelos-seleccionados');

        // await page.locator(".button.page_button.btn-action").click();
        expect(page.locator(".button.page_button.btn-action")).toBeVisible();
        await page.locator('.button.page_button.btn-action').click();

        await page.waitForSelector(".passenger_data");
        await page.waitForTimeout(5000);
        await takeScreenshot("fill-passenger");
    });
});