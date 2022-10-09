import { deepEqual, equal, ok } from 'assert';
import { FirefoxBrowser, Browser, BrowserType, BrowserContext } from 'playwright-firefox';
import sinon, { stubInterface } from 'ts-sinon';
import Logger from '../../../../../../main/core/Logger';
import BrowserRepositoryImpl from '../../../../../../main/features/browser/data/repositories/BrowserRepositoryImpl';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import { Left, Right } from '@typed-f/either';
import { BrowserFailure } from '../../../../../../main/core/error/failures';
import { DEFAULT_ABOUT_CONFIG, DEFAULT_LAUNCH_OPTIONS } from '../../../../../../main/features/browser/bin/config';
import StealthBrowserLaunchOptions from 'main/features/browser/domain/entities/StealthBrowserLaunchOptions';

const mockFirefox = stubInterface<BrowserType<Browser>>();
const mockContext = stubInterface<BrowserContext>();
const mockBrowser = stubInterface<FirefoxBrowser>();
const mockLogger = stubInterface<Logger>();

const repository = new BrowserRepositoryImpl(
  mockLogger,
  mockFirefox,
);

let createContextStub: sinon.SinonStub;

describe("BrowserRepository", () => {
  let successfulResult: StealthBrowser;

  beforeAll(() => {
    successfulResult = {
      browser: mockBrowser,
      context: mockContext,
    };

    createContextStub = sinon.stub(repository, "createContext");
  });

  beforeEach(() => {
    mockLogger.info.resetHistory();
    mockLogger.warn.resetHistory();
    mockLogger.error.resetHistory();
    mockFirefox.launch.resetHistory();
    mockBrowser.close.resetHistory();
    createContextStub.resetHistory();
  });

  describe("launch", () => {
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
      createContextStub.resolves(mockContext);

      // act
      const result = await repository.launch();

      // assert
      deepEqual(result, expectedResult);
    });

    it("should call [repository.createContext] with correct params", async () => {
      // arrange
      mockFirefox.launch.resolves(mockBrowser);
      mockBrowser.newContext.resolves(mockContext);

      // act
      await repository.launch();

      // assert
      ok(createContextStub.calledOnceWith(mockBrowser));
    });

    it("should handle errors and log correctly if [browser.launch] rejects", async () => {
      // arrange
      const errMessage = "test error";
      const err = new Error(errMessage);
      const failureMessage = "Failed while launching the browser.";
      mockFirefox.launch.rejects(err);

      // act
      const result = await repository.launch();

      // assert
      ok(mockLogger.warn.calledOnceWith(failureMessage));
      ok(mockLogger.error.calledOnceWith(err));
      deepEqual(result, new Left(new BrowserFailure(failureMessage, err)));
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
      const failureMessage = "Failed while creating a context.";

      mockBrowser.close.resolves();
      mockFirefox.launch.resolves(mockBrowser);
      createContextStub.rejects(err);

      // act
      const result = await repository.launch();

      // assert
      ok(mockLogger.warn.calledOnceWith(failureMessage));
      ok(mockLogger.error.calledOnceWith(err));
      ok(mockBrowser.close.calledOnceWith());
      deepEqual(result, new Left(new BrowserFailure(failureMessage, err)));
    });
  });
});
