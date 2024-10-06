import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { ChannelService } from './chat.service';

describe('ChatService', () => {
  let service: ChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
      ],
    });
    service = TestBed.inject(ChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
