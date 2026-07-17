import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmReservation } from './confirm-reservation';

describe('ConfirmReservation', () => {
  let component: ConfirmReservation;
  let fixture: ComponentFixture<ConfirmReservation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmReservation],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmReservation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
