import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Resetpassword } from './resetpassword';

describe('Resetpassword', () => {
  let component: Resetpassword;
  let fixture: ComponentFixture<Resetpassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resetpassword],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Resetpassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
