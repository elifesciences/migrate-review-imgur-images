
export const extractImgurSources = (html: string): string[] => {
  const imgurImageSources: string[] = [];
  const imgurLinks: string[] = [];
  const rewriter = new HTMLRewriter().on('img', {
    element(img) {
      const src = img.getAttribute('src');
      if (src) {
        imgurImageSources.push(src);
      }
    },
  }).on('a', {
    element(a) {
      const src = a.getAttribute('href');
      if (src && src.includes('imgur')) {
        imgurLinks.push(src);
      }
    }
  });

  // Just invoke the transformer, we don't need the transformed output
  rewriter.transform(html);


  const imgurLinksFiltered = imgurLinks.filter((link) => imgurImageSources.includes(link));

  return [
    ...imgurImageSources,
    ...imgurLinksFiltered,
  ];
};
