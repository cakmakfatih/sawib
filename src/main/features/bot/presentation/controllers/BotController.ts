import { Page } from 'playwright-firefox';
import { inject, injectable } from 'tsyringe';
import StealthBrowser from '../../../../features/browser/domain/entities/StealthBrowser';
import { ICreatePages } from '../../domain/usecases/CreatePages';
import Tokens from '../../../../bin/Tokens';
import { Failure } from '../../../../core/error/failures';
import { Either, Left, Right } from '@typed-f/either';
import Logger from '../../../../core/Logger';

interface BotController {
  initialize(): Promise<Either<Failure, null>>;
}

@injectable()
class BotControllerImpl implements BotController {
  public readonly stealthBrowser: StealthBrowser;

  private readonly logger: Logger;
  private readonly createPages: ICreatePages;

  public pages: Page[];

  constructor(
    stealthBrowser: StealthBrowser,
    @inject(Tokens.logger) logger?: Logger,
    @inject(Tokens.createPages) createPages?: ICreatePages,
  ) {
    this.stealthBrowser = stealthBrowser;

    this.logger = logger!;
    this.createPages = createPages!;
  }

  async initialize(): Promise<Either<Failure, null>> {
    this.logger.info("[BotController.initialize] started.");

    const pagesOrFailure = await this.createPages(this.stealthBrowser.context);

    if (pagesOrFailure.isLeft()) {
      this.logger.info("[BotController.initialize] completed with a [Failure].");

      return new Left(pagesOrFailure.value);
    }

    const pages = pagesOrFailure.value;

    this.pages = pages;

    this.logger.info("[BotController.initialize] completed.");

    return new Right(null);
  }
}

export default BotControllerImpl;
