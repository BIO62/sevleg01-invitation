// Persistence for RSVP submissions using Vercel Blob (no external token to manage —
// Vercel injects OIDC credentials automatically for the connected store).
const { put, get } = require("@vercel/blob");

const PATHNAME = "rsvp-data.json";

async function readPeople() {
  try {
    const result = await get(PATHNAME, { access: "private", useCache: false });
    if (!result) return [];
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
}

async function writePeople(people) {
  await put(PATHNAME, JSON.stringify(people, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

module.exports = { readPeople, writePeople };
