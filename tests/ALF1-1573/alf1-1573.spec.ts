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

        const destino = page.getByPlaceholder(copys[idioma].destino);
        await destino.click();
        await destino.fill(copys['ciudad_destino']);
        await destino.press('Enter');
        await (page.locator('id=' + copys['ciudad_destino'])).click();

        const fechaIda = await page.locator('id=departureInputDatePickerId')
        fechaIda.click();
        await page.locator('span').filter({ hasText: copys['fecha_salida'] }).click();

        await page.locator('span').filter({ hasText: copys['fecha_llegada'] }).click();

        await page.getByRole('button', { name: '' }).nth(1).click();
        await page.getByRole('button', { name: '' }).nth(2).click();
        await page.getByRole('button', { name: '' }).nth(3).click();
        const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
        confirmar.click();

        await expect(page.getByRole('button', { name: copys[idioma].buscar, exact: true })).toBeVisible()
        await page.getByRole('button', { name: copys[idioma].buscar, exact: true }).click();

        await page.waitForSelector('#pageWrap');
        await expect(page.locator(".journey_price_fare-select_label-text").first()).toBeVisible();
        await page.locator('.journey_price_fare-select_label-text').first().click();
        await page.waitForSelector(".journey_fares");
        await page.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click();
        //  await page.locator('.journey_fares').first().locator('.fare-flex').click();

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
        await containerVuelta.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click();
        await page.waitForTimeout(1500);

        const isVisibleModal2 = await page.locator("#FB310").first().isVisible();

        if (isVisibleModal2) {
            await expect(page.locator(".cro-button.cro-no-accept-upsell-button")).toBeVisible();
            await page.locator(".cro-button.cro-no-accept-upsell-button").first().click();
        }

        await page.waitForSelector(".trip-summary");
        const buttonConfirmResumen = page.locator(".button.page_button.btn-action");
        await expect(buttonConfirmResumen).toBeVisible();
        buttonConfirmResumen.scrollIntoViewIfNeeded();
        await buttonConfirmResumen.click();

        //página de pasajeros
        await page.waitForSelector(".passenger_data_group");

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
                    console.log('----ENTRO-----lastNamesData' + lastNamesData);
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
                            const cas = document.querySelector('#acceptNewCheckbox') as HTMLButtonElement;
                            cas.click();
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
                //const fieldAuthoritation = document.querySelector("#acceptNewCheckbox") as HTMLInputElement;
                // if (fieldAuthoritation) fieldAuthoritation.checked = true;

                await page.waitForSelector("id=acceptNewCheckbox");
                await expect(page.locator('id=acceptNewCheckbox')).toBeVisible();
                await (page.locator('id=acceptNewCheckbox')).click()

                await expect(page.locator('id=sendNewsLetter')).toBeVisible();
                await (page.locator('id=sendNewsLetter')).click();
            }
            setValuesDefaultAutoForm();
        });

        const acceptCheckbox = page.locator('input#acceptNewCheckbox');
        await expect(acceptCheckbox).toBeVisible();
        await acceptCheckbox.check();

        await takeScreenshot("llenado-de-pasajeros-ok");
        await page.waitForTimeout(2000);
        

    });
});