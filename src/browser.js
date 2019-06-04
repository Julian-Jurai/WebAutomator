import puppeteer from "puppeteer";
import stringVoke from "./utils/stringVoke";

export const createBrowser = async () => {
  const TIMEOUT = 60 * 1000;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const closeBrowser = async () => {
    for (let page of await browser.pages()) {
      await page.close();
    }
    await browser.close();
  };

  // Hook Into Headless Browser Console Message
  page.on("console", consoleObj => {
    const msg = consoleObj.text();
    const isUserDefinedMessage = msg.slice(0, 2) == "GM";
    if (isUserDefinedMessage) console.log(msg);
  });

  const onPageLoadInjectScript = greaseMonkeyScript => {
    page.on("domcontentloaded", () =>
      page.addScriptTag({
        content: stringVoke(greaseMonkeyScript, {
          runInDebugMode: process.env.DEBUG_MODE
        })
      })
    );
  };

  const visit = url => page.goto(url, { waitUntil: "networkidle2" });

  const waitUntil = async url =>
    await browser.waitForTarget(target => target.url() === url, {
      timeout: TIMEOUT
    });

  page.setDefaultTimeout(TIMEOUT);

  return {
    browser,
    page,
    visit,
    closeBrowser,
    onPageLoadInjectScript,
    waitUntil
  };
};
