import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const pdfFilename = "Ryan_Dharma_Resume.pdf";

export async function GET(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    console.error("PDF generation failed: missing host header");
    return NextResponse.json({ error: "Missing host header" }, { status: 400 });
  }

  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  const targetUrl = new URL("/private/resume/pdf", `${protocol}://${host}`);
  let browser;

  try {
    const chromiumMod = await import("@sparticuz/chromium-min");
    const chromium = chromiumMod.default;
    const pw = await import("playwright-core");
    const pwChromium = pw.chromium;

    browser = await pwChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(targetUrl.toString(), {
      waitUntil: "load",
      timeout: 60_000,
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

    console.info("PDF generated", {
      url: targetUrl.toString(),
      bytes: pdfBuffer.byteLength,
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFilename}"`,
      },
    });
  // } catch (error) {
  //   console.error("PDF generation failed", {
  //     url: targetUrl.toString(),
  //     message: error instanceof Error ? error.message : "Unknown error",
  //     stack: error instanceof Error ? error.stack : undefined,
  //     error,
  //   });
  //   return NextResponse.json(
  //     { error: "Failed to generate PDF" },
  //     { status: 500 },
  //   );
  //
  } catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("PDF generation failed", {
    url: targetUrl.toString(),
    message,
    stack,
  });

  // TEMPORARY: return the real error so we can see it
  return NextResponse.json(
    {
      error: "Failed to generate PDF",
      message,
      stack,
    },
    { status: 500 },
  );
}
} finally {
    if (browser) {
      await browser.close();
    }
  }
}
