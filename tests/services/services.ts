import { Page } from 'playwright';
import { test, expect, webkit, chromium } from '@playwright/test';


export async function services(page: Page, takeScreenshot: any): Promise<boolean> {
    const getRandomDelay = () => Math.floor(Math.random() * 500 + 300);

    await page.waitForSelector(".main-banner--section-offer");
    await page.waitForTimeout(8000);
    await takeScreenshot("Pagina-de-servicios");
    await expect(page.locator("#serviceButtonTypeBusinessLounge")).toBeVisible();
    await page.waitForSelector("#serviceButtonTypeBusinessLounge");
    await page.locator('#serviceButtonTypeBusinessLounge').click({ delay: getRandomDelay() });
    await page.waitForSelector(".service_item_button.button");
    await page.locator('.service_item_button.button').first().click({ delay: getRandomDelay() });
    await takeScreenshot("Servicio avianca-lounges");
    await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: getRandomDelay() });

    await expect(page.locator('#serviceButtonTypeSpecialAssistance')).toBeVisible();
    await page.waitForSelector("#serviceButtonTypeSpecialAssistance");
    await page.locator('#serviceButtonTypeSpecialAssistance').click({ delay: getRandomDelay() });
    await takeScreenshot("Servicio asistencia especial");
    await page.waitForSelector(".service_item_button.button");
    await page.locator('.service_item_button.button').first().click({ delay: getRandomDelay() });
    await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: getRandomDelay() });

    await expect(page.locator('.services-card_action_button.button').last()).toBeVisible();
    await takeScreenshot("Asistencia en viaje");
    await page.waitForSelector(".services-card_action_button.button");
    await page.locator('.services-card_action_button.button').last().click({ delay: getRandomDelay() });
    await page.waitForSelector(".button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton");
    await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton').click({ delay: getRandomDelay() });
    await takeScreenshot("Servicios añadidos");
    await expect(page.locator(".button_label").last()).toBeVisible();
    await page.locator('.button_label').last().click({ delay: getRandomDelay() });

    const upsellService = await page.locator('.terciary-button').last().isVisible()
    if (upsellService) {
        await page.locator('.terciary-button').last().click({ delay: getRandomDelay() })
    }


    return false;
}