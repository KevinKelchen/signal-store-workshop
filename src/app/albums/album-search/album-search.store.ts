import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { exhaustMap, filter, pipe, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { tapResponse } from '@ngrx/operators';
import { SortOrder } from '@/shared/models/sort-order.model';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@/shared/state/request-status.feature';
import { Album, searchAlbums, sortAlbums } from '@/albums/album.model';
import { AlbumsService } from '@/albums/albums.service';
import { AlbumsStore } from "../albums.store";

export const AlbumSearchStore = signalStore(
  withState({
    query: '',
    order: 'asc' as SortOrder,
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
  withMethods(
    (
      store,
      snackBar = inject(MatSnackBar),
    ) => ({
      updateQuery(query: string): void {
        patchState(store, { query });
      },
      updateOrder(order: SortOrder): void {
        patchState(store, { order });
      },
      notifyOnError: rxMethod<string | null>(
        pipe(
          filter(Boolean),
          tap((error) => snackBar.open(error, 'Close', { duration: 5_000 })),
        ),
      ),
    }),
  ),
  withHooks({
    onInit({ notifyOnError }, albumsStore = inject(AlbumsStore)) {
      albumsStore.loadAllAlbums();
      notifyOnError(albumsStore.error);
    },
  }),
);
