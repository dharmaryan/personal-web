import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

export const runtime = "nodejs";

const pdfFilename = "Ryan_Dharma_Resume.pdf";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host");
  if (!host) {
    return NextResponse.json({ error: "Missing host header" }, { status: 400 });
  }

  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  const targetUrl = new URL("/private/resume/pdf", `${protocol}://${host}`);

  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(targetUrl.toString(), {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        bottom: "12mm",
        left: "12mm",
        right: "12mm",
      },
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFilename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  } finally {
    await browser.close();
  }
}
