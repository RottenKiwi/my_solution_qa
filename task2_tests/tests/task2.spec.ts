import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
import dotenv from 'dotenv';

// Use playwright-extra and apply stealth plugin
chromium.use(StealthPlugin());

// Load environment variables from .env file
dotenv.config();

// Configuration object loaded from environment variables
const config = {
    loginUrl: process.env.LOGIN_URL || '',
    email: process.env.EMAIL || '',
    password: process.env.PASSWORD || '',
    pageTimeout: parseInt(process.env.PAGE_TIMEOUT || '60000'),
    walletAddress: process.env.WALLET_ADDRESS || '',
    apiUrl: process.env.API_URL || '',
    apiKey: process.env.API_KEY || ''
};



const performLogin = async (page: Page, email: string, password: string) => {
    // Handle cookie popup if it exists
    await page.click('#cookiescript_accept', { timeout: 2000 }).catch(() => {
        console.log('Cookie popup not found, continuing...');
    });

    // Fill email
    await page.fill('#admin-login-email', email);
    await page.waitForTimeout(1500); // Add a 1.5-second delay

    // Fill password
    await page.fill('#admin-login-password', password);
    await page.waitForTimeout(1500); // Add a 1.5-second delay

    // Scroll down to view the login button
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000); // Add a 1-second delay before clicking login

    // Click login button
    await page.click('button[type="submit"]');
    await page.waitForTimeout(700); // Add a 0.7-second delay after clicking login

    // Loop for up to 40 retries if login is not successful
    for (let i = 0; i < 40; i++) {
        // Scroll down and add delay before retrying
        await page.evaluate(() => window.scrollBy(0, 400));
        await page.waitForTimeout(3000); // Add a 3-second delay between each attempt

        // Check if we are already on the dashboard (look for a dashboard-specific element)
        const dashboardCheck = page.locator('span[data-testid="test-typography"]');

        if (await dashboardCheck.isVisible()) {
            console.log('Successfully logged in and verified the dashboard element.');
            break; // Exit the loop if dashboard is detected
        }

        // If login is unsuccessful, retry clicking the login button
        const loginButton = page.locator('button[type="submit"]');
        if (await loginButton.isVisible()) {
            console.log(`Login attempt ${i + 1} failed. Retrying...`);
            await loginButton.click();
            await page.waitForTimeout(1000); // Additional delay after retrying
        } else {
            console.log('Login button not visible. Checking if we are on the dashboard...');
        }
    }
};

// Function to reveal the API key
const revealApiKey = async (page: Page) => {
    // Click the button to reveal the API key
    const revealButton = page.locator('button[data-testid="mui-button"]').nth(1); // Adjust the index based on the position of the button
    if (await revealButton.isVisible()) {
        await revealButton.click();
        await page.waitForTimeout(1000); // Wait for the API key to be revealed
    } else {
        console.error('Reveal button not visible.');
    }
};

// Wrapper function to log request details and make the API call
const fetchNFTsWithLogging = async (url: string, apiKey: string) => {
    console.log('Request URL:', url);
    console.log('Request Headers:', {
        'accept': 'application/json',
        'X-API-Key': apiKey
    });

    try {
        const response = await axios.get(url, {
            headers: {
                'accept': 'application/json',
                'X-API-Key': apiKey
            }
        });
        console.log('Response Code:', response.status);
        console.log('Response Data:', response.data);

    } catch (error) {
        if (error.response) {
            // Log only the status code from the error response
            console.error('Error fetching NFTs. Response Code:', error.response.status);
        } else {
            console.error('Error fetching NFTs:', error);
        }
    }
};

test('Successful Admin Login, Fetch API Key, and Retrieve NFTs', async () => {
    let browser: Browser | undefined;
    let context: BrowserContext | undefined;
    let page: Page | undefined;

    browser = await chromium.launch({ headless: false }) as unknown as Browser;
    context = await browser.newContext();
    page = await context.newPage();

    // Navigate to the login page
    await page.goto(config.loginUrl);

    // Small delay to simulate real user interaction
    await page.waitForTimeout(1000);

    // Perform login
    await performLogin(page, config.email, config.password);

    console.log('AFTER LOOP');

    // Reveal the API key if necessary
    await revealApiKey(page);

    // Fetch the API key from the input element
    const apiKey = await page.evaluate(() => {
        const apiKeyInput = document.querySelector('input[type="text"]');
        return apiKeyInput ? apiKeyInput.getAttribute('value') : null;
    });

    console.log('API Key:', apiKey);

    if (apiKey) {
        // Construct the API URL for fetching NFTs
        const nftUrl = `${config.apiUrl}/${config.walletAddress}/nft?chain=eth&format=decimal&media_items=false`;

        // Fetch NFTs using the API key with logging
        await fetchNFTsWithLogging(nftUrl, apiKey);
    } else {
        console.error('Failed to retrieve API key.');
    }

    // Optionally wait for additional actions
    await page.waitForTimeout(10000);

    // Clean up
    await page.close();
    await context.close();
    await browser.close();
});

// Negative test case for handling bad requests
test('Handle Bad Request for NFTs', async () => {
    let browser: Browser | undefined;
    let context: BrowserContext | undefined;
    let page: Page | undefined;

    browser = await chromium.launch({ headless: false }) as unknown as Browser;
    context = await browser.newContext();
    page = await context.newPage();

    // Navigate to the login page
    await page.goto(config.loginUrl);

    // Small delay to simulate real user interaction
    await page.waitForTimeout(1000);

    // Perform login
    await performLogin(page, config.email, config.password);

    // Reveal the API key if necessary
    await revealApiKey(page);

    // Fetch the API key from the input element
    const apiKey = await page.evaluate(() => {
        const apiKeyInput = document.querySelector('input[type="text"]');
        return apiKeyInput ? apiKeyInput.getAttribute('value') : null;
    });

    if (apiKey) {
        // Construct an incorrect API URL for bad request
        const badRequestUrl = `${config.apiUrl}/incorrect_wallet_address/nft?chain=eth&format=decimal&media_items=false`;

        // Fetch NFTs using the incorrect API URL with logging
        console.log('Fetching NFTs with bad request URL...');
        await fetchNFTsWithLogging(badRequestUrl, apiKey);
    } else {
        console.error('Failed to retrieve API key.');
    }

    // Optionally wait for additional actions
    await page.waitForTimeout(10000);

    // Clean up
    await page.close();
    await context.close();
    await browser.close();
});
