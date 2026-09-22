const { readPeople, writePeople } = require("../lib/blob-store");

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function parseFormBody(raw) {
  const out = {};
  for (const pair of String(raw || "").split("&")) {
    if (!pair) continue;
    const [k, v] = pair.split("=");
    out[decodeURIComponent(k || "")] = decodeURIComponent((v || "").replace(/\+/g, " "));
  }
  return out;
}

module.exports = async (req, res) => {
  if (req.method === "POST") {
    let fields = req.body;
    if (!fields || typeof fields === "string") {
      fields = parseFormBody(fields);
    }
    const id = fields && fields.id;
    if (id) {
      try {
        const people = await readPeople();
        await writePeople(people.filter((p) => p.id !== id));
      } catch (e) {
        // ignore, fall through to redirect
      }
    }
    res.writeHead(302, { Location: "/people" });
    res.end();
    return;
  }

  let people = [];
  try {
    people = await readPeople();
  } catch (e) {}

  const rows = people.slice().reverse().map((p) => `
    <tr>
      <td>${escapeHtml(p.submittedAt)}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.phone)}</td>
      <td>${escapeHtml(p.count)}</td>
      <td>${escapeHtml(p.message)}</td>
      <td>
        <form method="POST" action="/people" onsubmit="return confirm('Устгах уу?');" style="margin:0;">
          <input type="hidden" name="id" value="${escapeHtml(p.id)}">
          <button type="submit" style="background:#c62828;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Устгах</button>
        </form>
      </td>
    </tr>`).join("");

  const html = `<!doctype html>
<html lang="mn"><head><meta charset="utf-8">
<title>Ирэх хүмүүсийн жагсаалт</title>
<style>
  body { font-family: sans-serif; padding: 24px; background: #f5f5f7; }
  h1 { font-size: 20px; }
  table { border-collapse: collapse; width: 100%; background: #fff; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 14px; }
  th { background: #1a237e; color: #fff; }
  tr:nth-child(even) { background: #fafafa; }
</style></head>
<body>
  <h1>Бүртгүүлсэн хүмүүс (${people.length})</h1>
  <table>
    <thead><tr><th>Огноо</th><th>Овог нэр</th><th>Утас</th><th>Хүний тоо</th><th>Сэтгэгдэл</th><th>Үйлдэл</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
};
