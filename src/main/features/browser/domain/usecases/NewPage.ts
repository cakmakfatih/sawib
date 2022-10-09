import { Either } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import { BrowserContext, Page } from 'playwright-firefox';
import BrowserRepository from '../repositories/BrowserRepository';

type NewPageParams = BrowserContext;

interface INewPage {
  (params: NewPageParams): Promise<Either<Failure, Page>>;
}

async function NewPage(repository: BrowserRepository, params: NewPageParams): Promise<Either<Failure, Page>> {
  return await repository.newPage(params);
}

export {
  NewPageParams,
  INewPage,
  NewPage,
};
