import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";
import type { PostType } from "astro:content";

const getPostsByTag = (posts: CollectionEntry<PostType>[], tag: string) =>
  getSortedPosts(
    posts.filter(post => slugifyAll(post.data.tags).includes(tag))
  );

export default getPostsByTag;
