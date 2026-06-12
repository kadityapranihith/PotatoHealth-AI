/**
 * PotatoHealth AI - Frontend Application Engine
 * Handles UI interactions, API requests, local storage caching,
 * dashboard metrics, and diagnostic logs.
 */

const BACKEND_URL = 'http://localhost:8000';

// App State
let selectedFile = null;
let diagnosticHistory = [];

// DOM Elements
const systemStatusDot = document.getElementById('status-dot');
const systemStatusText = document.getElementById('status-text');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const previewFilename = document.getElementById('preview-filename');
const removeBtn = document.getElementById('remove-btn');
const uploadPrompt = document.getElementById('upload-prompt');

const predictBtn = document.getElementById('predict-btn');
const loadingState = document.getElementById('loading-state');

const resultsPlaceholder = document.getElementById('results-placeholder');
const resultsCard = document.getElementById('results-card');
const diseaseName = document.getElementById('disease-name');
const diseaseBadge = document.getElementById('disease-badge');
const confidencePercentage = document.getElementById('confidence-percentage');
const confidenceFill = document.getElementById('confidence-fill');
const diseaseDescription = document.getElementById('disease-description');
const diseaseTreatment = document.getElementById('disease-treatment');

const kpiTotal = document.getElementById('kpi-total');
const kpiHealthy = document.getElementById('kpi-healthy');
const kpiEarly = document.getElementById('kpi-early');
const kpiLate = document.getElementById('kpi-late');

const historySearch = document.getElementById('history-search');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const historyTbody = document.getElementById('history-tbody');
const tableEmpty = document.getElementById('table-empty');
const historyTable = document.getElementById('history-table');

// Mappings for UI styling & display names
const DISEASE_MAP = {
    'Potato___healthy': {
        name: 'Healthy',
        class: 'healthy',
        description: 'The potato leaf appears healthy and free of disease symptoms. Continue monitoring and regular crop scouting.',
        treatment: 'No treatment required. Maintain standard watering and fertilization schedules.'
    },
    'Potato___Early_blight': {
        name: 'Early Blight',
        class: 'early-blight',
        description: 'Fungal disease caused by Alternaria solani. Characterized by dark spots with concentric rings ("target" pattern) on older leaves.',
        treatment: 'Remove and destroy infected leaves. Apply copper-based fungicides or appropriate bio-fungicides. Enhance air circulation between plants.'
    },
    'Potato___Late_blight': {
        name: 'Late Blight',
        class: 'late-blight',
        description: 'Severe disease caused by Phytophthora infestans. Displays dark, water-soaked spots on leaves that turn black in humid weather with white fuzzy growth beneath.',
        treatment: 'Foliage must be destroyed or treated with systematic fungicides immediately. Highly contagious. Keep plants dry and improve drainage.'
    }
};

/* --- Initialize Application --- */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Backend Connection Check
    checkBackendConnection();
    setInterval(checkBackendConnection, 10000); // Check status every 10 seconds

    // 2. Load Diagnostic History from Cache
    loadHistory();

    // 3. Register Event Listeners
    setupUploadEventListeners();
    setupPredictEventListeners();
    setupHistoryEventListeners();
});

/* --- Backend Connection Checker --- */
async function checkBackendConnection() {
    try {
        systemStatusDot.className = 'status-indicator-dot connecting';
        systemStatusText.innerText = 'Connecting...';
        
        const response = await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
        if (response.ok) {
            systemStatusDot.className = 'status-indicator-dot online';
            systemStatusText.innerText = 'API Connected';
        } else {
            throw new Error('Server returned error status');
        }
    } catch (error) {
        systemStatusDot.className = 'status-indicator-dot offline';
        systemStatusText.innerText = 'API Offline';
    }
}

/* --- Drag-and-Drop & File Pickers Logic --- */
function setupUploadEventListeners() {
    // Browse button triggers hidden input
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // Dropzone acts as click selector too
    dropZone.addEventListener('click', () => {
        if (!selectedFile) {
            fileInput.click();
        }
    });

    // File input selection change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // Remove Preview Click
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUploadArea();
    });
}

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('Invalid file format. Please upload an image file (JPG, JPEG, PNG).');
        return;
    }
    
    selectedFile = file;
    previewFilename.innerText = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        uploadPrompt.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        predictBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

function resetUploadArea() {
    selectedFile = null;
    fileInput.value = '';
    imagePreview.src = '';
    previewContainer.classList.add('hidden');
    uploadPrompt.classList.remove('hidden');
    predictBtn.disabled = true;
}

/* --- Prediction Request & Response Processing --- */
function setupPredictEventListeners() {
    predictBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // Enter loading state
        loadingState.classList.remove('hidden');
        predictBtn.disabled = true;
        removeBtn.classList.add('hidden'); // Disable removal during scan

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${BACKEND_URL}/predict`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Prediction API failure');
            }

            const data = await response.json();
            displayPredictionResults(data);
            
            // Sync database truth directly
            loadHistory();
            
        } catch (error) {
            console.error('Scan Error:', error);
            alert('An error occurred during diagnostic classification. Please ensure the API is running at localhost:8000 and try again.');
        } finally {
            // Exit loading state
            loadingState.classList.add('hidden');
            predictBtn.disabled = false;
            removeBtn.classList.remove('hidden');
        }
    });
}

function displayPredictionResults(data) {
    const rawDisease = data.disease;
    const confidence = data.confidence || 0.0;
    
    // Resolve mappings
    const info = DISEASE_MAP[rawDisease] || {
        name: rawDisease.replace(/Potato___/g, '').replace(/_/g, ' '),
        class: 'early-blight',
        description: data.description || 'No pathology details registered.',
        treatment: data.treatment || 'No recommended actions registered.'
    };

    // Update UI elements
    diseaseName.innerText = info.name;
    diseaseBadge.className = `status-badge ${info.class}`;
    diseaseBadge.innerText = info.name;
    confidencePercentage.innerText = `${confidence.toFixed(1)}%`;
    
    // Style fill bar and trigger transition
    confidenceFill.className = `confidence-bar-fill ${info.class}`;
    resultsCard.setAttribute('data-disease-type', info.class);
    
    // Clear and animate fill
    confidenceFill.style.width = '0%';
    
    // Update texts
    diseaseDescription.innerText = info.description;
    diseaseTreatment.innerText = info.treatment;

    // Show Results Card
    resultsPlaceholder.classList.add('hidden');
    resultsCard.classList.remove('hidden');

    // Smooth transition trigger
    setTimeout(() => {
        confidenceFill.style.width = `${confidence}%`;
    }, 50);
}

/* --- History Logs & Dashboard Metrics (Cached Locally) --- */
function setupHistoryEventListeners() {
    // Live search filters table
    historySearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        renderHistoryTable(query);
    });

    // Clear History Button Action
    clearHistoryBtn.addEventListener('click', async () => {
        if (diagnosticHistory.length === 0) return;
        
        const confirmClear = confirm('Are you sure you want to permanently clear all database diagnostic history logs and dashboard counters?');
        if (confirmClear) {
            // Try to notify backend
            try {
                const response = await fetch(`${BACKEND_URL}/history`, { method: 'DELETE' });
                if (response.ok) {
                    diagnosticHistory = [];
                    updateDashboard();
                    renderHistoryTable();
                    
                    // If active results are shown, hide them
                    resultsCard.classList.add('hidden');
                    resultsPlaceholder.classList.remove('hidden');
                } else {
                    alert('Backend does not support clearing history at this endpoint.');
                }
            } catch (err) {
                console.error('Error calling clear history endpoint:', err);
                alert('Could not contact the server to clear history.');
            }
        }
    });
}

function formatTimestamp(dbTimestamp) {
    if (!dbTimestamp) return new Date().toLocaleString();
    try {
        // SQLite CURRENT_TIMESTAMP returns UTC "YYYY-MM-DD HH:MM:SS"
        // Replace space with 'T' and add 'Z' to parse as UTC ISO
        const isoString = dbTimestamp.replace(' ', 'T') + 'Z';
        const date = new Date(isoString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleString();
        }
    } catch (e) {
        console.error('Timestamp parsing error:', e);
    }
    return dbTimestamp; // Return raw string if formatting fails
}

function loadHistory() {
    // Try to load from server database
    fetch(`${BACKEND_URL}/history`)
        .then(async (response) => {
            if (response.ok) {
                const data = await response.json();
                
                // Map database columns to UI presentation model
                diagnosticHistory = data.map(item => {
                    const info = DISEASE_MAP[item.disease] || { 
                        name: item.disease.replace(/Potato___/g, '').replace(/_/g, ' ') 
                    };
                    return {
                        id: item.id,
                        filename: item.filename,
                        prediction: info.name,
                        confidence: item.confidence,
                        timestamp: formatTimestamp(item.timestamp)
                    };
                });
            } else {
                throw new Error('History database response not OK');
            }
        })
        .catch((err) => {
            console.error('Backend history unavailable:', err);
            diagnosticHistory = [];
        })
        .finally(() => {
            updateDashboard();
            renderHistoryTable();
        });
}

function updateDashboard() {
    const total = diagnosticHistory.length;
    let healthyCount = 0;
    let earlyBlightCount = 0;
    let lateBlightCount = 0;

    diagnosticHistory.forEach(item => {
        const pred = item.prediction.toLowerCase();
        if (pred.includes('healthy')) healthyCount++;
        else if (pred.includes('early')) earlyBlightCount++;
        else if (pred.includes('late')) lateBlightCount++;
    });

    // Update KPI UI counters
    kpiTotal.innerText = total;
    kpiHealthy.innerText = healthyCount;
    kpiEarly.innerText = earlyBlightCount;
    kpiLate.innerText = lateBlightCount;
}

function renderHistoryTable(filterQuery = '') {
    historyTbody.innerHTML = '';
    
    const filtered = diagnosticHistory.filter(item => {
        const matchesName = item.filename.toLowerCase().includes(filterQuery);
        const matchesPrediction = item.prediction.toLowerCase().includes(filterQuery);
        return matchesName || matchesPrediction;
    });

    if (filtered.length === 0) {
        historyTable.classList.add('hidden');
        tableEmpty.classList.remove('hidden');
        return;
    }

    historyTable.classList.remove('hidden');
    tableEmpty.classList.add('hidden');

    filtered.forEach(item => {
        const row = document.createElement('tr');
        
        // Match badges class
        let badgeClass = 'healthy';
        if (item.prediction.toLowerCase().includes('early')) badgeClass = 'early-blight';
        else if (item.prediction.toLowerCase().includes('late')) badgeClass = 'late-blight';

        row.innerHTML = `
            <td>${item.filename}</td>
            <td><span class="row-disease-badge ${badgeClass}">${item.prediction}</span></td>
            <td class="row-confidence">${item.confidence.toFixed(1)}%</td>
            <td class="row-timestamp">${item.timestamp}</td>
        `;
        
        historyTbody.appendChild(row);
    });
}
