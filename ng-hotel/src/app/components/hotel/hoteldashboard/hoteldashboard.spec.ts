import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hoteldashboard } from './hoteldashboard';

describe('Hoteldashboard', () => {
  let component: Hoteldashboard;
  let fixture: ComponentFixture<Hoteldashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hoteldashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Hoteldashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
