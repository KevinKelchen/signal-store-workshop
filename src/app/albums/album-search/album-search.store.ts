import { Signal, computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, pipe, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { SortOrder, toSortOrder } from '@/shared/models/sort-order.model';
import { searchAlbums, sortAlbums } from '@/albums/album.model';
import { AlbumsStore } from '@/albums/albums.store';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { withQueryParams } from "../../shared/state/route/query-params.feature";

export const AlbumSearchStore = signalStore(
  // withState({
  //   query: '', // Want to remove duplicate state b/c in route
  //   order: 'asc' as SortOrder,
  // }),
  withQueryParams({
    query: (param) => param ?? '',
    order: toSortOrder,
  }),
  withComputed(({ query, order }, albumsStore = inject(AlbumsStore)) => {
    // const route = inject(ActivatedRoute);
    // const params = toSignal(route.queryParams, { initialValue: {} as Params });

    // const query: Signal<string> = computed(() => params()['query'] ?? '');
    // const order = computed(() => toSortOrder(params()['order']));

    const filteredAlbums = computed(() => {
      const searchedAlbums = searchAlbums(albumsStore.entities(), query());
      return sortAlbums(searchedAlbums, order());
    });

    return {
      query,
      order,
      filteredAlbums,
      showProgress: albumsStore.isPending,
      showSpinner: computed(
        () => albumsStore.isPending() && albumsStore.entities().length === 0,
      ),
      totalAlbums: computed(() => filteredAlbums().length),
    };
  }),
  withMethods((_, snackBar = inject(MatSnackBar), router = inject(Router)) => ({
    // updateQuery(query: string): void {
    //   router.navigate([], { queryParams: { query }, queryParamsHandling: 'merge' });
    // },
    // updateOrder(order: SortOrder): void {

    // },
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
