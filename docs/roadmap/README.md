# SOLVET Interactive Roadmap Tracker

An interactive visualization of the SOLVET asset lifecycle, broken into 5 sections, with functionality to track development progress through notes, tags, and status markers.

## Features

- **Interactive Graph**: Click on any node in the mermaid graph to view and edit details
- **Status Tracking**: Mark nodes as Planned, In Progress, Completed, or Blocked
- **Notes/Comments**: Add timestamped notes to track progress, blockers, and decisions
- **Tagging**: Categorize nodes with tags for easy filtering and organization
- **Progress Indicators**: See section-level progress with completion percentages
- **Data Persistence**: Changes are saved to localStorage and can be exported/imported as JSON

## Usage

1. Open `index.html` in a web browser
2. Navigate between the 5 asset lifecycle sections using the sidebar
3. Click on any node in the graph to open the detail panel
4. Add notes, change status, or add/remove tags
5. Export your changes as JSON to share with the team

## Asset Lifecycle Sections

1. **Asset Creation** - Blender, Add-on, Input Sources
2. **Asset Management** - Dashboard, Metadata
3. **Storage** - Repository Libraries
4. **Automated Publishing** - GitHub Actions, Platforms
5. **Asset Selling & Delivery** - Outputs, End User

## Data Structure

The roadmap data is stored in `roadmap-data.json` with the following structure:

```json
{
  "sections": {
    "asset-creation": {
      "name": "1. Asset Creation",
      "nodes": {
        "A": {
          "id": "A",
          "label": "Blender 4.5+ Asset Creation",
          "status": "completed",
          "tags": ["core", "blender"],
          "notes": []
        }
      }
    }
  },
  "tags": ["core", "blender", "dashboard", ...],
  "statusOptions": ["planned", "in-progress", "completed", "blocked"]
}
```

## Status Colors

- **Planned**: Gray (#999999)
- **In Progress**: Lello Yellow (#f0ff00)
- **Completed**: Green (#27AE60)
- **Blocked**: Red (#E74C3C)

## Export/Import

- **Export**: Click "Export JSON" to download the current roadmap data
- **Import**: Click "Import JSON" to load a previously exported roadmap data file

Changes are automatically saved to browser localStorage. To persist changes permanently, export the JSON file and commit it to the repository.

## Customization

To add new nodes or modify the graph structure:

1. Update `roadmap-data.json` with new node definitions
2. Update the mermaid graph definition in `roadmap.js` (in the `renderGraph` function)
3. Ensure node IDs match between the JSON data and mermaid graph

## Browser Compatibility

Requires a modern browser with:
- ES6+ JavaScript support
- LocalStorage API
- Fetch API

Tested on Chrome, Firefox, Safari, and Edge (latest versions).



