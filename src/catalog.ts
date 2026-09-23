export type CatalogBook = {
  key: string;
  title: string;
  author: string;
  cover: string;
  totalPages?: number;
  year?: number;
};

async function resolveHighResCover(
  doc: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<string> {
  const isTooSmall =
    typeof doc.cover_height === "number" && doc.cover_height < 300;

  if (typeof doc.cover_i === "number" && doc.cover_i > 0 && !isTooSmall) {
    return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`;
  }

  // If the work's default cover is missing or a tiny thumbnail (<300px), check editions for a full-size cover
  if (typeof doc.key === "string" && doc.key.startsWith("/works/")) {
    try {
      const res = await fetch(
        `https://openlibrary.org${doc.key}/editions.json?limit=8`,
        { signal },
      );
      if (res.ok) {
        const edData = await res.json();
        if (edData && Array.isArray(edData.entries)) {
          for (const entry of edData.entries) {
            if (Array.isArray(entry.covers)) {
              const coverId = entry.covers.find(
                (c: unknown) =>
                  typeof c === "number" && c > 0 && c !== doc.cover_i,
              );
              if (coverId) {
                return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`;
              }
            }
          }
        }
      }
    } catch {}
  }

  if (
    typeof doc.cover_edition_key === "string" &&
    doc.cover_edition_key.trim()
  ) {
    return `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key.trim()}-L.jpg?default=false`;
  }
  if (
    Array.isArray(doc.isbn) &&
    typeof doc.isbn[0] === "string" &&
    doc.isbn[0].trim()
  ) {
    return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0].trim()}-L.jpg?default=false`;
  }
  if (typeof doc.cover_i === "number" && doc.cover_i > 0) {
    return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`;
  }
  return "";
}

/** Search the live catalog; no sample results are substituted on failure. */
export async function searchBooks(
  query: string,
  signal: AbortSignal,
): Promise<CatalogBook[]> {
  const fields =
    "key,title,author_name,cover_i,cover_edition_key,cover_width,cover_height,isbn,number_of_pages_median,first_publish_year";
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=8&lang=en&fields=${fields}`,
    { signal, headers: { Accept: "application/json" } },
  );
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "The book catalog is busy. Please try again in a moment."
        : "The book catalog is unavailable right now. Please try again, or enter your book manually.",
    );
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("docs" in data) ||
    !Array.isArray(data.docs)
  )
    throw new Error(
      "The catalog returned an unexpected response. You can enter your book manually.",
    );

  const docs = data.docs.filter(
    (doc): doc is Record<string, unknown> =>
      Boolean(
        doc &&
          typeof doc === "object" &&
          typeof doc.title === "string" &&
          typeof doc.key === "string",
      ),
  );

  return Promise.all(
    docs.map(async (doc) => {
      const authors = Array.isArray(doc.author_name)
        ? doc.author_name.filter(
            (author): author is string => typeof author === "string",
          )
        : [];
      const cover = await resolveHighResCover(doc, signal);

      return {
        key: doc.key as string,
        title: (doc.title as string).slice(0, 300),
        author: authors.join(", ").slice(0, 200),
        cover,
        totalPages:
          typeof doc.number_of_pages_median === "number" &&
          Number.isSafeInteger(doc.number_of_pages_median) &&
          doc.number_of_pages_median > 0 &&
          doc.number_of_pages_median <= 100000
            ? doc.number_of_pages_median
            : undefined,
        year:
          typeof doc.first_publish_year === "number"
            ? doc.first_publish_year
            : undefined,
      };
    }),
  );
}
