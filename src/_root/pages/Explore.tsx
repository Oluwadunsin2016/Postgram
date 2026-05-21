import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/ui/shared/Loader";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/context/AuthContext";
import { useGetAllPosts, useGetAllUsers, useSearchPosts } from "@/lib/react-query/queries";
import SearchResults from "@/components/ui/shared/SearchResults";
import PostMedia, { getPostMedia } from "@/components/ui/shared/PostMedia";
import CreatorDiscoveryCard from "@/components/ui/shared/CreatorDiscoveryCard";
import { ArrowRight, Hash, Heart, Image, MapPin, MessageCircle, Play, Repeat2, Search, TrendingUp, Users } from "lucide-react";

const getDisplayPost = (post: any) => post?.repostOf || post;

const getPostScore = (post: any) => {
  const contentPost = getDisplayPost(post);
  return (
    (contentPost?.likes?.length || post?.likes?.length || 0) * 4 +
    (contentPost?.comments?.length || post?.comments?.length || 0) * 3 +
    (contentPost?.repostCount || post?.repostCount || 0) * 5 +
    getPostMedia(contentPost).length
  );
};

const ExplorePostTile = ({ post, size = "regular" }: { post: any; size?: "featured" | "regular" }) => {
  const contentPost = getDisplayPost(post);
  const media = getPostMedia(contentPost);
  const hasVideo = media.some((item) => item.type === "video");
  const creator = contentPost?.creator || post?.creator;

  return (
    <Link
      to={`/posts/${post._id}`}
      className={`group relative overflow-hidden rounded-3xl border border-dark-4 bg-dark-2 shadow-xl transition hover:-translate-y-1 hover:border-primary-500/50 ${
        size === "featured" ? "min-h-[28rem] md:col-span-2 md:row-span-2" : "min-h-[18rem]"
      }`}
    >
      {media.length > 0 ? (
        <PostMedia
          post={contentPost}
          className="absolute inset-0"
          imageClassName="h-full min-h-full rounded-none object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-dark-3 via-primary-500/15 to-dark-2 p-6 text-center">
          <p className="line-clamp-6 text-light-1 body-bold">{contentPost?.caption || "Text post"}</p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur">
          {hasVideo ? <Play size={17} className="fill-white" /> : <Image size={17} />}
        </span>
        {media.length > 1 && (
          <span className="rounded-full bg-black/55 px-3 py-1 text-white tiny-medium backdrop-blur">{media.length} files</span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-center gap-2">
          <img
            src={creator?.imageUrl || "/assets/images/default_user_image.png"}
            alt={creator?.name || "Creator"}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="min-w-0">
            <p className="truncate text-white small-semibold">{creator?.name}</p>
            {contentPost?.location && (
              <p className="flex items-center gap-1 truncate text-white/60 tiny-medium">
                <MapPin size={12} />
                {contentPost.location}
              </p>
            )}
          </div>
        </div>

        {contentPost?.caption && (
          <p className={`mt-3 text-white/90 ${size === "featured" ? "line-clamp-3 body-medium" : "line-clamp-2 small-regular"}`}>
            {contentPost.caption}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-white/70 tiny-medium">
          <span className="inline-flex items-center gap-1">
            <Heart size={14} />
            {contentPost?.likes?.length || post?.likes?.length || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={14} />
            {contentPost?.comments?.length || post?.comments?.length || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Repeat2 size={14} />
            {contentPost?.repostCount || post?.repostCount || 0}
          </span>
        </div>
      </div>
    </Link>
  );
};

const Explore = () => {
  const { ref, inView } = useInView();
  const { user } = useUserContext();
  const { data: posts, hasNextPage, fetchNextPage } = useGetAllPosts();
  const { data: users = [], isLoading: isUsersLoading } = useGetAllUsers();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedSearch);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, searchValue]);

  const loadedPosts = useMemo(
    () => posts?.pages?.flatMap((page: any) => page?.posts || []) || [],
    [posts]
  );

  const trendingTags = useMemo(() => {
    const tagMap = loadedPosts.reduce((map: Record<string, number>, post: any) => {
      (getDisplayPost(post)?.tags || []).forEach((tag: string) => {
        map[tag] = (map[tag] || 0) + 1;
      });
      return map;
    }, {});
    return Object.entries(tagMap)
      .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [loadedPosts]);

  const rankedPosts = useMemo(
    () => [...loadedPosts].sort((firstPost: any, secondPost: any) => getPostScore(secondPost) - getPostScore(firstPost)),
    [loadedPosts]
  );

  const featuredPost = rankedPosts[0];
  const discoveryPosts = rankedPosts.slice(1, 8);
  const suggestedCreators = useMemo(
    () =>
      users
        .filter((creator: any) => creator._id !== user?._id)
        .sort((firstCreator: any, secondCreator: any) => (secondCreator?.followers?.length || 0) - (firstCreator?.followers?.length || 0))
        .slice(0, 5),
    [user?._id, users]
  );

  if (!posts) {
    return (
      <div className="flex-center h-full w-full">
        <Loader />
      </div>
    );
  }

  const shouldShowSearchResults = searchValue.trim() !== "";
  const shouldShowPosts = !shouldShowSearchResults && loadedPosts.length === 0;

  return (
    <div className="explore-container">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="content-panel overflow-hidden rounded-3xl">
          <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
            <div>
              <p className="small-semibold uppercase tracking-[0.24em] text-primary-500">Explore</p>
              <h1 className="mt-2 max-w-2xl text-[2rem] font-bold leading-tight text-white md:text-[2.85rem]">
                Search and discover beyond your feed
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-light-3">
                Use Explore when you want to find posts, tags, locations, and creators outside the people you already follow.
              </p>

              <div className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-dark-4 bg-dark-3 px-4">
                <Search size={20} className="text-light-4" />
                <Input
                  type="text"
                  placeholder="Search captions, tags, locations, or conversations"
                  className="explore-search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-3xl border border-dark-4 bg-dark-3/60 p-4">
              <div className="rounded-2xl bg-dark-2 p-4">
                <TrendingUp size={20} className="text-primary-500" />
                <p className="mt-3 text-light-1 base-semibold">{loadedPosts.length}</p>
                <p className="text-light-4 tiny-medium">Posts scanned</p>
              </div>
              <div className="rounded-2xl bg-dark-2 p-4">
                <Hash size={20} className="text-primary-500" />
                <p className="mt-3 text-light-1 base-semibold">{trendingTags.length}</p>
                <p className="text-light-4 tiny-medium">Active tags</p>
              </div>
              <div className="rounded-2xl bg-dark-2 p-4">
                <Users size={20} className="text-primary-500" />
                <p className="mt-3 text-light-1 base-semibold">{users.length}</p>
                <p className="text-light-4 tiny-medium">Creators</p>
              </div>
            </div>
          </div>

          {trendingTags.length > 0 && (
            <div className="border-t border-dark-4 bg-dark-2/45 px-5 py-4 md:px-7">
              <div className="flex flex-wrap gap-2">
              {trendingTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchValue(tag)}
                  className="rounded-full border border-dark-4 bg-dark-3 px-3 py-1.5 text-xs font-semibold text-light-2 transition hover:border-primary-500/50 hover:text-white"
                >
                  #{tag} <span className="text-light-4">{count}</span>
                </button>
              ))}
              </div>
            </div>
          )}
        </section>

        {shouldShowSearchResults ? (
          <section>
            <div className="mb-5 flex-between">
              <div>
                <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Search results</p>
                <h2 className="h3-bold">Results for "{searchValue}"</h2>
              </div>
            </div>
            <SearchResults isSearchFetching={isSearchFetching} searchedPosts={searchedPosts} />
          </section>
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          <>
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Popular now</p>
                  <h2 className="h3-bold">Posts gaining attention</h2>
                </div>
                <span className="hidden rounded-full bg-dark-3 px-4 py-2 text-light-3 small-medium md:inline-flex">One discovery grid</span>
              </div>

              <div className="grid auto-rows-[18rem] gap-4 md:grid-cols-2 xl:grid-cols-4">
                {featuredPost && <ExplorePostTile post={featuredPost} size="featured" />}
                {discoveryPosts.map((post: any) => (
                  <ExplorePostTile key={post._id} post={post} />
                ))}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="content-panel rounded-3xl p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Browse topics</p>
                    <h2 className="h3-bold">Active tags</h2>
                  </div>
                  <Hash size={22} className="text-primary-500" />
                </div>

                {trendingTags.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {trendingTags.map(({ tag, count }) => (
                      <button
                        key={`topic-${tag}`}
                        type="button"
                        onClick={() => setSearchValue(tag)}
                        className="flex min-h-24 flex-col justify-between rounded-2xl border border-dark-4 bg-dark-3 p-4 text-left transition hover:border-primary-500/50 hover:bg-dark-4"
                      >
                        <span className="text-primary-500 body-bold">#{tag}</span>
                        <span className="text-light-4 tiny-medium">{count} post{Number(count) === 1 ? "" : "s"}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid min-h-52 place-items-center rounded-2xl bg-dark-3 text-center">
                    <p className="text-light-3 small-regular">No tags have started trending yet.</p>
                  </div>
                )}
              </div>

              <aside className="content-panel rounded-3xl p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Creators</p>
                    <h2 className="body-bold">People to watch</h2>
                  </div>
                  <Users size={22} className="text-primary-500" />
                </div>

                {isUsersLoading ? (
                  <Loader />
                ) : (
                  <div className="flex flex-col gap-3">
                    {suggestedCreators.map((creator: any) => (
                      <CreatorDiscoveryCard key={creator._id} creator={creator} />
                    ))}
                  </div>
                )}

                <Link to="/all-users" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-white small-semibold transition hover:bg-primary-600">
                  Explore people
                  <ArrowRight size={16} />
                </Link>
              </aside>
            </section>
          </>
        )}

        {hasNextPage && !searchValue && (
          <div ref={ref} className="mt-2">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
