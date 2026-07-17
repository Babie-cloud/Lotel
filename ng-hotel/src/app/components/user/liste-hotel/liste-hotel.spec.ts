import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeHotel } from './liste-hotel';

describe('ListeHotel', () => {
  let component: ListeHotel;
  let fixture: ComponentFixture<ListeHotel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeHotel],
    }).compileComponents();

    fixture = TestBed.createComponent(ListeHotel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
