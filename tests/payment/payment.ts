import { Page } from 'playwright';
import { test, expect, webkit, chromium } from '@playwright/test';


export async function payment(page: Page, takeScreenshot: any): Promise<boolean> {
    const getRandomDelay = () => Math.floor(Math.random() * 500 + 300);

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
    await countryOption.click({ delay: getRandomDelay() });

    await takeScreenshot('19-country-seleccionado');

    // Aceptar Términos
    const termsCheckbox = page.locator('input#terms');
    await expect(termsCheckbox).toBeVisible();
    await termsCheckbox.check();
    await takeScreenshot('20-aceptar-terminos');

    // Captura final de facturación
    await takeScreenshot('21-datos-facturacion');

    return false;
}