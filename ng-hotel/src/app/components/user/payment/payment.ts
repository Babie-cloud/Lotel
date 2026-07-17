import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment implements OnInit {
  @Input({ required: true }) hotelId!: number;
  @Input() nuits: number = 1;
  @Input() selectedHotel: any; 
  private paymentService = inject(PaymentService);
  private stripePromise = loadStripe('pk_test_XXXXXXXXXXXXXXXXXXXXXXXX');

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

 
  isPaying = false; 
  montant: number | null = null;
  isLoading = false;
  isProcessing = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  async ngOnInit(): Promise<void> {

  }

  async goToPayment(hotel: any): Promise<void> {
    this.isPaying = true;
    this.isLoading = true;
    this.errorMessage = null;

    this.stripe = await this.stripePromise;

    this.paymentService.createPaymentIntent(this.hotelId, this.nuits).subscribe({
      next: async (response) => {
        this.montant = response.montant;

        if (!this.stripe) return;

        this.elements = this.stripe.elements({
          clientSecret: response.clientSecret,
          appearance: { theme: 'stripe' }
        });

        setTimeout(() => {
          if (this.elements) {
            this.paymentElement = this.elements.create('payment');
            this.paymentElement.mount('#payment-element');
            this.isLoading = false;
          }
        }, 0);
      },
      error: (err) => {
        this.errorMessage = "Impossible d'initialiser le paiement.";
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.isPaying = false;
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.stripe || !this.elements) return;

    this.isProcessing = true;
    this.errorMessage = null;

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + '/reservation-confirmee'
      },
      redirect: 'if_required'
    });

    this.isProcessing = false;

    if (error) {
      this.errorMessage = error.message ?? 'Le paiement a échoué. Vérifiez vos informations.';
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      this.successMessage = 'Paiement réussi ! Votre réservation est confirmée.';
    }
  }
}