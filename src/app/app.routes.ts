import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HotelListComponent } from './pages/hotels/hotel-list.component';
import { HotelDetailComponent } from './pages/hotel/hotel-detail.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'hotels', component: HotelListComponent },
	{ path: 'hotel/:id', component: HotelDetailComponent }
];
