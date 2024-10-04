import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private uploadUrl = 'http://localhost:3000/api/upload';
  private fileUrl = 'http://localhost:3000/api/file';

  constructor(private http: HttpClient) { }

  uploadFiles(files: File[]): Observable<any> {
    const formData: FormData = new FormData();
    for (let file of files) {
      formData.append('image', file, file.name);
    }
    
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');

    return this.http.post(this.uploadUrl, formData, { headers });
  }

  getFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.fileUrl}/${filename}`, { responseType: 'blob' });
  }
}
