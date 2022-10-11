class Tokens {
  static browserRepository = Symbol.for("repository.browser");
  static launchBrowser = Symbol.for("usecase.launchBrowser");
  static newPage = Symbol.for("usecase.newPage");
  static botRepository = Symbol.for("repository.bot");
  static newBot = Symbol.for("usecase.newBot");
  static createPages = Symbol.for("usecase.createPages");
  static logger = Symbol.for("core.logger");
  static log4js = Symbol.for("external.log4js");
  static firefox = Symbol.for("external.firefox");
  static electronStore = Symbol.for("external.electronStore");
}

export default Tokens;
