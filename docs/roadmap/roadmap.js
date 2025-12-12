// SOLVET Roadmap Tracker - Main JavaScript

let roadmapData = null;
let currentSection = null;
let selectedNodeId = null;
let noteEditId = null;

// Initialize Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
    }
});

// Load roadmap data
async function loadRoadmapData() {
    try {
        const response = await fetch('roadmap-data.json');
        roadmapData = await response.json();
        
        // Try to load from localStorage if available
        const savedData = localStorage.getItem('roadmap-data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Merge with file data, prioritizing localStorage
                roadmapData = { ...roadmapData, ...parsed };
            } catch (e) {
                console.warn('Could not parse saved data from localStorage');
            }
        }
        
        initializeApp();
    } catch (error) {
        console.error('Error loading roadmap data:', error);
        alert('Error loading roadmap data. Please ensure roadmap-data.json exists.');
    }
}

// Initialize the application
function initializeApp() {
    buildSectionNavigation();
    populateTagFilter();
    renderGraph('asset-creation'); // Start with first section
    setupEventListeners();
}

// Build section navigation sidebar
function buildSectionNavigation() {
    const nav = document.getElementById('section-nav');
    nav.innerHTML = '';
    
    const sections = Object.keys(roadmapData.sections);
    
    sections.forEach((sectionKey, index) => {
        const section = roadmapData.sections[sectionKey];
        const nodes = Object.values(section.nodes);
        
        // Calculate progress
        const completed = nodes.filter(n => n.status === 'completed').length;
        const total = nodes.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;
        
        const li = document.createElement('li');
        li.className = 'section-nav-item';
        
        const button = document.createElement('button');
        button.className = 'section-nav-button';
        if (index === 0) {
            button.classList.add('active');
            currentSection = sectionKey;
        }
        button.textContent = section.name;
        button.onclick = () => {
            document.querySelectorAll('.section-nav-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentSection = sectionKey;
            renderGraph(sectionKey);
        };
        
        const progressDiv = document.createElement('div');
        progressDiv.className = 'section-progress';
        progressDiv.innerHTML = `
            <span>${completed}/${total} completed</span>
            <span>${Math.round(progress)}%</span>
        `;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = `${progress}%`;
        progressBar.appendChild(progressFill);
        
        li.appendChild(button);
        li.appendChild(progressDiv);
        li.appendChild(progressBar);
        nav.appendChild(li);
    });
}

// Populate tag filter dropdown
function populateTagFilter() {
    const filter = document.getElementById('tag-filter');
    const tags = roadmapData.tags || [];
    
    tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        filter.appendChild(option);
    });
}

// Generate mermaid graph definition with status styling
function generateMermaidGraph(sectionKey) {
    const section = roadmapData.sections[sectionKey];
    if (!section) return '';
    
    // Get the original mermaid structure from README.md
    // We'll build it dynamically based on the section
    let graph = 'graph LR\n';
    
    // Add nodes with status-based classes
    const nodes = Object.values(section.nodes);
    nodes.forEach(node => {
        const label = node.label.replace(/<br\/>/g, ' ');
        const nodeType = getNodeType(node.id);
        graph += `    ${node.id}${nodeType}${label}]\n`;
    });
    
    // Add edges (simplified - we'll use the full graph from README)
    // For now, we'll render the full graph and filter visually
    
    // Add status-based classDef
    graph += '\n    %% Status Styling\n';
    graph += '    classDef status-planned fill:#999999,stroke:#333,stroke-width:2px,color:#fff\n';
    graph += '    classDef status-in-progress fill:#f0ff00,stroke:#333,stroke-width:2px,color:#000\n';
    graph += '    classDef status-completed fill:#27AE60,stroke:#333,stroke-width:2px,color:#fff\n';
    graph += '    classDef status-blocked fill:#E74C3C,stroke:#333,stroke-width:2px,color:#fff\n';
    
    // Apply status classes
    nodes.forEach(node => {
        graph += `    class ${node.id} status-${node.status}\n`;
    });
    
    return graph;
}

// Get node type for mermaid syntax
function getNodeType(nodeId) {
    // Based on original graph structure
    if (nodeId === 'F') return '{';
    if (nodeId === 'G' || nodeId === 'H') return '((';
    return '[';
}

// Render the full graph (all sections) with status indicators
function renderGraph(sectionKey) {
    const graphContainer = document.getElementById('roadmap-graph');
    
    // Use the full graph from README.md
    const fullGraph = `graph LR
    subgraph "1. Asset Creation"
        A[Blender 4.5+<br/>Asset Creation]
        B[SOLVET Asset Management Add-on<br/>Internal Export Tool]
        I1[Local Folders<br/>& Files]
        I2[Other Sources...]
    end
    
    subgraph "2. Asset Management"
        D[CO-AUG Dashboard<br/>Asset Editing & Creation]
        C[Product Structure<br/>& Metadata]
    end
    
    subgraph "3. Storage"
        E1[no3d-tools-library<br/>Blender Asset Library]
        E2[no3d-prints-library<br/>3D Printable Files]
        E3[no3d-notes-library<br/>Educational Content<br/>Project Documentation]
        E4[no3d-cod3-library<br/>Vibe Coding Projects]
    end
    
    subgraph "4. Automated Asset Publishing"
        F{Automated Publishing<br/>via GitHub Actions}
        G((Website<br/>Patreon<br/>Gumroad<br/>Shopify))
    end
    
    subgraph "5. Asset Selling & Delivery"
        O1[Blender Assets]
        O2[3D Printable Files]
        O3[Educational Content]
        O4[Coding Projects]
        H((Happy no3d member))
    end

    A -->|Creates Assets| B
    B -->|Exports| D
    I1 -->|Imports| D
    I2 -->|Imports| D
    D -->|Validates, Structures,<br/>Manages & Edits| C
    C -->|Stored in| E1
    C -->|Stored in| E2
    C -->|Stored in| E3
    C -->|Stored in| E4
    E1 --> F
    E2 --> F
    E3 --> F
    E4 --> F
    F --> G
    G -->|Polar| O1
    G -->|Thangs? tbd| O2
    G -->|tbd| O3
    G -->|tbd| O4
    O1 --> H
    O2 --> H
    O3 --> H
    O4 --> H

    %% Original Styling
    classDef blender fill:#EA7600,stroke:#333,stroke-width:2px,color:#fff
    classDef addon fill:#FF6B6B,stroke:#333,stroke-width:2px,color:#fff
    classDef input fill:#E67E22,stroke:#333,stroke-width:2px,color:#fff
    classDef metadata fill:#9B59B6,stroke:#333,stroke-width:2px,color:#fff
    classDef dashboard fill:#2E86AB,stroke:#333,stroke-width:2px,color:#fff
    classDef repo fill:#333,stroke:#666,stroke-width:2px,color:#fff
    classDef automation fill:#F0FF00,stroke:#333,stroke-width:2px,color:#000
    classDef platform fill:#F0FF00,stroke:#333,stroke-width:2px,color:#000
    classDef output fill:#3498DB,stroke:#333,stroke-width:2px,color:#fff
    classDef user fill:#27AE60,stroke:#333,stroke-width:2px,color:#fff

    %% Status-based styling (overrides original)
    classDef status-planned fill:#999999,stroke:#333,stroke-width:3px,color:#fff
    classDef status-in-progress fill:#f0ff00,stroke:#333,stroke-width:3px,color:#000
    classDef status-completed fill:#27AE60,stroke:#333,stroke-width:3px,color:#fff
    classDef status-blocked fill:#E74C3C,stroke:#333,stroke-width:3px,color:#fff

    class A blender
    class B addon
    class I1,I2 input
    class C metadata
    class D dashboard
    class E1,E2,E3,E4 repo
    class F automation
    class G platform
    class O1,O2,O3,O4 output
    class H user`;

    // Add status classes based on roadmap data
    let statusClasses = '\n    %% Status Classes\n';
    Object.keys(roadmapData.sections).forEach(sectionKey => {
        const section = roadmapData.sections[sectionKey];
        Object.values(section.nodes).forEach(node => {
            statusClasses += `    class ${node.id} status-${node.status}\n`;
        });
    });
    
    const graphWithStatus = fullGraph + statusClasses;
    
    graphContainer.innerHTML = '';
    const graphId = 'mermaid-graph-' + Date.now();
    
    mermaid.render(graphId, graphWithStatus).then(({ svg }) => {
        graphContainer.innerHTML = svg;
        
        // Make nodes clickable after a short delay to ensure DOM is ready
        setTimeout(() => {
            makeNodesClickable();
        }, 200);
        
        // Also try again after a longer delay in case mermaid is still processing
        setTimeout(() => {
            makeNodesClickable();
        }, 1000);
    }).catch(err => {
        console.error('Error rendering graph:', err);
        graphContainer.innerHTML = '<p>Error rendering graph. Please check the console.</p>';
    });
}

// Make graph nodes clickable
function makeNodesClickable() {
    const svg = document.querySelector('#roadmap-graph svg');
    if (!svg) return;
    
    // Create a map of all node IDs to their section keys
    const nodeMap = {};
    Object.keys(roadmapData.sections).forEach(sectionKey => {
        const section = roadmapData.sections[sectionKey];
        Object.keys(section.nodes).forEach(nodeId => {
            nodeMap[nodeId] = sectionKey;
        });
    });
    
    // Mermaid creates node groups - find them by looking for groups with specific patterns
    // Nodes are typically in groups with class "node" or IDs containing the node ID
    const allGroups = svg.querySelectorAll('g');
    
    allGroups.forEach(group => {
        const groupId = group.getAttribute('id') || '';
        const className = group.getAttribute('class') || group.className?.baseVal || '';
        
        // Try to find node ID in various ways
        let nodeId = null;
        
        // Check if group ID contains a known node ID
        for (const id of Object.keys(nodeMap)) {
            if (groupId.includes(id) || className.includes(`node-${id}`)) {
                nodeId = id;
                break;
            }
        }
        
        // If not found, try to extract from ID pattern (e.g., "flowchart-A-0" -> "A")
        if (!nodeId) {
            const idMatch = groupId.match(/[^a-z]([A-Z][0-9]*)[^a-z]/);
            if (idMatch && nodeMap[idMatch[1]]) {
                nodeId = idMatch[1];
            }
        }
        
        if (nodeId && nodeMap[nodeId]) {
            // Make all interactive elements in this group clickable
            const interactiveElements = group.querySelectorAll('rect, ellipse, polygon, circle, path, text');
            interactiveElements.forEach(element => {
                element.style.cursor = 'pointer';
                // Remove existing listeners to avoid duplicates
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                newElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    findNodeById(nodeId);
                });
            });
        }
    });
    
    // Fallback: make all text elements clickable and try to match by content
    const textElements = svg.querySelectorAll('text');
    textElements.forEach(text => {
        const textContent = text.textContent.trim();
        if (textContent && textContent.length < 150 && !textContent.includes('-->')) {
            text.style.cursor = 'pointer';
            text.addEventListener('click', (e) => {
                e.stopPropagation();
                findNodeByLabel(textContent);
            });
        }
    });
}

// Find node by ID
function findNodeById(nodeId) {
    // Search through all sections to find node with this ID
    for (const sectionKey of Object.keys(roadmapData.sections)) {
        const section = roadmapData.sections[sectionKey];
        if (section.nodes[nodeId]) {
            openDetailPanel(nodeId, sectionKey);
            return true;
        }
    }
    return false;
}

// Find node by label text (fallback)
function findNodeByLabel(labelText) {
    // First try to extract node ID from label if it's at the start
    const idMatch = labelText.match(/^([A-Z0-9]+)\s/);
    if (idMatch) {
        const nodeId = idMatch[1];
        if (findNodeById(nodeId)) return;
    }
    
    // Search through all sections to find matching node
    for (const sectionKey of Object.keys(roadmapData.sections)) {
        const section = roadmapData.sections[sectionKey];
        for (const node of Object.values(section.nodes)) {
            const nodeLabel = node.label.replace(/<br\/>/g, ' ').toLowerCase();
            const searchLabel = labelText.toLowerCase();
            
            // Try to match by partial text
            if (nodeLabel.includes(searchLabel) || searchLabel.includes(nodeLabel.substring(0, 20))) {
                openDetailPanel(node.id, sectionKey);
                return;
            }
        }
    }
}

// Open detail panel for a node
function openDetailPanel(nodeId, sectionKey) {
    selectedNodeId = nodeId;
    const section = roadmapData.sections[sectionKey];
    const node = section.nodes[nodeId];
    
    if (!node) return;
    
    const panel = document.getElementById('detail-panel');
    const title = document.getElementById('detail-title');
    const content = document.getElementById('detail-content');
    
    title.textContent = node.label;
    panel.classList.add('active');
    
    // Build detail content
    content.innerHTML = `
        <div class="detail-section">
            <h3>Status</h3>
            <select class="status-select" id="node-status" data-status="${node.status}">
                ${roadmapData.statusOptions.map(status => 
                    `<option value="${status}" ${node.status === status ? 'selected' : ''}>${status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</option>`
                ).join('')}
            </select>
        </div>
        
        <div class="detail-section">
            <h3>Tags</h3>
            <div class="tags-container" id="tags-container">
                ${node.tags.map(tag => `
                    <span class="tag">
                        ${tag}
                        <span class="tag-remove" data-tag="${tag}">&times;</span>
                    </span>
                `).join('')}
            </div>
            <div class="tag-input-container">
                <select class="tag-input" id="tag-select">
                    <option value="">Add a tag...</option>
                    ${roadmapData.tags.filter(tag => !node.tags.includes(tag)).map(tag => 
                        `<option value="${tag}">${tag}</option>`
                    ).join('')}
                </select>
                <button class="btn tag-add-btn" id="add-tag-btn">Add</button>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Notes</h3>
            <ul class="notes-list" id="notes-list">
                ${node.notes.length === 0 ? '<li class="empty-state"><p>No notes yet. Add one below.</p></li>' : 
                node.notes.map(note => `
                    <li class="note-item" data-note-id="${note.id}">
                        <div class="note-header">
                            <span class="note-date">${formatDate(note.date)}</span>
                            <div class="note-actions">
                                <button class="note-edit-btn" data-note-id="${note.id}">Edit</button>
                                <button class="note-delete-btn" data-note-id="${note.id}">Delete</button>
                            </div>
                        </div>
                        <div class="note-text" id="note-text-${note.id}">${escapeHtml(note.text)}</div>
                    </li>
                `).join('')}
            </ul>
            <div class="note-input-container">
                <textarea class="note-textarea" id="note-textarea" placeholder="Add a note about this node..."></textarea>
                <button class="btn note-add-btn" id="add-note-btn">Add Note</button>
            </div>
        </div>
    `;
    
    // Setup event listeners for this panel
    setupDetailPanelListeners(sectionKey);
}

// Setup event listeners for detail panel
function setupDetailPanelListeners(sectionKey) {
    // Status change
    const statusSelect = document.getElementById('node-status');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            updateNodeStatus(selectedNodeId, sectionKey, e.target.value);
        });
    }
    
    // Tag removal
    document.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tag = e.target.getAttribute('data-tag');
            removeTag(selectedNodeId, sectionKey, tag);
        });
    });
    
    // Tag addition
    const addTagBtn = document.getElementById('add-tag-btn');
    const tagSelect = document.getElementById('tag-select');
    if (addTagBtn && tagSelect) {
        addTagBtn.addEventListener('click', () => {
            const tag = tagSelect.value;
            if (tag) {
                addTag(selectedNodeId, sectionKey, tag);
                tagSelect.value = '';
            }
        });
    }
    
    // Note addition
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteTextarea = document.getElementById('note-textarea');
    if (addNoteBtn && noteTextarea) {
        addNoteBtn.addEventListener('click', () => {
            const text = noteTextarea.value.trim();
            if (text) {
                if (noteEditId) {
                    updateNote(selectedNodeId, sectionKey, noteEditId, text);
                    noteEditId = null;
                    addNoteBtn.textContent = 'Add Note';
                } else {
                    addNote(selectedNodeId, sectionKey, text);
                }
                noteTextarea.value = '';
            }
        });
    }
    
    // Note edit/delete
    document.querySelectorAll('.note-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const noteId = e.target.getAttribute('data-note-id');
            editNote(noteId);
        });
    });
    
    document.querySelectorAll('.note-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const noteId = e.target.getAttribute('data-note-id');
            deleteNote(selectedNodeId, sectionKey, noteId);
        });
    });
}

// Update node status
function updateNodeStatus(nodeId, sectionKey, status) {
    const node = roadmapData.sections[sectionKey].nodes[nodeId];
    if (node) {
        node.status = status;
        saveData();
        renderGraph(currentSection);
        // Update the status select styling
        const statusSelect = document.getElementById('node-status');
        if (statusSelect) {
            statusSelect.setAttribute('data-status', status);
        }
    }
}

// Add tag to node
function addTag(nodeId, sectionKey, tag) {
    const node = roadmapData.sections[sectionKey].nodes[nodeId];
    if (node && !node.tags.includes(tag)) {
        node.tags.push(tag);
        saveData();
        openDetailPanel(nodeId, sectionKey); // Refresh panel
    }
}

// Remove tag from node
function removeTag(nodeId, sectionKey, tag) {
    const node = roadmapData.sections[sectionKey].nodes[nodeId];
    if (node) {
        node.tags = node.tags.filter(t => t !== tag);
        saveData();
        openDetailPanel(nodeId, sectionKey); // Refresh panel
    }
}

// Add note to node
function addNote(nodeId, sectionKey, text) {
    const node = roadmapData.sections[sectionKey].nodes[nodeId];
    if (node) {
        const note = {
            id: 'note-' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            author: 'user',
            text: text
        };
        node.notes.push(note);
        saveData();
        openDetailPanel(nodeId, sectionKey); // Refresh panel
    }
}

// Edit note
function editNote(noteId) {
    const node = Object.values(roadmapData.sections).flatMap(s => Object.values(s.nodes))
        .find(n => n.notes.some(note => note.id === noteId));
    
    if (node) {
        const note = node.notes.find(n => n.id === noteId);
        if (note) {
            noteEditId = noteId;
            const textarea = document.getElementById('note-textarea');
            const addBtn = document.getElementById('add-note-btn');
            if (textarea && addBtn) {
                textarea.value = note.text;
                addBtn.textContent = 'Update Note';
                textarea.focus();
            }
        }
    }
}

// Update note
function updateNote(nodeId, sectionKey, noteId, text) {
    const node = roadmapData.sections[sectionKey].nodes[nodeId];
    if (node) {
        const note = node.notes.find(n => n.id === noteId);
        if (note) {
            note.text = text;
            note.date = new Date().toISOString().split('T')[0]; // Update date
            saveData();
            openDetailPanel(nodeId, sectionKey); // Refresh panel
        }
    }
}

// Delete note
function deleteNote(nodeId, sectionKey, noteId) {
    const node = roadmapData.sections[sectionKey].nodes[nodeId];
    if (node) {
        node.notes = node.notes.filter(n => n.id !== noteId);
        saveData();
        openDetailPanel(nodeId, sectionKey); // Refresh panel
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('roadmap-data', JSON.stringify(roadmapData));
    buildSectionNavigation(); // Update progress bars
}

// Export JSON
function exportJSON() {
    const dataStr = JSON.stringify(roadmapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'roadmap-data.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Import JSON
function importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            roadmapData = imported;
            saveData();
            initializeApp();
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing JSON: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup global event listeners
function setupEventListeners() {
    // Close panel
    document.getElementById('close-panel').addEventListener('click', () => {
        document.getElementById('detail-panel').classList.remove('active');
        selectedNodeId = null;
        noteEditId = null;
    });
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportJSON);
    
    // Import button
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    
    document.getElementById('import-file').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importJSON(e.target.files[0]);
        }
    });
    
    // Tag filter
    document.getElementById('tag-filter').addEventListener('change', (e) => {
        const selectedTag = e.target.value;
        applyFilters(selectedTag, document.getElementById('status-filter').value);
    });
    
    // Status filter
    document.getElementById('status-filter').addEventListener('change', (e) => {
        const selectedStatus = e.target.value;
        applyFilters(document.getElementById('tag-filter').value, selectedStatus);
    });
}

// Apply filters to graph
function applyFilters(tagFilter, statusFilter) {
    // This is a visual filter - we'll highlight matching nodes
    const svg = document.querySelector('#roadmap-graph svg');
    if (!svg) return;
    
    // Reset all nodes to normal opacity
    const allNodes = svg.querySelectorAll('g');
    allNodes.forEach(group => {
        group.style.opacity = '1';
    });
    
    // If no filters, show all
    if (!tagFilter && !statusFilter) {
        return;
    }
    
    // Find nodes that match filters
    const matchingNodeIds = new Set();
    
    Object.keys(roadmapData.sections).forEach(sectionKey => {
        const section = roadmapData.sections[sectionKey];
        Object.values(section.nodes).forEach(node => {
            let matches = true;
            
            if (tagFilter && !node.tags.includes(tagFilter)) {
                matches = false;
            }
            
            if (statusFilter && node.status !== statusFilter) {
                matches = false;
            }
            
            if (matches) {
                matchingNodeIds.add(node.id);
            }
        });
    });
    
    // Dim nodes that don't match
    allNodes.forEach(group => {
        const groupId = group.getAttribute('id') || '';
        let isMatch = false;
        
        matchingNodeIds.forEach(nodeId => {
            if (groupId.includes(nodeId)) {
                isMatch = true;
            }
        });
        
        if (!isMatch) {
            group.style.opacity = '0.3';
        }
    });
}

// Load data on page load
loadRoadmapData();





