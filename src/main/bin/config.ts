import AboutConfig from '../features/browser/domain/entities/AboutConfig';
import StealthBrowserLaunchOptions from '../features/browser/domain/entities/StealthBrowserLaunchOptions';
import path from 'path';

export const LAUNCH_TIMEOUT: number = 60000;

const BROWSER_PATH_PROD = path.join(__dirname, "..", "..", "..", "firefox", "firefox", "firefox.exe");

export const DEFAULT_LAUNCH_OPTIONS: StealthBrowserLaunchOptions = process.env.NODE_ENV === "development" ? {
  headless: true,
  timeout: LAUNCH_TIMEOUT,
  ignoreDefaultArgs: ['--hide-scrollbars', '--mute-audio'],
} : {
  executablePath: BROWSER_PATH_PROD,
  headless: true,
  timeout: LAUNCH_TIMEOUT,
  ignoreDefaultArgs: ['--hide-scrollbars', '--mute-audio'],
};

export const CONCURRENCY: number = 5;

export const DEFAULT_ABOUT_CONFIG: AboutConfig = {
  "javascript.use_us_english_locale": true,
  "browser.contentblocking.category": "standard",
  "network.cookie.cookieBehavior": 0,
  "browser.urlbar.placeholderName": "Google",
  "media.autoplay.blocking_policy": 2,
  "media.autoplay.enabled.user-gestures-needed": true,
  "dom.ipc.processPrelaunch.enabled": true,
  "media.peerconnection.ice.proxy_only": true,
  "media.peerconnection.ice.relay_only": false,
  "media.peerconnection.use_document_iceservers": false,
  "media.peerconnection.default_iceservers": "[]",
  "media.peerconnection.ice.force_interface": "192.168.0.1",
  "media.navigator.enabled": false,
  "media.peerconnection.enabled": true,
  "dom.ipc.processCount": 2,
};

export const SENTRY_DSN_URL = "https://f2e3023b40eb413bbd5c590dae8993cf@o1151796.ingest.sentry.io/4503946505158656";
