import Logger from '../../../../../../main/core/Logger';
import sinon, { stubInterface } from 'ts-sinon';
import ScraperRepositoryImpl, { SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE, SCRAPER_LAUNCH_BROWSER_WARNING_MESSAGE, SCRAPER_NEW_BOT_WARNING_MESSAGE, SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE } from '../../../../../../main/features/scraper/data/repositories/ScraperRepositoryImpl';
import ScraperLocalDataSource from '../../../../../../main/features/scraper/data/datasources/ScraperLocalDataSource';
import { deepEqual, equal, ok } from 'assert';
import { ScrapePartNumberParams } from '../../../../../../main/features/scraper/domain/usecases/ScrapePartNumber';
import { BotFailure, BrowserFailure, ScraperFailure } from '../../../../../../main/core/error/failures';
import { Left, Right } from '@typed-f/either';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import { Page } from 'playwright-firefox';

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

const pageGoToStub = sinon.stub();

mockPage.goto = pageGoToStub;

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

    beforeAll(() => {
      loginToPartsCheckStub = sinon.stub(repository, "loginToPartsCheck");
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
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));
      loginToPartsCheckStub.resolves(new Right(true));

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
  });
});
