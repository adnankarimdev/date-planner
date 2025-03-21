// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// function-declarations.js
// Authors: kylephillips@ bencobley@

import { html } from "https://esm.run/lit";
import { GOOGLE_MAPS_API_KEY } from "./config.js";
export const systemInstructions = `Act as a sophisticated date night planner with extensive knowledge of romantic destinations and activities worldwide. Help couples create memorable experiences by recommending unique date ideas in various cities. Consider factors like ambiance, cuisine, cultural activities, and special experiences. Aim for a mix of classic romantic spots and hidden gems that locals love. Focus on creating cohesive experiences that flow well together.

First, understand the couple's preferences or specific requests. Then, recommend a complete date experience using the available functions. You can suggest a restaurant with 'recommend_restaurant()', an activity with 'recommend_activity()', or create a full evening plan with 'plan_date()'. Provide context and romantic details about why each suggestion would make for a special date night.`;

export const declarations = [
  {
    name: "recommend_place",
    description:
      "Shows the user a map of the city or specific venue. Use for initial city overview or specific locations.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "Name of the city or specific venue, including country",
        },
        caption: {
          type: "string",
          description:
            "Brief description of why this location is romantic or special",
        },
      },
      required: ["location", "caption"],
    },
  },
  {
    name: "recommend_restaurant",
    description: "Suggests a romantic restaurant in the specified city",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "Full restaurant name and address",
        },
        cuisine: {
          type: "string",
          description: "Type of cuisine",
        },
        priceRange: {
          type: "string",
          enum: ["$", "$$", "$$$", "$$$$"],
        },
        ambiance: {
          type: "string",
          description: "Brief description of the atmosphere",
        },
      },
      required: ["location", "cuisine", "priceRange", "ambiance"],
    },
  },
  {
    name: "plan_date",
    description: "Creates a complete date night itinerary",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name and country",
        },
        timeOfDay: {
          type: "string",
          enum: ["afternoon", "evening", "all-day"],
        },
        activities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time: { type: "string" },
              activity: { type: "string" },
              location: { type: "string" },
              details: { type: "string" },
            },
          },
        },
      },
      required: ["city", "timeOfDay", "activities"],
    },
  },
];

// For browser environment, we'll need to store the API key differently
// You can store this in a separate config.js file that's not committed to version control
const API_KEY = GOOGLE_MAPS_API_KEY; // Add your API key here after getting it from Google Cloud Console

export function embed(location) {
  if (!API_KEY) {
    console.error("Google Maps API key is not configured");
    return html`<div>Map configuration error</div>`;
  }

  location = encodeURIComponent(location);
  console.log(location);
  return html`<iframe
    id="embed-map"
    width="600"
    height="450"
    style="border:0"
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps/embed/v1/place?key=${API_KEY}
    &q=${location}"
  >
  </iframe>`;
}

export function embedRestaurant(location, cuisine, priceRange, ambiance) {
  const mapEmbed = embed(location);
  return html`
    <div class="restaurant-recommendation">
      <div class="restaurant-details">
        <p><strong>Cuisine:</strong> ${cuisine}</p>
        <p><strong>Price Range:</strong> ${priceRange}</p>
        <p><strong>Ambiance:</strong> ${ambiance}</p>
      </div>
      ${mapEmbed}
    </div>
  `;
}

export function embedDatePlan(city, activities) {
  const cityMap = embed(city);
  return html`
    <div class="date-plan">
      <h3>Your Date Night in ${city}</h3>
      <div class="date-timeline">
        ${activities.map(
          (activity) => html`
            <div class="timeline-item">
              <span class="time">${activity.time}</span>
              <div class="activity-details">
                <h4>${activity.activity}</h4>
                <p>${activity.details}</p>
              </div>
            </div>
          `
        )}
      </div>
      ${cityMap}
    </div>
  `;
}
