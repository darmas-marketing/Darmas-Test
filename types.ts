
export interface Prompt {
  id: number;
  value: string;
}

export interface GeneratedImage {
  prompt: string;
  imageUrl: string | null;
  error: string | null;
  isLoading: boolean;
}

export interface ImageFile {
    base64: string;
    mimeType: string;
    name: string;
}
