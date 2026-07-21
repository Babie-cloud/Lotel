import { ChangeDetectorRef, Component, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { PaymentService } from '../../../core/services/payment.service';
import { Hotel } from '../../../core/services/hotel.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, RouterLink],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment implements OnDestroy {
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private stripePromise = loadStripe(environment.stripePublishableKey);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;
  private clientSecret: string | null = null;

  selectedHotel: Hotel | null = null;
  nuits = 1;
  isPaying = false;
  montant: number | null = null;
  isLoading = false;
  isProcessing = false;
  formReady = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor() {
    const navHotel = this.router.getCurrentNavigation()?.extras?.state?.['hotel'] as
      | Hotel
      | undefined;
    const historyHotel =
      typeof history !== 'undefined' ? (history.state?.['hotel'] as Hotel | undefined) : undefined;

    this.selectedHotel = navHotel ?? historyHotel ?? null;

    if (!this.selectedHotel) {
      this.errorMessage =
        'No hotel selected. Return to the dashboard and click “View details”.';
    }
  }

  ngOnDestroy(): void {
    this.paymentElement?.destroy();
  }

  async goToPayment(): Promise<void> {
    if (!this.selectedHotel) return;

    this.isPaying = true;
    this.isLoading = true;
    this.formReady = false;
    this.errorMessage = null;
    this.successMessage = null;

    this.stripe = await this.stripePromise;

    if (!this.stripe) {
      this.errorMessage =
        'Stripe is not configured (invalid public key). Unable to display the form.';
      this.isLoading = false;
      return;
    }

    this.paymentService.createPaymentIntent(this.selectedHotel.id, this.nuits).subscribe({
      next: async (response) => {
        try {
          this.montant = response.montant;
          this.clientSecret = response.clientSecret;

          if (!this.stripe) {
            this.errorMessage = 'Stripe not initialized.';
            return;
          }
          if (!response.clientSecret) {
            this.errorMessage = 'The server did not return a clientSecret.';
            return;
          }

          this.elements = this.stripe.elements({
            clientSecret: response.clientSecret,
            appearance: { theme: 'night' },
          });

          await new Promise((r) => setTimeout(r, 50));
          const mountEl = document.getElementById('payment-element');
          if (!mountEl) {
            this.errorMessage = 'Payment area not found on the page.';
            return;
          }

          this.paymentElement = this.elements.create('payment');
          await this.paymentElement.mount(mountEl);
          this.formReady = true;
        } catch (e) {
          console.error(e);
          this.errorMessage =
            'Unable to display the Stripe form. Check the pk/sk keys (same Test account).';
        } finally {
          this.zone.run(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          });
        }
      },
      error: (err) => {
        const apiMsg = err?.error?.message as string | undefined;
        this.errorMessage =
          apiMsg ??
          'Unable to initialize payment. Check that the xp-hotel API is running on port 3000.';
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.isPaying = false;
    this.montant = null;
    this.formReady = false;
    this.clientSecret = null;
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.stripe || !this.elements || !this.clientSecret) return;

    this.isProcessing = true;
    this.errorMessage = null;

    // Requis par les versions récentes de Stripe.js
    const { error: submitError } = await this.elements.submit();
    if (submitError) {
      this.zone.run(() => {
        this.errorMessage = submitError.message ?? 'Invalid form.';
        this.isProcessing = false;
      });
      return;
    }

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: this.elements,
      clientSecret: this.clientSecret,
      confirmParams: {
        return_url: window.location.origin + '/userdashboard',
      },
      redirect: 'if_required',
    });

    this.zone.run(() => {
      this.isProcessing = false;

      if (error) {
        this.errorMessage = error.message ?? 'Payment failed. Please check your details.';
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        this.successMessage = 'Payment successful! Your reservation is confirmed.';
      }
    });
  }
}
