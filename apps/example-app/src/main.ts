import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { ApplicationConfig } from '@angular/core';
import { inspect } from '@xstate/inspect';

inspect({
  // options
  // url: 'https://stately.ai/viz?inspect', // (default)
  iframe: false, // open in new window
});

const appConfig: ApplicationConfig = {
  providers: [],
};

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
