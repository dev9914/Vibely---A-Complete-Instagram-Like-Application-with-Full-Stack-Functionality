import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { closeCreatePostModal } from "@/store/uiSlice";
import { CreatePostInput, createPostSchema } from "../lib/validations";
import {
  useCreatePostMutation,
  useGenerateCaptionsMutation,
  useUploadImageForAIMutation,
} from "../services";

function CaptionCard({
  caption,
  onUse,
}: {
  caption: string;
  onUse: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40">
      <div className="flex items-start gap-3">
        <p className="flex-1 whitespace-pre-wrap break-words text-sm leading-6">
          {caption}
        </p>

        <Button
          size="sm"
          variant="secondary"
          onClick={onUse}
          className="shrink-0"
        >
          <Check className="mr-1 h-4 w-4" />
          Use
        </Button>
      </div>
    </div>
  );
}

function GeneratingCaptionsState() {
  return (
    <div className="flex h-40 flex-col items-center justify-center rounded-lg
border
bg-muted/20 px-4 py-7 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5 animate-pulse" />
      </div>
      <p className="text-sm font-semibold text-foreground">Generating AI captions...</p>
      <p className="mt-1 text-sm text-muted-foreground">Understanding your image...</p>
    </div>
  );
}

export function CardWithForm() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [captions, setCaptions] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const [uploadImage, { isLoading: uploadingImage }] = useUploadImageForAIMutation();
  const [generateCaptions, { isLoading: generatingCaptions }] = useGenerateCaptionsMutation();
  const [createPost, { isLoading: creatingPost }] = useCreatePostMutation();

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      description: "",
      postImage: undefined,
    },
  });

  const postImage = form.watch("postImage");
  const isGeneratingAiCaptions = uploadingImage || generatingCaptions;
  const hasCaptions = captions.length > 0;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetComposerState = () => {
    form.reset({
      description: "",
      postImage: undefined,
    });
    setPreviewUrl(null);
    setUploadedImageUrl("");
    setCaptions([]);
    setIsDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetComposerState();
    dispatch(closeCreatePostModal());
  };

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    form.setValue("postImage", file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.clearErrors("postImage");
    setPreviewUrl(URL.createObjectURL(file));
    setUploadedImageUrl("");
    setCaptions([]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0]);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    form.setValue("postImage", undefined as unknown as CreatePostInput["postImage"], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.clearErrors("postImage");
    setPreviewUrl(null);
    setUploadedImageUrl("");
    setCaptions([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files?.[0]);
  };

  const handleUploadAndGenerate = async () => {
    const image = form.getValues("postImage");

    if (!image) {
      form.setError("postImage", {
        message: "Please select an image first",
      });
      return;
    }

    try {
      setCaptions([]);

      const formData = new FormData();
      formData.append("image", image);

      const uploadResult = await uploadImage(formData).unwrap();
      const imageUrl = uploadResult.imageUrl;
      setUploadedImageUrl(imageUrl);

      const captionsResult = await generateCaptions({ imageUrl }).unwrap();
      setCaptions(captionsResult.aiCaptions || []);
    } catch (error) {
      console.error("Failed to upload/generate captions:", error);
    }
  };

  const handleRegenerateCaptions = async () => {
    if (!uploadedImageUrl) return;

    try {
      setCaptions([]);
      const result = await generateCaptions({ imageUrl: uploadedImageUrl }).unwrap();
      setCaptions(result.aiCaptions || []);
    } catch (error) {
      console.error("Failed to regenerate captions:", error);
    }
  };

  const onSubmit = async (data: CreatePostInput) => {
    if (!data.postImage) {
      form.setError("postImage", { message: "Please upload an image" });
      return;
    }

    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("postImage", data.postImage);

    try {
      await createPost(formData).unwrap();
      handleClose();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
  className={cn(
    "overflow-hidden border-border bg-card p-0 gap-0",
    postImage
      ? "h-[88vh] w-[95vw] max-w-[1400px]"
      : "w-[640px] max-w-[92vw]"
  )}
>
        <DialogHeader className="shrink-0 border-b border-border/70 px-4 py-0 h-14">
          <div className="flex h-full items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>

            <DialogTitle className="text-sm font-semibold">
              Create new post
            </DialogTitle>

            <Button
              variant="ghost"
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={creatingPost || !postImage}
              className="-mr-2 font-semibold text-primary hover:text-primary/80"
            >
              {creatingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share"}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <Form {...form}>
            <div className="flex flex-1 overflow-hidden">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />

              {!postImage ? (
  <div className="flex flex-1 items-center justify-center bg-card">
    <div
      onClick={triggerFilePicker}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
  "flex w-full max-w-[430px] cursor-pointer flex-col items-center rounded-2xl bg-card px-10 py-14 text-center transition-all duration-200",
  isDragging && "scale-[1.02] bg-primary/5"
)}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <ImagePlus className="h-8 w-8 text-primary" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight">
        Create a new post
      </h2>

      <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
        Drag & drop an image here or choose one from your computer.
      </p>

      <Button
        type="button"
        className="mt-8 h-12 rounded-full px-8 shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          triggerFilePicker();
        }}
      >
        <Upload className="mr-2 h-4 w-4" />
        Select image
      </Button>
    </div>
  </div>
) : (
                <>
                  <div className="relative flex-1 bg-black">
                    <div className="relative h-full h-full w-full overflow-hidden bg-black">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={clearImage}
                        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-md"
                      >
                        <X className="h-5 w-5" />
                      </Button>

                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Selected preview"
                          className="h-full w-full max-h-full
max-w-full
object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex h-full w-[420px] shrink-0 flex-col overflow-hidden border-t border-border/70 bg-card md:border-l md:border-t-0">
                    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-5">
                      <div className="flex flex-1 min-h-0 flex-col gap-5 overflow-hidden">
                        <div className="shrink-0">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Write a caption..."
                                  className="min-h-[130px] resize-none rounded-lg border-border bg-card p-3 text-sm placeholder:text-muted-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        </div>

                        <div className="rounded-lg
border
p-4 border-border/70 p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                              <p className="text-xs text-muted-foreground">AI Caption Assistant</p>
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={handleUploadAndGenerate}
                            disabled={!postImage || isGeneratingAiCaptions || creatingPost}
                            className="mt-3 h-11 w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {isGeneratingAiCaptions ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            Generate
                          </Button>
                        </div>

{isGeneratingAiCaptions ? (
  <GeneratingCaptionsState />
) : hasCaptions ? (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-semibold">
        AI Suggestions
      </p>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRegenerateCaptions}
        disabled={isGeneratingAiCaptions || !uploadedImageUrl}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Regenerate
      </Button>
    </div>

    <ScrollArea className="flex-1 min-h-0 rounded-xl border border-border/70">
      <div className="space-y-3 p-3">
        {captions.map((caption, index) => (
          <CaptionCard
            key={`${index}-${caption}`}
            caption={caption}
            onUse={() =>
              form.setValue("description", caption, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
        ))}
      </div>
    </ScrollArea>

  </div>
) : (
                          <div className="rounded-xl border border-dashed border-border/80 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
                            Generate AI captions to get smart suggestions for your post.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
