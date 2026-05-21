import PostForm from "@/components/forms/PostForm";
import { ImagePlus, Sparkles } from "lucide-react";

const CreatePost = () => {
  return (
    <div className="common-container">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="content-panel overflow-hidden rounded-3xl p-5 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-primary-500 small-semibold">
                <Sparkles size={15} />
                Create for the feed
              </div>
              <h1 className="h2-bold">Publish something worth stopping for</h1>
              <p className="mt-3 text-white/[0.58] base-regular">
                Share text, images, videos, or a mixed media post. Keep the story clear, add context, and make it easy to discover.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-dark-4 bg-dark-3 p-4 text-right md:block">
              <div className="ml-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-500/15 text-primary-500">
                <ImagePlus size={22} />
              </div>
              <p className="mt-3 small-semibold">Text, photos, and video</p>
              <p className="text-white/45 tiny-medium">One composer. Every format.</p>
            </div>
          </div>
        </section>

        <PostForm action="Create"/>
      </div>
    </div>
  );
};

export default CreatePost;
