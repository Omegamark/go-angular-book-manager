import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { EpubViewerComponent } from './epub-viewer/epub-viewer.component';
import { AppHomeComponent } from './app-home/app-home.component';
import { UserComponent } from './user/user.component';
import { EpubViewerS3Component } from './epub-viewer-s3/epub-viewer-s3.component';

const routes: Routes = [
  { path: "", component: AppHomeComponent },
  { path: "book-list", component: BookListComponent },
  { path: "epub-viewer", component: EpubViewerComponent },
  { path: "epub-viewer-s3", component: EpubViewerS3Component},
  { path: "user", component: UserComponent },
  { path: '**', redirectTo: '' }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
