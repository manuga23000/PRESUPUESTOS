import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface LineItem {
  cantidad: string;
  descripcion: string;
  importe: string;
}

interface PdfRequestBody {
  nombre: string;
  vehiculo: string;
  items: LineItem[];
  total: string;
  moneda: "ARS" | "USD";
}

function formatImporte(val: string): string {
  const n = parseFloat(val.replace(/\./g, "").replace(",", "."));
  if (isNaN(n)) return val;
  return n.toLocaleString("es-AR");
}

function getTodayStr(): string {
  const d = new Date();
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "LOGO NEGRO.png");
    const buf = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

function buildHtml(data: PdfRequestBody, logoBase64: string): string {
  const BLUE = "#0ea5e9";
  const BLUE_DARK = "#0369a1";
  const BLUE_DEEP = "#0c1a2e";
  const BLUE_MID = "#0f2744";
  const ACCENT = "#38bdf8";
  const NEON = "#00d4ff";

  const today = getTodayStr();
  const MIN_ROWS = 7;
  const rows = [...data.items];
  while (rows.length < MIN_ROWS) {
    rows.push({ cantidad: "", descripcion: "", importe: "" });
  }

  const gridSvg = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${NEON}" stroke-width="0.5"/></svg>`
  )}`;

  const triangleTopRight = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340"><polygon points="340,0 340,340 0,0" fill="${BLUE}"/></svg>`
  )}`;

  const triangleBottomLeft = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><polygon points="0,240 240,240 0,0" fill="${ACCENT}"/></svg>`
  )}`;

  const circlesSvg = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 794 1123"><circle cx="680" cy="160" r="180" fill="none" stroke="${NEON}" stroke-width="1"/><circle cx="680" cy="160" r="130" fill="none" stroke="${NEON}" stroke-width="0.5"/><circle cx="100" cy="900" r="120" fill="none" stroke="${BLUE}" stroke-width="1"/></svg>`
  )}`;

  const totalDisplay =
    data.moneda === "USD"
      ? `${formatImporte(data.total)} usd`
      : `$ ${formatImporte(data.total)}`;

  const tableRows = rows
    .map((item, i) => {
      const bgColor = i % 2 === 0 ? `${BLUE_MID}cc` : `${BLUE_DEEP}dd`;
      const borderLeft = item.descripcion
        ? `2px solid ${NEON}66`
        : `2px solid transparent`;
      const cantColor = item.cantidad ? NEON : "#2a4a6a";
      const cantWeight = item.cantidad ? 700 : 400;
      const descColor = item.descripcion ? "#e2f0ff" : "#1a3050";
      const descWeight = item.descripcion ? 600 : 400;

      return `<tr style="background-color:${bgColor};border-left:${borderLeft}">
        <td style="padding:11px 16px;font-size:20px;border-bottom:1px solid ${BLUE}22;height:44px;line-height:22px;vertical-align:middle;text-align:center;font-family:'Orbitron',sans-serif;font-weight:${cantWeight};color:${cantColor}">${item.cantidad}</td>
        <td style="padding:11px 16px;font-size:20px;border-bottom:1px solid ${BLUE}22;height:44px;line-height:22px;vertical-align:middle;text-align:center;font-weight:${descWeight};color:${descColor}">${item.descripcion}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: ${BLUE_DEEP}; }
  </style>
</head>
<body>
<div style="width:794px;min-height:1123px;background-color:${BLUE_DEEP};color:#e2f0ff;font-family:'Rajdhani','Arial',sans-serif;box-sizing:border-box;position:relative;overflow:hidden;-webkit-print-color-adjust:exact">
  <!-- GRID PATTERN -->
  <div style="position:absolute;inset:0;opacity:0.06;pointer-events:none;z-index:0;background-image:url('${gridSvg}');background-repeat:repeat;background-size:40px 40px"></div>
  <!-- DIAGONAL TOP RIGHT -->
  <div style="position:absolute;top:0;right:0;width:340px;height:340px;opacity:0.12;pointer-events:none;z-index:0;background-image:url('${triangleTopRight}');background-size:cover"></div>
  <!-- DIAGONAL BOTTOM LEFT -->
  <div style="position:absolute;bottom:0;left:0;width:240px;height:240px;opacity:0.08;pointer-events:none;z-index:0;background-image:url('${triangleBottomLeft}');background-size:cover"></div>
  <!-- NEON CIRCLES -->
  <div style="position:absolute;inset:0;opacity:0.07;pointer-events:none;z-index:0;background-image:url('${circlesSvg}');background-size:cover"></div>
  <!-- TOP BAR -->
  <div style="height:4px;background:linear-gradient(90deg,transparent 0%,${NEON} 40%,${BLUE} 100%);position:relative;z-index:2"></div>

  <div style="position:relative;z-index:1;padding:32px 44px 36px">
    <!-- HEADER -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">
      <div style="position:relative">
        <div style="position:absolute;inset:-10px;background:radial-gradient(circle,${BLUE}22 0%,transparent 70%);border-radius:50%"></div>
        ${logoBase64 ? `<img src="${logoBase64}" alt="GTM" style="height:140px;width:auto;display:block;position:relative;filter:brightness(1.1) drop-shadow(0 0 12px rgba(14,165,233,0.4))">` : `<div style="font-size:56px;font-weight:900;letter-spacing:6px;color:${NEON};line-height:1;text-shadow:0 0 20px ${NEON}66;font-family:'Orbitron',sans-serif">GTM</div>`}
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;letter-spacing:6px;color:${BLUE};text-transform:uppercase;margin-bottom:8px;font-weight:600">GRANDOLI TALLER MEC&Aacute;NICO</div>
        <div style="font-size:40px;font-weight:900;letter-spacing:4px;color:#ffffff;line-height:1;text-shadow:0 0 30px ${BLUE}66;font-family:'Orbitron',sans-serif">PRESUPUESTO</div>
        <div style="display:inline-block;margin-top:12px;background:linear-gradient(135deg,${BLUE_DARK},${BLUE});color:#fff;font-size:15px;font-weight:700;letter-spacing:2px;padding:6px 18px;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);box-shadow:0 0 16px ${BLUE}55;line-height:20px">${today}</div>
      </div>
    </div>

    <!-- DIVIDER -->
    <div style="height:1px;background:linear-gradient(90deg,${NEON} 0%,${BLUE} 40%,transparent 100%);margin-bottom:24px;box-shadow:0 0 8px ${NEON}44"></div>

    <!-- CLIENT DATA -->
    <div style="display:table;width:100%;border-spacing:14px 0;margin-left:-14px;margin-bottom:26px">
      <div style="display:table-cell;width:50%">
        <div style="border:1px solid ${BLUE}44;border-radius:4px;padding:14px 18px;background:linear-gradient(135deg,${BLUE_MID}ee,${BLUE_DEEP}cc);box-shadow:inset 0 1px 0 ${BLUE}22">
          <div style="font-size:10px;font-weight:700;letter-spacing:3px;color:${BLUE};margin-bottom:6px;text-transform:uppercase">NOMBRE DEL CLIENTE</div>
          <div style="font-size:22px;font-weight:700;color:#e2f0ff;line-height:1.3">${data.nombre || "&mdash;"}</div>
        </div>
      </div>
      <div style="display:table-cell;width:50%">
        <div style="border:1px solid ${BLUE}44;border-radius:4px;padding:14px 18px;background:linear-gradient(135deg,${BLUE_MID}ee,${BLUE_DEEP}cc);box-shadow:inset 0 1px 0 ${BLUE}22">
          <div style="font-size:10px;font-weight:700;letter-spacing:3px;color:${BLUE};margin-bottom:6px;text-transform:uppercase">VEH&Iacute;CULO</div>
          <div style="font-size:22px;font-weight:700;color:#e2f0ff;line-height:1.3">${data.vehiculo || "&mdash;"}</div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="background:linear-gradient(90deg,${BLUE_DARK} 0%,#0a2540 100%);color:#fff;padding:13px 16px;font-size:13px;font-weight:700;letter-spacing:4px;border-bottom:2px solid ${NEON};text-transform:uppercase;line-height:1.3;width:90px;text-align:center">CANT.</th>
          <th style="background:linear-gradient(90deg,${BLUE_DARK} 0%,#0a2540 100%);color:#fff;padding:13px 16px;font-size:13px;font-weight:700;letter-spacing:4px;border-bottom:2px solid ${NEON};text-transform:uppercase;line-height:1.3;text-align:center">DESCRIPCI&Oacute;N</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <!-- TOTAL -->
    <div style="text-align:right;margin-top:6px">
      <div style="display:inline-table;min-width:360px;border:2px solid ${BLUE};border-spacing:0">
        <div style="display:table-row">
          <div style="display:table-cell;font-size:14px;font-weight:700;letter-spacing:5px;color:${ACCENT};font-family:'Orbitron',sans-serif;background-color:${BLUE_MID};padding:20px 32px;vertical-align:middle">TOTAL</div>
          <div style="display:table-cell;font-size:32px;font-weight:700;font-family:'Orbitron',sans-serif;color:#ffffff;background-color:${BLUE_DARK};padding:20px 24px;vertical-align:middle;border-left:2px solid ${BLUE}">${totalDisplay}</div>
        </div>
      </div>
    </div>

    <!-- WARRANTY -->
    <div style="margin-top:24px;border:1px solid ${BLUE};border-left:4px solid ${NEON};padding:14px 22px;display:table;width:calc(100% - 48px);background-color:${BLUE_MID};border-radius:0 4px 4px 0">
      <div style="display:table-cell;vertical-align:middle;width:46px;padding-right:14px">
        <div style="width:32px;height:32px;border-radius:50%;background-color:${BLUE_DARK};border:2px solid ${NEON};text-align:center;line-height:28px;color:${NEON};font-size:18px;font-weight:900">&#10003;</div>
      </div>
      <div style="display:table-cell;vertical-align:middle">
        <div style="font-weight:800;font-size:16px;letter-spacing:3px;color:${NEON};margin-bottom:4px">GARANT&Iacute;A INCLUIDA</div>
        <div style="font-size:14px;color:#6a9bbf">Este presupuesto incluye garant&iacute;a de 6 meses.</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid ${BLUE}33;display:table;width:100%">
      <div style="display:table-cell;text-align:center">
        <div style="font-size:12px;font-weight:700;letter-spacing:3px;color:${BLUE};margin-bottom:4px;text-transform:uppercase">DIRECCI&Oacute;N</div>
        <div style="font-size:17px;font-weight:600;color:#7aabcc;line-height:1.3">Viale 291, San Nicol&aacute;s</div>
      </div>
      <div style="display:table-cell;text-align:center">
        <div style="font-size:12px;font-weight:700;letter-spacing:3px;color:${BLUE};margin-bottom:4px;text-transform:uppercase">TEL&Eacute;FONO</div>
        <div style="font-size:17px;font-weight:600;color:#7aabcc;line-height:1.3">3364 694921</div>
      </div>
      <div style="display:table-cell;text-align:center">
        <div style="font-size:12px;font-weight:700;letter-spacing:3px;color:${BLUE};margin-bottom:4px;text-transform:uppercase">WEB</div>
        <div style="font-size:17px;font-weight:600;color:#7aabcc;line-height:1.3">mecanicagrandoli.com.ar</div>
      </div>
    </div>
  </div>

  <!-- BOTTOM BAR -->
  <div style="height:4px;background:linear-gradient(90deg,${NEON} 0%,${BLUE} 60%,transparent 100%);position:absolute;bottom:0;left:0;right:0;box-shadow:0 0 8px ${NEON}66"></div>
</div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PdfRequestBody;

    const logoBase64 = getLogoBase64();
    const html = buildHtml(body, logoBase64);

    // Dynamic import to avoid bundling issues
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    // Configure chromium for serverless
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cr = chromium as any;
    if ("setHeadlessMode" in chromium) cr.setHeadlessMode = "shell";
    if ("setGraphicsMode" in chromium) cr.setGraphicsMode = false;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="presupuesto-${(body.nombre || "gtm").replace(/\s+/g, "-").toLowerCase()}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Error generando PDF", detail: message },
      { status: 500 }
    );
  }
}
