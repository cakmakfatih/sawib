import Logger from '../../../../../../main/core/Logger';
import sinon, { stubInterface } from 'ts-sinon';
import BotRepositoryImpl, { BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE, CREATE_PAGES_FAILURE_MESSAGE, LAUNCH_BROWSER_WARNING_MESSAGE, NEW_BOT_WARNING_MESSAGE } from '../../../../../../main/features/bot/data/repositories/BotRepositoryImpl';
import { deepEqual, equal, ok } from 'assert';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import { Left, Right } from '@typed-f/either';
import { CONCURRENCY } from '../../../../../../main/bin/config';
import { Page } from 'playwright-firefox';
import { NEW_PAGE_FAILURE_MESSAGE } from '../../../../../../main/features/browser/data/repositories/BrowserRepositoryImpl';
import { BotFailure, BrowserFailure } from '../../../../../../main/core/error/failures';

const mockStealthBrowser = stubInterface<StealthBrowser>();

const closeBrowserSpy = sinon.spy();
const closeContextSpy = sinon.spy();
mockStealthBrowser.browser.close = closeBrowserSpy;
mockStealthBrowser.context.close = closeContextSpy;

const mockLogger = stubInterface<Logger>();
const mockNewPage = sinon.stub();

const mockLaunchBrowser = sinon.stub();

const repository = new BotRepositoryImpl(
  mockLogger,
  mockNewPage,
  mockLaunchBrowser,
);

const mockBotController = new BotController(mockStealthBrowser);

describe("BotRepository", () => {
  describe("newBot", () => {
    beforeEach(() => {
      mockLogger.info.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // act
      await repository.newBot(mockStealthBrowser);

      // assert
      ok(mockLogger.info.calledWith("[BotRepository.newBot] started."));
      ok(mockLogger.info.calledWith("[BotRepository.newBot] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should return [BotController] if doesn't run into any errors", async () => {
      // arrange
      const expectedResult = new Right(mockBotController);

      // act
      const result = await repository.newBot(mockStealthBrowser);

      // assert
      deepEqual(result, expectedResult);
    });
  });

  describe("createPages", () => {
    let mockPage: Page;
    let mockPageCloseStub: sinon.SinonSpy;

    beforeAll(() => {
      mockPage = stubInterface<Page>();
      mockPageCloseStub = sinon.spy();
      mockPage.close = mockPageCloseStub;
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      mockNewPage.resetHistory();
      mockPageCloseStub.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      mockNewPage.resolves(new Right(mockPage));

      // act
      await repository.createPages(mockStealthBrowser.context);

      // assert
      ok(mockLogger.info.calledWith("[BotRepository.createPages] started."));
      ok(mockLogger.info.calledWith("[BotRepository.createPages] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [newPage] method [CONCURRENCY] times", async () => {
      // arrange
      mockNewPage.resolves(new Right(mockPage));

      // act
      await repository.createPages(mockStealthBrowser.context);

      // assert
      equal(mockNewPage.callCount, CONCURRENCY);
    });

    it("should return [CONCURRENCY] pages in an array", async () => {
      // arrange
      const expectedResult: Page[] = [];
      mockNewPage.resolves(new Right(mockPage));

      for (let i = 0; i < CONCURRENCY; i++) {
        expectedResult.push(mockPage);
      }

      // act
      const result = await repository.createPages(mockStealthBrowser.context);

      // assert
      deepEqual(result, new Right(expectedResult));
    });

    it("should log correctly and return [BotFailure] with error attached if [newPage] resolves to [Failure]", async () => {
      // arrange
      const browserErr = new Error("test-err");
      const browserFailure = new BrowserFailure(NEW_PAGE_FAILURE_MESSAGE, browserErr);
      const expectedFailure = new BotFailure(CREATE_PAGES_FAILURE_MESSAGE, browserFailure.error);

      mockNewPage.onFirstCall().resolves(new Right(mockPage));
      mockNewPage.onSecondCall().resolves(new Right(mockPage));
      mockNewPage.onThirdCall().resolves(new Left(browserFailure));

      // act
      const result = await repository.createPages(mockStealthBrowser.context);

      // assert
      ok(mockLogger.info.calledWith("[BotRepository.createPages] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(CREATE_PAGES_FAILURE_MESSAGE));
      ok(mockLogger.error.calledOnceWith(browserErr));
      deepEqual(result, new Left(expectedFailure));
    });

    it("should quit previously opened pages if an error occurres in the loop", async () => {
      // arrange
      const browserErr = new Error("test-err");
      const browserFailure = new BrowserFailure(NEW_PAGE_FAILURE_MESSAGE, browserErr);

      const randomErrCallIndex = Math.floor(Math.random() * ((CONCURRENCY - 1) - 0 + 1) + 0);

      for (let i = 0; i < CONCURRENCY; i++) {
        mockNewPage.onCall(i).resolves(i !== randomErrCallIndex ? new Right(mockPage) : new Left(browserFailure));
      }

      // act
      await repository.createPages(mockStealthBrowser.context);

      // assert
      equal(mockPageCloseStub.callCount, randomErrCallIndex);
    });
  });

  describe("launchBotController", () => {
    let newBotStub: sinon.SinonStub;
    let initializeStub: sinon.SinonStub;

    beforeAll(() => {
      newBotStub = sinon.stub(repository, "newBot");
      initializeStub = sinon.stub(mockBotController, "initialize");
    });

    afterAll(() => {
      newBotStub.restore();
      initializeStub.restore();
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      closeContextSpy.resetHistory();
      closeBrowserSpy.resetHistory();
      newBotStub.resetHistory();
      initializeStub.resetHistory();
      mockLaunchBrowser.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      newBotStub.resolves(new Right(mockBotController));
      initializeStub.resolves(new Right(null));

      // act
      await repository.launchBotController();

      // assert
      ok(mockLogger.info.calledWith("[BotRepository.launchBotController] started."));
      ok(mockLogger.info.calledWith("[BotRepository.launchBotController] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [launchBrowser] and return [Failure] if result is [Left]", async () => {
      // arrange
      const err = new Error("test-err");
      const browserFailure = new BrowserFailure("failed launching", err);
      mockLaunchBrowser.resolves(new Left(browserFailure));

      // act
      const result = await repository.launchBotController();

      // assert
      ok(mockLogger.info.calledWith("[BotRepository.launchBotController] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(LAUNCH_BROWSER_WARNING_MESSAGE));
      ok(mockLaunchBrowser.calledOnceWith());
      deepEqual(result, new Left(browserFailure));
    });

    it("should call [newBot] with correct params and return [Failure] if result is [Left] and dispose browser", async () => {
      // arrange
      const err = new Error("test-err");
      const botFailure = new BotFailure("failed creating a bot", err);
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      newBotStub.resolves(new Left(botFailure));

      // act
      const result = await repository.launchBotController();

      // assert
      ok(mockLogger.info.calledWith("[BotRepository.launchBotController] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(NEW_BOT_WARNING_MESSAGE));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      ok(newBotStub.calledOnceWith(mockStealthBrowser));
      deepEqual(result, new Left(botFailure));
    });

    it("should call [BotController.initialize] and return [Failure] if result is [Left]", async () => {
      // arrange
      const err = new Error("test-err");
      const botFailure = new BotFailure("failed creating pages", err);
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));
      newBotStub.resolves(new Right(mockBotController));
      initializeStub.resolves(new Left(botFailure));

      // act
      const result = await repository.launchBotController();

      // assert
      ok(mockLogger.info.calledWith("[BotRepository.launchBotController] completed with a [Failure]."));
      ok(mockLogger.warn.calledOnceWith(BOT_CONTROLLER_INITIALIZE_WARNING_MESSAGE));
      ok(closeContextSpy.calledOnceWith());
      ok(closeBrowserSpy.calledOnceWith());
      ok(initializeStub.calledOnceWith());
      deepEqual(result, new Left(botFailure));
    });

    afterAll(() => {
      newBotStub.restore();
      initializeStub.restore();
    });
  });
});
