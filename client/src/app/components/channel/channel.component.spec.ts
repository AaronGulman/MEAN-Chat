import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/channel.service';
import { SocketService } from '../../services/socket.service';
import { UploadService } from '../../services/upload.service';
import { PeerService } from '../../services/peer.service';
import { ChannelComponent } from './channel.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('ChannelComponent', () => {
  let component: ChannelComponent;
  let fixture: ComponentFixture<ChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ChannelComponent,
        HttpClientModule,
        RouterTestingModule,
      ],
      providers: [
        AuthService,
        GroupService,
        ChannelService,
        UploadService,
        UserService,
        SocketService,
        PeerService
      ],
    })

    fixture = TestBed.createComponent(ChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
