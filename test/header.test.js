/* Test to make sure that the Header of our application
  appears and responds the way we expect.
*/

const { userFactory } = require("./factories/userFactory");
const { sessionFactory } = require("./factories/sessionFactory");
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
  const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(text).toEqual("Blogster");
});

test("Clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows logout button", async () => {
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);

  await page.setCookie({ name: "session", value: session });
  await page.setCookie({ name: "session.sig", value: sig });

  // Refresh page
  await page.goto("http://localhost:3000");

  // Wait until the element appears
  await page.waitForSelector('a[href="/auth/logout"]');

  // Get the element
  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);
  expect(text).toEqual("Logout");
});
