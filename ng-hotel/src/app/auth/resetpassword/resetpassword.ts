import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-resetpassword',
  imports: [ RouterLink],
  templateUrl: './resetpassword.html',
  styleUrl: './resetpassword.scss',
})
export class Resetpassword {
    constructor(private router: Router) {}

  onSubmit() {
    this.router.navigate(['/login']);
  }
}
