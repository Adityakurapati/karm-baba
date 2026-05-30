import "server-only";
import { getServerConfig } from "./cloudflare-config";

export class R2Client {
  private getConfig() {
    return getServerConfig();
  }

  private getBaseUrl() {
    const config = this.getConfig();
    return `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets/${config.bucketName}/objects`;
  }

  private getHeaders() {
    const config = this.getConfig();
    return {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  async uploadFile(
    key: string,
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const config = this.getConfig();
      const baseUrl = this.getBaseUrl();

      const uploadHeaders = {
        Authorization: `Bearer ${config.apiToken}`,
      };

      console.log(`Uploading file to: ${baseUrl}/${key}`);

      const response = await fetch(`${baseUrl}/${key}`, {
        method: "PUT",
        headers: uploadHeaders,
        body: file,
      });

      console.log(`Upload response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload failed: ${response.status} ${errorText}`);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const publicUrl = `${config.publicUrl}/${key}`;
      console.log(`File uploaded successfully. Public URL: ${publicUrl}`);

      return {
        success: true,
        url: publicUrl,
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const baseUrl = this.getBaseUrl();
      const headers = this.getHeaders();

      console.log(`Deleting file: ${baseUrl}/${key}`);

      const response = await fetch(`${baseUrl}/${key}`, {
        method: "DELETE",
        headers,
      });

      console.log(`Delete response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to delete file: ${response.status} ${errorText}`);
        throw new Error(
          `Failed to delete file: ${response.status} - ${errorText}`
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file",
      };
    }
  }
}
