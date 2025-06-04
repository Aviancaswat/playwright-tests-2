import { Page } from 'playwright';
import { test, expect, webkit, chromium } from '@playwright/test';

export async function tripSummary(page: Page, takeScreenshot: any): Promise<boolean> {
    const getRandomDelay = () => Math.floor(Math.random() * 500 + 300);

    await takeScreenshot('13-resumen-de-vuelos-seleccionados');

    await page.waitForSelector(".trip-summary");
    const buttonConfirmResumen = page.locator(".button.page_button.btn-action");
    await expect(buttonConfirmResumen).toBeVisible();
    buttonConfirmResumen.scrollIntoViewIfNeeded();
    await buttonConfirmResumen.click({ delay: getRandomDelay() });

    return false;
}