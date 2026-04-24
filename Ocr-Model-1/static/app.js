document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const loadingEl = document.getElementById('loading');
    const resultsEl = document.getElementById('results');
    const errorEl = document.getElementById('error-message');
    const imgPreview = document.getElementById('image-preview');
    
    // Array to store all extracted data during this session
    let allInvoicesData = [];

    // Drag and Drop Handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];
        
        if (!file.type.startsWith('image/')) {
            showError('Please upload an image file (JPEG, PNG, etc).');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            imgPreview.style.display = 'block';
        }
        reader.readAsDataURL(file);

        uploadFile(file);
    }

    async function uploadFile(file) {
        errorEl.classList.add('hidden');
        loadingEl.classList.remove('hidden');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/extract', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Network response was not ok');
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                allInvoicesData.push(data); // Add to session memory
                appendResults(data, allInvoicesData.length - 1);
                updateSummary();
                loadingEl.classList.add('hidden');
                resultsEl.classList.remove('hidden');
            } else {
                throw new Error(data.message || 'Error processing invoice.');
            }

        } catch (error) {
            console.error('Error:', error);
            showError('Error processing invoice: ' + error.message);
            loadingEl.classList.add('hidden');
        }
    }

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }

    function formatCurrency(val) {
        if (val === null || val === undefined) return '-';
        return '$' + parseFloat(val).toFixed(2);
    }

    function updateSummary() {
        // Calculate cumulative totals across all stored invoices
        let totalSum = 0;
        let invoiceCount = allInvoicesData.length;
        
        allInvoicesData.forEach(invoice => {
            if (invoice.result && invoice.result.total && invoice.result.total.value) {
                totalSum += invoice.result.total.value;
            }
        });

        // Use the summary cards for Cumulative totals
        document.querySelector('.summary-cards').innerHTML = `
            <div class="card">
                <h3>Total Invoices Processed</h3>
                <p class="value">${invoiceCount}</p>
            </div>
            <div class="card">
                <h3>Cumulative Total</h3>
                <p class="value amount">${formatCurrency(totalSum)}</p>
            </div>
        `;
    }

    function appendResults(data, invoiceIndex) {
        const result = data.result;
        const tbody = document.getElementById('line-items-body');
        
        const vendorName = result.vendor?.value || 'Unknown';
        const invoiceNum = result.invoice_number?.value || 'Unknown';

        // Clear the "No line items" message if it exists
        if (tbody.innerHTML.includes("No line items found.")) {
            tbody.innerHTML = '';
        }

        if (!result.line_items || result.line_items.length === 0) {
            return;
        }

        result.line_items.forEach((item, itemIndex) => {
            const tr = document.createElement('tr');
            
            let confClass = 'low';
            if (item.confidence > 0.8) confClass = 'high';
            else if (item.confidence > 0.5) confClass = 'medium';

            const formattedConf = (item.confidence * 100).toFixed(0) + '%';

            tr.innerHTML = `
                <td>${vendorName}</td>
                <td>${invoiceNum}</td>
                <td><input type="text" data-invoice="${invoiceIndex}" data-idx="${itemIndex}" data-field="item_name" value="${item.item_name || ''}"></td>
                <td><input type="number" step="0.01" data-invoice="${invoiceIndex}" data-idx="${itemIndex}" data-field="quantity" value="${item.quantity || ''}"></td>
                <td><input type="text" data-invoice="${invoiceIndex}" data-idx="${itemIndex}" data-field="unit" value="${item.unit || ''}"></td>
                <td><input type="number" step="0.01" data-invoice="${invoiceIndex}" data-idx="${itemIndex}" data-field="unit_price" value="${item.unit_price || ''}"></td>
                <td><input type="number" step="0.01" data-invoice="${invoiceIndex}" data-idx="${itemIndex}" data-field="line_total" value="${item.line_total || ''}"></td>
                <td class="center"><span class="badge ${confClass}">${formattedConf}</span></td>
            `;
            tbody.appendChild(tr);
            
            // Re-bind input listeners
            const inputs = tr.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    const invIdx = e.target.dataset.invoice;
                    const itmIdx = e.target.dataset.idx;
                    const field = e.target.dataset.field;
                    allInvoicesData[invIdx].result.line_items[itmIdx][field] = e.target.value;
                });
            });
        });
    }

    // CSV Export functionality (All Invoices)
    document.getElementById('export-csv-btn').addEventListener('click', () => {
        if (allInvoicesData.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Headers
        csvContent += "Vendor,Date,Invoice Number,Item Name,Quantity,Unit,Unit Price,Line Total,Total Invoice Amount,Confidence\n";

        // Rows for all invoices
        allInvoicesData.forEach(invoice => {
            const result = invoice.result;
            if (result && result.line_items) {
                const vendor = `"${(result.vendor?.value || '').toString().replace(/"/g, '""')}"`;
                const date = result.date?.value || '';
                const invNum = `"${(result.invoice_number?.value || '').toString().replace(/"/g, '""')}"`;
                const totalAmt = result.total?.value || '';

                result.line_items.forEach(item => {
                    const name = `"${(item.item_name || '').toString().replace(/"/g, '""')}"`;
                    const qty = item.quantity || '';
                    const unit = item.unit || '';
                    const price = item.unit_price || '';
                    const total = item.line_total || '';
                    const conf = item.confidence || '';
                    
                    csvContent += `${vendor},${date},${invNum},${name},${qty},${unit},${price},${total},${totalAmt},${conf}\n`;
                });
            }
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `all_invoices_data_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link); 
    });
});
