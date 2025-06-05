import { test, expect, webkit, chromium } from '@playwright/test';
import { searchFlight } from './home/searchFlight';
import { acceptCookies } from './home/home';
import { booking } from './booking/booking';
import { passengers } from './passengers/passengers';
import { services } from './services/services';
import { seats } from './seats/seats';
import { payment } from './payment/payment';

type Lang = 'es' | 'en' | 'pt' | 'fr';

type copysType = {
    idioma: Lang,
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
        pagar: string
    },
    en: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    pt: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    fr: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    getLang: () => Lang
}

const copys: copysType = {
    idioma: 'es' as Lang,
    pais: 'CO',
    fecha_salida: 'jul 10',
    fecha_llegada: 'jul 17',
    ciudad_origen: 'CLO',
    ciudad_destino: 'MDE',
    es: {
        origen: 'Origen',
        destino: 'Hacia',
        buscar: 'Buscar',
        vuelta: 'Vuelta',
        pagar: 'Ir a pagar',
    },
    en: {
        origen: 'Origin',
        destino: 'Destination',
        buscar: 'Search',
        vuelta: 'Return',
        pagar: 'Go to payment',
    },
    pt: {
        origen: 'Origem',
        destino: 'Destino',
        buscar: 'Buscar voos',
        vuelta: 'Regresso',
        pagar: 'Vá pagar',
    },
    fr: {
        origen: 'Origen',
        destino: 'Destination',
        buscar: 'Rechercher',
        vuelta: 'Retour',
        pagar: ' Continuer',
    },
    getLang: () => copys.idioma
};

test.describe('Comenzo prueba avianca', () => {

    test('prueba home avianca', async ({ }, testInfo) => {
        test.setTimeout(300_000);
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

        //***************CODIGO PARA PROBAR EN GITHUB PARA SER INDETECTABLE*********************** */
        const { chromium } = require("playwright-extra");
        //const stealth = require("puppeteer-extra-plugin-stealth")();

        //chromium.use(stealth);
        // Replace with your res
        const browser = await chromium.launch({
            headless: true,
            args: ['--disable-blink-features=AutomationControlled',
                '--enable-webgl',
                '--use-gl=swiftshader',
                '--enable-accelerated-2d-canvas'
            ]
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'en-US',
            timezoneId: 'America/New_York',
            deviceScaleFactor: 1,
        });
        const page = await context.newPage();

        //********************************************************************************* */

        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        await page.goto('https://www.avianca.com/' + idioma + '/', {
            waitUntil: "domcontentloaded",
        });
        await page.waitForSelector("#searchComponentDiv");
        await takeScreenshot('01-goto-avianca');
        const getRandomDelay = () => Math.floor(Math.random() * 500 + 300);
        // Function to generate random delays between 50ms and 200ms
        await acceptCookies(page, getRandomDelay);

        // const intervalId = setInterval(async () => {
        //     //console.log('entro a intervalo playwright');
        //     if (page) {
        //         const isVisibleModalError = await page.locator(".action-message_container").isVisible();
        //         if (isVisibleModalError) {
        //             await page.waitForTimeout(1500);
        //             await takeScreenshot('error popup');
        //             await page.waitForTimeout(1500);
        //             await expect(page.locator(".close")).toBeVisible();
        //             await page.locator(".close").click();
        //         }
        //     }

        // }, 500)


        await searchFlight(page, takeScreenshot, copys, idioma);

        // await departureFlights(page, takeScreenshot);

        await booking(page, takeScreenshot);

        //página de pasajeros


        const userNamesData: Array<string> = [
            "john doe",
            "jane smith",
            "alexander wilson",
            "maria gomez",
            "roberto perez",
            "lucia martinez",
            "david hernandez",
            "carla jones",
            "luis vega",
            "susan brown"
        ];

        const lastNamesData: Array<string> = [
            "Doe",
            "Smith",
            "Wilson",
            "Gomez",
            "Perez",
            "Martinez",
            "Hernandez",
            "Jones",
            "Vega",
            "Brown"
        ];

        const emailsData: Array<string> = [
            "monitoreo.digital@avianca.com"
        ];

        const phoneNumbersData: Array<string> = [
            "123456",
            "987654",
            "654321",
            "321654",
            "987123",
            "456789",
            "102938",
            "112233",
            "778899",
            "334455"
        ];

        await passengers(page, takeScreenshot, userNamesData, lastNamesData, emailsData, phoneNumbersData);

        await services(page, takeScreenshot);

        await seats(page, takeScreenshot, copys, idioma);

        // await expect(page.locator('.payment-container_title')).toBeVisible();
        // await takeScreenshot("pagos");

        // const noOtraTarjeta = page.locator('.fb-left-container');
        // await expect(noOtraTarjeta).toBeVisible();
        // await noOtraTarjeta.click();
        await page.waitForTimeout(1000);
        // await clearInterval(intervalId);

        // Llenar datos de facturación
        await payment(page, takeScreenshot);

    });
});