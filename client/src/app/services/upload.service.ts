import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  // Endpoint URL for uploading files
  private uploadUrl = 'https://localhost:3000/api/upload';

  // Endpoint URL for retrieving files
  private fileUrl = 'https://localhost:3000/api/file';

  constructor(private http: HttpClient) {}

  /**
   * Upload multiple files to the server
   * @param files - An array of files to be uploaded
   * @returns Observable of the response from the server
   */
  uploadFiles(files: File[]): Observable<any> {
    const formData: FormData = new FormData();
    for (let file of files) {
      // Append each file to the FormData object
      formData.append('image', file, file.name);
    }

    // Create headers for the request
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');

    // Make the HTTP POST request to upload files
    return this.http.post(this.uploadUrl, formData, { headers });
  }

  /**
   * Retrieve a file from the server by filename
   * @param filename - The name of the file to be retrieved
   * @returns Observable containing the Blob of the requested file
   */
  getFile(filename: string): Observable<Blob> {
    // Make the HTTP GET request to retrieve the file as a Blob
    return this.http.get(`${this.fileUrl}/${filename}`, { responseType: 'blob' });
  }
}
