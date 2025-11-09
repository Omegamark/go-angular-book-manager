import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

export interface EpubEntry {
  key: string;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EpubViewerS3Service {

  constructor(private http: HttpClient) { }
    
  private base = `${environment.apiUrl}/api/epubs`;
  

  getEpubList(): Observable<EpubEntry[]> {
    return this.http.get<EpubEntry[]>(this.base)
  }

  getPresignedUrl(key: string): Observable<{ url: string}> {
    return this.http.get<{url: string}>(`${this.base}/presign?key=${encodeURIComponent(key)}`)
  }

  // fetch the ebook as ArrayBuffer from the presigned URL
  fetchEpubArrayBuffer(url: string): Observable<ArrayBuffer> {
    return this.http.get(url, {responseType: 'arraybuffer'})
  }
}
