import puppeteer from "puppeteer";
import stringVoke from "./utils/stringVoke";

const TIMEOUT = 90 * 1000;

export const initializeBrowser = async () => {
  const browser = await puppeteer.launch({ headless: !process.env.DEBUG_MODE });
  const page = await browser.newPage();
  const closeBrowser = async () => {
    await browser.close();
    await page.close();
  };
  // Hook Into Headless Browser Console Message
  page.on("console", consoleObj => {
    const msg = consoleObj.text();
    const isUserDefinedMessage = msg.slice(0, 2) == "GM";
    if (isUserDefinedMessage) console.log(msg);
  });

  const injectScript = greaseMonkeyScript => {
    page.on("domcontentloaded", () =>
      page.addScriptTag({
        content: stringVoke(greaseMonkeyScript, {
          runInDebugMode: process.env.DEBUG_MODE
        })
      })
    );
  };

  page.setDefaultTimeout(TIMEOUT);
  return { browser, page, closeBrowser, injectScript };
};
