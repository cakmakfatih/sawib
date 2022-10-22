class Tokens {
  static browserRepository = Symbol.for("repository.browser");
  static launchBrowser = Symbol.for("usecase.launchBrowser");
  static newPage = Symbol.for("usecase.newPage");
  static botRepository = Symbol.for("repository.bot");
  static newBot = Symbol.for("usecase.newBot");
  static createPages = Symbol.for("usecase.createPages");
  static launchBotController = Symbol.for("usecase.launchBotController");
  static scraperRepository = Symbol.for("repository.scraper");
  static scraperLocalDataSource = Symbol.for("localdatasource.scraper");
  static getScraperConfig = Symbol.for("usecase.getScraperConfig");
  static loginToPartsCheck = Symbol.for("usecase.loginToPartsCheck");
  static savePartNumbersAsCsv = Symbol.for("usecase.savePartNumbersAsCsv");
  static scrapePartNumbers = Symbol.for("usecase.scrapePartNumbers");
  static setScraperConfig = Symbol.for("usecase.setScraperConfig");
  static logger = Symbol.for("core.logger");
  static log4js = Symbol.for("external.log4js");
  static firefox = Symbol.for("external.firefox");
  static electronStore = Symbol.for("external.electronStore");
  static fs = Symbol.for("external.fs");
}

export default Tokens;
