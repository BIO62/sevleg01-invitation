// Shared helper: read/write rsvp-data.json in a private GitHub repo,
// used as a simple free persistence layer for Vercel serverless functions
// (which have no writable local disk of their own).
const OWNER = process.env.RSVP_GH_OWNER || "BIO62";
const REPO = process.env.RSVP_GH_REPO || "sevleg01-rsvp-data";
const PATH = "rsvp-data.json";
const TOKEN = process.env.RSVP_GH_TOKEN;

function apiUrl() {
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
}

function authHeaders() {
  return {
    Authorization: `token ${TOKEN}`,
    "User-Agent": "sevleg01-rsvp",
    Accept: "application/vnd.github+json"
  };
}

async function readPeople() {
  const res = await fetch(apiUrl(), { headers: authHeaders() });
  if (res.status === 404) {
    return { people: [], sha: undefined };
  }
  if (!res.ok) {
    throw new Error(`GitHub read failed: ${res.status}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { people: JSON.parse(content), sha: data.sha };
}

async function writePeople(people, sha) {
  const content = Buffer.from(JSON.stringify(people, null, 2)).toString("base64");
  const res = await fetch(apiUrl(), {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `RSVP update (${people.length} total)`,
      content,
      sha
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write failed: ${res.status} ${text}`);
  }
}

module.exports = { readPeople, writePeople };
