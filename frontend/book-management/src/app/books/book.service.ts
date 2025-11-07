import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Book } from '../models/book';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // backend base URL - adjust if your go server runs on a different host/port
  // I will need to adjust this when containerizing the go app.
  private base = `${environment.apiUrl}/api/books`;

  constructor(private http: HttpClient ) { }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.base)
  }

  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.base, book)
  }

  removeBook(bookId: string): Observable<void>{
    const url = `${this.base}/${encodeURIComponent(bookId)}`
    console.log("URL: ", url)
    return this.http.delete<void>(url)
  }

  // Old code getting directly from browser
  // addBook(book: Book): Observable<Book>{
  //   return of(book)
  // }
}
