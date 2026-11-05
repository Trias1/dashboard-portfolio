const PAGE = 1000;

/**
 * Reads every row of a query, page by page. PostgREST returns at most 1,000 rows per request by default,
 * so a single select silently cuts larger results short. `page(from, to)` must build the query with a
 * stable order and `.range(from, to)`.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
  maxRows = 100_000,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; from < maxRows; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}
