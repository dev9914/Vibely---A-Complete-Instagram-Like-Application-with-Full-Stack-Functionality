import { api } from './api';

/**
 * AI API Service
 * 
 * Handles AI-powered features including:
 * - Image upload to Cloudinary
 * - AI caption generation (Replicate + Google Gemini)
 * - Image understanding
 */

// ========== TYPES ==========

export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  publicId?: string;
}

export interface AICaptionResponse {
  success: boolean;
  imageUrl: string;
  imageDescription?: string;
  aiCaptions: string[];
  model?: string;
}

// ========== API ENDPOINTS ==========

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Upload image to Cloudinary and get URL
     * This is the first step before generating captions
     */
    uploadImageForAI: builder.mutation<ImageUploadResponse, FormData>({
      query: (formData) => ({
        url: '/ai/getUrl',
        method: 'POST',
        body: formData,
      }),
    }),
    
    /**
     * Generate AI captions for an image
     * Uses Replicate (BLIP) for image understanding + Google Gemini for creative captions
     */
    generateCaptions: builder.mutation<AICaptionResponse, { imageUrl: string }>({
      query: (body) => ({
        url: '/ai/auto-captions',
        method: 'POST',
        body,
      }),
    }),
    
    /**
     * Combined: Upload image + Generate captions in one call
     * Convenience endpoint for better UX
     */
    uploadAndGenerateCaptions: builder.mutation<AICaptionResponse, FormData>({
      async queryFn(formData, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          // Step 1: Upload image
          const uploadResult = await fetchWithBQ({
            url: '/ai/getUrl',
            method: 'POST',
            body: formData,
          });
          
          if (uploadResult.error) {
            return { error: uploadResult.error };
          }
          
const uploadData = uploadResult.data as ImageUploadResponse;

if (!uploadData?.imageUrl) {
  return {
    error: {
      status: 'CUSTOM_ERROR',
      error: 'Image upload failed',
    },
  };
}
          
          // Step 2: Generate captions
          const captionResult = await fetchWithBQ({
            url: '/ai/auto-captions',
            method: 'POST',
            body: { imageUrl: uploadData.imageUrl },
          });
          
          if (captionResult.error) {
            return { error: captionResult.error };
          }
          
          return { data: captionResult.data as AICaptionResponse };
        } catch (error) {
  return {
    error: {
      status: 'CUSTOM_ERROR',
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    },
  };
}
      },
    }),
    
    /**
     * Regenerate captions for an existing image URL
     * Useful when user wants different caption suggestions
     */
    regenerateCaptions: builder.mutation<AICaptionResponse, { imageUrl: string }>({
      query: (body) => ({
        url: '/ai/auto-captions',
        method: 'POST',
        body,
      }),
    }),
  }),
});

// ========== EXPORT HOOKS ==========

/**
 * Auto-generated hooks for use in components
 * 
 * Usage:
 * const [uploadImage] = useUploadImageForAIMutation();
 * const [generateCaptions] = useGenerateCaptionsMutation();
 * const [uploadAndGenerate] = useUploadAndGenerateCaptionsMutation();
 */
export const {
  useUploadImageForAIMutation,
  useGenerateCaptionsMutation,
  useUploadAndGenerateCaptionsMutation,
  useRegenerateCaptionsMutation,
} = aiApi;

export default aiApi;
