import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantInfoFormComponent } from './participant-info-form.component';

describe('ParticipantInfoFormComponent', () => {
  let component: ParticipantInfoFormComponent;
  let fixture: ComponentFixture<ParticipantInfoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantInfoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
