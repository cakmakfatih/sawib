import Logger from "../../../../../../main/core/Logger";
import sinon, { stubInterface } from "ts-sinon";
import BotRepositoryImpl from "../../../../../../main/features/bot/data/repositories/BotRepositoryImpl";
import { deepEqual, equal, ok } from "assert";
import StealthBrowser from "../../../../../../main/features/browser/domain/entities/StealthBrowser";
import BotController from "../../../../../../main/features/bot/presentation/controllers/BotController";
import { Right } from "@typed-f/either";

const mockLogger = stubInterface<Logger>();
const mockNewPage = sinon.stub();

const mockStealthBrowser: StealthBrowser = stubInterface<StealthBrowser>();

const repository = new BotRepositoryImpl(
  mockLogger,
  mockNewPage,
);

describe("BotRepository", () => {
  describe("newBot", () => {
    let successfulResult: BotController;

    beforeAll(() => {
      successfulResult = new BotController(mockStealthBrowser);
    });

    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();
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
      const expectedResult = new Right(successfulResult);

      // act
      const result = await repository.newBot(mockStealthBrowser);

      // assert
      deepEqual(result, expectedResult);
    });
  });
});
