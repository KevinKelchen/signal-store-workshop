export type SortOrder = 'asc' | 'desc';

export function toSortOrder(value: string | undefined): SortOrder {
  return (
    value && ['asc', 'desc'].includes(value) ? value : 'asc'
  ) as SortOrder;
}
