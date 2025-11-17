import { s3 } from "bun";

import data from '../data/non-rp-imgur-image-urls-with-cdn-url-and-published-url-and-imgur-link-url.json';

// Initialize the S3 client using Bun's built-in support
// Bun will read credentials from environment variables automatically: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
for (const { image_info } of data) {
  for (const { imgur_url, cdn_url } of image_info) {
    console.log(`copying ${imgur_url} to ${cdn_url}...`);

    const proxy_image_url = `https://proxy.duckduckgo.com/iu/?u=${encodeURIComponent(imgur_url)}`;
    const response = await fetch(proxy_image_url);

    if (!response.ok) {
        console.error(`Failed to fetch image from ${imgur_url}: ${response.status} ${response.statusText}`);
        continue;
    }

    const contentLength = response.headers.get('Content-Length');
    console.log(`Fetched image from ${imgur_url} (content length: ${contentLength})`);

    if (contentLength === '34641') {
        console.warn(`Image probably blocked ${imgur_url}`);
        continue;
    }

    const blob = await response.blob();

    const s3File = s3.file(cdn_url);

    console.log(`Uploading to S3 at:`, s3File);

    const bytes = new Uint8Array(await blob.arrayBuffer());
    await s3File.write(bytes, {
        type: response.headers.get('Content-Type') ?? 'application/octet-stream'
    });

    console.log(`Uploaded to S3 at ${cdn_url}`);
  }
}
