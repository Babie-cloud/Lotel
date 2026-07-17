import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, 
         FormGroup, 
         ReactiveFormsModule, 
         Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HotelService, Hotel } from '../../../core/services/hotel.service';


function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const debut = control.get('dateDebut')?.value;
  const fin = control.get('dateFin')?.value;
  if (!debut || !fin) return null;
  return new Date(fin) > new Date(debut) ? null : { dateRangeInvalid: true };
}

@Component({
  selector: 'app-userdashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './userdashboard.html',
  styleUrl: './userdashboard.scss',
})
export class Userdashboard implements OnInit {
  private hotelService = inject(HotelService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  hotels: Hotel[] = [];
  selectedHotel: Hotel | null = null;

  searchForm: FormGroup = this.fb.group(
    {
      codePostal: ['', [Validators.pattern('^[0-9]{5}$')]],
      dateDebut: [''],
      dateFin: [''],
      personnes: [1, [Validators.min(1)]],
    },
    { validators: dateRangeValidator }
  );

  ngOnInit(): void {
    this.hotelService.getHotels().subscribe((data) => (this.hotels = data));
  }

  filterByVille(ville: string): void {
    this.hotelService.searchByVille(ville).subscribe((data) => (this.hotels = data));
  }

  searchHotels(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { codePostal, dateDebut, dateFin, personnes } = this.searchForm.value;

    this.hotelService
      .searchHotels({ codePostal, dateDebut, dateFin, personnes })
      .subscribe((data) => (this.hotels = data));
  }

  resetSearch(): void {
    this.searchForm.reset({ codePostal: '', dateDebut: '', dateFin: '', personnes: 1 });
    this.ngOnInit();
  }

  showDetail(hotel: Hotel): void {
    this.selectedHotel = hotel;
  }


  pay() { 
    this.router.navigate(['/payment']);
  }
}