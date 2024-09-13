import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';

// Use playwright-extra and apply stealth plugin
chromium.use(StealthPlugin());

// Configuration object
const config = {
    loginUrl: 'https://admin.moralis.io',
    email: 'yonatanhornstein@gmail.com',
    password: '04510451qQ',
    incorrectEmail: 'incorrectemail@example.com',
    incorrectPassword: 'incorrectpassword',
    pageTimeout: 60000, // 1 minute timeout for page actions
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY3ODc2YzY3LWU2NTktNGIyNS1hYzdhLTY3ZjMwZGE4OTA5ZCIsIm9yZ0lkIjoiNDA4MDQ4IiwidXNlcklkIjoiNDE5Mjg4IiwidHlwZUlkIjoiOTEyNjI4Y2QtMzdmZi00NmU5LTlmYjItMGYxZjQ1MzJiZDNkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjYwNjQ0MTgsImV4cCI6NDg4MTgyNDQxOH0.jbE8W2QNp01k3gWmJt9J-4nHw_4asIEkogQWz7ONyc8'
};

// Helper function to execute RPC methods
const executeRpcMethod = async (url: string, method: string, params: any[] = []) => {
    try {
        const response = await axios.post(url, {
            jsonrpc: '2.0',
            method,
            params,
            id: 1
        });
        console.log(`Response from ${method}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error executing ${method}:`, error);
        return null;
    }
};

// Helper function to perform login
const performLogin = async (page: Page, email: string, password: string) => {
    // Scroll down to view the elements
    await page.evaluate(() => window.scrollBy(0, 400));

    // Handle cookie popup if it exists
    await page.click('#cookiescript_accept', { timeout: 2000 }).catch(() => {
        console.log('Cookie popup not found, continuing...');
    });

    // Fill email
    await page.fill('#admin-login-email', email);
    await page.waitForTimeout(1000); // Add small delay between steps

    // Fill password
    await page.fill('#admin-login-password', password);
    await page.waitForTimeout(1000); // Add small delay between steps

    // Scroll down to the bottom of the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000); // Small delay before clicking login

    // Click login button
    await page.click('button[type="submit"]');

    // Wait 0.7 seconds
    await page.waitForTimeout(700);

    // Loop for 10 tries if login is not successful
    for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(2200); // 2.2 seconds delay between each attempt

        // Check if the "Welcome Jonathan Hornstein 👋" element is visible
        const welcomeElement = page.locator('span[data-testid="test-typography"]', { hasText: 'Welcome Jonathan Hornstein 👋' });

        if (await welcomeElement.isVisible()) {
            console.log('Successfully logged in and verified the welcome element.');
            break; // Exit the loop if login is successful
        } else {
            // If the welcome element is not visible, try clicking the login button again
            const loginButton = page.locator('button[type="submit"]');
            if (await loginButton.isVisible()) {
                console.log(`Login attempt ${i + 1} failed. Retrying...`);
                await loginButton.click();
            } else {
                // If the login button is no longer visible, assume we are on the dashboard
                console.log('Login button not visible. Checking if we are on the dashboard...');
                break;
            }
        }
    }
};

test('Admin Login and Node Management', async () => {
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

    // Click on the Nodes button after the loop
    const nodesButton = page.locator('button[title="Nodes"]');
    if (await nodesButton.isVisible()) {
        console.log('Clicking the Nodes button...');
        await nodesButton.click();
        console.log('Nodes button clicked.');
    } else {
        console.log('Nodes button not visible.');
    }

    await page.waitForTimeout(10200); // 10.2 seconds delay after clicking the Nodes button

    // Check if there are any existing nodes
    const nodeLocator = page.locator('p._subtitle_1xepc_444');
    if (await nodeLocator.isVisible()) {
        console.log('Nodes are present. Deleting existing nodes...');

        // Click the drop-down to reveal delete options
        const dropdownButton = page.locator('button[aria-controls="control-string"]');
        if (await dropdownButton.isVisible()) {
            await dropdownButton.click();
            console.log('Clicked drop-down to reveal delete options.');
        } else {
            console.log('Drop-down button not visible.');
        }

        await page.waitForTimeout(2000); // Wait for drop-down animation

        // Click the trash icon to delete using XPath
        const trashButton = page.locator('xpath=//*[@id="string"]/div/div/div/div/div/div[1]/button[2]');
        if (await trashButton.isVisible()) {
            await trashButton.click();
            console.log('Clicked trash icon to delete node.');
        } else {
            console.log('Trash button not visible.');
        }

        await page.waitForTimeout(2000); // Wait for animation

        // Confirm delete
        const confirmDeleteButton = page.locator('button[data-testid="mui-button-destructive"]');
        if (await confirmDeleteButton.isVisible()) {
            await confirmDeleteButton.click();
            console.log('Confirmed node deletion.');
        } else {
            console.log('Confirm delete button not visible.');
        }

        await page.waitForTimeout(2000); // Wait for confirmation

        // Wait until the node deletion is confirmed
        await page.waitForSelector('span[data-testid="test-typography"]', { hasText: 'You don’t have any Nodes yet' });
        console.log('No nodes present after deletion.');
    } else {
        console.log('No existing nodes found.');
    }

    // Create a new node using XPath
    const createNodeButton = page.locator('xpath=//*[@id="main_top"]/main/div/div[1]/div[2]/button');
    if (await createNodeButton.isVisible()) {
        await createNodeButton.click();
        console.log('Clicked create new node button.');
    } else {
        console.log('Create node button not visible.');
    }

    // Select platform dropdown option "Ethereum"
    const platformDropdown = page.locator('select#select-protoccol');
    if (await platformDropdown.isVisible()) {
        await platformDropdown.selectOption({ value: 'Ethereum' });
        console.log('Selected "Ethereum" from the platform dropdown.');
    } else {
        console.log('Platform dropdown not visible.');
    }

    // Select network dropdown option "Sepolia"
    const networkDropdown = page.locator('select#select-network');
    if (await networkDropdown.isVisible()) {
        await networkDropdown.selectOption({ value: '0xaa36a7-Sepolia' });
        console.log('Selected "Sepolia" from the network dropdown.');
    } else {
        console.log('Network dropdown not visible.');
    }

    // Click the "Create Node" button using XPath
    const createNodeSubmitButton = page.locator('xpath=//*[@id=":rt:"]/footer/div/button');
    if (await createNodeSubmitButton.isVisible()) {
        await createNodeSubmitButton.click();
        console.log('Clicked "Create Node" button.');
    } else {
        console.log('"Create Node" button not visible.');
    }

    // Wait for 5 seconds
    await page.waitForTimeout(5000);

    // Collect and print the endpoints using XPath
    const site1EndpointLocator = page.locator('xpath=/html/body/div[1]/div[5]/div/div/main/main/div/div[2]/section/div/div/div/div/div/div[2]/div[1]/div/div/input');
    const site2EndpointLocator = page.locator('xpath=/html/body/div[1]/div[5]/div/div/main/main/div/div[2]/section/div/div/div/div/div/div[2]/div[3]/div/div/input');

    if (await site1EndpointLocator.isVisible()) {
        const site1Endpoint = await site1EndpointLocator.inputValue();
        console.log('Site 1 endpoint:', site1Endpoint);

        // Get the current block number
        const blockNumberData = await executeRpcMethod(site1Endpoint, 'eth_blockNumber');
        const blockNumber = blockNumberData?.result;
        if (blockNumber) {
            // Fetch block details
            const blockData = await executeRpcMethod(site1Endpoint, 'eth_getBlockByNumber', [blockNumber, true]);
            if (blockData && blockData.result && blockData.result.transactions.length > 0) {
                const transactionHash = blockData.result.transactions[0].hash; // Take the first transaction hash from the block
                console.log('Using transaction hash:', transactionHash);

                await executeRpcMethod(site1Endpoint, 'eth_getTransactionByHash', [transactionHash]);
            } else {
                console.log('No transactions found in the block.');
            }
        } else {
            console.log('Failed to get block number.');
        }
    } else {
        console.log('Site 1 endpoint input not visible.');
    }

    if (await site2EndpointLocator.isVisible()) {
        const site2Endpoint = await site2EndpointLocator.inputValue();
        console.log('Site 2 endpoint:', site2Endpoint);

        // Get the current block number
        const blockNumberData = await executeRpcMethod(site2Endpoint, 'eth_blockNumber');
        const blockNumber = blockNumberData?.result;
        if (blockNumber) {
            // Fetch block details
            const blockData = await executeRpcMethod(site2Endpoint, 'eth_getBlockByNumber', [blockNumber, true]);
            if (blockData && blockData.result && blockData.result.transactions.length > 0) {
                const transactionHash = blockData.result.transactions[0].hash; // Take the first transaction hash from the block
                console.log('Using transaction hash:', transactionHash);

                await executeRpcMethod(site2Endpoint, 'eth_getTransactionByHash', [transactionHash]);
            } else {
                console.log('No transactions found in the block.');
            }
        } else {
            console.log('Failed to get block number.');
        }
    } else {
        console.log('Site 2 endpoint input not visible.');
    }

    // Clean up
    await page.close();
    await context.close();
    await browser.close();
});

test('Incorrect Login Test', async () => {
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

    // Scroll down to view the elements
    await page.evaluate(() => window.scrollBy(0, 400));

    // Handle cookie popup if it exists
    await page.click('#cookiescript_accept', { timeout: 2000 }).catch(() => {
        console.log('Cookie popup not found, continuing...');
    });

    // Perform login with incorrect credentials
    await page.fill('#admin-login-email', config.incorrectEmail);
    await page.waitForTimeout(1000);
    await page.fill('#admin-login-password', config.incorrectPassword);

    await page.waitForTimeout(1000);

    // Scroll down to the bottom of the page
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(1000); // Small delay before clicking login

    // Click login button
    await page.click('button[type="submit"]');

    // Wait 0.7 seconds
    await page.waitForTimeout(700);

    // Loop for 10 tries if login is not successful
    for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(2200); // 2.2 seconds delay between each attempt

        // Get all elements with the error message class
        const errorMessages = page.locator('p._message_1mjxr_522');
        const messageCount = await errorMessages.count();

        let unauthorizedFound = false;

        for (let j = 0; j < messageCount; j++) {
            const messageText = await errorMessages.nth(j).textContent();
            if (messageText && messageText.includes('Unauthorized')) {
                console.log('Unauthorized error message found.');
                unauthorizedFound = true;
                break; // Exit the loop if "Unauthorized" message is found
            }
        }

        if (unauthorizedFound) {
            break; // Exit the outer loop if "Unauthorized" message is found
        } else {
            console.log(`Attempt ${i + 1}: Unauthorized message not found.`);
        }

        // Try logging in again
        await page.click('button[type="submit"]');
    }

    // Clean up
    await page.close();
    await context.close();
    await browser.close();
});
