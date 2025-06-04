import { Page } from 'playwright';
import { test, expect, webkit, chromium } from '@playwright/test';
import { departureFlights } from './departureFlights';
import { returnFlights } from './returnFlights';
import { tripSummary } from './tripSummary';

export async function booking(page: Page, takeScreenshot: any): Promise<boolean> {
   await departureFlights(page, takeScreenshot);
   await returnFlights(page, takeScreenshot);
   await tripSummary(page, takeScreenshot);

    return false;
}