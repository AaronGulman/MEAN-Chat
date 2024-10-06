import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { PeerService } from './peer.service';

describe('PeerService', () => {
  let service: PeerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
      ],
    });
    service = TestBed.inject(PeerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
