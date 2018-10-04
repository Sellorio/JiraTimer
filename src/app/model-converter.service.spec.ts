import { TestBed } from '@angular/core/testing';

import { ModelConverterService } from './model-converter.service';

describe('ModelConverterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModelConverterService = TestBed.get(ModelConverterService);
    expect(service).toBeTruthy();
  });
});
