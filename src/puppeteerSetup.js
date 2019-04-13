import puppeteer from "puppeteer";

const TIMEOUT = 90 * 1000;

export const puppeteerInit = async () => {
  const browser = await puppeteer.launch({ headless: !process.env.DEBUG_MODE });
  const page = await browser.newPage();

  //Hook Into Headless Browser Console Message
  page.on("console", consoleObj => {
    const msg = consoleObj.text();
    const isUserDefinedMessage = msg.slice(0, 2) == "GM";
    if (isUserDefinedMessage) console.log(msg);
  });

  page.setDefaultTimeout(TIMEOUT);
  return { browser, page };
};
