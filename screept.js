const input = document.getElementById('input');
const contentDiv = document.getElementById('content');

// Exports SVG and puts it into the `contentDiv`
const previewSvg = mainContent => {
  $typst.svg({ mainContent }).then(svg => {
    console.log(`rendered! SvgElement { len: ${svg.length} }`);
    // append svg text
    contentDiv.innerHTML = svg;

    const svgElem = contentDiv.firstElementChild;
    const width = Number.parseFloat(svgElem.getAttribute('width'));
    const height = Number.parseFloat(svgElem.getAttribute('height'));
    const cw = document.body.clientWidth - 40;
    svgElem.setAttribute('width', cw);
    svgElem.setAttribute('height', (height * cw) / width);
  });
};

// Exports PDF and downloads it
const exportPdf = mainContent =>
  $typst.pdf({ mainContent }).then(pdfData => {
    var pdfFile = new Blob([pdfData], { type: 'application/pdf' });

    // Creates element with <a> tag
    const link = document.createElement('a');
    // Sets file content in the object URL
    link.href = URL.createObjectURL(pdfFile);
    // Sets file name
    link.target = '_blank';
    // Triggers a click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);
  });

/// Listens the 'load' event to initialize after loaded the bundle file from CDN (jsdelivr).
document.getElementById('typst').addEventListener('load', function () {
  /// Initializes the Typst compiler and renderer. Since we use "all-in-one-lite.bundle.js" instead of
  /// "all-in-one.bundle.js" we need to tell that the wasm module files can be loaded from CDN (jsdelivr).
  $typst.setCompilerInitOptions({
    getModule: () =>
      'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
  });
  $typst.setRendererInitOptions({
    getModule: () =>
      'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
  });

  /// Binds exportPdf action to the button
  document.getElementById('export').onclick = () => exportPdf(input.value);
  /// Binds previewSvg action to the textarea
  input.oninput = () => {
    previewSvg(input.value);
    input.style.height = '5px';
    input.style.height = input.scrollHeight + 'px';
  };
  /// Triggers the first preview.
  previewSvg(input.value);
});