export type PaginationMeta = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export type PaginatedResponse<T> = {
  items: T[]
  pagination: PaginationMeta
}
