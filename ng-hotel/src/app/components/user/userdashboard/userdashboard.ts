import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HotelService, Hotel } from '../../../core/services/hotel.service';

/** Codes postaux disponibles par ville (données partenaires). */
const CODES_POSTAUX_PAR_VILLE: Record<string, string[]> = {
  Paris: ['75004', '75007'],
  Lyon: ['69002'],
  'Saint-Étienne': ['42000'],
  'Clermont-Ferrand': ['63000'],
  Annecy: ['74000'],
  Marseille: ['13001'],
  Toulon: ['83000'],
  Nice: ['06000'],
  'Aix-en-Provence': ['13100'],
  Montpellier: ['34000'],
  Toulouse: ['31000'],
  Nîmes: ['30000'],
  Perpignan: ['66000'],
  Bordeaux: ['33000'],
  Limoges: ['87000'],
  Brest: ['29200'],
  Rennes: ['35000'],
  Strasbourg: ['67000'],
  Reims: ['51100'],
  Nancy: ['54000'],
  Lille: ['59000'],
  'Le Havre': ['76600'],
  Rouen: ['76000'],
};

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
  selectedVille: string = '';
  codesPostauxDisponibles: string[] = [];

  searchForm: FormGroup = this.fb.group(
    {
      codePostal: ['', [Validators.pattern('^[0-9]{5}$')]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      personnes: [1, [Validators.required, Validators.min(1)]],
    },
    { validators: dateRangeValidator }
  );

  ngOnInit(): void {
    this.hotelService.getHotels().subscribe((data) => (this.hotels = data));
  }

  filterByVille(ville: string, event?: Event): void {
    event?.preventDefault();
    this.selectedVille = ville;
    this.codesPostauxDisponibles = CODES_POSTAUX_PAR_VILLE[ville] ?? [];

    const cpActuel = this.searchForm.get('codePostal')?.value;
    if (cpActuel && !this.codesPostauxDisponibles.includes(cpActuel)) {
      this.searchForm.patchValue({ codePostal: '' });
    }

    // Si les dates sont déjà renseignées, on lance une recherche complète
    if (this.searchForm.get('dateDebut')?.value && this.searchForm.get('dateFin')?.value) {
      this.searchHotels();
    } else {
      this.hotelService.searchByVille(ville).subscribe((data) => (this.hotels = data));
    }
  }

  onCodePostalChange(): void {
    const cp = this.searchForm.get('codePostal')?.value;
    if (!cp || !/^[0-9]{5}$/.test(cp)) return;

    // Si aucune ville n'est choisie, on déduit la ville depuis le CP
    if (!this.selectedVille) {
      const ville = Object.entries(CODES_POSTAUX_PAR_VILLE).find(([, cps]) =>
        cps.includes(cp)
      )?.[0];
      if (ville) {
        this.selectedVille = ville;
        this.codesPostauxDisponibles = CODES_POSTAUX_PAR_VILLE[ville];
      }
    }
  }

  searchHotels(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { codePostal, dateDebut, dateFin, personnes } = this.searchForm.value;

    // CP doit correspondre à la ville sélectionnée
    if (
      this.selectedVille &&
      codePostal &&
      !(CODES_POSTAUX_PAR_VILLE[this.selectedVille] ?? []).includes(codePostal)
    ) {
      this.searchForm.get('codePostal')?.setErrors({ codePostalVilleMismatch: true });
      return;
    }

    this.hotelService
      .searchHotels({
        ville: this.selectedVille || undefined,
        codePostal: codePostal || undefined,
        dateDebut,
        dateFin,
        personnes,
      })
      .subscribe((data) => (this.hotels = data));
  }

  resetSearch(): void {
    this.selectedVille = '';
    this.codesPostauxDisponibles = [];
    this.searchForm.reset({ codePostal: '', dateDebut: '', dateFin: '', personnes: 1 });
    this.hotelService.getHotels().subscribe((data) => (this.hotels = data));
  }

  /** Nombre de chambres à réserver : 1 chambre = 2 personnes */
  chambresPour(personnes: number): number {
    return Math.ceil(personnes / 2);
  }

  showDetail(hotel: Hotel): void {
    if (hotel.disponible === false) {
      return;
    }
    this.selectedHotel = hotel;
    const personnes = this.searchForm.get('personnes')?.value ?? 1;
    const chambres = hotel.chambresNecessaires ?? this.chambresPour(personnes);
    this.router.navigate(['/payment'], {
      state: {
        hotel,
        personnes,
        chambres,
        dateDebut: this.searchForm.get('dateDebut')?.value,
        dateFin: this.searchForm.get('dateFin')?.value,
      },
    });
  }

  pay(hotel: Hotel): void {
    this.showDetail(hotel);
  }
}
