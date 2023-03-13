const puppeteer = require("puppeteer");
const { sessionFactory } = require("../factories/sessionFactory");
const { userFactory } = require("../factories/userFactory");

class CustomPage {
  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });

    // Refresh and go to blogs page
    await this.page.goto("http://localhost:3000/blogs");

    // Wait until the element appears
    await this.page.waitForSelector('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  async get(path) {
    return this.page.evaluate(async (_path) => {
      return fetch(_path, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    }, path);
  }

  async post(path, data) {
    return this.page.evaluate(
      async (_path, _data) => {
        return fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_data),
        }).then((res) => res.json());
      },
      path,
      data
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }

  static async build() {
    const browser = await puppeteer.launch({
      headless: ["production", "ci"].includes(process.env.NODE_ENV)
        ? true
        : false,
      args: ["production", "ci"].includes(process.env.NODE_ENV)
        ? ["--no-sandbox"]
        : [""],
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: (target, property, receiver) => {
        if (target[property]) {
          return target[property];
        }

        let value = browser[property];
        if (value instanceof Function) {
          return function (...args) {
            return value.apply(this === receiver ? browser : this, args);
          };
        }

        value = page[property];
        if (value instanceof Function) {
          return function (...args) {
            return value.apply(this === receiver ? page : this, args);
          };
        }

        return value;
      },
    });
  }
}

module.exports = CustomPage;
