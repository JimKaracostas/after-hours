export type CatalogBook = {
  key: string;
  title: string;
  author: string;
  cover: string;
  totalPages?: number;
  year?: number;
};

/** Search the live catalog; no sample results are substituted on failure. */
export async function searchBooks(
  query: string,
  signal: AbortSignal,
): Promise<CatalogBook[]> {
  const fields =
    "key,title,author_name,cover_i,cover_edition_key,isbn,number_of_pages_median,first_publish_year";
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
  return data.docs.flatMap((doc: Record<string, unknown>) => {
    if (
      !doc ||
      typeof doc !== "object" ||
      typeof doc.title !== "string" ||
      typeof doc.key !== "string"
    )
      return [];
    const authors = Array.isArray(doc.author_name)
      ? doc.author_name.filter(
          (author): author is string => typeof author === "string",
        )
      : [];

    let cover = "";
    if (typeof doc.cover_i === "number" && doc.cover_i > 0) {
      cover = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`;
    } else if (
      typeof doc.cover_edition_key === "string" &&
      doc.cover_edition_key.trim()
    ) {
      cover = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key.trim()}-L.jpg?default=false`;
    } else if (
      Array.isArray(doc.isbn) &&
      typeof doc.isbn[0] === "string" &&
      doc.isbn[0].trim()
    ) {
      cover = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0].trim()}-L.jpg?default=false`;
    }

    return [
      {
        key: doc.key,
        title: doc.title.slice(0, 300),
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
      },
    ];
  });
}
