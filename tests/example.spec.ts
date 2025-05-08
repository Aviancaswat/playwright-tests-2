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
pagar: string,
},
en: {
origen: string,
destino: string,
buscar: string,
vuelta: string,
pagar: string,
},
pt: {
origen: string,
destino: string,
buscar: string,
vuelta: string,
pagar: string,
},
fr: {
origen: string,
destino: string,
buscar: string,
vuelta: string,
pagar: string,
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
 
test('prueba home avianca', async ({ page }, testInfo) => {
test.setTimeout(900_000);
// const browser = await chromium.launch({ headless: true })
// const context = await browser.newContext({
// userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
// viewport: { width: 1280, height: 800 },
// locale: 'es-ES',
// extraHTTPHeaders: {
// 'accept-language': 'es-ES,es;q=0.9',
// },
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
 
await page.goto('https://www.avianca.com/'+idioma+'/?poscode='+pais)+'/';
//await page.goto('https://nuxqa.avtest.ink/'+idioma+'/?poscode='+pais);
await takeScreenshot('01-goto-avianca');
 
const consentBtn = page.locator('#onetrust-pc-btn-handler');
 
if (await consentBtn.isVisible()) {
await consentBtn.click();
await page.locator('.save-preference-btn-handler.onetrust-close-btn-handler').click();
}
 
await expect(page.locator('.content-wrap')).toBeVisible();
await expect(page.locator('#originBtn')).toBeVisible();
 
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
 
await page.getByRole('button', { name: '' }).nth(1).click();
await page.getByRole('button', { name: '' }).nth(2).click();
await page.getByRole('button', { name: '' }).nth(3).click();
const confirmar = page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
confirmar.click()
await takeScreenshot('07-seleccion-pasajeros');
//@ts-ignore
await expect(page.getByRole('button', { name: copys[idioma].buscar, exact: true })).toBeVisible()
//@ts-ignore
await page.getByRole('button', { name: copys[idioma].buscar, exact: true }).click();
await takeScreenshot('08-buscar');
await page.waitForTimeout(6000)
await page.waitForSelector('#pageWrap');
await expect(page.locator(".journey_price_fare-select_label-text").first()).toBeVisible();
await page.locator('.journey_price_fare-select_label-text').first().click();
await page.waitForSelector(".journey_fares");
await page.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click();
//await page.locator('.journey_fares').first().locator('.fare-flex').click();
await takeScreenshot('09-seleccion-vuelo-ida');
await page.waitForTimeout(2000)
//await page.waitForSelector('.cro-no-accept-upsell-button');
const upsell = await page.locator('.cro-no-accept-upsell-button').isVisible()
if(upsell){
    //await expect(page.locator('.cro-no-accept-upsell-button'))
    await page.locator('.cro-no-accept-upsell-button').click()
}
//await page.waitForSelector(".cro-no-accept-upsell-button", {timeout: 2000});
//@ts-ignore
await page.waitForSelector("#journeysContainerId_1", {timeout: 15000});
const containerVuelta = page.locator("#journeysContainerId_1");
await expect(containerVuelta).toBeVisible();
// await expect(page.locator('.journey_price_fare-select_label-text').nth(22)).toBeVisible();
await containerVuelta.locator(".journey_price_fare-select_label-text").first().click();
await takeScreenshot('13-seleccion-vuelo-regreso');
await containerVuelta.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click();
 
const upsellVuelta = await page.locator('.cro-no-accept-upsell-button').isVisible()
if(upsellVuelta){
    await page.locator('.cro-no-accept-upsell-button').click()
}
 
await page.waitForTimeout(3000);
await takeScreenshot('13-resumen-de-vuelos-seleccionados');
 
expect(page.locator(".button.page_button.btn-action")).toBeVisible();
await page.locator('.button.page_button.btn-action').click();
 
await page.waitForSelector(".passenger_data");
await page.waitForTimeout(5000);
await takeScreenshot("fill-passenger");
 
//página de pasajeros
await takeScreenshot("inicio-de-llenado-pagina-de-pasajeros");
await page.waitForSelector(".passenger_data_group");
 
//seteando los valores
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
 
const getDataRandom = (data: Array<string> = []) => {
return data[Math.floor(Math.random() * data.length)];
}
 
const getValueElement = (element: HTMLInputElement) => {
let value;
if (element.name === "email") {
value = getDataRandom(emailsData);
}
 else if (element.name === "phone_phoneNumberId") {
 value = getDataRandom(phoneNumbersData);
 }
 else if (element.id.includes("IdFirstName")) {
 value = getDataRandom(userNamesData);
 }
 else {
 value = getDataRandom(lastNamesData);
 }
 return value;
 }
 
 const setValuesDefaultAutoForm = () => {
 const elements = document.querySelectorAll('.ui-input');
 console.log("elements: ", elements);
 Array.from(elements).forEach((element, index) => {
 if (element.tagName === "BUTTON") {
 (element as HTMLButtonElement).click();
 const listOptions = document.querySelector(".ui-dropdown_list");
 (listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement).click();
 }
 else if (element.tagName === "INPUT") {
 const containers = document.querySelectorAll(".ui-input-container");
 Array.from(containers).forEach(e => { e.classList.add("is-focused") });
 let eventBlur = new Event("blur");
 let eventFocus = new Event("focus");
 (element as HTMLInputElement).value = getValueElement(element as HTMLInputElement);
 ['change', 'input'].forEach(event => {
 let handleEvent = new Event(event, { bubbles: true, cancelable: false });
 element.dispatchEvent(handleEvent);
 });
 element.dispatchEvent(eventFocus);
 setTimeout(() => {
 element.dispatchEvent(eventBlur);
 Array.from(containers).forEach(e => { e.classList.remove("is-focused") });
 }, 100);
 }
 });
 
 const fieldAuthoritation = document.querySelector("#acceptNewCheckbox") as HTMLInputElement;
 if (fieldAuthoritation) fieldAuthoritation.checked = true;
 }
 
 setValuesDefaultAutoForm();
 });
 
 await takeScreenshot("llenado-de-pasajeros-ok");
 await page.waitForTimeout(2000);
 //boton de continuar para los servicios
 await expect(page.locator(".button.page_button.btn-action").last()).toBeVisible();
 await page.locator(".button.page_button.btn-action").last().click();
 
 await page.waitForSelector(".main-banner--section-offer");
 await page.waitForTimeout(8000);
 await takeScreenshot("Pagina-de-servicios");
 
  await expect(page.locator(".button_label").last()).toBeVisible();
 await page.locator('.button_label').last().click();
 
 const upsellService = await page.locator('.terciary-button').last().isVisible()
if(upsellService){
    await page.locator('.terciary-button').last().click()
}
await page.waitForTimeout(12000);
await takeScreenshot("Pagina-de-seleccion-asientos");
//seleccion de asientos
 const pasajeros = page.locator(".pax-selector_pax-avatar")
 
 for (const e of await pasajeros.all()) {
    await takeScreenshot("seleccion-asiento");
    await expect(page.locator(".seat-number").first()).toBeVisible();
    await page.locator('.seat-number').first().click();
    await page.waitForTimeout(8000);
  }
 
await expect(page.locator(".next-flight-code")).toBeVisible();
await takeScreenshot("seleccion-asiento-vuelta");
await page.locator('.next-flight-code').click();
 
const pasajerosVuelta = page.locator(".pax-selector_pax-avatar")
 
for (const j of await pasajerosVuelta.all()) {
    await takeScreenshot("seleccion-asiento");
    await expect(page.locator(".seat-number").first()).toBeVisible();
    await page.locator('.seat-number').first().click();
    await page.waitForTimeout(8000);
  }
 
await expect(page.getByRole('button', { name: copys[idioma].pagar, exact: true })).toBeVisible()
await page.getByRole('button', { name: copys[idioma].pagar, exact: true }).click();
await page.waitForTimeout(5000);
await expect(page.locator('.payment-container_title')).toBeVisible();
await takeScreenshot("pagos");
});
});