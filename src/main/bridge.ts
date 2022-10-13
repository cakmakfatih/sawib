import { dialog, ipcMain } from 'electron';
import { firefox } from 'playwright-firefox';
import { container } from 'tsyringe';
import Tokens from './bin/Tokens';
import { IGetScraperConfig } from './features/scraper/domain/usecases/GetScraperConfig';

abstract class Bridge {
  static init() {
    const getScraperConfig: IGetScraperConfig = container.resolve<IGetScraperConfig>(Tokens.getScraperConfig);

    ipcMain.on("browser:launch", async () => {
      const browser = await firefox.launch({
        headless: false,
      });

      const page = await browser.newPage();

      await page.goto("https://google.com");
    });

    ipcMain.handle('dialog:openDirectory', async (_) => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });

      if (canceled) {
        return null;
      } else {
        return filePaths[0];
      }
    });

    ipcMain.handle('usecase:getScraperConfig', (_) => {
      const scraperConfigOrFailure = getScraperConfig();

      if (scraperConfigOrFailure.isLeft()) {
        return null;
      }

      const scraperConfig = scraperConfigOrFailure.value;

      return scraperConfig;
    });
  }
}

export default Bridge;
