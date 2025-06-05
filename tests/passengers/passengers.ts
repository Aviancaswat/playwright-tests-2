import { Page } from 'playwright';
import { test, expect, webkit, chromium } from '@playwright/test';

export async function passengers(
  page: Page,
  takeScreenshot: any,
  userNamesData: any,
  lastNamesData: any,
  emailsData: any,
  phoneNumbersData: any
): Promise<boolean> {
  const getRandomDelay = () => Math.floor(Math.random() * 500 + 300);

  await page.waitForSelector(".passenger_data_group");
  await takeScreenshot("inicio-de-llenado-pagina-de-pasajeros");

  const setValuesDefaultAutoForm = async () => {
    await page.evaluate(
      ({ userNamesData, lastNamesData, emailsData, phoneNumbersData }) => {
        const getDataRandom = (data: string[] = []): string => {
          return data[Math.floor(Math.random() * data.length)];
        };

        const getValueElement = (element: HTMLInputElement): string => {
          let value: string | null = null;
          if (element.name === "email" || element.name === "confirmEmail") {
            value = getDataRandom(emailsData);
          } else if (element.name === "phone_phoneNumberId") {
            value = getDataRandom(phoneNumbersData);
          } else if (element.id.includes("IdFirstName")) {
            value = getDataRandom(userNamesData);
          } else {
            value = getDataRandom(lastNamesData);
          }
          return value;
        };

        const getButtonAndClickItem = () => {
          const listOptions = document.querySelector(".ui-dropdown_list");
          const buttonElement = listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement;
          buttonElement?.click();
        };

        const elements = document.querySelectorAll('.ui-input');
        Array.from(elements).forEach((element) => {
          if (element.tagName === "BUTTON") {
            const elementButton = element as HTMLButtonElement;
            elementButton.click();
            const listOptions = document.querySelector(".ui-dropdown_list");
            (listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement)?.click();

            if (element.id === "passengerId" || element.id === 'phone_prefixPhoneId') {
              setTimeout(() => {
                elementButton.click();
                getButtonAndClickItem();
              }, 1000);
            } else {
              const checkAccept = document.querySelector('#acceptNewCheckbox') as HTMLButtonElement;
              checkAccept?.click();
              elementButton.click();
              getButtonAndClickItem();
            }
          } else if (element.tagName === "INPUT") {
            const elementInput = element as HTMLInputElement;
            const containers = document.querySelectorAll(".ui-input-container");
            Array.from(containers).forEach(e => e.classList.add("is-focused"));
            const eventBlur = new Event("blur");
            const eventFocus = new Event("focus");
            elementInput.value = getValueElement(elementInput);
            ['change', 'input'].forEach(event => {
              const handleEvent = new Event(event, { bubbles: true });
              elementInput.dispatchEvent(handleEvent);
            });
            elementInput.dispatchEvent(eventFocus);
            setTimeout(() => {
              elementInput.dispatchEvent(eventBlur);
              Array.from(containers).forEach(e => e.classList.remove("is-focused"));
            }, 1000);
          }
        });
      },
      { userNamesData, lastNamesData, emailsData, phoneNumbersData }
    );

    // El resto que necesita acceso a Playwright directamente
    await expect(page.locator('id=email')).toBeVisible();
    await page.locator('id=email').fill('test@gmail.com');

    await expect(page.locator('id=confirmEmail')).toBeVisible();
    await page.locator('id=confirmEmail').fill('test@gmail.com');

    await page.waitForSelector('id=acceptNewCheckbox');
    await expect(page.locator('id=acceptNewCheckbox')).toBeVisible();
    await page.locator('id=acceptNewCheckbox').press('Enter');
  };

  await setValuesDefaultAutoForm();
  await takeScreenshot("llenado-de-pasajeros-ok");

  await page.waitForTimeout(2000);
  await expect(page.locator(".button.page_button.btn-action").last()).toBeVisible();
  await page.locator(".button.page_button.btn-action").last().click({ delay: getRandomDelay() });

  return false;
}