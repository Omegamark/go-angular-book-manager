import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { BookReducer } from './books/book.reducer';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookListComponent } from './book-list/book-list.component';
import { AppState } from './app.state';
import { EffectsModule } from '@ngrx/effects';
import { BookEffects } from './books/book.effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ReactiveFormsModule } from '@angular/forms';
import { EpubViewerComponent } from './epub-viewer/epub-viewer.component';
import { HttpClientModule } from '@angular/common/http';
import { AppHomeComponent } from './app-home/app-home.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { UserComponent } from './user/user.component';
import { UserReducer } from './user/user.reducer';
import { EpubViewerS3Component } from './epub-viewer-s3/epub-viewer-s3.component';

@NgModule({
  declarations: [
    AppComponent,
    BookListComponent,
    EpubViewerComponent,
    AppHomeComponent,
    ThemeToggleComponent,
    UserComponent,
    EpubViewerS3Component
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot<AppState>({
      book: BookReducer,
      user: UserReducer
    }),
    EffectsModule.forRoot([BookEffects]),
    StoreDevtoolsModule.instrument()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
