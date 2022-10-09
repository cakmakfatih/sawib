class Tokens {
  static browserRepository = Symbol.for("repository.browser");
  static launchBrowser = Symbol.for("usecase.launchBrowser");
  static newPage = Symbol.for("usecase.newPage");
  static logger = Symbol.for("core.logger");
  static log4js = Symbol.for("external.log4js");
  static firefox = Symbol.for("external.firefox");
}

export default Tokens;
