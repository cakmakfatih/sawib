import Logger from '../../../../../../main/core/Logger';
import BotController from '../../../../../../main/features/bot/presentation/controllers/BotController';
import StealthBrowser from '../../../../../../main/features/browser/domain/entities/StealthBrowser';
import sinon, { stubInterface } from 'ts-sinon';
import { deepEqual, equal, ok } from 'assert';
import { Left, Right } from '@typed-f/either';
import { Page } from 'playwright-firefox';
import { BotFailure } from '../../../../../../main/core/error/failures';

const mockPage = stubInterface<Page>();

const mockStealthBrowser = stubInterface<StealthBrowser>();
const mockLogger = stubInterface<Logger>();
const mockCreatePages = sinon.stub();

const controller = new BotController(
  mockStealthBrowser,
  mockLogger,
  mockCreatePages,
);

describe("BotController", () => {
  describe("initialize", () => {
    beforeEach(() => {
      mockLogger.info.resetHistory();
      mockCreatePages.resetHistory();
    });

    it("should call [Logger.info] correctly", async () => {
      // arrange
      mockCreatePages.resolves(new Right([mockPage]));

      // act
      await controller.initialize();

      // assert
      ok(mockLogger.info.calledWith("[BotController.initialize] started."));
      ok(mockLogger.info.calledWith("[BotController.initialize] completed."));
      equal(mockLogger.info.callCount, 2);
    });

    it("should call [BotController.createPages] once with correct params to create pages", async () => {
      // arrange
      mockCreatePages.resolves(new Right([mockPage]));

      // act
      await controller.initialize();

      // assert
      ok(mockCreatePages.calledOnceWith(mockStealthBrowser.context));
    });

    it("should return [Right] if [createPages] resolves", async () => {
      // arrange
      mockCreatePages.resolves(new Right([mockPage]));

      // act
      const result = await controller.initialize();

      // assert
      deepEqual(result, new Right(null));
    });

    it("should return [BotFailure] if [createPages] fails", async () => {
      // arrange
      const err = new Error("test-err");
      const failure = new BotFailure("failed", err);
      mockCreatePages.resolves(new Left(failure));

      // act
      const result = await controller.initialize();

      // assert
      ok(mockLogger.info.calledWith("[BotController.initialize] completed with a [Failure]."));
      deepEqual(result, new Left(failure));
    });

    it("should assign the result of [createPages] to [BotController.pages]", async () => {
      // arrange
      const pages = [mockPage, mockPage];
      mockCreatePages.resolves(new Right(pages));

      // act
      await controller.initialize();

      // assert
      deepEqual(controller.pages, pages);
    });
  });
});
