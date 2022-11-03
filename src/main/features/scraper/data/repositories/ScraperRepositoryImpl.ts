import { Either, Left, Right } from '@typed-f/either';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { Failure, ScraperFailure } from '../../../../core/error/failures';
import { Page, Response, ElementHandle } from 'playwright-firefox';
import ScraperRepository from '../../domain/repositories/ScraperRepository';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Logger from '../../../../core/Logger';
import { ScraperLocalDataSource } from '../datasources/ScraperLocalDataSource';
import safePromise from '../../../../utils/safePromise';
import ScraperConfig from '../../domain/entities/ScraperConfig';
import safeCall from '../../../../utils/safeCall';
import { ILaunchBotController } from '../../../../features/bot/domain/usecases/LaunchBotController';
import BotControllerImpl from '../../../../features/bot/presentation/controllers/BotController';
import VehicleInfo from '../../domain/entities/VehicleInfo';
import { SaveVehicleInfoWithPartsDataAsCsvParams } from '../../domain/usecases/SaveVehicleInfoWithPartsDataAsCsv';


export const SCRAPER_LAUNCH_BOT_CONTROLLER_WARNING_MESSAGE = "Failed while running [launchBotController] from [ScraperRepository].";
export const SCRAPER_BOT_LOGIN_TO_PARTS_CHECK_FAILURE_MESSAGE = "Failed on [BotRepository.loginToPartsCheck].";
export const SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE = "Failed while running [page.goto] method.";

export const SCRAPER_ELEMENT_HANDLES_FAILURE_MESSAGE = "Failed while running [<locator>.elementHandles].";
export const SCRAPER_GET_ATTRIBUTE_FAILURE_MESSAGE = "Failed while running [<element>.getAttribute].";
export const SCRAPER_PAGE_FILL_FAILURE_MESSAGE = "Failed while running [<page>.fill].";
export const SCRAPER_PAGE_CLICK_FAILURE_MESSAGE = "Failed while running [<page>.click].";
export const SCRAPER_PAGE_WAIT_FOR_FAILURE_MESSAGE = "Failed while running [<locator>.waitFor].";

export const FS_WRITE_FILE_SYNC_FAILURE_MESSAGE = "Failed while running [<fs>.writeFileSync] on [ScraperRepository.savePartNumbersAsCsv].";
export const FS_WRITE_FILE_SYNC_VEHICLE_INFO_WITH_PART_NUMBERS_FAILURE_MESSAGE = "Failed while running [<fs>.writeFileSync] on [ScraperRepository.saveVehicleInfoWithPartsDataAsCsv].";

export const SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE = "Failed while running [<localDataSource>.setScraperConfig].";
export const SCRAPER_LOCAL_DATA_SOURCE_GET_SCRAPER_CONFIG_FAILURE_MESSAGE = "Failed while running [<localDataSource>.getScraperConfig].";

export const SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE = "Failed while running [ScraperRepository.getPartRows].";
export const SCRAPER_GET_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE = "Failed while running [ScraperRepository.getPartTextsFromPartRows].";
export const SCRAPER_GET_PART_NUMBERS_AND_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE = "Failed while running [ScraperRepository.getPartNumbersAndPartTextsFromPartRows].";

export const SCRAPER_GET_VEHICLE_INFO_DATA_FAILURE_MESSAGE = "Failed while running [ScraperRepository.getVehicleInfoData].";

export const PARTS_CHECK_LOGIN_URL = "https://partscheck.com.au/global/login.php";

export enum Selectors {
  partNumberInp = "input.partNr",
  loginUsernameInp = "#myuser",
  loginPasswordInp = "#mypass",
  loginBtn = "#loginButton",
  isLoggedIn = "#Xtop-header > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(4) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(1)",
  vehicleInfoContainer = "body > center > div:nth-child(2) > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > div:nth-child(2) > div:nth-child(1) > div.quoteTitleContainer",
  vehicleInfoDivs = "div.quoteTitle,div.quoteTitleContent:not(:has(> input))",
  vehicleVinInfo = "div.quoteTitleContent > input",
  partRowTr = "tr.lineRow",
}

@injectable()
class ScraperRepositoryImpl implements ScraperRepository {
  private readonly logger: Logger;
  private readonly localDataSource: ScraperLocalDataSource;
  private readonly launchBotController: ILaunchBotController;

  constructor(
    @inject(Tokens.logger) logger: Logger,
    @inject(Tokens.scraperLocalDataSource) localDataSource: ScraperLocalDataSource,
    @inject(Tokens.launchBotController) launchBotController: ILaunchBotController,
  ) {
    this.logger = logger;
    this.localDataSource = localDataSource;
    this.launchBotController = launchBotController;
  }

  async getPartNumbers(botController: BotControllerImpl): Promise<Either<Failure, string[]>> {
    this.logger.info("[ScraperRepository.getPartNumbers] started.");

    const page = botController.pages[0];

    const partNumbersLocator = page.locator(Selectors.partNumberInp);
    const partNumberInpElementsOrFailure = await safePromise<ElementHandle<Node>[]>(() => partNumbersLocator.elementHandles());

    if (partNumberInpElementsOrFailure.isLeft()) {
      const elementHandlesErr = partNumberInpElementsOrFailure.value;

      this.logger.info("[ScraperRepository.getPartNumbers] completed with a [Failure].");
      this.logger.warn(SCRAPER_ELEMENT_HANDLES_FAILURE_MESSAGE);
      this.logger.error(elementHandlesErr);

      return new Left(new ScraperFailure(SCRAPER_ELEMENT_HANDLES_FAILURE_MESSAGE, elementHandlesErr));
    }

    const partNumberInpElements = partNumberInpElementsOrFailure.value;
    const partNumberValues: string[] = [];

    for (let partNumberInp of partNumberInpElements) {
      const partNumberOrFailure = await safePromise<string | null>(() => partNumberInp.getAttribute("value"));

      if (partNumberOrFailure.isLeft()) {
        const getAttributeErr = partNumberOrFailure.value;

        this.logger.info("[ScraperRepository.getPartNumbers] completed with a [Failure].");
        this.logger.warn(SCRAPER_GET_ATTRIBUTE_FAILURE_MESSAGE);
        this.logger.error(getAttributeErr);

        return new Left(new ScraperFailure(SCRAPER_GET_ATTRIBUTE_FAILURE_MESSAGE, getAttributeErr));
      }

      const partNumber = partNumberOrFailure.value;

      partNumberValues.push(partNumber ?? "");
    }

    this.logger.info("[ScraperRepository.getPartNumbers] completed.");

    return new Right(partNumberValues);
  }

  async getPartTexts(botController: BotControllerImpl): Promise<Either<Failure, string[]>> {
    this.logger.info("[ScraperRepository.getPartTextsParams] started.");

    const page = botController.pages[0];

    const partRowsOrError = await safePromise<ElementHandle<Node>[]>(() => this.getPartRows(page));

    if (partRowsOrError.isLeft()) {
      const partRowsErr = partRowsOrError.value;

      this.logger.error(partRowsErr);
      this.logger.warn(SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE);
      this.logger.info("[ScraperRepository.getPartTextsParams] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE, partRowsErr));
    }

    const partRows = partRowsOrError.value;

    const partTextsOrError = await safePromise<string[]>(() => this.getPartTextsFromPartRows(partRows));

    if (partTextsOrError.isLeft()) {
      const partTextsErr = partTextsOrError.value;

      this.logger.error(partTextsErr);
      this.logger.warn(SCRAPER_GET_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE);
      this.logger.info("[ScraperRepository.getPartTextsParams] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_GET_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE, partTextsErr));
    }

    const partTexts = partTextsOrError.value;

    this.logger.info("[ScraperRepository.getPartTextsParams] completed.");

    return new Right(partTexts);
  }

  async getPartNumbersAndPartTexts(botController: BotControllerImpl): Promise<Either<Failure, { partText: string; partNumber: string; }[]>> {
    this.logger.info("[ScraperRepository.getPartNumbersAndPartTexts] started.");

    const page = botController.pages[0];

    const partRowsOrError = await safePromise<ElementHandle<Node>[]>(() => this.getPartRows(page));

    if (partRowsOrError.isLeft()) {
      const partRowsErr = partRowsOrError.value;

      this.logger.error(partRowsErr);
      this.logger.warn(SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE);
      this.logger.info("[ScraperRepository.getPartNumbersAndPartTexts] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_GET_PART_ROWS_FAILURE_MESSAGE, partRowsErr));
    }

    const partRows = partRowsOrError.value;

    const partNumbersAndTextsOrError = await safePromise(() => this.getPartNumbersAndPartTextsFromPartRows(partRows));

    if (partNumbersAndTextsOrError.isLeft()) {
      const partNumbersAndTextsErr = partNumbersAndTextsOrError.value;

      this.logger.error(partNumbersAndTextsErr);
      this.logger.warn(SCRAPER_GET_PART_NUMBERS_AND_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE);
      this.logger.info("[ScraperRepository.getPartNumbersAndPartTexts] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_GET_PART_NUMBERS_AND_PART_TEXTS_FROM_PART_ROWS_FAILURE_MESSAGE, partNumbersAndTextsErr));
    }

    const partTextsAndNumbers = partNumbersAndTextsOrError.value;

    this.logger.info("[ScraperRepository.getPartNumbersAndPartTexts] completed.");

    return new Right(partTextsAndNumbers);
  }

  private async getPartNumbersAndPartTextsFromPartRows(partRows: ElementHandle<Node>[]): Promise<{
    partNumber: string;
    partText: string;
  }[]> {
    const partNumbersAndPartTexts: {
      partNumber: string;
      partText: string;
    }[] = [];

    for (let partRow of partRows) {
      partNumbersAndPartTexts.push(await this.getPartNumberAndPartTextFromPartRow(partRow));
    }

    return partNumbersAndPartTexts;
  }

  private async getPartNumberAndPartTextFromPartRow(partRow: ElementHandle<Node>): Promise<{
    partNumber: string;
    partText: string;
  }> {
    return {
      partNumber: await this.getPartNumberFromPartRow(partRow),
      partText: await this.getPartTextFromPartRow(partRow),
    }
  }

  private async getPartNumberFromPartRow(partRow: ElementHandle<Node>): Promise<string> {
    const inputElement = await partRow.$(Selectors.partNumberInp);

    return await inputElement?.getAttribute("value") ?? "";
  }

  private async getPartTextsFromPartRows(partRows: ElementHandle<Node>[]): Promise<string[]> {
    const partTexts = [];

    for (let partRow of partRows) {
      partTexts.push(await this.getPartTextFromPartRow(partRow));
    }

    return partTexts;
  }

  private async getPartTextFromPartRow(partRow: ElementHandle<Node>): Promise<string> {
    return await partRow.getAttribute("data-parttext") ?? "";
  }

  private async getPartRows(page: Page): Promise<ElementHandle<Node>[]> {
    const partRowsLocator = page.locator(Selectors.partRowTr);

    return await partRowsLocator.elementHandles();
  }

  async getVehicleInfo(botController: BotControllerImpl): Promise<Either<Failure, VehicleInfo>> {
    this.logger.info("[ScraperRepository.getVehicleInfo] started.");

    const page = botController.pages[0];

    const vehicleInfoDataOrError = await safePromise<VehicleInfo>(() => this.handleVehicleInfoScraping(page));

    if (vehicleInfoDataOrError.isLeft()) {
      const vehicleInfoErr = vehicleInfoDataOrError.value;

      this.logger.warn(SCRAPER_GET_VEHICLE_INFO_DATA_FAILURE_MESSAGE);
      this.logger.error(vehicleInfoErr);
      this.logger.info("[ScraperRepository.getVehicleInfo] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_GET_VEHICLE_INFO_DATA_FAILURE_MESSAGE, vehicleInfoErr));
    }

    const vehicleInfo = vehicleInfoDataOrError.value;

    this.logger.info("[ScraperRepository.getVehicleInfo] completed.");

    return new Right(vehicleInfo);
  }

  private async handleVehicleInfoScraping(page: Page): Promise<VehicleInfo> {
    const vehicleInfoContainerLocator = page.locator(Selectors.vehicleInfoContainer);
    const vehicleInfoLocator = vehicleInfoContainerLocator.locator(Selectors.vehicleInfoDivs);
    const vehicleVinInfoLocator = vehicleInfoContainerLocator.locator(Selectors.vehicleVinInfo);

    const vehicleInfoTxtResults: string[] = [];

    const vehicleInfoDivs = await vehicleInfoLocator.elementHandles();

    let unformattedVehicleInfo: { [key: string]: string } = {};

    for (let div of vehicleInfoDivs) {
      const txtContent = await div.textContent();

      if (txtContent !== "VIN")
        vehicleInfoTxtResults.push(txtContent ?? "");
    }

    for (let i = 0; i < vehicleInfoTxtResults.length; i += 2) {
      unformattedVehicleInfo[vehicleInfoTxtResults[i]] = vehicleInfoTxtResults[i + 1];
    }

    const vehicleVinValueInp = await vehicleVinInfoLocator.elementHandle();

    unformattedVehicleInfo["VIN"] = await vehicleVinValueInp?.getAttribute("value") ?? "";

    const formattedVehicleInfo: VehicleInfo = {
      make: unformattedVehicleInfo["Make"] || "NA",
      model: unformattedVehicleInfo["Model"] || "NA",
      modelNr: unformattedVehicleInfo["Model Nr"] || "NA",
      series: unformattedVehicleInfo["Series"] || "NA",
      trans: unformattedVehicleInfo["Trans"] || "NA",
      colour: unformattedVehicleInfo["Colour"] || "NA",
      body: unformattedVehicleInfo["Body"] || "NA",
      mthYr: unformattedVehicleInfo["Mth/Yr"] || "NA",
      vehReg: unformattedVehicleInfo["Veh Reg"] || "NA",
      claimNr: unformattedVehicleInfo["Claim Nr"] || "NA",
      vin: unformattedVehicleInfo["VIN"] || "NA",
    };

    return formattedVehicleInfo;
  }

  async scrapePartNumbers(url: string): Promise<Either<Failure, boolean>> {
    this.logger.info("[ScraperRepository.scrapePartNumbers] started.");

    const botOrFailure = await this.launchBotController();

    if (botOrFailure.isLeft()) {
      const failure = botOrFailure.value;

      this.logger.warn(failure.message);
      this.logger.info("[ScraperRepository.scrapePartNumbers] completed with a [Failure].");

      return new Left(failure);
    }

    const botController = botOrFailure.value;
    const { stealthBrowser } = botController;

    const loggedInOrFailed = await this.loginToPartsCheck(botController.pages[0]);

    if (loggedInOrFailed.isLeft()) {
      const loginFailure = loggedInOrFailed.value;

      this.logger.warn(SCRAPER_BOT_LOGIN_TO_PARTS_CHECK_FAILURE_MESSAGE);

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapePartNumbers] completed with a [Failure].");

      return new Left(loginFailure);
    }

    const page = botController.pages[0];
    const navigatedToUrlOrFailed = await safePromise<null | Response>(() => page.goto(url));

    if (navigatedToUrlOrFailed.isLeft()) {
      const navigationErr = navigatedToUrlOrFailed.value;

      this.logger.warn(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE);
      this.logger.error(navigationErr);

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapePartNumbers] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, navigationErr));
    }

    const partNumbersOrFailure = await this.getPartNumbers(botController);

    if (partNumbersOrFailure.isLeft()) {
      const getPartNumbersFailure = partNumbersOrFailure.value;

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapePartNumbers] completed with a [Failure].");

      return new Left(getPartNumbersFailure);
    }

    const partNumbers = partNumbersOrFailure.value;
    const partNumbersSavedOrFailed = this.savePartNumbersAsCsv(partNumbers);

    if (partNumbersSavedOrFailed.isLeft()) {
      const failure = partNumbersSavedOrFailed.value;

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapePartNumbers] completed with a [Failure].");

      return new Left(failure);
    }

    await stealthBrowser.context.close();
    await stealthBrowser.browser.close();

    this.logger.info("[ScraperRepository.scrapePartNumbers] completed.");

    return new Right(true);
  }

  async scrapeVehicleInfoWithPartsData(url: string): Promise<Either<Failure, boolean>> {
    this.logger.info("[ScraperRepository.scrapeVehicleInfoWithPartsData] started.");

    const botOrFailure = await this.launchBotController();

    if (botOrFailure.isLeft()) {
      const failure = botOrFailure.value;

      this.logger.warn(failure.message);
      this.logger.info("[ScraperRepository.scrapeVehicleInfoWithPartsData] completed with a [Failure].");

      return new Left(failure);
    }

    const botController = botOrFailure.value;
    const { stealthBrowser } = botController;

    const loggedInOrFailed = await this.loginToPartsCheck(botController.pages[0]);

    if (loggedInOrFailed.isLeft()) {
      const loginFailure = loggedInOrFailed.value;

      this.logger.warn(SCRAPER_BOT_LOGIN_TO_PARTS_CHECK_FAILURE_MESSAGE);

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapeVehicleInfoWithPartsData] completed with a [Failure].");

      return new Left(loginFailure);
    }

    const page = botController.pages[0];
    const navigatedToUrlOrFailed = await safePromise<null | Response>(() => page.goto(url));

    if (navigatedToUrlOrFailed.isLeft()) {
      const navigationErr = navigatedToUrlOrFailed.value;

      this.logger.warn(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE);
      this.logger.error(navigationErr);

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapeVehicleInfoWithPartsData] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, navigationErr));
    }

    const vehicleInfoWithPartsDataOrFailure = await this.getVehicleInfoWithPartsData(botController);

    if (vehicleInfoWithPartsDataOrFailure.isLeft()) {
      const failure = vehicleInfoWithPartsDataOrFailure.value;

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapeVehicleInfoWithPartsData] completed with a [Failure].");

      return new Left(failure);
    }

    const vehicleInfoWithPartsData = vehicleInfoWithPartsDataOrFailure.value;
    const vehicleInfoWithPartsDataSavedOrFailed = this.saveVehicleInfoWithPartsDataAsCsv(vehicleInfoWithPartsData);

    if (vehicleInfoWithPartsDataSavedOrFailed.isLeft()) {
      const failure = vehicleInfoWithPartsDataSavedOrFailed.value;

      await stealthBrowser.context.close();
      await stealthBrowser.browser.close();

      this.logger.info("[ScraperRepository.scrapeVehicleInfoWithPartsData] completed with a [Failure].");

      return new Left(failure);
    }

    await stealthBrowser.context.close();
    await stealthBrowser.browser.close();

    this.logger.info("[ScraperRepository.scrapeVehicleInfoWithPartsData] completed.");

    return new Right(true);
  }

  private async getVehicleInfoWithPartsData(
    botController: BotControllerImpl,
  ): Promise<Either<Failure, {
    partNumbersAndTexts: { partNumber: string; partText: string; }[];
    vehicleInfo: VehicleInfo;
  }>> {
    const partNumbersAndTextsOrFailure = await this.getPartNumbersAndPartTexts(botController);

    if (partNumbersAndTextsOrFailure.isLeft()) {
      return new Left(partNumbersAndTextsOrFailure.value);
    }

    const vehicleInfoOrFailure = await this.getVehicleInfo(botController);

    if (vehicleInfoOrFailure.isLeft()) {
      return new Left(vehicleInfoOrFailure.value);
    }

    return new Right({
      partNumbersAndTexts: partNumbersAndTextsOrFailure.value,
      vehicleInfo: vehicleInfoOrFailure.value,
    });
  }

  async loginToPartsCheck(page: Page): Promise<Either<Failure, boolean>> {
    this.logger.info("[ScraperRepository.loginToPartsCheck] started.");

    const scraperConfigOrFailure = this.getScraperConfig();

    if (scraperConfigOrFailure.isLeft()) {
      const getScraperConfigFailure = scraperConfigOrFailure.value;
      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");

      return new Left(getScraperConfigFailure);
    }

    const navigatedToUrlOrFailed = await safePromise<null | Response>(() => page.goto(PARTS_CHECK_LOGIN_URL));

    if (navigatedToUrlOrFailed.isLeft()) {

      const navigationErr = navigatedToUrlOrFailed.value;

      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE);
      this.logger.error(navigationErr);

      return new Left(new ScraperFailure(SCRAPER_PAGE_NAVIGATION_FAILURE_MESSAGE, navigationErr));
    }

    const scraperConfig = scraperConfigOrFailure.value;

    const filledInputsOrFailed = await this.fillCredentialInputs({
      page,
      username: scraperConfig.partsCheckCredentials.username,
      password: scraperConfig.partsCheckCredentials.password,
    });

    if (filledInputsOrFailed.isLeft()) {
      const fillInputFailure: ScraperFailure = filledInputsOrFailed.value;
      const fillInputErr = fillInputFailure.error;

      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_FILL_FAILURE_MESSAGE);
      this.logger.error(fillInputErr!);

      return new Left(new ScraperFailure(SCRAPER_PAGE_FILL_FAILURE_MESSAGE, fillInputErr));
    }

    const clickedOrFailed = await safePromise<void>(() => page.click(Selectors.loginBtn));

    if (clickedOrFailed.isLeft()) {
      const clickErr = clickedOrFailed.value;

      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_CLICK_FAILURE_MESSAGE);
      this.logger.error(clickErr);

      return new Left(new ScraperFailure(SCRAPER_PAGE_CLICK_FAILURE_MESSAGE, clickErr));
    }

    const authenticationLocator = page.locator(Selectors.isLoggedIn);

    const authenticatedOrFailed = await safePromise<void>(() => authenticationLocator.waitFor({ state: "visible" }));

    if (authenticatedOrFailed.isLeft()) {
      const waitForErr = authenticatedOrFailed.value;

      this.logger.info("[ScraperRepository.loginToPartsCheck] completed with a [Failure].");
      this.logger.warn(SCRAPER_PAGE_WAIT_FOR_FAILURE_MESSAGE);
      this.logger.error(waitForErr);

      return new Left(new ScraperFailure(SCRAPER_PAGE_WAIT_FOR_FAILURE_MESSAGE, waitForErr));
    }

    this.logger.info("[ScraperRepository.loginToPartsCheck] completed.");

    return new Right(true);
  }

  savePartNumbersAsCsv(partNumbers: string[]): Either<Failure, boolean> {
    this.logger.info("[ScraperRepository.savePartNumbersAsCsv] started.");

    const scraperConfigOrFailure = this.getScraperConfig();

    if (scraperConfigOrFailure.isLeft()) {
      const scraperConfigFailure = scraperConfigOrFailure.value;

      this.logger.info("[ScraperRepository.savePartNumbersAsCsv] completed with a [Failure].");

      return new Left(scraperConfigFailure);
    }

    const scraperConfig = scraperConfigOrFailure.value;

    const fileName = `${moment().utc().format("YYYY-MM-DD HH-MM-ss").toString()}--part_numbers.csv`;
    const pathToSave = path.join(scraperConfig.savePath, fileName);

    partNumbers = partNumbers.map((i) => `"${i.replace(/-| /g, "")}"`);

    const fileSavedOrFailed = safeCall(() => fs.writeFileSync(pathToSave, partNumbers.join("\n"), { encoding: "utf-8" }));

    if (fileSavedOrFailed.isLeft()) {
      const fsWriteFileSyncErr = fileSavedOrFailed.value;

      this.logger.info("[ScraperRepository.savePartNumbersAsCsv] completed with a [Failure].");
      this.logger.warn(FS_WRITE_FILE_SYNC_FAILURE_MESSAGE);
      this.logger.error(fsWriteFileSyncErr);

      return new Left(new ScraperFailure(FS_WRITE_FILE_SYNC_FAILURE_MESSAGE, fsWriteFileSyncErr));
    }

    this.logger.info(`[ScraperRepository.savePartNumbersAsCsv] saved CSV file to ${pathToSave}.`);
    this.logger.info("[ScraperRepository.savePartNumbersAsCsv] completed.");

    return new Right(true);
  }

  saveVehicleInfoWithPartsDataAsCsv({ partNumbersAndTexts, vehicleInfo }: SaveVehicleInfoWithPartsDataAsCsvParams): Either<Failure, boolean> {
    this.logger.info("[ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] started.");

    const scraperConfigOrFailure = this.getScraperConfig();

    if (scraperConfigOrFailure.isLeft()) {
      const scraperConfigFailure = scraperConfigOrFailure.value;

      this.logger.info("[ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] completed with a [Failure].");

      return new Left(scraperConfigFailure);
    }

    const scraperConfig = scraperConfigOrFailure.value;

    const fileName = `${moment().utc().format("YYYY-MM-DD HH-MM-ss").toString()}--vehicle_info_with_parts_data.csv`;
    const pathToSave = path.join(scraperConfig.savePath, fileName);

    const csvData = this.parseVehicleInfoWithPartsDataToCsv({ partNumbersAndTexts, vehicleInfo });

    const fileSavedOrFailed = safeCall(() => fs.writeFileSync(pathToSave, csvData, { encoding: "utf-8" }));

    if (fileSavedOrFailed.isLeft()) {
      const fsWriteFileSyncErr = fileSavedOrFailed.value;

      this.logger.info("[ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] completed with a [Failure].");
      this.logger.warn(FS_WRITE_FILE_SYNC_VEHICLE_INFO_WITH_PART_NUMBERS_FAILURE_MESSAGE);
      this.logger.error(fsWriteFileSyncErr);

      return new Left(new ScraperFailure(FS_WRITE_FILE_SYNC_VEHICLE_INFO_WITH_PART_NUMBERS_FAILURE_MESSAGE, fsWriteFileSyncErr));
    }

    this.logger.info("[ScraperRepository.saveVehicleInfoWithPartsDataAsCsv] completed.");

    return new Right(true);
  }

  private parseVehicleInfoWithPartsDataToCsv({ partNumbersAndTexts, vehicleInfo }: SaveVehicleInfoWithPartsDataAsCsvParams): string {
    let csv = "";

    const header = `"Row","PartText","PartNumber","Make","Model","Model Nr","Series","Trans","Colour","VIN","Body","Mth/Yr","Veh Reg","Claim Nr"`;

    csv += `${header}\n`;

    const { make, model, modelNr, series, trans, colour, vin, body, mthYr, vehReg, claimNr } = vehicleInfo;

    for (let row = 0; row < partNumbersAndTexts.length; row++) {
      const { partText, partNumber } = partNumbersAndTexts[row];

      csv += `"${row}","${partText}","${partNumber}","${make}","${model}","${modelNr}","${series}","${trans}","${colour}","${vin}","${body}","${mthYr}","${vehReg}","${claimNr}"\n`;
    }

    return csv;
  }

  setScraperConfig(config: ScraperConfig): Either<Failure, boolean> {
    this.logger.info("[ScraperRepository.setScraperConfig] started.");

    const savedOrFailed = safeCall<boolean>(() => this.localDataSource.setScraperConfig(config));

    if (savedOrFailed.isLeft()) {
      const setScraperConfigErr = savedOrFailed.value;

      this.logger.warn(SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE);
      this.logger.error(setScraperConfigErr);

      this.logger.info("[ScraperRepository.setScraperConfig] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_LOCAL_DATA_SOURCE_SET_SCRAPER_CONFIG_FAILURE_MESSAGE, setScraperConfigErr));
    }

    this.logger.info("[ScraperRepository.setScraperConfig] completed.");

    return new Right(true);
  }

  getScraperConfig(): Either<Failure, ScraperConfig> {
    this.logger.info("[ScraperRepository.getScraperConfig] started.");

    const scraperConfigOrFailure = safeCall<ScraperConfig>(() => this.localDataSource.getScraperConfig()!);

    if (scraperConfigOrFailure.isLeft()) {
      const setScraperConfigErr = scraperConfigOrFailure.value;

      this.logger.warn(SCRAPER_LOCAL_DATA_SOURCE_GET_SCRAPER_CONFIG_FAILURE_MESSAGE);
      this.logger.error(setScraperConfigErr);

      this.logger.info("[ScraperRepository.getScraperConfig] completed with a [Failure].");

      return new Left(new ScraperFailure(SCRAPER_LOCAL_DATA_SOURCE_GET_SCRAPER_CONFIG_FAILURE_MESSAGE, setScraperConfigErr));
    }

    const scraperConfig = scraperConfigOrFailure.value;

    this.logger.info("[ScraperRepository.getScraperConfig] completed.");

    return new Right(scraperConfig);
  }

  private async fillCredentialInputs({ page, username, password }: { page: Page; username: string; password: string; }): Promise<Either<Failure, boolean>> {
    try {
      await page.fill(Selectors.loginUsernameInp, username);
      await page.fill(Selectors.loginPasswordInp, password);

      return new Right(true);
    } catch (error) {
      if (error instanceof Error)
        return new Left(new ScraperFailure(SCRAPER_PAGE_FILL_FAILURE_MESSAGE, error));

      return new Left(new ScraperFailure(SCRAPER_PAGE_FILL_FAILURE_MESSAGE, new Error("Unexpected error.")));
    }
  }
}

export default ScraperRepositoryImpl;
