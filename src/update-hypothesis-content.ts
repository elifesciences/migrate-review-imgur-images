import data from '../data/imgur-image-urls-with-manuscript-id-and-cdn-url-and-published-url-and-imgur-link-url.json';

let index = 0;
(async () => {
  for (const { hypothesis_id, image_info } of data) {
    index++;
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

    if (content == originalContent) {
      console.log(`No changes needed for hypothesis_id ${hypothesis_id} on ${annotation.uri}`);
      continue;
    }

    if (!(annotation.uri.startsWith('https://www.biorxiv.org/') || annotation.uri.startsWith('https://www.medrxiv.org/'))) {
      console.log(`Skipping changes needed for hypothesis_id ${hypothesis_id} on ${annotation.uri}`);
      continue;
    }

    console.log(`Updating hypothesis_id ${hypothesis_id} on ${annotation.uri}`);

    const updateResponse = await fetch(`https://api.hypothes.is/api/annotations/${hypothesis_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.HYPOTHESIS_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: content,
      })
    });

    if (!updateResponse.ok) {
      console.error(`Failed to update index ${index} annotation for hypothesis_id ${hypothesis_id}: ${content}`);
      throw new Error(`Failed to update annotation for hypothesis_id ${hypothesis_id}: ${updateResponse.status} ${updateResponse.statusText}`);
    }

    console.log(`Updated hypothesis_id ${hypothesis_id}`);
  }
})();
