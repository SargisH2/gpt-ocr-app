async function uploadFile(event) {
    event.preventDefault();
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);

    displayStatus('Processing single file...');
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
    
        const result = await response.json();
        const markdownResult = createDownloadButtons(result, 'result.json');
        renderMarkdown(markdownResult);
    } catch (error) {
        displayStatus('An error occurred while processing the file.', true);
    }
}

async function uploadMultipleFiles(event) {
    event.preventDefault();
    const form = document.getElementById('uploadMultipleForm');
    const formData = new FormData(form);

    displayStatus('Processing multiple files...');
    
    try {
        const response = await fetch('/upload-multiple', {
            method: 'POST',
            body: formData
        });
    
        const result = await response.json();
        const markdownResult = createDownloadButtons(result, 'results.json');
        renderMarkdown(markdownResult);
    } catch (error) {
        displayStatus('An error occurred while processing the files.', true);
    }
}

function createDownloadButtons(data, filename) {
    if (!Array.isArray(data)) {
        data = [data];
    }
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results

    const buttons = [
        { text: 'Download JSON', class: 'btn-success', handler: () => downloadFile(data, filename, 'application/json') },
        { text: 'Download ZIP', class: 'btn-primary', handler: () => downloadZip(data) },
        { text: 'Download Markdown', class: 'btn-info', handler: () => downloadFile(data.map(item => item.analyzeResult.content), 'results.md', 'text/markdown') }
    ];

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.innerText = btn.text;
        button.classList.add('btn', btn.class);
        button.style.marginTop = '10px';
        button.onclick = btn.handler;
        resultDiv.appendChild(button);
    });

    return data.map(item => item.analyzeResult.content).join('\n');
}

function renderMarkdown(markdown) {
    const md = window.markdownit({ html: true, linkify: true, typographer: true });
    const htmlResult = md.render(markdown);
    document.getElementById('result_markdown').innerHTML = htmlResult;
    displayStatus('Processing complete.');
}

function displayStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function downloadZip(data) {
    const response = await fetch('/create-zip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
