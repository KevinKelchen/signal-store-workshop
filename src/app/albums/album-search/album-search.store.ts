import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, pipe, tap } from 'rxjs';
import {
  signalStore,
  withComputed,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toSortOrder } from '@/shared/models/sort-order.model';
import { withQueryParams } from '@/shared/state/route/query-params.feature';
import { searchAlbums, sortAlbums } from '@/albums/album.model';
import { AlbumsStore } from '@/albums/albums.store';

export const AlbumSearchStore = signalStore(
  withQueryParams({
    query: (param) => param ?? '',
    order: toSortOrder,
  }),
  withComputed(({ query, order }, albumsStore = inject(AlbumsStore)) => {
    const filteredAlbums = computed(() => {
      const searchedAlbums = searchAlbums(albumsStore.entities(), query());
      return sortAlbums(searchedAlbums, order());
    });

    return {
      filteredAlbums,
      showProgress: albumsStore.isPending,
      showSpinner: computed(
        () => albumsStore.isPending() && albumsStore.entities().length === 0,
      ),
      totalAlbums: computed(() => filteredAlbums().length),
    };
  }),
  withMethods((_, snackBar = inject(MatSnackBar)) => ({
    notifyOnError: rxMethod<string | null>(
      pipe(
        filter(Boolean),
        tap((error) => snackBar.open(error, 'Close', { duration: 5_000 })),
      ),
    ),
  })),
  withHooks({
    onInit({ notifyOnError }, albumsStore = inject(AlbumsStore)) {
      albumsStore.loadAllAlbums();
      notifyOnError(albumsStore.error);
    },
  }),
);
