import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { GroupComponent } from './group.component';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupService } from '../../services/group.service';
import { ChannelService } from '../../services/channel.service';
import { UploadService } from '../../services/upload.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('GroupComponent', () => {
  let component: GroupComponent;
  let fixture: ComponentFixture<GroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GroupComponent,
        HttpClientModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        AuthService,
        GroupService,
        ChannelService,
        UploadService,
        UserService
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
