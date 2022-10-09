import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import { Page, BrowserContext } from 'playwright-firefox';
import BotRepository from '../repositories/BotRepository';

type CreatePagesParams = BrowserContext;

interface ICreatePages {
  (params: CreatePagesParams): Promise<Either<Failure, Page[]>>;
}

async function CreatePages(repository: BotRepository, params: CreatePagesParams): Promise<Either<Failure, Page[]>> {
  return await repository.createPages(params);
}

export {
  CreatePagesParams,
  ICreatePages,
  CreatePages,
};
