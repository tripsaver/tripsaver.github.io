import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-affiliate-disclosure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './affiliate-disclosure.component.html',
  styleUrl: './affiliate-disclosure.component.scss'
})
export class AffiliateDisclosureComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.titleService.setTitle('Affiliate Disclosure - TripSaver');
    this.metaService.updateTag({
      name: 'description',
      content: 'TripSaver Affiliate Disclosure - Transparent information about our affiliate partnerships and commissions.'
    });
  }
}
