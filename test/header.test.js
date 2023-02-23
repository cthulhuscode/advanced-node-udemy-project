/* Test to make sure that the Header of our application
  appears and responds the way we expect.
*/

const puppeteer = require("puppeteer");

test("Adds two numbers", () => {
  const sum = 1 + 2;

  expect(sum).toEqual(3);
});

test("Launch a browser", async () => {
  /*
    Browser is the whole program or window
    Page is like a single tab running inside the browser

    Always run puppeteer operations asynchronously
  */
  const browser = await puppeteer.launch({
    headless: false,
  });    
    await page.goto("http://localhost:3000");
});
