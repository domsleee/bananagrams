import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocalComponent } from 'src/app/pages/local/local.component';

const routes: Routes = [{ path: '', component: LocalComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocalRoutingModule { }
