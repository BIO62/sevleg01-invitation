const { readPeople, writePeople } = require("../lib/github-store");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (e) {
      res.status(400).json({ error: "invalid body" });
      return;
    }
  }

  try {
    const { people, sha } = await readPeople();
    people.push({
      name: body.name || "",
      phone: body.phone || "",
      count: body.count || "",
      message: body.message || "",
      submittedAt: new Date().toISOString()
    });
    await writePeople(people, sha);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
