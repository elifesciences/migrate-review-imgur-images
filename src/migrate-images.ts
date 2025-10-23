import parse from "csv-simple-parser";

const file = Bun.file('data/imgur-image-urls-with-manuscript-id-and-cdn-url.csv');

const data = parse(await file.text(), { header: true }) as {
  manuscript_id: string,
  elife_doi_version_str: string,
  hypothesis_id: string,
  imgur_url: string,
  cdn_url: string
  }[];

data.forEach(async ({ imgur_url, cdn_url }) => {
  console.log(imgur_url, cdn_url);

  const proxy_image_url = `https://proxy.duckduckgo.com/iu/?u=${imgur_url}`;
  const response = await fetch(proxy_image_url);
  if (!response.ok) {
    console.error(`Failed to fetch image from ${imgur_url}: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch image from ${imgur_url}`);
  };
  const contentLength = response.headers.get('Content-Length');
  console.log(`Fetched image from ${imgur_url} (content length: ${contentLength})`);
  if (contentLength === '34641') {
    throw new Error(`Image probably blocked ${imgur_url}`);
  }

});
