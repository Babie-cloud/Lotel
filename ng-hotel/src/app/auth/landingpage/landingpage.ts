import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

interface ContactForm {
  name: string;
  email: string;
  message: string;
} 

@Component({
  selector: 'app-landingpage',
  imports: [RouterLink],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.scss',
})

export class Landingpage {
  contactForm: ContactForm = {
    name: '',
    email: '',
    message: ''
  };

  constructor(private router: Router) {}

  OpenLogin() {
    this.router.navigate(['./login']);
  }

  OpenSignup() {
    this.router.navigate(['./signup']);
  }
  hotel() {
    this.router.navigate(['./userdashboard'])
  }
 
}
