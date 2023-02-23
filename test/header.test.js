/* Test to make sure that the Header of our application
  appears and responds the way we expect.
*/

const puppeteer = require("puppeteer");
let browser, page;

/**
 * Gets executed before every single test
 */
beforeEach(async () => {
  /*
    Browser is the whole program or window
    Page is like a single tab running inside the browser

    Always run puppeteer operations asynchronously
  */
  browser = await puppeteer.launch({
    headless: false,
  });

  page = await browser.newPage();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await browser.close();
});

test("Check if logo appears", async () => {
  const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(text).toEqual("Blogster");
});
