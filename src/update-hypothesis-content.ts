import data from '../data/imgur-image-urls-with-manuscript-id-and-cdn-url-and-published-url-and-imgur-link-url.json';

data.splice(0, 1).forEach(async ({ hypothesis_id, image_info }) => {
  const annotationResponse = await fetch(`https://api.hypothes.is/api/annotations/${hypothesis_id}`);
  if (!annotationResponse.ok) {
    throw new Error(`Failed to fetch annotation for hypothesis_id ${hypothesis_id}: ${annotationResponse.status} ${annotationResponse.statusText}`);
  }

  const annotation = await annotationResponse.json();

  const originalContent = annotation.text;

  let content = originalContent;
  content = content.replaceAll(' title="source: imgur.com"', '');
  image_info.forEach(({ imgur_link_url, imgur_url, published_url }) => {
    content = content.replaceAll(imgur_link_url, published_url);
    content = content.replaceAll(imgur_url, published_url);
  });
  console.log(content);

  if (content == originalContent) {
    console.log(`No changes needed for hypothesis_id ${hypothesis_id}`);
    return;
  }
  console.log(`Updating hypothesis_id ${hypothesis_id}`);

  // const updateResponse = await fetch(`https://api.hypothes.is/api/annotations/${hypothesis_id}`, {
  //   method: 'PUT',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.HYPOTHESIS_API_TOKEN}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     ...annotation,
  //     content: contentWithImages
  //   })
  // });

  // if (!updateResponse.ok) {
  //   throw new Error(`Failed to update annotation for hypothesis_id ${hypothesis_id}: ${updateResponse.status} ${updateResponse.statusText}`);
  // }
});
