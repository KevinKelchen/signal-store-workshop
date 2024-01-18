import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { SortOrder } from '@/shared/models/sort-order.model';

@Component({
  selector: 'ngrx-album-filter',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatIcon,
  ],
  template: `
    <div class="filter-container">
      <mat-form-field appearance="outline" class="query">
        <mat-label>Search</mat-label>
        <input
          matInput
          type="text"
          autocomplete="off"
          [ngModel]="query()"
          (ngModelChange)="onQueryChange($event)"
        />
      </mat-form-field>

      <div class="order">
        <mat-button-toggle-group
          [ngModel]="order()"
          (change)="orderChange.emit($event.value)"
        >
          <mat-button-toggle value="asc">
            <mat-icon>arrow_upward</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="desc">
            <mat-icon>arrow_downward</mat-icon>
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>
    </div>
  `,
  styleUrl: './album-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumFilterComponent {
  readonly query = input('');
  readonly order = input<SortOrder>('asc');

  @Output() readonly queryChange = new EventEmitter<string>();
  @Output() readonly orderChange = new EventEmitter<SortOrder>();

  onQueryChange(query: string) {
    this.queryChange.emit(query.trim().toLowerCase());
  }
}
