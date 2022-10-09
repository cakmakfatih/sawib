import { deepEqual, equal, ok } from 'assert';
import { FirefoxBrowser, Browser, BrowserType, BrowserContext } from 'playwright-firefox';
import sinon, { stubInterface } from 'ts-sinon';
import Logger from '../../../../../../main/core/Logger';
import BrowserRepositoryImpl from '../../../../../../main/features/browser/data/repositories/BrowserRepositoryImpl';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import { Left, Right } from '@typed-f/either';
import { BrowserFailure } from '../../../../../../main/core/error/failures';

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
      deepEqual(result, new Left(new BrowserFailure(failureMessage, err)));
      ok(mockLogger.warn.calledOnceWith(failureMessage));
    });
  });
});
