import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import ePub from 'epubjs';
import { Observable, pipe } from 'rxjs';
import { AppState } from '../app.state';
import { selectUserName } from '../user/user.selectors';

@Component({
  selector: 'app-epub-viewer',
  templateUrl: './epub-viewer.component.html',
  styleUrls: ['./epub-viewer.component.css']
})
export class EpubViewerComponent implements OnDestroy {
  @ViewChild('viewer', { static: true }) viewer!: ElementRef<HTMLDivElement>;
  private book: any | null = null;
  private rendition: any | null = null
  private objectUrl: string | null = null

  // optional state for UI
  public isRendered = false
  public currentLocation: string | null = null

  // adding the username
  userName$: Observable<string>
  constructor(
    private store: Store<AppState>
  ){
    this.userName$ = store.select(pipe(selectUserName))
  }

  async onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    // cleanup previous
    this.rendition?.destroy?.()
    this.book?.destroy?.()
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }
    this.isRendered = false

    // Read as ArrayBuffer and pass to epub
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      try {
        this.book = ePub(arrayBuffer);
        this.rendition = this.book.renderTo(this.viewer.nativeElement,
          {
            width: '100%',
            height: '100%',
            flow: 'paginated'
          })

        // update location on relocation
        this.rendition.on && this.rendition.on('relocated', (location: any) => {
          try { this.currentLocation = location.start?.cfi || String(location); }
          catch { this.currentLocation = null }
        })

        await this.rendition.display();
        this.isRendered = true
      } catch (err) {
        console.error('Failed to open Epub from ArrayBuffer', err)
      }
    }

    reader.onerror = (err) => console.error('FileReader error', err)
    reader.readAsArrayBuffer(file)
  }

  // page controls
  public nextPage() {
    if (!this.rendition) return;
    try { this.rendition.next() } catch (e) { console.warn('next page failed', e) }
  }

  public prevPage() {
    if (!this.rendition) return;
    try { this.rendition.prev() } catch (e) { console.warn('prev page failed', e) }
  }

  // keyboard handling: PageDown/PageUp, ArrowRight/ArrowLeft, Space
  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    // avoid interfering with inputs
    const target = event.target as HTMLElement | null
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

    switch (event.code) {
      case 'PageDown':
      case 'ArrowRight':
      case 'Space':
        event.preventDefault()
        this.nextPage()
        break
      case 'PageUp':
      case 'ArrowLeft':
        event.preventDefault()
        this.prevPage()
        break
      default:
        break
    }
  }


  ngOnDestroy(): void {
    this.rendition?.destroy()
    this.book?.destroy?.()
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null;
    }
  }
}
