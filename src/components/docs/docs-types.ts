/** Shapes passed from the docs routes to the docs chrome components. */
export interface DocsNavGroup {
  id: string;
  title: string;
  icon: string;
  pages: { title: string; url: string; current: boolean }[];
}

export interface DocsPagerLink {
  title: string;
  url: string;
  section: string;
}
