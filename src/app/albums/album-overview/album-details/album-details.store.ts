import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { setFulfilled, setPending, withRequestStatus } from "../../../shared/state/request-status.feature";
import { withRouteParams } from "../../../shared/state/route/route-params.feature";
import { computed, inject } from "@angular/core";
import { AlbumsStore } from "../../albums.store";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { filter, pipe, switchMap, tap } from "rxjs";
import { AlbumsService } from "../../albums.service";
import { tapResponse } from "@ngrx/operators";
import { Router } from "@angular/router";


export const AlbumDetailStore = signalStore(
  withRequestStatus(),
  withRouteParams({ albumId: (param) => Number(param) }),
  withComputed(({ albumId }, albumsStore = inject(AlbumsStore)) => ({
    album: computed(() => !!albumId() ? albumsStore.entityMap()[albumId()] : null),
  })),
  withMethods((albumDetailStore, albumsStore = inject(AlbumsStore), albumsService = inject(AlbumsService), router = inject(Router)) => ({
    loadAlbumIfNotLoaded: rxMethod<number>(
      pipe(
        filter((id) => !albumsStore.entityMap()[id]),
        tap(() => patchState(AlbumDetailStore, setPending())),
        switchMap((id) => {
          return albumsService.getById(id).pipe(
            tapResponse({
              next: (album) => {
                patchState(albumDetailStore, setFulfilled());
                albumsStore.setAlbum(album);
              },
              error: () => router.navigateByUrl()
            })
          )
        })
      ),
    )
  })),
);
