import { dialog, ipcMain } from 'electron';
import { firefox } from 'playwright-firefox';

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
