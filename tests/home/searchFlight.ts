import { Page } from 'playwright';
import { test, expect, webkit, chromium } from '@playwright/test';

export async function searchFlight(page: Page, takeScreenshot: any, copys: any, idioma: any): Promise<boolean> {
    const getRandomDelay = () => Math.floor(Math.random() * 500 + 300);

    await expect(page.locator('.content-wrap')).toBeVisible();
    await page.waitForSelector("#originBtn");
    await expect(page.locator('#originBtn')).toBeVisible();
    const origen = page.getByPlaceholder((copys[idioma]).origen);
    await page.locator('button#originBtn').click({ delay: getRandomDelay() });
    await origen.fill(copys['ciudad_origen']);
    await origen.press('Enter');
    await (page.locator('id=' + copys['ciudad_origen'])).click({ delay: getRandomDelay() })
    await takeScreenshot('03-ciudad-origen');
    await page.waitForTimeout(2000);
    await expect(page.getByPlaceholder(copys[idioma].destino)).toBeVisible();
    const destino = page.getByPlaceholder(copys[idioma].destino);
    await destino.click({ delay: getRandomDelay() });
    await destino.fill(copys['ciudad_destino']);
    // await destino.press('Enter');
    await (page.locator('id=' + copys['ciudad_destino'])).click({ delay: getRandomDelay() });
    await takeScreenshot('04-ciudad-destino');

    await page.waitForSelector("#departureInputDatePickerId");
    const fechaIda = await page.locator('id=departureInputDatePickerId')
    fechaIda.click({ delay: getRandomDelay() });
    await page.locator('span').filter({ hasText: copys['fecha_salida'] }).click({ delay: getRandomDelay() });
    await takeScreenshot('05-fecha-ida');
    await page.waitForTimeout(3000);
    await page.locator('span').filter({ hasText: copys['fecha_llegada'] }).click({ delay: getRandomDelay() });
    await takeScreenshot('06-fecha-vuelta');

    await page.getByRole('button', { name: '' }).nth(1).click();
    await page.getByRole('button', { name: '' }).nth(2).click();
    await page.getByRole('button', { name: '' }).nth(3).click();
    const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
    confirmar.click({ delay: getRandomDelay() });

    await takeScreenshot('07-seleccion-pasajeros');

    //await page.locator('.divButtontext').first().screenshot({ path: 'ALF1-1520.png' });

    await expect(page.getByRole('button', { name: copys[idioma].buscar, exact: true })).toBeVisible()
    await page.getByRole('button', { name: copys[idioma].buscar, exact: true }).click({ delay: getRandomDelay() });
    await takeScreenshot('08-buscar');

    return false;
}