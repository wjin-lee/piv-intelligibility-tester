import { TestBed } from '@angular/core/testing';

import { PerceptionTestService } from './perception-test.service';

describe('PerceptionTestService', () => {
  let service: PerceptionTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerceptionTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
