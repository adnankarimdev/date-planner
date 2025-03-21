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

// script.js
// Authors: kylephillips@ bencobley@

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai@0.21.0";
import { html, render } from "https://esm.run/lit";
import { GEMINI_API_KEY } from "./config.js";
import * as mapsFunction from "./function-declarations.js";
import { presets } from "./presets.js";

const client = new GoogleGenerativeAI(GEMINI_API_KEY);
const systemInstruction = mapsFunction.systemInstructions;

const functionDeclarations = mapsFunction.declarations.map((declaration) => ({
  ...declaration,
  callback: (args) => {
    switch (declaration.name) {
      case "recommend_place":
        const { location, caption } = args;
        renderPage(location, caption);
        break;
      case "recommend_restaurant":
        const { location: restLocation, cuisine, priceRange, ambiance } = args;
        renderRestaurant(restLocation, cuisine, priceRange, ambiance);
        break;
      case "plan_date":
        const { city, timeOfDay, activities } = args;
        renderDatePlan(city, timeOfDay, activities);
        break;
    }
  },
}));

const chat = async (userText) => {
  try {
    const temperature = 2;
    const { response } = await client
      .getGenerativeModel(
        { model: "models/gemini-2.0-flash-exp", systemInstruction },
        { apiVersion: "v1beta" }
      )
      .generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: userText }],
          },
        ],
        generationConfig: { temperature },
        tools: [{ functionDeclarations }],
      });

    const calls = response.functionCalls();
    for (const call of calls) {
      const declaration = functionDeclarations.find(
        (d) => d.name === call.name
      );
      if (declaration) {
        declaration.callback(call.args);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

async function init() {
  renderPage("%"); // Start by rendering with empty location query: shows earth
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.removeAttribute("data-theme"); // Use default (dark)
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

init();

function renderPage(location, caption = "") {
  const root = document.querySelector("#root");
  caption = caption.replace(/\\/g, "");
  render(
    html`
      <div id="map">${mapsFunction.embed(location)}</div>
      ${caption ? html`<div id="caption"><p>${caption}</p></div>` : ""}
      <div id="presets-container">
        <span id="take-me-somewhere">Take me somewhere...</span>
        <div id="presets">
          ${presets.map(
            ([name, message]) =>
              html`<button @click=${() => chat(message)} class="preset">
                ${name}
              </button>`
          )}
        </div>
      </div>
    `,
    root
  );
}

function renderRestaurant(location, cuisine, priceRange, ambiance) {
  const root = document.querySelector("#root");
  render(
    html`
      ${mapsFunction.embedRestaurant(location, cuisine, priceRange, ambiance)}
      <div id="presets-container">
        <span id="take-me-somewhere">Try something else...</span>
        <div id="presets">
          ${presets.map(
            ([name, message]) =>
              html`<button @click=${() => chat(message)} class="preset">
                ${name}
              </button>`
          )}
        </div>
      </div>
    `,
    root
  );
}

function renderDatePlan(city, timeOfDay, activities) {
  const root = document.querySelector("#root");
  render(
    html`
      ${mapsFunction.embedDatePlan(city, activities)}
      <div id="presets-container">
        <span id="take-me-somewhere">Plan another date...</span>
        <div id="presets">
          ${presets.map(
            ([name, message]) =>
              html`<button @click=${() => chat(message)} class="preset">
                ${name}
              </button>`
          )}
        </div>
      </div>
    `,
    root
  );
}
