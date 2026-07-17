import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
// 1. On importe les outils de formulaires d'Angular
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reservation',
  // 2. On ajoute ReactiveFormsModule dans les imports du composant
  imports: [ReactiveFormsModule], 
  templateUrl: './reservation.html',
  styleUrl: './reservation.scss',
})
export class Reservation implements OnInit {
  private location = inject(Location);
  private fb = inject(FormBuilder); // On injecte le FormBuilder

  // 3. On déclare notre groupe de formulaire
  searchForm!: FormGroup;

  ngOnInit(): void {
    // 4. On initialise proprement notre formulaire réactif
    this.searchForm = this.fb.group({
      ville: [''],
      codePostal: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      date: ['', Validators.required],
      personnes: [1, [Validators.required, Validators.min(1)]]
    });
  }

  searchHotels() {
    // Si le formulaire est invalide, on ne fait rien (ou on affiche des erreurs)
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    // 5. Plus besoin de document.getElementById ! On récupère directement toutes les valeurs d'un coup
    const { ville, codePostal, date, personnes } = this.searchForm.value;
 
    // On formate la date proprement si elle est définie
    const dateFormatted = date ? new Date(date).toISOString() : '';

    // 6. On construit l'URL avec les paramètres propres
    const url = `/hotel-search?ville=${encodeURIComponent(ville || '')}&codePostal=${encodeURIComponent(codePostal || '')}&date=${encodeURIComponent(dateFormatted)}&personnes=${encodeURIComponent(personnes || '')}`;

    // On navigue / met à jour l'URL
    this.location.go(url);

    console.log('Filtres de recherche appliqués :', this.searchForm.value);
    
    // Ici tu pourras appeler ton service pour charger les hôtels depuis Express :
    // this.hotelService.getHotels(this.searchForm.value).subscribe(...);
  }
}