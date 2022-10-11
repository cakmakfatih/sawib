import Logger from 'main/core/Logger';
import sinon, { stubInterface } from 'ts-sinon';
import ScraperRepositoryImpl, { SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE, SCRAPER_LAUNCH_BROWSER_WARNING_MESSAGE, SCRAPER_NEW_BOT_WARNING_MESSAGE } from '../../../../../../main/features/scraper/data/repositories/ScraperRepositoryImpl';
import ScraperLocalDataSource from '../../../../../../main/features/scraper/data/datasources/ScraperLocalDataSource';
import { deepEqual, equal, ok } from 'assert';
import { ScrapePartNumberParams } from '../../../../../../main/features/scraper/domain/usecases/ScrapePartNumber';
import { BotFailure, BrowserFailure } from '../../../../../../main/core/error/failures';
import { Left, Right } from '@typed-f/either';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';

const mockLogger = stubInterface<Logger>();
const mockLocalDataSource = stubInterface<ScraperLocalDataSource>();
const mockLaunchBrowser = sinon.stub();
const mockNewBot = sinon.stub();

const mockStealthBrowser = stubInterface<StealthBrowser>();
const mockBotController = new BotController(mockStealthBrowser);

const mockBotControllerInitialize = sinon.stub(mockBotController, "initialize");

const closeBrowserSpy = sinon.spy();
const closeContextSpy = sinon.spy();

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
    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLaunchBrowser.resetHistory();
      mockNewBot.resetHistory();
      closeBrowserSpy.resetHistory();
      closeContextSpy.resetHistory();
      mockBotControllerInitialize.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      mockNewBot.resolves(new Right(mockBotController));
      mockBotControllerInitialize.resolves(new Right(null));

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
      const result = await repository.scrapePartNumber("123456");

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
      const result = await repository.scrapePartNumber("123456");

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
      const result = await repository.scrapePartNumber("123456");

      // assert
      ok(mockLogger.info.calledWith("[ScraperRepository.scrapePartNumber] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(SCRAPER_BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      ok(mockBotControllerInitialize.calledOnceWith());
      deepEqual(result, new Left(botFailure));
    });
  });
});
