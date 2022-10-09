import { LaunchOptions } from "playwright-firefox";

interface StealthBrowserLaunchOptions extends Omit<LaunchOptions, "proxy"> { }

export default StealthBrowserLaunchOptions;
