import { Page } from 'playwright';

export async function acceptCookies(page: Page, getRandomDelay: any): Promise<boolean> {

    const consentBtn = page.locator('#onetrust-pc-btn-handler');

    if (await consentBtn.isVisible()) {
        await page.waitForSelector("#onetrust-pc-btn-handler");
        await consentBtn.click();
        await page.locator('.save-preference-btn-handler.onetrust-close-btn-handler').click({ delay: getRandomDelay() });
    }
    return false;
}