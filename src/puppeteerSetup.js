import puppeteer from "puppeteer";

const TIMEOUT = 90 * 1000;

export const puppeteerInit = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(TIMEOUT);
  return { browser, page };
};
