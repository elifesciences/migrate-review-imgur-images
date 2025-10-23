import parse from "csv-simple-parser";

const file = Bun.file('data/imgur-image-urls-with-manuscript-id-and-cdn-url.csv');

const data = parse(await file.text(), { header: true }) as {
  manuscript_id: string,
  elife_doi_version_str: string,
  hypothesis_id: string,
  imgur_url: string,
  cdn_url: string
  }[];

data.forEach(({ imgur_url, cdn_url }) => {
  console.log(imgur_url, cdn_url)
});
