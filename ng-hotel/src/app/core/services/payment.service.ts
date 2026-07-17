import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateIntentResponse {
  clientSecret: string;
  montant: number;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/payment';

  createPaymentIntent(hotelId: number, nuits: number): Observable<CreateIntentResponse> {
    return this.http.post<CreateIntentResponse>(`${this.apiUrl}/create-intent`, {
      hotelId,
      nuits
    });
  }

  checkStatus(paymentIntentId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/status/${paymentIntentId}`);
  }
}