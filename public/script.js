// --- Navigation ---
function showTool(tool) {
  document.querySelectorAll('.tool').forEach(s => s.classList.remove('active'));
  document.getElementById(tool).classList.add('active');
}

// --- PDF LIB & MAMMOTH setup ---
const { PDFDocument, rgb, StandardFonts } = PDFLib;



 



// --- PDF/Doc Converter ---
const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");
const status = document.getElementById("status");

convertBtn.addEventListener("click", async () => {
  const files = fileInput.files;
  if (!files.length) return alert("Please select files");
  status.textContent = "Converting...";

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const ext = file.name.split('.').pop().toLowerCase();

    if (["png","jpg","jpeg"].includes(ext)) {
      let image = (ext==="png") ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image,{x:0,y:0,width:image.width,height:image.height});
    }
    else if (ext==="txt") {
      const text = new TextDecoder().decode(bytes);
      const page = pdfDoc.addPage();
      page.drawText(text,{x:50,y:page.getHeight()-50,size:12,font,color:rgb(0,0,0),maxWidth:500});
    }
    else if (ext==="docx") {
      const result = await mammoth.extractRawText({ arrayBuffer: bytes });
      const page = pdfDoc.addPage();
      page.drawText(result.value,{x:50,y:page.getHeight()-50,size:12,font,color:rgb(0,0,0),maxWidth:500});
    }
    else alert("Unsupported file: "+file.name);
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes],{type:"application/pdf"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "converted.pdf";
  a.click();

  status.textContent = "Done! Your PDF is ready.";
});
