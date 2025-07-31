export interface Response <R,E> {
  data: R;
  error: E;
  status?: number;
}
