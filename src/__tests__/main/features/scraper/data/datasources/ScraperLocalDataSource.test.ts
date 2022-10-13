import Logger from '../../../../../../main/core/Logger';
import { stubInterface } from 'ts-sinon';
import ScraperLocalDataSource, { SCRAPER_STORE_KEYS } from '../../../../../../main/features/scraper/data/datasources/ScraperLocalDataSource';
import Store from 'electron-store';
import ScraperConfig from '../../../../../../main/features/scraper/domain/entities/ScraperConfig';
import { equal, ok, throws } from 'assert';

const mockLogger = stubInterface<Logger>();
const mockStore = stubInterface<Store>();

const dataSource = new ScraperLocalDataSource(
  mockLogger,
  mockStore,
);

describe("ScraperLocalDataSource", () => {
  let scraperConfig: ScraperConfig;

  beforeAll(() => {
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
    mockStore.set.resetHistory();
  });

  describe("setScraperConfig", () => {
    it("should call [Logger.info] correctly", () => {
      // arrange
      mockStore.set.returns();

      // act
      dataSource.setScraperConfig(scraperConfig);

      // assert
      ok(mockLogger.info.calledWith("[ScraperLocalDataSource.setScraperConfig] started."));
      ok(mockLogger.info.calledWith("[ScraperLocalDataSource.setScraperConfig] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [store.set] with correct params", () => {
      // arrange
      mockStore.set.returns();

      // act
      dataSource.setScraperConfig(scraperConfig);

      // assert
      ok(mockStore.set.calledOnceWith({
        [SCRAPER_STORE_KEYS.scraperConfig]: scraperConfig
      }));
    });

    it("should throw an error if [store.set] fails", () => {
      // arrange
      const err = new Error("test-err");
      mockStore.set.throws(err);

      // act & assert
      throws(() => { dataSource.setScraperConfig(scraperConfig); }, Error, err);
      ok(mockLogger.info.calledWith("[ScraperLocalDataSource.setScraperConfig] completed with a [Failure]."));
      ok(mockLogger.error.calledWith(err));
    });

    it("should return true if [store.set] succeeds", () => {
      // arrange
      mockStore.set.returns();

      // act
      const result = dataSource.setScraperConfig(scraperConfig);

      // assert
      equal(result, true);
    });
  });

  describe("getScraperConfig", () => {
    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockStore.get.resetHistory();
    });

    it("should call [Logger.info] correctly", () => {
      // arrange
      mockStore.get.returns(scraperConfig);

      // act
      dataSource.getScraperConfig();

      // assert
      ok(mockLogger.info.calledWith("[ScraperLocalDataSource.getScraperConfig] started."));
      ok(mockLogger.info.calledWith("[ScraperLocalDataSource.getScraperConfig] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [store.get] with correct params", () => {
      // arrange
      mockStore.get.returns(scraperConfig);

      // act
      dataSource.getScraperConfig();

      // assert
      ok(mockStore.get.calledOnceWith(SCRAPER_STORE_KEYS.scraperConfig as any));
    });

    it("should throw an error if [store.get] fails", () => {
      // arrange
      const err = new Error("test-err");
      mockStore.get.throws(err);

      // act & assert
      throws(() => { dataSource.getScraperConfig(); }, Error, err);
      ok(mockLogger.info.calledWith("[ScraperLocalDataSource.getScraperConfig] completed with a [Failure]."));
    });

    it("should return [ScraperConfig] if [store.get] succeeds", () => {
      // arrange
      mockStore.get.returns(scraperConfig);

      // act
      const result = dataSource.getScraperConfig();

      // assert
      equal(result, scraperConfig);
    });

    it("should return [null] if [store.get] value succeeds with [undefined]", () => {
      // arrange
      mockStore.get.returns(undefined);

      // act
      const result = dataSource.getScraperConfig();

      // assert
      equal(result, null);
    });
  });
});
