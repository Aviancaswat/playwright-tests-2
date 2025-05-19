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
    fecha_salida: 'may 24',
    fecha_llegada: 'may 30',
    ciudad_origen: 'BAQ',
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

        await expect(page.locator('.content-wrap')).toBeVisible();
        await expect(page.locator('#originBtn')).toBeVisible();
        const origen = page.getByPlaceholder((copys[idioma]).origen);
        await page.locator('button#originBtn').click();
        await origen.fill(copys['ciudad_origen']);
        await origen.press('Enter');
        await (page.locator('id=' + copys['ciudad_origen'])).click()
        await takeScreenshot('03-ciudad-origen');

        const destino = page.getByPlaceholder(copys[idioma].destino);
        await destino.click();
        await destino.fill(copys['ciudad_destino']);
        await destino.press('Enter');
        await (page.locator('id=' + copys['ciudad_destino'])).click();
        await takeScreenshot('04-ciudad-destino');

        const fechaIda = await page.locator('id=departureInputDatePickerId')
        fechaIda.click();
        await page.locator('span').filter({ hasText: copys['fecha_salida'] }).click();
        await takeScreenshot('05-fecha-ida');

        await page.locator('span').filter({ hasText: copys['fecha_llegada'] }).click();
        await takeScreenshot('06-fecha-vuelta');

        await page.getByRole('button', { name: '' }).nth(1).click();
        await page.getByRole('button', { name: '' }).nth(2).click();
        await page.getByRole('button', { name: '' }).nth(3).click();
        const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
        confirmar.click();

        await takeScreenshot('07-seleccion-pasajeros');
        await expect(page.getByRole('button', { name: copys[idioma].buscar, exact: true })).toBeVisible()
        await page.getByRole('button', { name: copys[idioma].buscar, exact: true }).click();
        await takeScreenshot('08-buscar');

        await page.waitForSelector('#pageWrap');
        await expect(page.locator(".journey_price_fare-select_label-text").first()).toBeVisible();
        await page.locator('.journey_price_fare-select_label-text').first().click();
        await page.waitForSelector(".journey_fares");
        await page.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click();
        //  await page.locator('.journey_fares').first().locator('.fare-flex').click();
        await takeScreenshot('09-seleccion-vuelo-ida');

        await page.waitForTimeout(1500);
        const isVisibleModal = await page.locator("#FB310").first().isVisible();

        if (isVisibleModal) {
            await expect(page.locator(".cro-button.cro-no-accept-upsell-button")).toBeVisible();
            await page.locator(".cro-button.cro-no-accept-upsell-button").first().click();
        }

        await page.waitForSelector("#journeysContainerId_1", { timeout: 15000 });
        const containerVuelta = page.locator("#journeysContainerId_1");
        await expect(containerVuelta).toBeVisible();
        // await expect(page.locator('.journey_price_fare-select_label-text').nth(22)).toBeVisible();
        await containerVuelta.locator(".journey_price_fare-select_label-text").first().click();
        await takeScreenshot('13-seleccion-vuelo-regreso');
        await containerVuelta.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click();
        await page.waitForTimeout(1500);

        const isVisibleModal2 = await page.locator("#FB310").first().isVisible();

        if (isVisibleModal2) {
            await expect(page.locator(".cro-button.cro-no-accept-upsell-button")).toBeVisible();
            await page.locator(".cro-button.cro-no-accept-upsell-button").first().click();
        }

        await takeScreenshot('13-resumen-de-vuelos-seleccionados');

        await page.waitForSelector(".trip-summary");
        const buttonConfirmResumen = page.locator(".button.page_button.btn-action");
        await expect(buttonConfirmResumen).toBeVisible();
        buttonConfirmResumen.scrollIntoViewIfNeeded();
        await buttonConfirmResumen.click();

        //página de pasajeros
        await page.waitForSelector(".passenger_data_group");
        await takeScreenshot("inicio-de-llenado-pagina-de-pasajeros");

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
                let value = null;
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
        await expect(page.locator("#serviceButtonTypeBusinessLounge")).toBeVisible();
        await page.locator('#serviceButtonTypeBusinessLounge').click();
        await page.locator('.service_item_button.button').first().click();
        await takeScreenshot("Servicio avianca-lounges");
        await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click();

        await expect(page.locator('#serviceButtonTypeSpecialAssistance')).toBeVisible();
        await page.locator('#serviceButtonTypeSpecialAssistance').click();
        await takeScreenshot("Servicio asistencia especial");
        await page.locator('.service_item_button.button').first().click();
        await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click();

        await expect(page.locator('.services-card_action_button.button').last()).toBeVisible();
        await takeScreenshot("Asistencia en viaje");
        await page.locator('.services-card_action_button.button').last().click();
        await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton').click();
        await takeScreenshot("Servicios añadidos");
        await expect(page.locator(".button_label").last()).toBeVisible();
        await page.locator('.button_label').last().click();

        const upsellService = await page.locator('.terciary-button').last().isVisible()
        if (upsellService) {
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
        // await expect(page.locator('.payment-container_title')).toBeVisible();
        // await takeScreenshot("pagos");

        const noOtraTarjeta = page.locator('.fb-left-container');
        await expect(noOtraTarjeta).toBeVisible();
        await noOtraTarjeta.click();
        await page.waitForTimeout(1000);

        // // 16 – Llenar datos de la tarjeta (iframe)
        // await page.waitForSelector('iframe.payment-forms-layout_iframe', { timeout: 15_000 });
        // const cardFrame = page.frameLocator('iframe.payment-forms-layout_iframe');

        // // Titular de la tarjeta (input#Holder)
        // const holderInput = cardFrame.locator('input#Holder');
        // await expect(holderInput).toBeVisible();
        // await holderInput.fill('John Doe');

        // // Número de tarjeta (input#Data)
        // const dataInput = cardFrame.locator('input#Data');
        // await expect(dataInput).toBeVisible();
        // await dataInput.fill('4111111111111111');

        // await takeScreenshot('16-tarjeta-Holder-Data');


        // await takeScreenshot('17-datos-facturacion');
        // await takeScreenshot("pagos");

        // // Fecha de expiración: Mes
        // const monthBtn = cardFrame.locator('button#expirationMonth_ExpirationDate');
        // await expect(monthBtn).toBeVisible();
        // await monthBtn.click();
        // await cardFrame
        //     .locator('ul#listId_expirationMonth_ExpirationDate li button')
        //     .filter({ hasText: '12' })    // el mes que necesites
        //     .click();

        // // Fecha de expiración: Año
        // const yearBtn = cardFrame.locator('button#expirationYear_ExpirationDate');
        // await expect(yearBtn).toBeVisible();
        // await yearBtn.click();
        // await cardFrame
        //     .locator('ul#listId_expirationYear_ExpirationDate li button')
        //     .filter({ hasText: '25' })    // el año que necesites (por ejemplo “25” para 2025)
        //     .click();

        // // CVV
        // const cvvInput = cardFrame.locator('input#Cvv');
        // await expect(cvvInput).toBeVisible();
        // await cvvInput.fill('123');

        // //screenshot tras expiración y CVV
        // await takeScreenshot('18-tarjeta-expiracion-cvv');

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
        await countryOption.click();

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