import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-summary.component.html',
  styleUrls: ['./result-summary.component.scss']
})
export class ResultSummaryComponent {
  @Input() month!: number;
  @Input() budget!: string;
  @Input() categories: string[] = [];
  @Input() resultCount: number = 0;

  // Month name mapping
  private monthNames: Record<number, string> = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
  };

  // Budget display mapping
  private budgetDisplayMap: Record<string, string> = {
    'budget': '₹10k–₹20k',
    'moderate': '₹15k–₹30k',
    'premium': '₹30k+'
  };

  get monthName(): string {
    return this.monthNames[this.month] || 'Selected Month';
  }

  get budgetDisplay(): string {
    return this.budgetDisplayMap[this.budget] || this.budget;
  }

  get categoriesDisplay(): string {
    return this.categories.length > 0 ? this.categories.join(' • ') : 'Selected interests';
  }

  get resultCountDisplay(): string {
    if (this.resultCount === 0) {
      return 'No destinations found';
    }
    return `${this.resultCount} best destination${this.resultCount !== 1 ? 's' : ''}`;
  }
}
