import { Either } from "@typed-f/either";
import { Failure } from "../../../../core/error/failures";
import StealthBrowser from "../../../browser/domain/entities/StealthBrowser";
import BotController from "../../presentation/controllers/BotController";
import BotRepository from "../repositories/BotRepository";

type NewBotParams = StealthBrowser;

interface INewBot {
  (params: NewBotParams): Promise<Either<Failure, BotController>>;
}

async function NewBot(repository: BotRepository, params: NewBotParams): Promise<Either<Failure, BotController>> {
  return await repository.newBot(params);
}

export {
  NewBotParams,
  INewBot,
  NewBot,
};
