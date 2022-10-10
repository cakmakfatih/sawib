import { Page } from 'playwright-firefox';
import { container, inject, injectable } from 'tsyringe';
import StealthBrowser from '../../../../features/browser/domain/entities/StealthBrowser';
import { ICreatePages } from '../../domain/usecases/CreatePages';
import Tokens from '../../../../bin/Tokens';

interface BotController { }

@injectable()
class BotControllerImpl implements BotController {
  public stealthBrowser: StealthBrowser;
  public pages: Page[];

  private readonly createPages: ICreatePages;

  constructor(
    stealthBrowser: StealthBrowser,
    @inject(Tokens.createPages) createPages?: ICreatePages,
  ) {
    this.stealthBrowser = stealthBrowser;

    this.createPages = createPages!;
  }
}

export default BotControllerImpl;
