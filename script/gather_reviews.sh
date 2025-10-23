#!/bin/bash

curl https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v2/index | jq '[.docmaps[]|.steps|to_entries[]|.value.actions[].outputs[]|select(.type=="review-article" or .type=="evaluation-summary" or .type=="reply")|{ "doi": .doi, "reviewContentUrl": (.content[]|select(.url|startswith("https://sciety.org/evaluations/hypothesis:"))|.url) }]' > data/reviews.json
