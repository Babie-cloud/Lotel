import { Routes } from '@angular/router';
import { Landingpage } from './auth/landingpage/landingpage';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Resetpassword } from './auth/resetpassword/resetpassword';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Userdashboard } from './components/user/userdashboard/userdashboard';
import { Hoteldashboard } from './components/hotel/hoteldashboard/hoteldashboard';
import { ConfirmReservation } from './components/hotel/confirm-reservation/confirm-reservation';
import { ReservationDetails } from './components/hotel/reservation-details/reservation-details';
import { Settings } from './components/hotel/settings/settings';
import { Payment } from './components/user/payment/payment';
import { PolicyPrivacy } from './layout/policy-privacy/policy-privacy';
import { Terms } from './layout/terms/terms';

export const routes: Routes = [
    { path: '', component: Landingpage },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'reset-password', component: Resetpassword },
    { path: 'navbar', component: Navbar },
    { path: 'footer', component: Footer },
    { path: 'payment', component: Payment},
    { path: 'policy-privacy', component: PolicyPrivacy },
    { path: 'terms', component: Terms },

    {
    path: 'admin-dashboard',
    component: AdminDashboard,
    children: [
    ]
    },
    {
    path: 'userdashboard',
    component: Userdashboard,
    }, 
    {
        path : 'hotel-dashboard',
        component : Hoteldashboard,
        children : [
            {
                path : 'confirm-reservation',
                component : ConfirmReservation
            }, 
            {
                path : 'reservation-details',
                component : ReservationDetails
            },
            {
                path : 'settings',
                component : Settings
            }

        ]
    },
    { path: '**', redirectTo: '' }
];
