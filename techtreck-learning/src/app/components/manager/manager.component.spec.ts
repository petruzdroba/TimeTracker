import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagerComponent } from './manager.component';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('ManagerComponent', () => {
  let fixture: ComponentFixture<ManagerComponent>;
  let component: ManagerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ManagerComponent,
        HttpClientTestingModule,
        MatTabsModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
