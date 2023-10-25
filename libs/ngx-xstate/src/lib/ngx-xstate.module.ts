import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XStateService } from './xstate.service';

@NgModule({
  imports: [CommonModule],
  providers: [XStateService],
})
export class NgxXStateModule {}
