import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Destination { id: string; name: string }

@Component({
	selector: 'app-search-bar',
	standalone: true,
    imports: [CommonModule],
	templateUrl: './search-bar.component.html',
	styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
	public destinations: Destination[] = [];
	public filtered: Destination[] = [];

	public destination = '';
	public checkin = '';
	public checkout = '';

	@Output() search = new EventEmitter<{destination:string,checkin:string,checkout:string}>();

	constructor(private router: Router) {
		// load local JSON destinations
		fetch('/assets/data/destinations.json')
			.then(r => r.json())
			.then((list: Destination[]) => { this.destinations = list; this.filtered = list; })
			.catch(() => { this.destinations = []; this.filtered = []; });
	}

	onInputChange(value: string) {
		this.destination = value;
		const q = value.trim().toLowerCase();
		this.filtered = q ? this.destinations.filter(d => d.name.toLowerCase().includes(q)) : this.destinations;
	}

	onSubmit(e: Event) {
		e.preventDefault();
		if (!this.destination) return;
		this.search.emit({ destination: this.destination, checkin: this.checkin, checkout: this.checkout });
		// navigate to search results (unified search) with query params
		this.router.navigate(['/hotels'], { queryParams: { q: this.destination, checkin: this.checkin, checkout: this.checkout } });
	}
}
