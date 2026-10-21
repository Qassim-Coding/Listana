// Open Library : recherche de livres et couvertures (gratuit, sans clé)
const SEARCH_URL = "https://openlibrary.org/search.json";
const COVERS_URL = "https://covers.openlibrary.org/b/id";

export type BookSearchResult = {
  id: number; // position dans la liste (sert juste de clé d'affichage)
  title: string;
  year?: number;
  posterUrl?: string;
  subtitle?: string; // auteur, affiché sous le titre dans les résultats
  author?: string;
  pages?: number;
  olKey: string;
};

export function olCover(coverId?: number, size: "S" | "M" | "L" = "M"): string | undefined {
  return coverId ? `${COVERS_URL}/${coverId}-${size}.jpg` : undefined;
}

function toQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const url = `${SEARCH_URL}?${toQuery({
    q: query,
    fields: "key,title,author_name,first_publish_year,cover_i,number_of_pages_median",
    limit: "8",
    lang: "fr",
  })}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (res.status === 429) throw new Error("Trop de recherches, réessaie dans un instant");
  if (!res.ok) throw new Error(`Erreur Open Library (${res.status})`);
  const data = (await res.json()) as { docs?: any[] };

  return (data.docs ?? []).map((d, i) => {
    const author = Array.isArray(d.author_name) && d.author_name.length ? String(d.author_name[0]) : undefined;
    const pages = Number(d.number_of_pages_median);
    const year = Number(d.first_publish_year);
    return {
      id: i,
      title: d.title || "Sans titre",
      year: Number.isFinite(year) && year > 0 ? year : undefined,
      posterUrl: olCover(d.cover_i, "M"),
      subtitle: author,
      author,
      pages: Number.isFinite(pages) && pages > 0 ? pages : undefined,
      olKey: String(d.key ?? ""),
    };
  });
}