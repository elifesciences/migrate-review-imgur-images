import { chunks } from './array-utils';
import { extractImgurSources } from './html-utils';

import reviews from '../data/reviews.json';

const reviewsChunks = chunks(reviews, 2);
let iterator = 0;
while (iterator < 10) {
  const reviewsChunk = reviewsChunks.next().value;

  console.log('chunk');
  const reviewsChunkWithContent = await Promise.all(reviewsChunk.map(async (review) => ({
    ...review,
    content: await (await fetch(review.reviewContentUrl)).text(),
  })));
  const reviewsWithImgur = reviewsChunkWithContent.filter((review) => review.content.includes('imgur'));

  const doisWithImgurLinks = reviewsWithImgur.map((review) => ({
    doi: review.doi,
    imgLink: extractImgurSources(review.content),
  }));
  console.log(doisWithImgurLinks);

  iterator++;
}
