const puppeteer = require("puppeteer");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return (
      new Proxy(customPage, {
        get(target, property, receiver) {
          if (target[property]) {
            return target[property];
          }

          const value = page[property];
          if (value instanceof Function) {
            return function (...args) {
              return value.apply(this === receiver ? page : this, args);
            };
          }

          return value;
        },
      }) instanceof CustomPage && page
    );
  }

  constructor(page) {
    this.page = page;
  }
}

module.exports = CustomPage;
