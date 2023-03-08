/* Test to make sure that the Header of our application
  appears and responds the way we expect.
*/
const Page = require("./helpers/page");

let page;

/**
 * Gets executed before every single test
 */
beforeEach(async () => {
  /*
    Browser is the whole program or window
    Page is like a single tab running inside the browser

    Always run puppeteer operations asynchronously
  */
  // browser = await puppeteer.launch({
  //   headless: false,
  // });
  // page = await browser.newPage();

  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  // await browser.close();

  await page.close();
});

test("Check if logo appears", async () => {
  const text = await page.getContentsOf("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("Clicking login starts oauth flow", async () => {
  await page.waitForSelector(".right a");
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows logout button", async () => {
  await page.login();

  // Get the element
  const text = await page.getContentsOf('a[href="/auth/logout"]');
  expect(text).toEqual("Logout");
});
