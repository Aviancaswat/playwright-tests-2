import { Page } from 'playwright';
import { test, expect, webkit, chromium } from '@playwright/test';

export async function seats(page: Page, takeScreenshot: any, copys: any, idioma: any): Promise<boolean> {
    const getRandomDelay = () => Math.floor(Math.random() * 500 + 300);

    await page.waitForTimeout(12000);
    await takeScreenshot("Pagina-de-seleccion-asientos");
    //seleccion de asientos
    const pasajeros = page.locator(".pax-selector_pax-avatar")

    for (const e of await pasajeros.all()) {
        await takeScreenshot("seleccion-asiento");
        await expect(page.locator(".seat-number").first()).toBeVisible();
        await page.locator('.seat-number').first().click({ delay: getRandomDelay() });
        await page.waitForTimeout(8000);
    }
    await page.waitForSelector(".next-flight-code");
    await expect(page.locator(".next-flight-code")).toBeVisible();
    await takeScreenshot("seleccion-asiento-vuelta");
    await page.locator('.next-flight-code').click({ delay: getRandomDelay() });

    const pasajerosVuelta = page.locator(".pax-selector_pax-avatar")

    for (const j of await pasajerosVuelta.all()) {
        await takeScreenshot("seleccion-asiento");
        await expect(page.locator(".seat-number").first()).toBeVisible();
        await page.locator('.seat-number').first().click({ delay: getRandomDelay() });
        await page.waitForTimeout(8000);
    }

    await expect(page.getByRole('button', { name: copys[idioma].pagar, exact: true })).toBeVisible()
    await page.getByRole('button', { name: copys[idioma].pagar, exact: true }).click({ delay: getRandomDelay() });
    await page.waitForTimeout(5000);

    return false;
}