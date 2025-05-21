import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Helper: Split text into lines that fit the page width
function splitTextToSize(doc, text, maxWidth) {
  return doc.splitTextToSize(text, maxWidth);
}

// Helper: Parse markdown for bold, headings, and bullets
function renderMarkdown(doc, text, x, y, maxWidth, lineHeight, pageHeight, margin) {
  const lines = text.split('\n');
  let currY = y;

  lines.forEach(line => {
    // Remove leading bullet symbols (• or *) to avoid double bullets or unwanted bullets
    let isBullet = false;
    if (/^\*\s+/.test(line)) {
      isBullet = true;
      line = line.replace(/^\*\s+/, '');
    } else if (/^•\s+/.test(line)) {
      line = line.replace(/^•\s+/, '');
    }

    // Check if we need a new page
    if (currY + lineHeight > pageHeight - margin - 20) {
      doc.addPage();
      currY = margin + 30;
    }

    // Blank line (add extra space)
    if (/^\s*$/.test(line)) {
      currY += lineHeight / 2;
      return;
    }

    // Heading (## ...)
    if (/^##\s+/.test(line)) {
      doc.setFont("courier", "bold"); // Use monospace font
      doc.setFontSize(16);
      doc.text(line.replace(/^##\s+/, ""), x, currY);
      doc.setFontSize(14);
      doc.setFont("courier", "normal");
      currY += lineHeight * 1.2;
      return;
    }

    // --- Split into bold/normal parts before wrapping ---
    let parts = [];
    let lastIndex = 0;
    let regex = /\*\*(.*?)\*\*/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: line.substring(lastIndex, match.index), bold: false });
      }
      parts.push({ text: match[1], bold: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push({ text: line.substring(lastIndex), bold: false });
    }

    // Build wrapped lines with bold/normal structure
    let currX = x + (isBullet ? 12 : 0);
    let lineBuffer = '';
    let bufferParts = [];

    if (isBullet) {
      doc.setFont("courier", "normal");
      // doc.text("•", x + 4, currY);
    }

    parts.forEach((part, idx) => {
      let words = part.text.split(' ');
      words.forEach((word, widx) => {
        let testLine = lineBuffer + (lineBuffer ? ' ' : '') + word;
        let testWidth = doc.getTextWidth(testLine);

        if (currX + testWidth > x + maxWidth) {
          // Print the buffer
          let printX = currX;
          bufferParts.forEach((bp, bidx) => {
            doc.setFont("courier", bp.bold ? "bold" : "normal");
            doc.text(bp.text, printX, currY, { baseline: "top" });
            printX += doc.getTextWidth(bp.text + (bidx < bufferParts.length - 1 ? ' ' : ''));
          });
          currY += lineHeight;
          if (currY + lineHeight > pageHeight - margin - 20) {
            doc.addPage();
            currY = margin + 30;
          }
          currX = x + (isBullet ? 12 : 0);
          lineBuffer = word;
          bufferParts = [{ text: word, bold: part.bold }];
        } else {
          if (lineBuffer) lineBuffer += ' ';
          lineBuffer += word;
          if (bufferParts.length && bufferParts[bufferParts.length - 1].bold === part.bold) {
            bufferParts[bufferParts.length - 1].text += (widx === 0 ? '' : ' ') + word;
          } else {
            bufferParts.push({ text: word, bold: part.bold });
          }
        }
      });
    });

    // Print any remaining buffer
    if (lineBuffer) {
      let printX = currX;
      bufferParts.forEach((bp, bidx) => {
        doc.setFont("courier", bp.bold ? "bold" : "normal");
        doc.text(bp.text, printX, currY, { baseline: "top" });
        printX += doc.getTextWidth(bp.text + (bidx < bufferParts.length - 1 ? ' ' : ''));
      });
      currY += lineHeight;
    }
  });
  return currY;
}

export function downloadFeedbackPDFs(interviewList) {
  console.log("downloadFeedbackPDFs called", interviewList);
  for (const item of interviewList) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 8;

    // Header
    doc.setFillColor("#FFFFFF");
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setTextColor("#000000");
    doc.setFont("courier", "bold"); // Use monospace font for heading
    doc.setFontSize(20);
    doc.text(`Feedback for Attempt ${item.attempt_number}`, pageWidth / 2, 25, { align: "center" });

    // Format date as MM.DD.YY
    const dateObj = new Date(item.date || Date.now());
    const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getFullYear()).slice(-2)}`;

    doc.text(
      formattedDate,
      pageWidth / 2,
      33,
      { align: "center" }
    );

    doc.setDrawColor("#E7C58A");
    doc.setLineWidth(0.5);
    doc.line(margin, 38, pageWidth - margin, 38); // top line

    // Feedback as formatted markdown
    doc.setFont("courier", "normal");
    doc.setFontSize(14);
    doc.setTextColor("#000000");
    let currY = 50;
    const maxWidth = pageWidth - margin * 2;

    currY = renderMarkdown(doc, item.feedback || '', margin, currY, maxWidth, lineHeight, pageHeight, margin);

    // Footer
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30); // bottom line
    doc.setFontSize(10);
    const footerText = "© cheveningbrew.com | All rights reserved";
    const linkText = "cheveningbrew.com";
    const linkUrl = "https://cheveningbrew.com";

    // Calculate where to place the link in the footer
    const footerY = pageHeight - 20;
    const footerX = pageWidth / 2;
    const textBefore = "© ";
    const textAfter = " | All rights reserved";
    const beforeWidth = doc.getTextWidth(textBefore);
    const linkWidth = doc.getTextWidth(linkText);

    // Draw the full footer text (without the link part)
    doc.text(textBefore, footerX - (doc.getTextWidth(footerText) / 2), footerY);
    doc.textWithLink(
      linkText,
      footerX - (doc.getTextWidth(footerText) / 2) + beforeWidth,
      footerY,
      { url: linkUrl }
    );
    doc.text(
      textAfter,
      footerX - (doc.getTextWidth(footerText) / 2) + beforeWidth + linkWidth,
      footerY
    );

    doc.save(`Attempt_${item.attempt_number}.pdf`);
  }
};
