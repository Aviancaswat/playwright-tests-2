import { Page } from 'playwright';
import { test, expect, webkit, chromium } from '@playwright/test';
import { departureFlights } from './departureFlights';
import { returnFlights } from './returnFlights';
import { tripSummary } from './tripSummary';

export async function booking(page: Page, takeScreenshot: any): Promise<boolean> {
   const getRandomDelay = () => Math.floor(Math.random() * 500 + 300);

    await page.waitForSelector('#pageWrap');
    await page.waitForSelector('.journey_price_fare-select_label-text');
    await expect(page.locator(".journey_price_fare-select_label-text").first()).toBeVisible();
    await page.locator('.journey_price_fare-select_label-text').first().click({ delay: getRandomDelay() });
    await page.waitForSelector(".journey_fares");
    await page.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click({ delay: getRandomDelay() });
    await takeScreenshot('09-seleccion-vuelo-ida');

    await page.waitForTimeout(1500);
    const isVisibleModal = await page.locator("#FB310").first().isVisible();

    if (isVisibleModal) {
        await expect(page.locator(".cro-button.cro-no-accept-upsell-button")).toBeVisible();
        await page.locator(".cro-button.cro-no-accept-upsell-button").first().click({ delay: getRandomDelay() });
    }

    await page.waitForSelector("#journeysContainerId_1", { timeout: 15000 });
    const containerVuelta = page.locator("#journeysContainerId_1");
    await expect(containerVuelta).toBeVisible();
    await containerVuelta.locator(".journey_price_fare-select_label-text").first().click({ delay: getRandomDelay() });
    await takeScreenshot('13-seleccion-vuelo-regreso');
    await containerVuelta.locator('.journey_fares').first().locator('.light-basic.cro-new-basic-button').click({ delay: getRandomDelay() });
    await page.waitForTimeout(1500);

    const isVisibleModal2 = await page.locator("#FB310").first().isVisible();

    if (isVisibleModal2) {
        await expect(page.locator(".cro-button.cro-no-accept-upsell-button")).toBeVisible();
        await page.locator(".cro-button.cro-no-accept-upsell-button").first().click({ delay: getRandomDelay() });
    }
    await takeScreenshot('13-resumen-de-vuelos-seleccionados');

    await page.waitForSelector(".trip-summary");
    const buttonConfirmResumen = page.locator(".button.page_button.btn-action");
    await expect(buttonConfirmResumen).toBeVisible();
    buttonConfirmResumen.scrollIntoViewIfNeeded();
    await buttonConfirmResumen.click({ delay: getRandomDelay() });

    return false;
}