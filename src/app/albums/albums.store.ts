import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { setAllEntities, withEntities } from "@ngrx/signals/entities";
import { Album } from "./album.model";
import { setError, setFulfilled, setPending, withRequestStatus } from "../shared/state/request-status.feature";
import { inject } from "@angular/core";
import { AlbumsService } from "./albums.service";
import { tapResponse } from "@ngrx/operators";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, tap, exhaustMap } from "rxjs";


export const AlbumsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Album>(),
  withRequestStatus(),
  withMethods((store, albumsService = inject(AlbumsService)) => ({
    loadAllAlbums: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        exhaustMap(() => {
          return albumsService.getAll().pipe(
            tapResponse({
              next: (albums) => {
                patchState(store, setAllEntities(albums), setFulfilled());
              },
              error: (error: { message: string }) => {
                patchState(store, setError(error.message));
              },
            }),
          );
        }),
      ),
    ),
  })),
);
