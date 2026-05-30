"use server";

import { R2Client } from "@/lib/r2-client";
import { revalidatePath } from "next/cache";

const r2Client = new R2Client();

export async function uploadImageToR2(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const file = formData.get("file") as File;
    const key = formData.get("key") as string;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!key) {
      return { success: false, error: "No key provided" };
    }

    console.log(
      `Uploading file: ${key}, size: ${file.size}, type: ${file.type}`
    );

    const result = await r2Client.uploadFile(key, file);

    if (result.success && result.url) {
      revalidatePath("/");
      return { success: true, url: result.url };
    } else {
      return { success: false, error: result.error || "Upload failed" };
    }
  } catch (error) {
    console.error("Upload action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function deleteImageFromR2(imageUrl: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!imageUrl) {
      return { success: true }; // No image to delete
    }

    // Extract key from URL
    const key = imageUrl.split("/").pop();
    if (!key) {
      return { success: false, error: "Invalid image URL" };
    }

    const result = await r2Client.deleteFile(key);
    return result;
  } catch (error) {
    console.error("Delete action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
