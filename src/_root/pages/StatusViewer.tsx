import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useDeleteStatus, useGetStatuses, useMarkStatusViewed, useSendStatusReply } from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, Eye, MoreHorizontal, Pause, Play, Send, Trash2, Volume2, VolumeX, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PHOTO_DURATION = 5000;
const MAX_VIDEO_DURATION = 60000;
const TICK_MS = 80;

const getStatusMedia = (status: any) => status?.media?.[0];
const isStatusViewed = (status: any, userId: string) =>
  status?.viewedBy?.some((viewer: any) => viewer?._id === userId || viewer === userId);

const getStartStatusIndex = (group: any[] = [], userId: string) => {
  const firstUnviewedIndex = group.findIndex((status) => !isStatusViewed(status, userId));
  return firstUnviewedIndex >= 0 ? firstUnviewedIndex : 0;
};

const groupStatusesByCreator = (statuses: any[] = []) => {
  const grouped = new Map<string, any[]>();
  statuses.forEach((status) => {
    const creatorId = status?.creator?._id;
    if (!creatorId) return;
    grouped.set(creatorId, [...(grouped.get(creatorId) || []), status]);
  });
  return Array.from(grouped.values()).map((group) =>
    [...group].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  );
};

const getUnviewedCount = (group: any[] = [], userId: string) =>
  group.filter((status) => !isStatusViewed(status, userId)).length;

const StatusViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedCreatorId = searchParams.get("creator");
  const requestedStatusId = searchParams.get("status");
  const { user } = useUserContext();
  const { data: statuses = [], isLoading } = useGetStatuses();
  const { mutate: deleteStatus } = useDeleteStatus();
  const { mutate: markViewed } = useMarkStatusViewed();
  const { mutateAsync: sendStatusReply, isLoading: isSendingReply } = useSendStatusReply();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasPositionedInitialStatus = useRef(false);
  const lastRequestedCreatorId = useRef<string | null>(null);

  const groups = useMemo(() => groupStatusesByCreator(statuses), [statuses]);
  const initialGroupIndex = Math.max(0, groups.findIndex((group) => group[0]?.creator?._id === requestedCreatorId));
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(PHOTO_DURATION);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isViewersOpen, setIsViewersOpen] = useState(false);

  const currentGroup = groups[groupIndex] || [];
  const currentStatus = currentGroup[statusIndex];
  const media = getStatusMedia(currentStatus);
  const isVideo = media?.type === "video";
  const isOwner = currentStatus?.creator?._id === user._id;
  const statusStyle = currentStatus?.style || {};
  const mediaTransform = `translate(${statusStyle.mediaX || 0}px, ${statusStyle.mediaY || 0}px) scale(${statusStyle.mediaScale || 1}) rotate(${statusStyle.mediaRotation || 0}deg)`;

  useEffect(() => {
    if (lastRequestedCreatorId.current !== requestedCreatorId) {
      hasPositionedInitialStatus.current = false;
      lastRequestedCreatorId.current = requestedCreatorId;
    }
  }, [requestedCreatorId]);

  useEffect(() => {
    if (!groups.length || hasPositionedInitialStatus.current) return;
    setGroupIndex(initialGroupIndex);
    const group = groups[initialGroupIndex] || [];
    const requestedIndex = requestedStatusId ? group.findIndex((status) => status._id === requestedStatusId) : -1;
    setStatusIndex(requestedIndex >= 0 ? requestedIndex : getStartStatusIndex(group, user._id));
    hasPositionedInitialStatus.current = true;
  }, [groups, initialGroupIndex, requestedStatusId, user._id]);

  useEffect(() => {
    setProgress(0);
    setDuration(isVideo ? MAX_VIDEO_DURATION : PHOTO_DURATION);
    setIsPaused(false);
    if (currentStatus?._id) markViewed(currentStatus._id);
  }, [currentStatus?._id, isVideo, markViewed]);

  const closeViewer = () => navigate("/");

  const goNext = () => {
    if (statusIndex < currentGroup.length - 1) {
      setStatusIndex((index) => index + 1);
      return;
    }

    if (groupIndex < groups.length - 1) {
      const nextGroupIndex = groupIndex + 1;
      setGroupIndex(nextGroupIndex);
      setStatusIndex(getStartStatusIndex(groups[nextGroupIndex] || [], user._id));
      return;
    }

    closeViewer();
  };

  const goPrevious = () => {
    if (statusIndex > 0) {
      setStatusIndex((index) => index - 1);
      return;
    }

    if (groupIndex > 0) {
      const previousGroup = groups[groupIndex - 1] || [];
      setGroupIndex((index) => index - 1);
      setStatusIndex(Math.max(previousGroup.length - 1, 0));
    }
  };

  const handleStatusReply = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = replyText.trim();
    if (!text || !currentStatus?._id || isOwner) return;
    await sendStatusReply({ statusId: currentStatus._id, text });
    setReplyText("");
  };

  useEffect(() => {
    if (!currentStatus || isPaused) return;

    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = value + (TICK_MS / duration) * 100;
        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(goNext, 0);
          return 100;
        }
        return next;
      });
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [currentStatus, duration, isPaused, groupIndex, statusIndex, groups.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "Escape") closeViewer();
      if (event.key === " ") setIsPaused((value) => !value);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [groupIndex, statusIndex, groups.length]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPaused) videoRef.current.pause();
    else videoRef.current.play().catch(() => undefined);
  }, [isPaused, currentStatus?._id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <Loader />
      </div>
    );
  }

  if (!currentStatus) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-black p-6 text-center">
        <p className="h3-bold">No active status</p>
        <p className="mt-2 max-w-sm text-light-3 small-regular">Statuses from people you follow will appear here for 24 hours.</p>
        <Button type="button" className="shad-button_primary mt-6" onClick={closeViewer}>Back to feed</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-black">
      <aside className="hidden w-[23rem] flex-none flex-col overflow-y-auto border-r border-white/10 bg-[#232526] p-5 text-white custom-scrollbar lg:flex">
        <button
          type="button"
          onClick={closeViewer}
          className="mb-7 grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/15"
          aria-label="Close stories"
        >
          <X size={24} />
        </button>

        <h1 className="text-3xl font-extrabold">Stories</h1>
        <div className="mt-3 flex gap-2 text-primary-500">
          <span>Archive</span>
          <span>·</span>
          <span>Settings</span>
        </div>

        <p className="mt-8 text-lg font-bold text-light-1">Your story</p>
        {groups.filter((group) => group[0]?.creator?._id === user._id).map((group) => {
          const creator = group[0]?.creator;
          const latest = group[group.length - 1];
          return (
            <button
              key={creator?._id}
              type="button"
              onClick={() => {
                const index = groups.findIndex((item) => item[0]?.creator?._id === creator?._id);
                setGroupIndex(index);
                setStatusIndex(getStartStatusIndex(groups[index] || [], user._id));
              }}
              className={`mt-3 flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-white/10 ${currentGroup[0]?.creator?._id === creator?._id ? "bg-white/15" : ""}`}
            >
              <img src={creator?.imageUrl || "/assets/images/default_user_image.png"} alt={creator?.name || "You"} className="h-14 w-14 rounded-full object-cover ring-2 ring-white/25" />
              <div>
                <p className="base-semibold">{creator?.name || "Your story"}</p>
                <p className="small-regular text-light-3">{multiFormatDateString(latest?.createdAt)}</p>
              </div>
            </button>
          );
        })}

        <p className="mt-8 text-lg font-bold text-light-1">All stories</p>
        <div className="mt-3 flex flex-col gap-2">
          {groups.filter((group) => group[0]?.creator?._id !== user._id).map((group) => {
            const creator = group[0]?.creator;
            const activeIndex = groups.findIndex((item) => item[0]?.creator?._id === creator?._id);
            const preview = group[getStartStatusIndex(group, user._id)] || group[0];
            const unviewedCount = getUnviewedCount(group, user._id);

            return (
              <button
                key={creator?._id}
                type="button"
                onClick={() => {
                  setGroupIndex(activeIndex);
                  setStatusIndex(getStartStatusIndex(groups[activeIndex] || [], user._id));
                }}
                className={`flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-white/10 ${groupIndex === activeIndex ? "bg-white/15" : ""}`}
              >
                <span className={`h-14 w-14 overflow-hidden rounded-full border-[3px] p-[2px] ${unviewedCount ? "border-primary-500" : "border-gray-400/80"}`}>
                  <img src={creator?.imageUrl || "/assets/images/default_user_image.png"} alt={creator?.name || "creator"} className="h-full w-full rounded-full object-cover" />
                </span>
                <div className="min-w-0">
                  <p className="base-semibold line-clamp-1">{creator?.name}</p>
                  <p className="small-regular text-light-3">
                    {unviewedCount ? <span className="text-primary-500">{unviewedCount} new</span> : "Seen"} · {multiFormatDateString(preview?.createdAt)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-black">
      <button type="button" aria-label="Previous status" onClick={goPrevious} className="absolute left-3 z-30 hidden h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/15 text-white backdrop-blur-xl transition hover:bg-white/25 md:grid">
        <ChevronLeft size={34} />
      </button>
      <button type="button" aria-label="Next status" onClick={goNext} className="absolute right-3 z-30 hidden h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/15 text-white backdrop-blur-xl transition hover:bg-white/25 md:grid">
        <ChevronRight size={34} />
      </button>

      <article className="relative h-full w-full overflow-hidden bg-dark-1 md:h-[min(100vh,54rem)] md:max-w-[31rem] md:rounded-xl">
        {media ? (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            {isVideo ? (
              <video
                src={media.url}
                muted
                playsInline
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
              />
            ) : (
              <img
                src={media.url}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
              />
            )}
            <div className="absolute inset-0 bg-black/10" />
            {isVideo ? (
              <video
                ref={videoRef}
                src={media.url}
                muted={isMuted}
                autoPlay
                playsInline
                className="relative z-10 h-full w-full object-contain"
                style={{ transform: mediaTransform }}
                onLoadedMetadata={(event) => setDuration(Math.min((event.currentTarget.duration || 5) * 1000, MAX_VIDEO_DURATION))}
                onEnded={goNext}
              />
            ) : (
              <img
                src={media.url}
                alt={media.name || "status"}
                className="relative z-10 h-full w-full object-contain"
                style={{ transform: mediaTransform }}
              />
            )}
          </div>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center p-8"
            style={{ background: statusStyle.background || "linear-gradient(180deg, #1f2937 0%, #000000 100%)" }}
          >
            <p
              className="max-w-sm whitespace-pre-line leading-tight text-white"
              style={{
                fontSize: `${statusStyle.textSize || 34}px`,
                textAlign: statusStyle.textAlign || "center",
                fontWeight: statusStyle.textWeight || "800",
                fontStyle: statusStyle.textItalic ? "italic" : "normal",
              }}
            >
              {currentStatus.text}
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute left-4 right-4 top-5 z-20 flex gap-2">
          {currentGroup.map((status: any, index: number) => (
            <div key={status._id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-75"
                style={{ width: `${index < statusIndex ? 100 : index === statusIndex ? progress : 0}%` }}
              />
            </div>
          ))}
        </div>

        <header className="absolute left-4 right-4 top-10 z-20 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src={currentStatus?.creator?.imageUrl || "/assets/images/default_user_image.png"} alt={currentStatus?.creator?.name || "creator"} className="h-12 w-12 rounded-full object-cover ring-2 ring-white/25" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="base-semibold line-clamp-1">{currentStatus?.creator?.name}</p>
                <span className="small-regular text-white/75">{multiFormatDateString(currentStatus.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isVideo && (
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white" onClick={() => setIsMuted((value) => !value)} aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white" onClick={() => setIsPaused((value) => !value)} aria-label={isPaused ? "Play" : "Pause"}>
              {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
            </button>
            {isOwner ? (
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-red text-white" onClick={() => deleteStatus(currentStatus._id, { onSuccess: goNext })} aria-label="Delete status">
                <Trash2 size={18} />
              </button>
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white">
                <MoreHorizontal size={22} />
              </span>
            )}
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white" onClick={closeViewer} aria-label="Close status">
              <X size={21} />
            </button>
          </div>
        </header>

        <button type="button" aria-label="Previous" onClick={goPrevious} className="absolute bottom-0 left-0 top-24 z-10 w-1/3 md:hidden" />
        <button type="button" aria-label="Next" onClick={goNext} className="absolute bottom-0 right-0 top-24 z-10 w-1/3 md:hidden" />

        {media && currentStatus.text && (
          <div className={`absolute left-4 right-4 z-20 rounded-2xl bg-black/45 p-4 backdrop-blur-xl ${isOwner ? "bottom-24" : "bottom-24 md:bottom-28"}`}>
            <p className="whitespace-pre-line text-lg font-semibold leading-7">{currentStatus.text}</p>
          </div>
        )}

        {isOwner ? (
          <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/55 px-4 py-3 text-white backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setIsViewersOpen((value) => !value)}
              className="mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            >
              <ChevronUp size={18} className={`transition ${isViewersOpen ? "rotate-180" : ""}`} />
              <Eye size={18} />
              {currentStatus.viewedBy?.length || 0} {(currentStatus.viewedBy?.length || 0) === 1 ? "viewer" : "viewers"}
            </button>

            {isViewersOpen && (
              <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-dark-2 p-3 custom-scrollbar">
                {(currentStatus.viewedBy || []).length === 0 ? (
                  <p className="py-6 text-center text-light-3 small-regular">No viewers yet.</p>
                ) : (
                  <div className="space-y-2">
                    {currentStatus.viewedBy.map((viewer: any) => (
                      <div key={viewer._id || viewer} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
                        <img src={viewer.imageUrl || "/assets/images/default_user_image.png"} alt={viewer.name || "viewer"} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="line-clamp-1 small-semibold">{viewer.name || "Viewer"}</p>
                          <p className="line-clamp-1 tiny-medium text-light-3">@{viewer.username || "postgram"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleStatusReply} className="absolute bottom-0 left-0 right-0 z-30 flex items-center gap-3 bg-black/45 px-4 py-4 backdrop-blur-xl">
            <input
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder="Reply to status..."
              className="min-w-0 flex-1 rounded-full border border-white/35 bg-black/25 px-5 py-3 text-sm text-white outline-none placeholder:text-white/75 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={isSendingReply || !replyText.trim()}
              className="grid h-12 w-12 place-items-center rounded-full bg-primary-500 text-white transition hover:bg-primary-600 disabled:opacity-50"
              aria-label="Send status reply"
            >
              <Send size={18} />
            </button>
          </form>
        )}

        <button type="button" className="absolute left-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white md:hidden" onClick={closeViewer} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
      </article>
      </main>
    </div>
  );
};

export default StatusViewer;
