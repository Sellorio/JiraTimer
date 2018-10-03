import { TestBed } from '@angular/core/testing';

import { JiraService } from './jira.service';

describe('JiraService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JiraService = TestBed.get(JiraService);
    expect(service).toBeTruthy();
  });
});
