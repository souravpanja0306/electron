const puppeteer = require("puppeteer");

let browser;

const getBrowser = async () => {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-extensions'
            ]
        });
        
        // Handle browser disconnect
        browser.on('disconnected', () => {
            browser = null;
        });
    }
    return browser;
};

const closeBrowser = async () => {
    if (browser) {
        await browser.close();
        browser = null;
    }
};

module.exports = { getBrowser, closeBrowser };
