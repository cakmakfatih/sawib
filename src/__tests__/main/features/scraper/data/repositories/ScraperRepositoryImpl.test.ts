import Logger from 'main/core/Logger';
import sinon, { stubInterface } from 'ts-sinon';
import ScraperRepositoryImpl, { SCRAPER_LAUNCH_BROWSER_FAILURE_MESSAGE } from '../../../../../../main/features/scraper/data/repositories/ScraperRepositoryImpl';
import ScraperLocalDataSource from '../../../../../../main/features/scraper/data/datasources/ScraperLocalDataSource';
import { deepEqual, equal, ok } from 'assert';
import { ScrapePartNumberParams } from '../../../../../../main/features/scraper/domain/usecases/ScrapePartNumber';
import { BrowserFailure } from '../../../../../../main/core/error/failures';
import { Left, Right } from '@typed-f/either';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';

const mockLogger = stubInterface<Logger>();
const mockLocalDataSource = stubInterface<ScraperLocalDataSource>();
const mockLaunchBrowser = sinon.stub();
const mockStealthBrowser = stubInterface<StealthBrowser>();
const mockNewBot = sinon.stub();
const mockCreatePages = sinon.stub();

const repository = new ScraperRepositoryImpl(
  mockLogger,
  mockLocalDataSource,
  mockLaunchBrowser,
  mockNewBot,
  mockCreatePages,
);

describe("ScraperRepository", () => {
  describe("scrapePartNumber", () => {
    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLaunchBrowser.resetHistory();
      mockNewBot.resetHistory();
      mockCreatePages.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      mockLaunchBrowser.resolves(new Right(mockStealthBrowser));

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
      ok(mockLogger.warn.calledOnceWith(SCRAPER_LAUNCH_BROWSER_FAILURE_MESSAGE));
      deepEqual(result, new Left(browserFailure));
    });
  });
});
