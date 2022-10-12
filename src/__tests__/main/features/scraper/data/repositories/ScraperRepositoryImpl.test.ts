import Logger from '../../../../../../main/core/Logger';
import sinon, { stubInterface } from 'ts-sinon';
import ScraperRepositoryImpl, { PARTS_CHECK_LOGIN_URL, SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE, SCRAPER_ELEMENT_HANDLES_FAILURE, SCRAPER_GET_ATTRIBUTE_FAILURE, SCRAPER_LAUNCH_BROWSER_WARNING_MESSAGE, SCRAPER_NEW_BOT_WARNING_MESSAGE, SCRAPER_PAGE_CLICK_FAILURE, SCRAPER_PAGE_FILL_FAILURE, SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, SCRAPER_PAGE_WAIT_FOR_FAILURE, Selectors } from '../../../../../../main/features/scraper/data/repositories/ScraperRepositoryImpl';
import ScraperLocalDataSource from '../../../../../../main/features/scraper/data/datasources/ScraperLocalDataSource';
import { deepEqual, equal, ok } from 'assert';
import { ScrapePartNumberParams } from '../../../../../../main/features/scraper/domain/usecases/ScrapePartNumber';
import { BotFailure, BrowserFailure, ScraperFailure } from '../../../../../../main/core/error/failures';
import { Left, Right } from '@typed-f/either';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import { Page, Locator } from 'playwright-firefox';
import jsdom from 'jsdom';
import ScraperConfig from '../../../../../../main/features/scraper/domain/entities/ScraperConfig';

const document = new jsdom.JSDOM().window.document;

const mockLogger = stubInterface<Logger>();
const mockLocalDataSource = stubInterface<ScraperLocalDataSource>();
const mockLaunchBrowser = sinon.stub();
const mockNewBot = sinon.stub();

const mockStealthBrowser = stubInterface<StealthBrowser>();
const mockBotController = new BotController(mockStealthBrowser);

const mockBotControllerInitialize = sinon.stub(mockBotController, "initialize");

const closeBrowserSpy = sinon.spy();
const closeContextSpy = sinon.spy();

const mockPage: Page = stubInterface<Page>();

const mockLocator: Locator = stubInterface<Locator>();

const elementHandlesStub = sinon.stub();
const waitForStub = sinon.stub();

mockLocator.elementHandles = elementHandlesStub;
mockLocator.waitFor = waitForStub;

const pageGoToStub = sinon.stub();
const pageCloseStub = sinon.stub();
const pageLocatorStub = sinon.stub();
const pageFillStub = sinon.stub();
const pageClickStub = sinon.stub();

mockPage.close = pageCloseStub;
mockPage.goto = pageGoToStub;
mockPage.locator = pageLocatorStub;
mockPage.fill = pageFillStub;
mockPage.click = pageClickStub;

mockBotController.pages = [mockPage];
mockStealthBrowser.browser.close = closeBrowserSpy;
mockStealthBrowser.context.close = closeContextSpy;

const repository = new ScraperRepositoryImpl(
  mockLogger,
  mockLocalDataSource,
  mockLaunchBrowser,
  mockNewBot,
);

describe("ScraperRepository", () => {
  describe("scrapePartNumber", () => {
    let loginToPartsCheckStub: sinon.SinonStub;
    let savePartNumbersAsCsv: sinon.SinonStub;

    beforeAll(() => {
      loginToPartsCheckStub = sinon.stub(repository, "loginToPartsCheck");
      savePartNumbersAsCsv = sinon.stub(repository, "savePartNumbersAsCsv");
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      mockLaunchBrowser.resetHistory();
      mockNewBot.resetHistory();
      closeBrowserSpy.resetHistory();
      closeContextSpy.resetHistory();
      mockBotControllerInitialize.resetHistory();
      loginToPartsCheckStub.resetHistory();
      pageGoToStub.resetHistory();
      pageLocatorStub.resetHistory();
      elementHandlesStub.resetHistory();
      savePartNumbersAsCsv.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);
      savePartNumbersAsCsv.returns(new Right(true));

      // act
      const params: ScrapePartNumberParams = "12356";
      await repository.scrapePartNumber(params);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [launchBrowser] and return [Failure] if result is [Left]", async () => {
      // arrange
      const err = new Error("test-err");
      const browserFailure = new BrowserFailure("failed launching", err);
      mockLaunchBrowser.resolves(new Left(browserFailure));

      // act
      const result = await repository.scrapePartNumber("test-url");

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_LAUNCH_BROWSER_WARNING_MESSAGE));
      ok(mockLaunchBrowser.calledOnceWith());
      deepEqual(result, new Left(browserFailure));
    });

    it("should call [newBot] with correct params and return [Failure] if result is [Left] and dispose browser", async () => {
      // arrange
      const err = new Error("test-err");
      const botFailure = new BotFailure("failed creating a bot", err);
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Left(botFailure));

      // act
      const result = await repository.scrapePartNumber("test-url");

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_NEW_BOT_WARNING_MESSAGE));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      ok(mockNewBot.calledOnceWith(mockStealthBrowser));
      deepEqual(result, new Left(botFailure));
    });

    it("should call [BotController.initialize] and return [Failure] if result is [Left]", async () => {
      // arrange
      const err = new Error("test-err");
      const botFailure = new BotFailure("failed creating pages", err);
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Left(botFailure));

      // act
      const result = await repository.scrapePartNumber("test-url");

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      ok(mockBotControllerInitialize.calledOnceWith());
      deepEqual(result, new Left(botFailure));
    });

    it("should call [loginToPartsCheck] with correct params", async () => {
      // arrange
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.scrapePartNumber("test-url");

      // assert
      ok(loginToPartsCheckStub.calledOnceWith(mockBotController.pages[0]));
    });

    it("should dispose and return [Failure] if [loginToPartsCheck] fails", async () => {
      // arrange
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));

      const err = new Error("scraper err");
      const scraperFailure = new ScraperFailure("scraper failure", err);
      loginToPartsCheckStub.resolves(new Left(scraperFailure));

      // act
      const result = await repository.scrapePartNumber("test-url");

      // assert
      deepEqual(result, new Left(scraperFailure));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
    });

    it("should call [goto] with correct URL to Quotes using one of the [controller.pages]", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);

      // act
      await repository.scrapePartNumber(urlToScrape);

      // assert
      ok(pageGoToStub.calledOnceWith(urlToScrape));
    });

    it("should return [ScraperFailure] if navigation to the [page.goto] rejects", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      const err = new Error("err");
      pageGoToStub.rejects(err);

      const failure = new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, err);

      // act
      const result = await repository.scrapePartNumber(urlToScrape);

      // assert
      ok(pageGoToStub.calledOnceWith(urlToScrape));
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(failure.message));
      ok(mockLogger.error.calledWith(err));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Left(failure));
    });

    it("should call [page.locator] on [partNrSelector] to get all elements", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);

      const nodes: Node[] = [];

      const inputCount = Math.floor(Math.random() * 11);

      for (let i = 0; i < inputCount; i++) {
        const examplePartNumInput = document.createElement("input");
        examplePartNumInput.setAttribute("value", `partnum-${i}`);

        nodes.push(examplePartNumInput);
      }

      elementHandlesStub.resolves(nodes);

      // act
      await repository.scrapePartNumber(urlToScrape);

      // assert
      ok(pageLocatorStub.calledWith(Selectors.partNumberInp));
      ok(elementHandlesStub.calledOnceWith());
    });

    it("should call [savePartNumbersAsCsv] with correctly scraped data", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);

      const nodes: Node[] = [];

      const inputCount = Math.floor(Math.random() * 11);

      for (let i = 0; i < inputCount; i++) {
        const examplePartNumInput = document.createElement("input");
        examplePartNumInput.setAttribute("value", `partnum-${i}`);

        nodes.push(examplePartNumInput);
      }

      elementHandlesStub.resolves(nodes);

      const expectedData = [];

      for (let i = 0; i < inputCount; i++) {
        expectedData.push(`partnum-${i}`);
      }

      // act
      await repository.scrapePartNumber(urlToScrape);

      // assert
      ok(savePartNumbersAsCsv.calledOnceWith(expectedData));
    });

    it("should log correctly return a [Failure] if [elementHandles] rejects", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);
      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure(SCRAPER_ELEMENT_HANDLES_FAILURE, err);
      elementHandlesStub.rejects(err);

      // act
      const result = await repository.scrapePartNumber(urlToScrape);

      // assert
      ok(pageLocatorStub.calledWith(Selectors.partNumberInp));
      ok(elementHandlesStub.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(expectedFailure.message));
      ok(mockLogger.error.calledWith(err));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Left(expectedFailure));
    });

    it("should log correctly and return a [Failure] if [element.getAttribute] rejects", async () => {
      // arrange
      const node: HTMLElement = stubInterface<HTMLElement>();
      const getAttributeStub = sinon.stub();
      node.getAttribute = getAttributeStub;

      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);
      const err = new Error("test-err");
      getAttributeStub.rejects(err);
      elementHandlesStub.rejects(err);
      const expectedFailure = new ScraperFailure(SCRAPER_GET_ATTRIBUTE_FAILURE, err);

      const nodes = [
        node,
      ];

      elementHandlesStub.resolves(nodes);

      // act
      const result = await repository.scrapePartNumber(urlToScrape);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(expectedFailure.message));
      ok(mockLogger.error.calledWith(err));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Left(expectedFailure));
    });

    it("should log correctly and return a [Failure] if [scrapePartNumber] throws", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);
      const savePartNumberFailure = new ScraperFailure("test-failure");
      savePartNumbersAsCsv.returns(new Left(savePartNumberFailure));

      // act
      const result = await repository.scrapePartNumber(urlToScrape);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Left(savePartNumberFailure));
    });

    it("should return [Right<true>] if everything ran without an issue and dispose browser", async () => {
      // arrange
      const urlToScrape = "http://v1.partscheck.com.au/appV2/price-quote.php?draftID=9725056&rURL=quotes-incoming.php";
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));
      pageGoToStub.resolves();
      pageLocatorStub.returns(mockLocator);
      elementHandlesStub.resolves([]);
      savePartNumbersAsCsv.returns(new Right(true));
      const expectedResult = true;

      // act
      const result = await repository.scrapePartNumber(urlToScrape);

      // assert
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      deepEqual(result, new Right(expectedResult));
    });

    afterAll(() => {
      loginToPartsCheckStub.restore();
      savePartNumbersAsCsv.restore();
    });
  });

  describe("loginToPartsCheck", () => {
    let getScraperConfigStub: sinon.SinonStub;
    let scraperConfig: ScraperConfig;

    beforeAll(() => {
      getScraperConfigStub = sinon.stub(repository, "getScraperConfig");
      scraperConfig = {
        partsCheckCredentials: {
          username: "test-username",
          password: "test-password",
        },
        partNumberSavePath: "test-path",
      };
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      getScraperConfigStub.resetHistory();
      pageCloseStub.resetHistory();
      pageGoToStub.resetHistory();
      pageFillStub.resetHistory();
      pageClickStub.resetHistory();
      pageLocatorStub.resetHistory();
      waitForStub.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] started."));
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [getScraperConfig] and return [Failure] if it fails, and dispose page", async () => {
      // arrange
      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure("test-failure", err);
      getScraperConfigStub.returns(new Left(expectedFailure));

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(getScraperConfigStub.calledOnceWith());
      ok(pageCloseStub.calledOnceWith());
      deepEqual(result, new Left(expectedFailure));
    });

    it("should call [page.goto] with correct params", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageGoToStub.calledOnceWith(PARTS_CHECK_LOGIN_URL));
    });

    it("should return [ScraperFailure] if navigation to the [page.goto] rejects", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      const err = new Error("err");
      pageGoToStub.rejects(err);

      const failure = new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, err);

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageGoToStub.calledOnceWith(PARTS_CHECK_LOGIN_URL));
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(failure.message));
      ok(mockLogger.error.calledWith(err));
      ok(pageCloseStub.calledOnceWith());
      deepEqual(result, new Left(failure));
    });

    it("should fill [username] & [password] inputs correctly", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageFillStub.calledWith(Selectors.loginUsernameInp, "test-username"));
      ok(pageFillStub.calledWith(Selectors.loginPasswordInp, "test-password"));
      equal(pageFillStub.callCount, 2);
    });

    it("should return [Failure] if [page.fill] rejects", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      const err = new Error("test-err");
      const failure = new ScraperFailure(SCRAPER_PAGE_FILL_FAILURE, err);
      pageFillStub.rejects(err);

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageCloseStub.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(failure.message));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(failure));
    });

    it("should [page.click] with correct params", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageClickStub.calledOnceWith(Selectors.loginBtn));
    });

    it("should return [Failure] if [page.click] rejects", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      const err = new Error("test-err");
      const failure = new ScraperFailure(SCRAPER_PAGE_CLICK_FAILURE, err);
      pageClickStub.rejects(err);

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageCloseStub.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(mockLogger.warn.calledWith(failure.message));
      ok(mockLogger.error.calledWith(err));
      deepEqual(result, new Left(failure));
    });

    it("should call [page.locator] with correct params to locate authentication verification", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      pageLocatorStub.returns(mockLocator);
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(pageLocatorStub.calledOnceWith(Selectors.isLoggedIn));
    });

    it("should call [<locator>.waitForStub] with correct params on authentication verification element", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      pageLocatorStub.returns(mockLocator);
      waitForStub.resolves();

      // act
      await repository.loginToPartsCheck(mockPage);

      // assert
      ok(waitForStub.calledOnceWith({ state: "visible" }));
    });

    it("should log correctly return a [Failure] if [<locator>.waitFor] rejects", async () => {
      // arrange
      getScraperConfigStub.returns(new Right(scraperConfig));
      pageGoToStub.resolves();
      pageFillStub.resolves();
      pageClickStub.resolves();
      pageLocatorStub.returns(mockLocator);

      const err = new Error("test-err");
      const expectedFailure = new ScraperFailure(SCRAPER_PAGE_WAIT_FOR_FAILURE, err);
      waitForStub.rejects(err);

      // act
      const result = await repository.loginToPartsCheck(mockPage);

      // assert
      ok(waitForStub.calledOnceWith({ state: "visible" }));
      ok(pageCloseStub.calledOnceWith());
      ok(mockLogger.info.calledWith("[ScraperRepository.loginToPartsCheck] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(expectedFailure.message));
      ok(mockLogger.error.calledOnceWith(err));
      deepEqual(result, new Left(expectedFailure));
    });

    afterAll(() => {
      getScraperConfigStub.restore();
    });
  });
});
