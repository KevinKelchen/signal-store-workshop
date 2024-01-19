import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { SortOrder } from '@/shared/models/sort-order.model';
import { Album } from '@/albums/album.model';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';

import { patchState, signalState } from "@ngrx/signals";
import { AlbumsService } from "../albums.service";
import { catchError, tap } from "rxjs";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="state.showProgress()" />

    <div class="container">
      <h1>Albums ({{ totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="state.query()"
        [order]="state.order()"
        (queryChange)="updateQuery($event)"
        (orderChange)="updateOrder($event)"
      />

      <ngrx-album-list
        [albums]="filteredAlbums()"
        [showSpinner]="showSpinner()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumSearchComponent {
  state = signalState<{
    albums: Album[];
    showProgress: boolean;
    query: string;
    order: SortOrder;
  }>({
    albums: [],
    showProgress: false,
    query: '',
    order: 'asc',
  });

  filteredAlbums = computed(() => {
    // const searchedAlbums = searchAlbums(this.state.albums(), this.state.query());
    return this.state.albums().filter((album) => {
      // QUESTION: album.title not reactive. OK?
      return album.title
        .toLowerCase()
        .includes(this.state.query().toLowerCase());
    });
  });

  totalAlbums = computed(() => {
    return this.filteredAlbums().length;
  });

  showSpinner = computed(() => {
    return this.state.showProgress() && this.state.albums().length == 0;
  });

  albumsService = inject(AlbumsService);
  snackBar = inject(MatSnackBar);

  ngOnInit() {
    patchState(this.state, { showProgress: true });
    this.albumsService
      .getAll()
      .subscribe({
        next: albums => patchState(this.state, { albums, showProgress: false }),
        error: (error: { message: string }) => {
          patchState(this.state, { showProgress: false });
          this.snackBar.open(error.message, 'Close', { duration: 5_000 });
        }
      });
  }

  // readonly albums: Album[] = [
  //   {
  //     id: 1,
  //     title: 'Album 1',
  //     artist: 'Artist 1',
  //     releaseDate: '2023-01-01',
  //     genre: 'Genre 1',
  //     coverImage: '/assets/album-covers/unplugged.jpg',
  //   },
  //   {
  //     id: 2,
  //     title: 'Album 2',
  //     artist: 'Artist 2',
  //     releaseDate: '2024-01-01',
  //     genre: 'Genre 2',
  //     coverImage: '/assets/album-covers/are-you-experienced.jpg',
  //   },
  // ];
  // readonly query = '';
  // readonly order: SortOrder = 'asc';
  // readonly showSpinner = false;
  // readonly showProgress = false;
  // readonly totalAlbums = this.albums.length;

  updateQuery(query: string): void {
    patchState(this.state, { query });
  }

  updateOrder(order: SortOrder): void {
    patchState(this.state, { order });
  }
}

const searchAlbums = (albums: Album[], query: string) => {
  return albums.filter((album) => {
    // QUESTION: album.title not reactive. OK?
    return album.title
      .toLowerCase()
      .includes(query.toLowerCase());
  });
}
