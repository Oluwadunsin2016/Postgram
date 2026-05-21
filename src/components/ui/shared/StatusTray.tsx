import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCreateStatus, useGetStatuses } from "@/lib/react-query/queries";
import { AlignCenter, AlignLeft, AlignRight, Bold, Image as ImageIcon, Italic, Minus, Music, Plus, RotateCw, Type, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Loader from "./Loader";

const textBackgrounds = [
  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
  "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
  "linear-gradient(135deg, #ef4444 0%, #db2777 100%)",
  "linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)",
  "linear-gradient(135deg, #020617 0%, #000000 100%)",
  "linear-gradient(135deg, #14b8a6 0%, #facc15 100%)",
  "linear-gradient(135deg, #64748b 0%, #ec4899 100%)",
];

const getStatusMedia = (status: any) => status?.media?.[0];

const isStatusViewed = (status: any, userId: string) =>
  status?.viewedBy?.some((viewer: any) => viewer?._id === userId || viewer === userId);

const getNextStatusToPreview = (statuses: any[] = [], userId: string) => {
  const firstUnviewed = statuses.find((status) => !isStatusViewed(status, userId));
  return firstUnviewed || statuses[0];
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

const StatusTray = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [composerStep, setComposerStep] = useState<"choice" | "media" | "text">("choice");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [background, setBackground] = useState(textBackgrounds[0]);
  const [mediaScale, setMediaScale] = useState(1);
  const [mediaRotation, setMediaRotation] = useState(0);
  const [mediaPosition, setMediaPosition] = useState({ x: 0, y: 0 });
  const [textSize, setTextSize] = useState(24);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [textWeight, setTextWeight] = useState<"500" | "700" | "800">("800");
  const [textItalic, setTextItalic] = useState(false);
  const [dragStart, setDragStart] = useState<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useUserContext();
  const { toast } = useToast();
  const { data: statuses = [], isLoading } = useGetStatuses();
  const { mutateAsync: createStatus, isLoading: isCreatingStatus } = useCreateStatus();
  const groupedStatuses = useMemo(() => groupStatusesByCreator(statuses), [statuses]);
  const isVideo = file?.type.startsWith("video/");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const openComposer = () => {
    setIsCreating(true);
    setComposerStep("choice");
    setText("");
    setFile(null);
    setBackground(textBackgrounds[0]);
    setMediaScale(1);
    setMediaRotation(0);
    setMediaPosition({ x: 0, y: 0 });
    setTextSize(24);
    setTextAlign("center");
    setTextWeight("800");
    setTextItalic(false);
  };

  const closeComposer = () => {
    setIsCreating(false);
    setComposerStep("choice");
    setText("");
    setFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setFile(nextFile);
    setComposerStep("media");
    setText("");
    setMediaScale(1);
    setMediaRotation(0);
    setMediaPosition({ x: 0, y: 0 });
    event.target.value = "";
  };

  const updateMediaScale = (nextScale: number) => {
    setMediaScale(Math.min(Math.max(nextScale, 1), 5));
  };

  const handleMediaPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!previewUrl) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: mediaPosition.x,
      originY: mediaPosition.y,
    });
  };

  const handleMediaPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;
    setMediaPosition({
      x: dragStart.originX + event.clientX - dragStart.x,
      y: dragStart.originY + event.clientY - dragStart.y,
    });
  };

  const handleMediaPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setDragStart(null);
    }
  };

  const handleCreateStatus = async () => {
    if (composerStep === "text" && !text.trim()) {
      toast({ title: "Add text before sharing your status" });
      return;
    }

    if (composerStep === "media" && !file) {
      toast({ title: "Choose an image or video first" });
      return;
    }

    await createStatus({
      text,
      files: file ? [file] : [],
      style: {
        background,
        mediaScale,
        mediaRotation,
        mediaX: mediaPosition.x,
        mediaY: mediaPosition.y,
        textSize,
        textAlign,
        textWeight,
        textItalic,
      },
    });

    closeComposer();
  };

  const actionButtons = (
    <>
      <Button type="button" className="shad-button_dark_4" onClick={closeComposer}>Discard</Button>
      <Button type="button" className="shad-button_primary" disabled={isCreatingStatus} onClick={handleCreateStatus}>
        {isCreatingStatus ? "Sharing..." : "Share to Story"}
      </Button>
    </>
  );

  const composerOverlay = (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#18191b] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Create status"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <button
        type="button"
        onClick={closeComposer}
        className="fixed left-4 top-4 z-[10000] grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white shadow-xl backdrop-blur-xl transition hover:bg-white/15 md:hidden"
        aria-label="Close status composer"
      >
        <X size={23} />
      </button>

      <div className="flex h-full flex-col overflow-y-auto bg-[#18191b] text-white custom-scrollbar md:grid md:min-h-0 md:grid-cols-[21rem_minmax(0,1fr)] md:overflow-hidden lg:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="flex flex-none flex-col border-b border-white/10 bg-[#232526] md:min-h-0 md:border-b-0 md:border-r">
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#232526]/95 p-4 pl-20 backdrop-blur-xl md:static md:pl-4">
            <button
              type="button"
              onClick={closeComposer}
              className="hidden h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15 md:grid"
              aria-label="Close status composer"
            >
              <X size={23} />
            </button>
            <div>
              <p className="text-2xl font-extrabold">Your story</p>
              <div className="mt-4 flex items-center gap-3 md:mt-8">
                <img
                  src={user?.imageUrl || "/assets/images/default_user_image.png"}
                  alt={user?.name || "You"}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <span className="base-semibold">{user?.name}</span>
              </div>
            </div>
          </div>

          {composerStep === "choice" ? (
            <div className="flex flex-1 items-center justify-center overflow-y-auto p-5 md:hidden">
              <div className="grid w-full grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-300 p-4 text-center font-bold"
                >
                  <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-black/45">
                    <ImageIcon size={21} />
                  </span>
                  Photo or video
                </button>
                <button
                  type="button"
                  onClick={() => setComposerStep("text")}
                  className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-purple-500 to-rose-500 p-4 text-center font-bold"
                >
                  <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-black/45">
                    <Type size={21} />
                  </span>
                  Text status
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 p-5 md:flex-1 md:overflow-y-auto md:custom-scrollbar">
              {composerStep === "media" ? (
                <>
                  <button type="button" className="flex items-center gap-3 text-left text-light-2">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
                      <Type size={19} />
                    </span>
                    Add text
                  </button>
                  <button type="button" className="flex items-center gap-3 text-left text-light-2">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
                      <Music size={19} />
                    </span>
                    Add music
                  </button>
                  <Textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Write a caption..."
                    className="shad-textarea h-24"
                  />
                  <div>
                    <p className="small-semibold text-light-2">Scale</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button type="button" onClick={() => updateMediaScale(mediaScale - 0.1)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-light-2">
                        <Minus size={18} />
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.05"
                        value={mediaScale}
                        onChange={(event) => updateMediaScale(Number(event.target.value))}
                        className="w-full accent-primary-500"
                      />
                      <button type="button" onClick={() => updateMediaScale(mediaScale + 0.1)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-light-2">
                        <Plus size={18} />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-light-3">Drag the media in the preview to choose what appears in the story.</p>
                  </div>
                  <Button type="button" className="shad-button_dark_4 gap-2" onClick={() => setMediaRotation((value) => (value + 90) % 360)}>
                    <RotateCw size={17} />
                    Rotate
                  </Button>
                </>
              ) : (
                <>
                  <Textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    autoFocus
                    placeholder="Start typing"
                    className="shad-textarea h-32"
                  />
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="small-semibold text-light-2">Text style</p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs text-light-3">Size</span>
                      <input
                        type="range"
                        min="16"
                        max="56"
                        value={textSize}
                        onChange={(event) => setTextSize(Number(event.target.value))}
                        className="flex-1 accent-primary-500"
                      />
                      <span className="w-8 text-right text-xs text-light-3">{textSize}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setTextWeight(textWeight === "800" ? "500" : "800")} className={`grid h-9 w-9 place-items-center rounded-full ${textWeight !== "500" ? "bg-primary-500 text-white" : "bg-white/10 text-light-2"}`}>
                        <Bold size={17} />
                      </button>
                      <button type="button" onClick={() => setTextItalic((value) => !value)} className={`grid h-9 w-9 place-items-center rounded-full ${textItalic ? "bg-primary-500 text-white" : "bg-white/10 text-light-2"}`}>
                        <Italic size={17} />
                      </button>
                      <button type="button" onClick={() => setTextAlign("left")} className={`grid h-9 w-9 place-items-center rounded-full ${textAlign === "left" ? "bg-primary-500 text-white" : "bg-white/10 text-light-2"}`}>
                        <AlignLeft size={17} />
                      </button>
                      <button type="button" onClick={() => setTextAlign("center")} className={`grid h-9 w-9 place-items-center rounded-full ${textAlign === "center" ? "bg-primary-500 text-white" : "bg-white/10 text-light-2"}`}>
                        <AlignCenter size={17} />
                      </button>
                      <button type="button" onClick={() => setTextAlign("right")} className={`grid h-9 w-9 place-items-center rounded-full ${textAlign === "right" ? "bg-primary-500 text-white" : "bg-white/10 text-light-2"}`}>
                        <AlignRight size={17} />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="small-semibold text-light-2">Backgrounds</p>
                    <div className="mt-4 grid grid-cols-6 gap-3">
                      {textBackgrounds.map((item) => (
                        <button
                          key={item}
                          type="button"
                          aria-label="Choose status background"
                          onClick={() => setBackground(item)}
                          className={`h-9 w-9 rounded-full border-2 ${background === item ? "border-primary-500 ring-2 ring-primary-500/40" : "border-white/15"}`}
                          style={{ background: item }}
                        />
                      ))}
                    </div>
                  </div>
                  <button type="button" className="flex items-center gap-3 text-left text-light-2">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
                      <Music size={19} />
                    </span>
                    Add music
                  </button>
                </>
              )}
            </div>
          )}

          {composerStep !== "choice" && (
            <div className="hidden grid-cols-2 gap-3 border-t border-white/10 p-4 md:mt-auto md:grid">
              {actionButtons}
            </div>
          )}
        </aside>

        <main className={`${composerStep === "choice" ? "hidden md:flex" : "flex"} flex-none items-start justify-center p-4 md:min-h-0 md:flex-1 md:items-center md:overflow-y-auto md:p-8 md:custom-scrollbar`}>
          {composerStep === "choice" ? (
            <div className="hidden w-full max-w-2xl grid-cols-2 gap-8 md:grid">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-300 p-8 text-center text-xl font-bold shadow-2xl transition hover:scale-[1.02]"
              >
                <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-black/45">
                  <ImageIcon size={25} />
                </span>
                Create a Photo or Video Story
              </button>
              <button
                type="button"
                onClick={() => setComposerStep("text")}
                className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-purple-500 to-rose-500 p-8 text-center text-xl font-bold shadow-2xl transition hover:scale-[1.02]"
              >
                <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-black/45">
                  <Type size={25} />
                </span>
                Create a Text Story
              </button>
            </div>
          ) : (
            <div className="w-full max-w-5xl rounded-2xl bg-[#242628] p-4 shadow-2xl md:p-6">
              <p className="body-bold mb-4">Preview</p>
              <div className="flex min-h-[22rem] items-center justify-center rounded-xl border border-white/10 bg-[#121314] p-3 sm:min-h-[30rem] md:min-h-[42rem] md:p-4">
                <div
                  className="relative aspect-[9/16] h-[min(62vh,38rem)] max-h-full touch-none overflow-hidden rounded-xl border border-white/20 bg-dark-4 sm:h-[min(68vh,38rem)]"
                  onPointerDown={composerStep === "media" ? handleMediaPointerDown : undefined}
                  onPointerMove={composerStep === "media" ? handleMediaPointerMove : undefined}
                  onPointerUp={composerStep === "media" ? handleMediaPointerUp : undefined}
                  onPointerCancel={composerStep === "media" ? handleMediaPointerUp : undefined}
                >
                  {composerStep === "media" && previewUrl ? (
                    <>
                      {isVideo ? (
                        <video
                          src={previewUrl}
                          muted
                          playsInline
                          className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-70"
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-70"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/10" />
                      {isVideo ? (
                        <video
                          src={previewUrl}
                          controls
                          className="relative z-10 h-full w-full cursor-move object-contain"
                          style={{ transform: `translate(${mediaPosition.x}px, ${mediaPosition.y}px) scale(${mediaScale}) rotate(${mediaRotation}deg)` }}
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Status preview"
                          draggable={false}
                          className="relative z-10 h-full w-full cursor-move select-none object-contain"
                          style={{ transform: `translate(${mediaPosition.x}px, ${mediaPosition.y}px) scale(${mediaScale}) rotate(${mediaRotation}deg)` }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-8" style={{ background }}>
                      <p
                        className="max-w-[84%] whitespace-pre-line leading-tight text-white"
                        style={{
                          fontSize: `${textSize}px`,
                          textAlign,
                          fontWeight: textWeight,
                          fontStyle: textItalic ? "italic" : "normal",
                        }}
                      >
                        {text || "Start typing"}
                      </p>
                    </div>
                  )}

                  {composerStep === "media" && text && (
                    <div className="absolute bottom-6 left-4 right-4 rounded-2xl bg-black/45 p-3 backdrop-blur-xl">
                      <p className="whitespace-pre-line text-center text-base font-semibold text-white">{text}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 md:hidden">
                {actionButtons}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );

  return (
    <section className="content-panel w-full overflow-hidden rounded-2xl p-4">
      <div>
        <p className="small-semibold uppercase tracking-[0.24em] text-white/[0.35]">Status</p>
        <h2 className="body-bold">24-hour moments</h2>
      </div>

      {isLoading ? (
        <div className="py-6">
          <Loader />
        </div>
      ) : (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          <div className="relative h-44 w-32 flex-none overflow-hidden rounded-2xl border border-dark-4 bg-dark-3 text-left shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
            <div className="block h-[7rem] w-full overflow-hidden bg-dark-4">
              <img
                src={user?.imageUrl || "/assets/images/default_user_image.png"}
                alt="You"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <button
              type="button"
              onClick={openComposer}
              className="absolute left-1/2 top-[5.5rem] grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border-4 border-dark-3 bg-primary-500 text-white"
              aria-label="Create status"
            >
              <Plus size={24} />
            </button>
            <span className="absolute bottom-4 left-3 right-3 text-center text-sm font-bold text-light-1">
              Create status
            </span>
          </div>

          {groupedStatuses.map((creatorStatuses) => {
            const creator = creatorStatuses[0]?.creator;
            const previewStatus = getNextStatusToPreview(creatorStatuses, user._id);
            const previewMedia = getStatusMedia(previewStatus);
            const hasUnviewed = creatorStatuses.some((status) => !isStatusViewed(status, user._id));

            return (
              <Link
                key={creator?._id}
                to={`/status?creator=${creator?._id}`}
                className="group relative h-44 w-32 flex-none overflow-hidden rounded-2xl border border-dark-4 bg-dark-3 shadow-[0_12px_35px_rgba(0,0,0,0.25)]"
                aria-label={`View ${creator?._id === user._id ? "your" : creator?.name + "'s"} status`}
              >
                {previewMedia ? (
                  previewMedia.type === "video" ? (
                    <video
                      src={previewMedia.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={previewMedia.url}
                      alt={previewMedia.name || "status"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  )
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center p-3"
                    style={{ background: previewStatus?.style?.background || textBackgrounds[0] }}
                  >
                    <p className="line-clamp-5 text-center text-sm font-extrabold leading-5 text-white">
                      {previewStatus?.text || "Status"}
                    </p>
                  </div>
                )}

                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/15" />

                <span
                  className={`absolute left-4 top-4 h-12 w-12 overflow-hidden rounded-full border-[3px] bg-dark-4 p-[2px] shadow-lg ${
                    hasUnviewed ? "border-primary-500" : "border-gray-400/80"
                  }`}
                >
                  <img
                    src={creator?.imageUrl || "/assets/images/default_user_image.png"}
                    alt={creator?.name || "creator"}
                    className="h-full w-full rounded-full object-cover"
                  />
                </span>

                <span className="absolute bottom-4 left-3 right-3 line-clamp-2 text-[15px] font-bold leading-5 text-white drop-shadow">
                  {creator?._id === user._id ? "Your status" : creator?.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {isCreating && createPortal(composerOverlay, document.body)}
    </section>
  );
};

export default StatusTray;
