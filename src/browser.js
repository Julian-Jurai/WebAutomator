import puppeteer from "puppeteer";
import stringVoke from "./utils/stringVoke";

export const initializeBrowser = async () => {
  const TIMEOUT = 90 * 1000;
  const browser = await puppeteer.launch({ headless: !process.env.DEBUG_MODE });
  const page = await browser.newPage();

  const closeBrowser = async () => {
    console.log("closing");
    await page.close();
    await browser.close();
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

  const visit = url => page.goto(url);

  const waitUntil = async url =>
    await browser.waitForTarget(target => target.url() === url, {
      timeout: TIMEOUT
    });

  page.setDefaultTimeout(TIMEOUT);

  return { browser, page, visit, closeBrowser, injectScript, waitUntil };
};
