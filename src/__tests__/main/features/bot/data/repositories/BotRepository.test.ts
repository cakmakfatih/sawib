import Logger from "../../../../../../main/core/Logger";
import sinon, { stubInterface } from "ts-sinon";
import BotRepositoryImpl from "main/features/bot/data/repositories/BotRepositoryImpl";

const mockLogger = stubInterface<Logger>();
const mockNewPage = sinon.stub();

const repository = new BotRepositoryImpl(
  mockLogger,
  mockNewPage,
);
