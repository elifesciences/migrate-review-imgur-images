import reviews from '../data/reviews.json';
import { extractImgurSources } from './html-utils';

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}



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

// https://i.imgur.com/fHS3GOv.jpg
