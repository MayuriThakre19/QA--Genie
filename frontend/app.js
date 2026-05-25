window.addEventListener("DOMContentLoaded", () => {
    fetchLiveDatabaseMetrics();
    setupSidebarNavigation();
});

// Function 1: Handle Tab Swapping Single-Page App Logic
function setupSidebarNavigation() {
    const menuItems = document.querySelectorAll(".menu-item");
    const tabViews = document.querySelectorAll(".tab-view");

    menuItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // 1. Clear active styles from all menu items
            menuItems.forEach(mi => mi.classList.remove("active"));
            // 2. Add active highlight line to the clicked item
            item.classList.add("active");

            // 3. Hide all tab view panels
            tabViews.forEach(view => view.classList.add("hidden"));
            
            // 4. Show the selected targeted view panel
            const targetId = item.getAttribute("data-target");
            document.getElementById(targetId).classList.remove("hidden");
        });
    });
}

// Function 2: Interactive Setting Component handler
function updateModelDisplay() {
    const selector = document.getElementById("modelSelector");
    const badge = document.getElementById("currentModelBadge");
    badge.innerText = selector.value;
}

// Function 3: Fetch Data Rows directly from your SQLite instances
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
                
                // Advanced UX Flow: When clicking a row, move to the generator tab and display info!
                row.onclick = () => {
                    // Navigate Tab Panels View programmatically
                    document.querySelectorAll(".tab-view").forEach(v => v.classList.add("hidden"));
                    document.querySelectorAll(".menu-item").forEach(mi => mi.classList.remove("active"));
                    
                    document.getElementById("generator-section").classList.remove("hidden");
                    document.querySelector('[data-target="generator-section"]').classList.add("active");
                    
                    // Populate data targets smoothly
                    document.getElementById("requirementsInput").value = record.requirements;
                    const resultsDisplay = document.getElementById("resultsDisplay");
                    resultsDisplay.classList.remove("placeholder-text");
                    resultsDisplay.innerText = record.generated_test_cases;
                };
                
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Database sync down state error:", error);
    }
}

// Function 4: Core Generation execution pipeline routing
async function triggerGeneration() {
    const inputField = document.getElementById("requirementsInput");
    const resultsBox = document.getElementById("resultsDisplay");
    const loadingIndicator = document.getElementById("loading");
    const userText = inputField.value.trim();

    if (!userText) {
        alert("Please enter some product requirements first!");
        return;
    }

    loadingIndicator.classList.remove("hidden");
    resultsBox.classList.remove("placeholder-text");
    resultsBox.innerText = "Analyzing requirements via Gemini AI Engine core...";

    try {
        const response = await fetch("http://127.0.0.1:8000/generate-tests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: userText })
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
            resultsBox.innerText = result.data;
            fetchLiveDatabaseMetrics(); // Pull numbers again
        } else {
            resultsBox.innerText = "⚠️ Error: " + (result.detail || "Something went wrong.");
        }
    } catch (error) {
        resultsBox.innerText = "❌ Connection failed. Ensure your FastAPI server is online!";
        console.error(error);
    } finally {
        loadingIndicator.classList.add("hidden");
    }
}