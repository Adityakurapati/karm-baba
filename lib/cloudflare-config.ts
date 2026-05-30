export function getServerConfig() {
  return {
    accountId: process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID!,
    bucketName: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
    publicUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  };
}

export function getClientConfig() {
  return {
    accountId: process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID!,
    bucketName: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
    publicUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL!,
  };
}
