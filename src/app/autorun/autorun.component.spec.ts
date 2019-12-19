import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorunComponent } from './autorun.component';

describe('AutorunComponent', () => {
  let component: AutorunComponent;
  let fixture: ComponentFixture<AutorunComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutorunComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
