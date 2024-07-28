import { SITE } from "@config";
import getPageNumbers from "./getPageNumbers";
import type { PostType } from "astro:content";


interface GetPaginationProps<T> {
  posts: T;
  page: string | number;
  isIndex?: boolean;
  path: PostType
}

const getPagination = <T>({
  posts,
  page,
  isIndex = false,
  path
}: GetPaginationProps<T[]>) => {
  const totalPagesArray = getPageNumbers(posts.length);
  const totalPages = totalPagesArray.length;

  const currentPage = isIndex
    ? 1
    : page && !isNaN(Number(page)) && totalPagesArray.includes(Number(page))
      ? Number(page)
      : 0;

  const lastPost = isIndex ? SITE.postPerPage : currentPage * SITE.postPerPage;
  const startPost = isIndex ? 0 : lastPost - SITE.postPerPage;
  const paginatedPosts = posts.slice(startPost, lastPost);

  return {
    totalPages,
    currentPage,
    paginatedPosts,
    path
  };
};

export default getPagination;
