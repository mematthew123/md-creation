export type MarkdownPageDoc = {
  _id: string;
  title: string;
  description?: string;
  path: string;
  markdown: string;
  sourceHash: string;
  ingestedAt: string;
};

export type MarkdownPageListItem = Pick<MarkdownPageDoc, "_id" | "path" | "title" | "description">;

export const MARKDOWN_PAGE_BY_PATH = /* groq */ `
  *[_type == "markdownPage" && path == $path][0]{
    _id, title, description, path, markdown, sourceHash, ingestedAt
  }
`;

export const MARKDOWN_PAGE_LIST = /* groq */ `
  *[_type == "markdownPage"] | order(path asc){
    _id, path, title, description
  }
`;

export const MARKDOWN_PAGE_STALE_IDS = /* groq */ `
  *[_type == "markdownPage" && !(path in $paths)]._id
`;
