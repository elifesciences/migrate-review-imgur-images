import { writeToPath } from '@fast-csv/format'; '@fast-csv/format';

import data from '../data/non-rp-imgur-image-urls-with-cdn-url-and-published-url-and-imgur-link-url.json';

let index = 0;
let updatedContent: {
  hypothesis_id: string,
  hypothesis_url: string,
  posted_on: string,
  current_content: string,
  new_content: string,
  }[] = [];
(async () => {
  for (const { hypothesis_id, image_info } of data) {
    index++;
    const annotationResponse = await fetch(`https://api.hypothes.is/api/annotations/${hypothesis_id}`);
    if (!annotationResponse.ok) {
      throw new Error(`Failed to fetch annotation for hypothesis_id ${hypothesis_id}: ${annotationResponse.status} ${annotationResponse.statusText}`);
    }

    const annotation = await annotationResponse.json() as {
      text: string,
      links: {
        html: string,
      }
      uri: string,
      group: string,
      };

    const originalContent = annotation.text;

    let content = originalContent;
    content = content.replaceAll(' title="source:\u00A0imgur.com"', '');
    image_info.forEach(({ imgur_link_url, imgur_url_in_text, published_url }) => {
      content = content.replaceAll(imgur_link_url, published_url);
      content = content.replaceAll(imgur_url_in_text, published_url);
    });

    if (content == originalContent) {
      console.log(`No changes needed for hypothesis_id ${hypothesis_id} on ${annotation.uri} (group: ${annotation.group})`);
      continue;
    }

    console.log(`Updating hypothesis_id ${hypothesis_id} on ${annotation.uri} (group: ${annotation.group})`);

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

    updatedContent.push({
      hypothesis_id: hypothesis_id,
      hypothesis_url: annotation.links.html,
      posted_on: annotation.uri,
      current_content: originalContent,
      new_content: content,
    });

    console.log(`Updated hypothesis_id ${hypothesis_id}`);
  }
  writeToPath('data/hypothesis_updates.csv', updatedContent, {headers: true});
})();
