import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadFeedbackPDFs = async (interviewList) => {
  for (const item of interviewList) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    const content = document.createElement("div");
    content.style.position = "absolute";
    content.style.top = "-9999px";
    content.style.width = "800px";
    content.style.color = "white";
    content.style.fontFamily = "Arial, sans-serif";
    content.style.fontSize = "16px";
    content.style.lineHeight = "1.8";
    content.style.padding = "0 30px";
    content.innerHTML = item.feedback
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/## (.*?)(\n|$)/g, "<h2 style='font-size:20px;margin-top:20px;'>$1</h2>")
      .replace(/\n/g, "<br />");

    document.body.appendChild(content);

    const canvas = await html2canvas(content, {
      scale: 2,
      backgroundColor: null,
      windowWidth: 800,
    });

    const contentImage = canvas.toDataURL("image/png");
    const availableHeight = pageHeight - 85; // Space between header and footer
    const sliceHeight = (canvas.width * availableHeight) / pageWidth;
    const overlap = 15; // <- this is the new part
    const totalPages = Math.ceil(canvas.height / (sliceHeight - overlap));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) doc.addPage();

      doc.setFillColor("#6D2493");
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Header
      doc.setTextColor("#FFFFFF");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.text(`Attempt ${item.attempt_number}`, pageWidth / 2, 25, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("Helvetica", "normal");
      doc.text(
        new Date(item.date || Date.now()).toLocaleDateString(),
        pageWidth / 2,
        33,
        { align: "center" }
      );

      doc.setDrawColor("#E7C58A");
      doc.setLineWidth(0.5);
      doc.line(margin, 38, pageWidth - margin, 38); // top line

      // Slice feedback content
      const pageCanvas = document.createElement("canvas");
      const pageCtx = pageCanvas.getContext("2d");
      pageCanvas.width = canvas.width;

      const sliceStartY = page * (sliceHeight - overlap);
      const sliceEndY = Math.min(sliceStartY + sliceHeight, canvas.height);
      const actualSliceHeight = sliceEndY - sliceStartY;

      pageCanvas.height = actualSliceHeight;

      pageCtx.drawImage(
        canvas,
        0,
        sliceStartY,
        canvas.width,
        actualSliceHeight,
        0,
        0,
        canvas.width,
        actualSliceHeight
      );

      const imgData = pageCanvas.toDataURL("image/png");
      const imgHeight = (pageCanvas.height * pageWidth) / canvas.width;
      doc.addImage(imgData, "PNG", 0, 45, pageWidth, imgHeight);

      // Footer
      doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30); // bottom line
      doc.setFontSize(10);
      doc.text("© cheveningbrew.com | All rights reserved", pageWidth / 2, pageHeight - 20, {
        align: "center",
      });
    }

    doc.save(`Attempt_${item.attempt_number}.pdf`);
    document.body.removeChild(content);
  }
};
