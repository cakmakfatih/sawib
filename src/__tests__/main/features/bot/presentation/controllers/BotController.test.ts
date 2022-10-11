import Logger from "main/core/Logger";
import BotController from "../../../../../../main/features/bot/presentation/controllers/BotController";
import StealthBrowser from "../../../../../../main/features/browser/domain/entities/StealthBrowser";
import sinon, { stubInterface } from "ts-sinon";
import { equal, ok } from "assert";

const mockStealthBrowser = stubInterface<StealthBrowser>();
const mockLogger = stubInterface<Logger>();
const mockNewPage = sinon.stub();

const controller = new BotController(
  mockStealthBrowser,
  mockLogger,
  mockNewPage,
);

describe("BotController", () => {
  describe("initialize", () => {
    beforeEach(() => {
      mockLogger.info.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // act
      await controller.initialize();

      // assert
      ok(mockLogger.info.calledWith("[BotController.initialize] started."));
      ok(mockLogger.info.calledWith("[BotController.initialize] completed."));
      equal(mockLogger.info.callCount, 2);
    });
  });
});
