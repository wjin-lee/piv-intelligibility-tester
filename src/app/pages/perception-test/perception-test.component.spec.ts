import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerceptionTestComponent } from './perception-test.component';

describe('PerceptionTestComponent', () => {
  let component: PerceptionTestComponent;
  let fixture: ComponentFixture<PerceptionTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerceptionTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerceptionTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
