// Global runtime string storage to keep track of un-parsed AI response for clipboard use
let rawLatestOutputText = "";

window.addEventListener("DOMContentLoaded", () => {
    fetchLiveDatabaseMetrics();
    setupSidebarNavigation();
});

function setupSidebarNavigation() {
    const menuItems = document.querySelectorAll(".menu-item");
    const tabViews = document.querySelectorAll(".tab-view");

    menuItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            menuItems.forEach(mi => mi.classList.remove("active"));
            item.classList.add("active");
            tabViews.forEach(view => view.classList.add("hidden"));
            
            const targetId = item.getAttribute("data-target");
            document.getElementById(targetId).classList.remove("hidden");
        });
    });
}

// Function 2: Setting Updates & Meaning Mapping Panel
function updateModelDisplay() {
    const selector = document.getElementById("modelSelector").value;
    const sliderVal = document.getElementById("tempSlider").value;
    
    // Update labels in Overview section and Settings section simultaneously
    document.getElementById("currentModelBadge").innerText = selector;
    document.getElementById("infoModelName").innerText = selector;
    
    const interpretationElement = document.getElementById("infoTempMeaning");
    const rawNumericValue = (sliderVal / 100).toFixed(1);
    
    if (rawNumericValue <= 0.3) {
        interpretationElement.innerText = `Strict Edge Case Logic (${rawNumericValue})`;
    } else if (rawNumericValue <= 0.7) {
        interpretationElement.innerText = `Balanced Functional Flow (${rawNumericValue})`;
    } else {
        interpretationElement.innerText = `Exploratory Creative QA (${rawNumericValue})`;
    }
}

// Function 3: Text Markdown Regex Content Segment Parser 
function parseAndColorCodeOutput(rawText) {
    // Store original markdown safe copy before rendering visual nodes
    rawLatestOutputText = rawText;
    const outputContainer = document.getElementById("resultsDisplay");
    outputContainer.innerHTML = ""; // Clear existing text

    // Check text for major segment boundaries or keep standard structure if missing
    const sections = [
        { key: "Unit Tests", title: "🧪 Unit Tests Matrix", className: "unit-test-card" },
        { key: "Integration Tests", title: "🔗 Integration Test Paths", className: "integration-test-card" },
        { key: "Edge Cases", title: "⚠️ Crucial Border Edge Cases", className: "edge-case-card" }
    ];

    let segmentsFound = false;

    sections.forEach((sec, idx) => {
        if (rawText.toLowerCase().includes(sec.key.toLowerCase())) {
            segmentsFound = true;
            
            // Slice text logic segment blocks out cleanly using simple splits
            let part = "";
            const parts = rawText.split(new RegExp(`#*\\s*${sec.key}`, "i"));
            if (parts.length > 1) {
                // Take content up until the next section keyword
                part = parts[1];
                for (let otherSec of sections) {
                    if (otherSec.key !== sec.key && part.toLowerCase().includes(otherSec.key.toLowerCase())) {
                        part = part.split(new RegExp(`#*\\s*${otherSec.key}`, "i"))[0];
                    }
                }
            }

            if (part.trim()) {
                const cardNode = document.createElement("div");
                cardNode.className = `parsed-section ${sec.className}`;
                cardNode.innerHTML = `
                    <h4>${sec.title}</h4>
                    <p>${part.replace(/[\#\*]/g, "").trim()}</p>
                `;
                outputContainer.appendChild(cardNode);
            }
        }
    });

    // Fallback: If AI returns response text without matching explicit block titles
    if (!segmentsFound) {
        outputContainer.innerText = rawText;
    }

    // Expose hidden copy button instantly upon compiling content
    document.getElementById("copyBtn").classList.remove("hidden");
}

// Function 4: Native Async Clipboard Copy Module
async function copyOutputToClipboard() {
    const copyBtn = document.getElementById("copyBtn");
    if (!rawLatestOutputText) return;

    try {
        await navigator.clipboard.writeText(rawLatestOutputText);
        copyBtn.innerText = "✅ Copied!";
        setTimeout(() => {
            copyBtn.innerText = "📋 Copy Output";
        }, 2000);
    } catch (err) {
        console.error("Clipboard permission denied:", err);
    }
}

// Function 5: Sync Rows from Database Registry
async function fetchLiveDatabaseMetrics() {
    const tableBody = document.getElementById("liveTableBody");
    const sessionCounter = document.getElementById("totalSessionsCount");
    
    try {
        const response = await fetch("http://127.0.0.1:8000/history");
        const result = await response.json();
        
        if (response.ok && result.status === "success") {
            const records = result.history;
            sessionCounter.innerText = records.length;
            tableBody.innerHTML = "";
            
            if (records.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="placeholder-text" style="text-align:center; padding: 20px;">No records found. Hit the Generator tab to create your first asset row!</td></tr>`;
                return;
            }
            
            records.forEach((record) => {
                const row = document.createElement("tr");
                row.style.cursor = "pointer";
                
                const previewText = record.requirements.length > 70 
                    ? record.requirements.substring(0, 70) + "..." 
                    : record.requirements;

                row.innerHTML = `
                    <td><strong>#00${record.id}</strong></td>
                    <td>${previewText}</td>
                    <td><span class="src-tag jira">Gemini Flash</span></td>
                    <td><span class="status-pill completed">Stored in DB</span></td>
                `;
                
                row.onclick = () => {
                    document.querySelectorAll(".tab-view").forEach(v => v.classList.add("hidden"));
                    document.querySelectorAll(".menu-item").forEach(mi => mi.classList.remove("active"));
                    
                    document.getElementById("generator-section").classList.remove("hidden");
                    document.querySelector('[data-target="generator-section"]').classList.add("active");
                    
                    document.getElementById("requirementsInput").value = record.requirements;
                    parseAndColorCodeOutput(record.generated_test_cases);
                };
                
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Database sync down state error:", error);
    }
}

// Function 6: Trigger API Generation Flow With Safety Locks
async function triggerGeneration() {
    const inputField = document.getElementById("requirementsInput");
    const resultsBox = document.getElementById("resultsDisplay");
    const loadingIndicator = document.getElementById("loading");
    const generateBtn = document.getElementById("generateBtn");
    const copyBtn = document.getElementById("copyBtn");
    
    const userText = inputField.value.trim();

    if (!userText) {
        alert("Please enter some product requirements first!");
        return;
    }

    // Lock UI interactions & activate spinner loader animation frames
    generateBtn.disabled = true;
    copyBtn.classList.add("hidden");
    loadingIndicator.classList.remove("hidden");
    resultsBox.classList.add("placeholder-text");
    resultsBox.innerText = ""; // Wipe display view clear for layout space

    try {
        const response = await fetch("http://127.0.0.1:8000/generate-tests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: userText })
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
            resultsBox.classList.remove("placeholder-text");
            // Direct parsed content payload out to colored blocks!
            parseAndColorCodeOutput(result.data);
            fetchLiveDatabaseMetrics(); 
        } else {
            resultsBox.innerText = "⚠️ Error: " + (result.detail || "Something went wrong.");
        }
    } catch (error) {
        resultsBox.innerText = "❌ Connection failed. Ensure your FastAPI server is online!";
        console.error(error);
    } finally {
        // Unlock button systems
        loadingIndicator.classList.add("hidden");
        generateBtn.disabled = false;
    }
}