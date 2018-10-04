import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraListComponent } from './jira-list.component';

describe('JiraListComponent', () => {
  let component: JiraListComponent;
  let fixture: ComponentFixture<JiraListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
