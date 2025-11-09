import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { EpubEntry, EpubViewerS3Service } from './epub-viewer-s3.service';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { selectUserName } from '../user/user.selectors';
import ePub from 'epubjs'

@Component({
  selector: 'app-epub-viewer-s3',
  templateUrl: './epub-viewer-s3.component.html',
  styleUrls: ['./epub-viewer-s3.component.css']
})
export class EpubViewerS3Component implements OnInit, OnDestroy{
  @ViewChild('viewer', {static: true}) viewer!: ElementRef<HTMLDivElement>
  epubList$!: Observable<EpubEntry[]>
  userName$: Observable<string>

  private book: any | null = null
  private rendition: any | null = null;
  public isRendered = false
  public currentLocation: string | null = null



  constructor(private s3: EpubViewerS3Service, private store: Store<AppState>) {
    this.userName$ = this.store.select(selectUserName)
  }

  ngOnInit(): void {
    this.epubList$ = this.s3.getEpubList()
  }

  openFromS3(entry: EpubEntry) {
    this.s3.getPresignedUrl(entry.key).pipe(
      switchMap(r => this.s3.fetchEpubArrayBuffer(r.url))
    ).subscribe({
      next: (arrayBuffer) => this.loadArrayBuffer(arrayBuffer),
      error: (err) => console.error('Failed to load epub from S3', err)
    })
  }

  private async loadArrayBuffer(arrayBuffer: ArrayBuffer) {
    // cleanup previous
    this.rendition?.destroy?.()
    this.book?.destroy?.()
    this.isRendered = false;
    this.currentLocation = null;

    try {
      this.book = ePub(arrayBuffer)
      this.rendition = this.book.renderTo(this.viewer.nativeElement, {
        width: '100%',
        height: '100%',
        flow: 'paginated'
      })

      if (this.rendition && this.rendition.on) {
        this.rendition.on('relocated', (location: any) => {
          try {this.currentLocation = location.start?.cfi || String(location); } catch { this.currentLocation = null}
        })
      }
      await this.rendition.display()
      this.isRendered = true


    } catch (err) {
      console.error('Failed to open Epub from s3 ArrayBuffer', err)
    }
  }

    public nextPage() {
    try { this.rendition?.next(); } catch (e) { console.warn(e); }
  }

  public prevPage() {
    try { this.rendition?.prev(); } catch (e) { console.warn(e); }
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    switch (event.code) {
      case 'PageDown': case 'ArrowRight': case 'Space':
        event.preventDefault(); this.nextPage(); break;
      case 'PageUp': case 'ArrowLeft':
        event.preventDefault(); this.prevPage(); break;
      default: break;
    }
  }

  ngOnDestroy(): void {
    this.rendition?.destroy();
    this.book?.destroy();
  }
}
