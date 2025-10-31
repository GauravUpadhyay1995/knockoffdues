import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import JoiningLetter from "@/components/letters/JoiningLetter";

export async function generateLetterPDF(letterType: string, userData: any) {
  const html = renderToStaticMarkup(
    React.createElement(JoiningLetter, { employeeData: userData })
  );

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  const lettersDir = path.join(process.cwd(), "public", "letters");
  if (!fs.existsSync(lettersDir)) fs.mkdirSync(lettersDir, { recursive: true });

  const fileName = `${letterType}-${userData._id}.pdf`;
  const filePath = path.join(lettersDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  return `/letters/${fileName}`;
}
