import { TestBed } from '@angular/core/testing';
import { UploadService } from './upload.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';


describe('UploadService', () => {
  let service: UploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
    });
    service = TestBed.inject(UploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload files', () => {
    const mockFiles: File[] = [
      new File(['content'], 'file1.txt', { type: 'text/plain' }),
      new File(['another content'], 'file2.txt', { type: 'text/plain' })
    ];
    const mockResponse = { success: true };

    service.uploadFiles(mockFiles).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://localhost:3000/api/upload');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockResponse);
  });

  it('should retrieve a file by filename', () => {
    const filename = 'file1.txt';
    const mockBlob = new Blob(['file content'], { type: 'text/plain' });

    service.getFile(filename).subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`https://localhost:3000/api/file/${filename}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});