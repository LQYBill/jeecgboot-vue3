export interface ShopWithOptionsListParam {
  clientId?: string;
  shopIdsString?: string;
  shopIds?: string[];
  showAll?: boolean;
  hasOptions?: number; // 0: no options, 1: has options, 2: all
  pageSize?: number;
  pageNo?: number;
  order?: 'ASC' | 'DESC';
  column?: string;
}
