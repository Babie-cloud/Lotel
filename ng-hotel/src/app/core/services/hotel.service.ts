import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Hotel {
  id: number;
  nom: string;
  ville: string;
  codePostal: string;
  region: string;
  adresse: string;
  prix: number;
  note: number;
  description: string;
  image: string;
  chambresDisponibles: number;
  capaciteParChambre?: number;
  chambresRestantes?: number;
  chambresNecessaires?: number | null;
  placesRestantes?: number;
  disponible?: boolean;
  messages?: string[];
}

export interface HotelSearchFilters {
  ville?: string;
  codePostal?: string;
  dateDebut?: string;
  dateFin?: string;
  personnes?: number;
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.apiUrl}/hotels`);
  }

  searchByVille(ville: string): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.apiUrl}/hotel-search`, {
      params: { ville },
    });
  }

  searchHotels(filters: HotelSearchFilters): Observable<Hotel[]> {
    let params = new HttpParams();

    if (filters.ville) params = params.set('ville', filters.ville);
    if (filters.codePostal) params = params.set('codePostal', filters.codePostal);
    if (filters.dateDebut) params = params.set('dateDebut', filters.dateDebut);
    if (filters.dateFin) params = params.set('dateFin', filters.dateFin);
    if (filters.personnes) params = params.set('personnes', String(filters.personnes));

    return this.http.get<Hotel[]>(`${this.apiUrl}/hotel-search`, { params });
  }
}