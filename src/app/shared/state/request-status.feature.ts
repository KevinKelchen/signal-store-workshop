import { computed } from "@angular/core";
import { signalStoreFeature, withComputed, withMethods, withState } from "@ngrx/signals";


export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };

export type RequestStatusState = { requestStatus: RequestStatus };

export const withRequestStatus = () => {
  return signalStoreFeature(
    withState<RequestStatusState>({ requestStatus: 'idle'}),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      isFulfilled: computed(() => requestStatus() === 'fulfilled'),
      error: computed(() => {
        const status = requestStatus();
        // typings limitation; type narrowing needs help
        return typeof status === 'object' ? status.error : null;
      })
    }),
  ));
};

export const setPending: () => RequestStatusState = () => {
  return { requestStatus: 'pending' };
};

export const setFulfilled: () => RequestStatusState = () => {
  return { requestStatus: 'fulfilled' };
};

export const setError: (error: string) => RequestStatusState = (error) => {
  return { requestStatus: { error } };
};
