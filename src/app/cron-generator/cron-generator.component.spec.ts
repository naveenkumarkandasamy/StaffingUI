import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CronGeneratorComponent } from './cron-generator.component';

describe('CronGenComponent', () => {
  let component: CronGeneratorComponent;
  let fixture: ComponentFixture<CronGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CronGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
