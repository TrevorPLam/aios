/**
 * iOS Mobile Application Entry Point
 * 
 * This is the iOS-specific entry point for the mobile application.
 * It imports the shared App component from @aios/mobile-shared.
 */
import { registerRootComponent } from "expo";

import App from "@aios/mobile-shared";

registerRootComponent(App);
