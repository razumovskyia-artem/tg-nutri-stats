/// <reference types="vite/client" />
export {};

declare global {
  interface TelegramWebApp {
    initData: string;
    expand: () => void;
  }
  interface TelegramNamespace {
    WebApp?: TelegramWebApp;
  }
  interface Window {
    Telegram?: TelegramNamespace;
  }
}
