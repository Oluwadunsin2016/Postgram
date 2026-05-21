import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../button";
import { FileVideo, ImagePlus, Play, Plus, X } from "lucide-react";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl?: string;
  media?: { url: string; publicId?: string; type?: "image" | "video"; name?: string }[];
  existingMediaChange?: (media: { url: string; publicId?: string; type?: "image" | "video"; name?: string }[]) => void;
};

const FileUploader = ({ fieldChange, mediaUrl, media = [], existingMediaChange }: FileUploaderProps) => {
  const initialPreviews = media.length
    ? media
    : mediaUrl
      ? [{ url: mediaUrl, type: "image" as const, name: "Current post media" }]
      : [];
  const [files, setFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState(initialPreviews);
  const [filePreviews, setFilePreviews] = useState<{ url: string; type?: "image" | "video"; name?: string }[]>([]);
  const previews = [...existingMedia, ...filePreviews];
  const mediaSignature = JSON.stringify(initialPreviews.map((item) => ({
    url: item.url,
    publicId: item.publicId,
    type: item.type,
    name: item.name,
  })));

  useEffect(() => {
    const nextInitialPreviews = media.length
      ? media
      : mediaUrl
        ? [{ url: mediaUrl, type: "image" as const, name: "Current post media" }]
        : [];
    setExistingMedia(nextInitialPreviews);
    existingMediaChange?.(nextInitialPreviews);
  }, [mediaSignature]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const nextFiles = [...files, ...acceptedFiles];
      setFiles(nextFiles);
      fieldChange(nextFiles);
      setFilePreviews(
        nextFiles.map((file) => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith("video/") ? ("video" as const) : ("image" as const),
          name: file.name,
        }))
      );
    },
    [fieldChange, files]
  );

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => {
        if (preview.url.startsWith("blob:")) URL.revokeObjectURL(preview.url);
      });
    };
  }, [filePreviews]);

  const removeFile = (index: number) => {
    if (index < existingMedia.length) {
      const nextExistingMedia = existingMedia.filter((_, mediaIndex) => mediaIndex !== index);
      setExistingMedia(nextExistingMedia);
      existingMediaChange?.(nextExistingMedia);
      return;
    }

    const fileIndex = index - existingMedia.length;
    const nextFiles = files.filter((_, currentIndex) => currentIndex !== fileIndex);
    const nextFilePreviews = filePreviews.filter((_, currentIndex) => currentIndex !== fileIndex);
    setFiles(nextFiles);
    setFilePreviews(nextFilePreviews);
    fieldChange(nextFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
      "video/*": [".mp4", ".mov", ".webm"],
    },
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-dark-4 bg-dark-3">
      {previews.length > 0 ? (
        <div className="grid gap-3 p-3 sm:grid-cols-2">
          {previews.map((preview, index) => (
            <div key={`${preview.url}-${index}`} className="group relative overflow-hidden rounded-xl border border-dark-4 bg-dark-2">
              {preview.type === "video" ? (
                <video src={preview.url} className="h-72 w-full object-cover" controls />
              ) : (
                <img src={preview.url} alt={preview.name || "post media"} className="h-72 w-full object-cover" />
              )}
              {preview.type === "video" && (
                <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white">
                  <Play size={16} fill="currentColor" />
                </span>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                aria-label="Remove media"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-3 left-3 max-w-[calc(100%-5rem)] rounded-full bg-black/55 px-3 py-1 text-white tiny-medium backdrop-blur-md">
                <span className="line-clamp-1">{preview.name || `${preview.type || "media"} ${index + 1}`}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="flex-center min-h-80 cursor-pointer flex-col border border-dashed border-transparent p-7 text-center transition hover:border-primary-500/50 hover:bg-dark-4/50 lg:min-h-[420px]"
        >
          <input {...getInputProps()} className="cursor-pointer" />
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary-500/15 text-primary-500">
            <ImagePlus size={34} />
          </div>
          <h3 className="base-semibold mb-2 mt-6 text-light-2">
            Drag media here
          </h3>
          <p className="small-regular mb-6 max-w-sm text-light-4">Upload images, videos, or a mix of both. PNG, JPG, WEBP, GIF, MP4, MOV, and WEBM are supported.</p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" className="shad-button_dark_4 gap-2">
              <ImagePlus size={17} />
              Select media
            </Button>
            <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-dark-4 bg-dark-4 px-4 text-white/55 small-medium">
              <FileVideo size={17} />
              Video ready
            </span>
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div
          {...getRootProps()}
          className="file_uploader-label flex cursor-pointer items-center justify-center gap-2 transition hover:text-white"
        >
          <input {...getInputProps()} className="cursor-pointer" />
          <Plus size={16} />
          Add more media
        </div>
      )}
    </div>
  );
};

export default FileUploader;
