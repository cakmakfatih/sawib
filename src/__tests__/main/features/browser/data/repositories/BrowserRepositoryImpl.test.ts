import { deepEqual, equal, ok } from 'assert';
import { FirefoxBrowser, Browser, BrowserType, BrowserContext, Page } from 'playwright-firefox';
import { stubInterface } from 'ts-sinon';
import Logger from '../../../../../../main/core/Logger';
import BrowserRepositoryImpl, { BROWSER_LAUNCH_FAILURE_MESSAGE, CREATE_CONTEXT_FAILURE_MESSAGE, NEW_PAGE_FAILURE_MESSAGE } from '../../../../../../main/features/browser/data/repositories/BrowserRepositoryImpl';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import { Left, Right } from '@typed-f/either';
import { BrowserFailure } from '../../../../../../main/core/error/failures';
import { DEFAULT_ABOUT_CONFIG, DEFAULT_LAUNCH_OPTIONS } from '../../../../../../main/bin/config';
import StealthBrowserLaunchOptions from '../../../../../../main/features/browser/domain/entities/StealthBrowserLaunchOptions';

const mockFirefox = stubInterface<BrowserType<Browser>>();
const mockContext = stubInterface<BrowserContext>();
const mockPage = stubInterface<Page>();
const mockBrowser = stubInterface<FirefoxBrowser>();
const mockLogger = stubInterface<Logger>();

const repository = new BrowserRepositoryImpl(
  mockLogger,
  mockFirefox,
);

describe("BrowserRepository", () => {
  describe("launch", () => {
    let successfulResult: StealthBrowser;

    beforeAll(() => {
      successfulResult = {
        browser: mockBrowser,
        context: mockContext,
      };
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      mockFirefox.launch.resetHistory();
      mockBrowser.newContext.resetHistory();
      mockBrowser.close.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      mockFirefox.launch.resolves(mockBrowser);

      // act
      await repository.launch();

      // assert
      ok(mockLogger.info.calledWith("[BrowserRepository.launch] started."));
      ok(mockLogger.info.calledWith("[BrowserRepository.launch] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should return [StealthBrowser] if doesn't run into any errors", async () => {
      // arrange
      const expectedResult = new Right(successfulResult);

      mockFirefox.launch.resolves(mockBrowser);
      mockBrowser.newContext.resolves(mockContext);

      // act
      const result = await repository.launch();

      // assert
      deepEqual(result, expectedResult);
    });

    it("should call [browser.newContext] with correct params", async () => {
      // arrange
      mockFirefox.launch.resolves(mockBrowser);
      mockBrowser.newContext.resolves(mockContext);

      // act
      await repository.launch();

      // assert
      ok(mockBrowser.newContext.calledOnceWith());
    });

    it("should handle errors and log correctly if [browser.launch] rejects", async () => {
      // arrange
      const errMessage = "test error";
      const err = new Error(errMessage);
      mockFirefox.launch.rejects(err);

      // act
      const result = await repository.launch();

      // assert
      ok(mockLogger.warn.calledOnceWith(BROWSER_LAUNCH_FAILURE_MESSAGE));
      ok(mockLogger.error.calledOnceWith(err));
      deepEqual(result, new Left(new BrowserFailure(BROWSER_LAUNCH_FAILURE_MESSAGE, err)));
    });

    it("should call [browser.launch] with [DEFAULT_LAUNCH_OPTIONS] if no params given", async () => {
      // act
      await repository.launch();

      // assert
      ok(mockFirefox.launch.calledOnceWith({ ...DEFAULT_LAUNCH_OPTIONS, firefoxUserPrefs: DEFAULT_ABOUT_CONFIG }));
    });

    it("should call [browser.launch] with correct params if any given", async () => {
      // arrange
      const params: StealthBrowserLaunchOptions = {
        headless: false,
      };

      // act
      await repository.launch(params);

      // assert
      ok(mockFirefox.launch.calledOnceWith({ ...DEFAULT_LAUNCH_OPTIONS, ...params, firefoxUserPrefs: DEFAULT_ABOUT_CONFIG }));
    });

    it("should add additional firefoxUserPrefs settings if passed with params", async () => {
      // arrange
      const params: StealthBrowserLaunchOptions = {
        headless: false,
        firefoxUserPrefs: {
          "test-pref": true,
        },
      };

      // act
      await repository.launch(params);

      // assert
      ok(mockFirefox.launch.calledOnceWith({ ...DEFAULT_LAUNCH_OPTIONS, ...params, firefoxUserPrefs: { ...DEFAULT_ABOUT_CONFIG, ...params.firefoxUserPrefs } }));
    });

    it("should handle errors and log correctly if [Repository.createContext] rejects and call [browser.close]", async () => {
      // arrange
      const errMessage = "test error";
      const err = new Error(errMessage);

      mockBrowser.close.resolves();
      mockFirefox.launch.resolves(mockBrowser);
      mockBrowser.newContext.rejects(err);

      // act
      const result = await repository.launch();

      // assert
      ok(mockLogger.warn.calledOnceWith(CREATE_CONTEXT_FAILURE_MESSAGE));
      ok(mockLogger.error.calledOnceWith(err));
      ok(mockBrowser.close.calledOnceWith());
      deepEqual(result, new Left(new BrowserFailure(CREATE_CONTEXT_FAILURE_MESSAGE, err)));
    });
  });

  describe("newPage", () => {
    let successfulResult: Page;

    beforeAll(() => {
      successfulResult = mockPage;
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
      mockContext.newPage.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // act
      await repository.newPage(mockContext);

      // assert
      ok(mockLogger.info.calledWith("[BrowserRepository.newPage] started."));
      ok(mockLogger.info.calledWith("[BrowserRepository.newPage] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should return [Page] if doesn't run into any errors", async () => {
      // arrange
      const expectedResult = new Right(successfulResult);
      mockContext.newPage.resolves(mockPage);

      // act
      const result = await repository.newPage(mockContext);

      // assert
      deepEqual(result, expectedResult);
    });

    it("should call [context.newPage] once", async () => {
      // act
      await repository.newPage(mockContext);

      // assert
      ok(mockContext.newPage.calledOnceWith());
    });

    it("should handle errors and log correctly if [context.newPage] rejects", async () => {
      // arrange
      const errMessage = "test error";
      const err = new Error(errMessage);
      mockContext.newPage.rejects(err);

      // act
      const result = await repository.newPage(mockContext);

      // assert
      ok(mockLogger.warn.calledOnceWith(NEW_PAGE_FAILURE_MESSAGE));
      ok(mockLogger.error.calledOnceWith(err));
      deepEqual(result, new Left(new BrowserFailure(NEW_PAGE_FAILURE_MESSAGE, err)));
    });
  });
});
