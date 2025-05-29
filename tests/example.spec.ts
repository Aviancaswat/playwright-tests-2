import { test, expect, webkit, chromium } from '@playwright/test';
 
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
ciudad_destino: 'BOG',
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
 
test('prueba home avianca', async ({  }, testInfo) => {
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
 
await page.goto('https://www.avianca.com/'+ idioma + '/', {
    waitUntil: "domcontentloaded",
  });
await page.waitForSelector("#searchComponentDiv");
await takeScreenshot('01-goto-avianca');
 
// Function to generate random delays between 50ms and 200ms
const getRandomDelay = () => Math.random() * (200 - 50) + 50;
 
const consentBtn = page.locator('#onetrust-pc-btn-handler', { delay: getRandomDelay() });
 
if (await consentBtn.isVisible()) {
    await page.waitForSelector("#onetrust-pc-btn-handler");
await consentBtn.click();
await page.locator('.save-preference-btn-handler.onetrust-close-btn-handler').click({ delay: getRandomDelay()} );
}
 
 
     const intervalId = setInterval(async () => {
                //console.log('entro a intervalo playwright');
                const isVisibleModalError = await page.locator(".action-message_container").isVisible();
                if (isVisibleModalError) {
                    await expect(page.locator(".close")).toBeVisible();
                    await page.locator(".close").click();
                }
     }, 500)
 
 
await expect(page.locator('.content-wrap')).toBeVisible();
await page.waitForSelector("#originBtn");
await expect(page.locator('#originBtn')).toBeVisible();
const origen = page.getByPlaceholder((copys[idioma]).origen);
await page.locator('button#originBtn').click({ delay: getRandomDelay()} );
await origen.fill(copys['ciudad_origen'], { delay: getRandomDelay() });
await origen.press('Enter');
await (page.locator('id=' + copys['ciudad_origen'])).click({ delay: getRandomDelay()} )
await takeScreenshot('03-ciudad-origen');
await page.waitForTimeout(2000);  
await expect(page.getByPlaceholder(copys[idioma].destino)).toBeVisible();
const destino = page.getByPlaceholder(copys[idioma].destino);
await destino.click({ delay: getRandomDelay()} );
await destino.fill(copys['ciudad_destino'], { delay: getRandomDelay() });
await destino.press('Enter');
await (page.locator('id=' + copys['ciudad_destino'])).click({ delay: getRandomDelay()} );
await takeScreenshot('04-ciudad-destino');
 
await page.waitForSelector("#departureInputDatePickerId");
const fechaIda = await page.locator('id=departureInputDatePickerId')
fechaIda.click({ delay: getRandomDelay()} );
await page.locator('span').filter({ hasText: copys['fecha_salida'] }).click({ delay: getRandomDelay()} );
await takeScreenshot('05-fecha-ida');
await page.waitForTimeout(3000);
await page.locator('span').filter({ hasText: copys['fecha_llegada'] }).click({ delay: getRandomDelay()} );
await takeScreenshot('06-fecha-vuelta');
 
await page.getByRole('button', { name: '' }).nth(1).click();
await page.getByRole('button', { name: '' }).nth(2).click();
await page.getByRole('button', { name: '' }).nth(3).click();
const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
confirmar.click({ delay: getRandomDelay()} );
 
await takeScreenshot('07-seleccion-pasajeros');
 
//await page.locator('.divButtontext').first().screenshot({ path: 'ALF1-1520.png' });
 
await expect(page.getByRole('button', { name: copys[idioma].buscar, exact: true })).toBeVisible()
await page.getByRole('button', { name: copys[idioma].buscar, exact: true }).click({ delay: getRandomDelay()} );
await takeScreenshot('08-buscar');
 
await page.waitForSelector('#pageWrap');
await page.waitForSelector('.journey_price_fare-select_label-text');
await expect(page.locator(".journey_price_fare-select_label-text").first()).toBeVisible();
await page.locator('.journey_price_fare-select_label-text').first().click({ delay: getRandomDelay()} );
await page.waitForSelector(".journey_fares");
await page.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click({ delay: getRandomDelay()} );
// await page.locator('.journey_fares').first().locator('.fare-flex').click();
await takeScreenshot('09-seleccion-vuelo-ida');
 
await page.waitForTimeout(1500);
const isVisibleModal = await page.locator("#FB310").first().isVisible();
 
if (isVisibleModal) {
await expect(page.locator(".cro-button.cro-no-accept-upsell-button")).toBeVisible();
await page.locator(".cro-button.cro-no-accept-upsell-button").first().click({ delay: getRandomDelay()} );
}
 
await page.waitForSelector("#journeysContainerId_1", { timeout: 15000 });
const containerVuelta = page.locator("#journeysContainerId_1");
await expect(containerVuelta).toBeVisible();
// await expect(page.locator('.journey_price_fare-select_label-text').nth(22)).toBeVisible();
await containerVuelta.locator(".journey_price_fare-select_label-text").first().click({ delay: getRandomDelay()} );
await takeScreenshot('13-seleccion-vuelo-regreso');
await containerVuelta.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click({ delay: getRandomDelay()} );
await page.waitForTimeout(1500);
 
const isVisibleModal2 = await page.locator("#FB310").first().isVisible();
 
if (isVisibleModal2) {
await expect(page.locator(".cro-button.cro-no-accept-upsell-button")).toBeVisible();
await page.locator(".cro-button.cro-no-accept-upsell-button").first().click({ delay: getRandomDelay()} );
}
 
await takeScreenshot('13-resumen-de-vuelos-seleccionados');
 
await page.waitForSelector(".trip-summary");
const buttonConfirmResumen = page.locator(".button.page_button.btn-action");
await expect(buttonConfirmResumen).toBeVisible();
buttonConfirmResumen.scrollIntoViewIfNeeded();
await buttonConfirmResumen.click({ delay: getRandomDelay()} );
 
//página de pasajeros
await page.waitForSelector(".passenger_data_group");
await takeScreenshot("inicio-de-llenado-pagina-de-pasajeros");
 
await page.evaluate(() => {
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
 
                const getDataRandom = (data: Array<string> = []): string => {
                    return data[Math.floor(Math.random() * data.length)];
                }
 
                const getValueElement = (element: HTMLInputElement): string => {
                    let value: string | null = null;
                    if (element.name === "email") {
                        console.log('----ENTRO-----');
                        value = getDataRandom(emailsData);
                    }
                    else if (element.name === "confirmEmail") {
                        value = getDataRandom(emailsData);
                        console.log('----ENTRO-----');
                    }
                    else if (element.name === "phone_phoneNumberId") {
                        value = getDataRandom(phoneNumbersData);
                        console.log('----ENTRO-----');
                    }
                    else if (element.id.includes("IdFirstName")) {
                        value = getDataRandom(userNamesData);
                        console.log('----ENTRO-----');
                    }
                    else {
                        value = getDataRandom(lastNamesData);
                        console.log('----ENTRO-----lastNamesData' +lastNamesData);
                    }
                    return value;
                }
 
                const getButtonAndClickItem = () => {
                    const listOptions = document.querySelector(".ui-dropdown_list");
                    const buttonElement = listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement;
                    buttonElement.click();
                }
 
                const setValuesDefaultAutoForm = async () => {
                    const elements = document.querySelectorAll('.ui-input');
                    Array.from(elements).forEach((element) => {
                        if (element.tagName === "BUTTON") {
                           
                            const elementButton = element as HTMLButtonElement;
                            elementButton.click();
                            const listOptions = document.querySelector(".ui-dropdown_list");
                            (listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement)?.click();
                            console.log('****element.id****' + element.id);
                            if (element.id === "passengerId") {
                                    elementButton.click();
                                setTimeout(() => {
                                    console.log('++++++++++Entro++++++++');
                                    getButtonAndClickItem();
                                }, 1000);
                            }
                            else if (element.id === 'phone_prefixPhoneId') {
                                setTimeout(() => {
                                    console.log('++++++++++Entro++++++++');
                                    elementButton.click();
                                    getButtonAndClickItem();
                                }, 1000);
                            }
                            else {
                                const checkAccept = document.querySelector('#acceptNewCheckbox') as HTMLButtonElement;
                                checkAccept.click();
                                elementButton.click();
                                getButtonAndClickItem();
                            }
                        }
                        else if (element.tagName === "INPUT") {
                            const elementInput = element as HTMLInputElement;
                            const containers = document.querySelectorAll(".ui-input-container");
                            Array.from(containers).forEach(e => { e.classList.add("is-focused") });
                            let eventBlur: Event = new Event("blur");
                            let eventFocus: Event = new Event("focus");
                            elementInput.value = getValueElement(elementInput);
                            ['change', 'input'].forEach(event => {
                                let handleEvent = new Event(event, { bubbles: true, cancelable: false });
                                element.dispatchEvent(handleEvent);
                            });
                            element.dispatchEvent(eventFocus);
                            setTimeout(() => {
                                element.dispatchEvent(eventBlur);
                                Array.from(containers).forEach(e => { e.classList.remove("is-focused") });
                            }, 1000);
                        }
                    });
 
                    await expect(page.locator('id=email')).toBeVisible();
                    await (page.locator('id=email')).fill('test@gmail.com');
 
                    await expect(page.locator('id=confirmEmail')).toBeVisible();
                    await (page.locator('id=confirmEmail')).fill('test@gmail.com');
                   
                    await page.waitForSelector("id=acceptNewCheckbox");
                    await expect(page.locator('id=acceptNewCheckbox')).toBeVisible();
                    await (page.locator('id=acceptNewCheckbox')).click()
 
                }
                setValuesDefaultAutoForm();
            });
 
await takeScreenshot("llenado-de-pasajeros-ok");
 
 
await page.waitForTimeout(2000);
//boton de continuar para los servicios
await expect(page.locator(".button.page_button.btn-action").last()).toBeVisible();
//await page.waitForSelector(".button.page_button.btn-action");
await page.locator(".button.page_button.btn-action").last().click({ delay: getRandomDelay()} );
 
await page.waitForSelector(".main-banner--section-offer");
await page.waitForTimeout(8000);
await takeScreenshot("Pagina-de-servicios");
await expect(page.locator("#serviceButtonTypeBusinessLounge")).toBeVisible();
await page.waitForSelector("#serviceButtonTypeBusinessLounge");
await page.locator('#serviceButtonTypeBusinessLounge').click({ delay: getRandomDelay()} );
await page.waitForSelector(".service_item_button.button");
await page.locator('.service_item_button.button').first().click({ delay: getRandomDelay()} );
await takeScreenshot("Servicio avianca-lounges");
await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: getRandomDelay()} );
 
await expect(page.locator('#serviceButtonTypeSpecialAssistance')).toBeVisible();
await page.waitForSelector("#serviceButtonTypeSpecialAssistance");
await page.locator('#serviceButtonTypeSpecialAssistance').click({ delay: getRandomDelay()} );
await takeScreenshot("Servicio asistencia especial");
await page.waitForSelector(".service_item_button.button");
await page.locator('.service_item_button.button').first().click({ delay: getRandomDelay()} );
await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: getRandomDelay()} );
 
await expect(page.locator('.services-card_action_button.button').last()).toBeVisible();
await takeScreenshot("Asistencia en viaje");
await page.waitForSelector(".services-card_action_button.button");
await page.locator('.services-card_action_button.button').last().click({ delay: getRandomDelay()} );
await page.waitForSelector(".button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton");
await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton').click({ delay: getRandomDelay()} );
await takeScreenshot("Servicios añadidos");
await expect(page.locator(".button_label").last()).toBeVisible();
await page.locator('.button_label').last().click({ delay: getRandomDelay()} );
 
const upsellService = await page.locator('.terciary-button').last().isVisible()
if (upsellService) {
await page.locator('.terciary-button').last().click({ delay: getRandomDelay()} )
}
await page.waitForTimeout(12000);
await takeScreenshot("Pagina-de-seleccion-asientos");
//seleccion de asientos
const pasajeros = page.locator(".pax-selector_pax-avatar")
 
for (const e of await pasajeros.all()) {
await takeScreenshot("seleccion-asiento");
await expect(page.locator(".seat-number").first()).toBeVisible();
await page.locator('.seat-number').first().click({ delay: getRandomDelay()} );
await page.waitForTimeout(8000);
}
await page.waitForSelector(".next-flight-code");
await expect(page.locator(".next-flight-code")).toBeVisible();
await takeScreenshot("seleccion-asiento-vuelta");
await page.locator('.next-flight-code').click({ delay: getRandomDelay()} );
 
const pasajerosVuelta = page.locator(".pax-selector_pax-avatar")
 
for (const j of await pasajerosVuelta.all()) {
await takeScreenshot("seleccion-asiento");
await expect(page.locator(".seat-number").first()).toBeVisible();
await page.locator('.seat-number').first().click({ delay: getRandomDelay()} );
await page.waitForTimeout(8000);
}
 
await expect(page.getByRole('button', { name: copys[idioma].pagar, exact: true })).toBeVisible()
await page.getByRole('button', { name: copys[idioma].pagar, exact: true }).click({ delay: getRandomDelay()} );
await page.waitForTimeout(5000);
// await expect(page.locator('.payment-container_title')).toBeVisible();
// await takeScreenshot("pagos");
 
// const noOtraTarjeta = page.locator('.fb-left-container');
// await expect(noOtraTarjeta).toBeVisible();
// await noOtraTarjeta.click();
await page.waitForTimeout(1000);
 
// Llenar datos de facturación
await page.waitForSelector('input#email', { timeout: 15_000 });
 
// Correo electrónico
const emailInput = page.locator('input#email');
await expect(emailInput).toBeVisible();
await emailInput.fill('monitoreo.digital@avianca.com');
 
// Dirección de residencia
const addressInput = page.locator('input#address');
await expect(addressInput).toBeVisible();
await addressInput.fill('Calle 123 #45-67');
 
// Ciudad
const cityInput = page.locator('input#city');
await expect(cityInput).toBeVisible();
await cityInput.fill('Bogotá');
 
// País
const countryBtn = page.locator('button#country');
await expect(countryBtn).toBeVisible();
await countryBtn.click();
 
// Esperar a que aparezcan las opciones
await page.waitForSelector('div.ds-select-dropdown li button', { timeout: 5_000 });
 
// Seleccionar “Colombia”
const countryOption = page
.locator('div.ds-select-dropdown li button')
.filter({ hasText: 'Colombia' });
await expect(countryOption).toBeVisible();
await countryOption.click({ delay: getRandomDelay()} );
 
await takeScreenshot('19-country-seleccionado');
 
// Aceptar Términos
const termsCheckbox = page.locator('input#terms');
await expect(termsCheckbox).toBeVisible();
await termsCheckbox.check();
await takeScreenshot('20-aceptar-terminos');
 
// Captura final de facturación
await takeScreenshot('21-datos-facturacion');
 
});
});