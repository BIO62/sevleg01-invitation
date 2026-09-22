const { readPeople } = require("../lib/github-store");

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

module.exports = async (req, res) => {
  let people = [];
  try {
    ({ people } = await readPeople());
  } catch (e) {
    res.status(500).send(`Алдаа: ${escapeHtml(e.message || e)}`);
    return;
  }

  const rows = people.slice().reverse().map((p) => `
    <tr>
      <td>${escapeHtml(p.submittedAt)}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.phone)}</td>
      <td>${escapeHtml(p.count)}</td>
      <td>${escapeHtml(p.message)}</td>
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
    <thead><tr><th>Огноо</th><th>Овог нэр</th><th>Утас</th><th>Хүний тоо</th><th>Сэтгэгдэл</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
};
