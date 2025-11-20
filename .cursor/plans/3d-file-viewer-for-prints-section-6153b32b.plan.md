<!-- 6153b32b-b71a-4d2d-8f85-372def69a7ca 0a0f1ee9-9ae5-482c-a333-353031598ea2 -->
# Media Carousel with 3D Viewer for Prints and Tools Sections

## Overview

Create a swipeable carousel component that displays all media files from a product folder. The carousel works for both "prints" and "tools" product types. For prints: 3D models (.stl/.3mf) appear first using Three.js, followed by other media. For tools: animated GIFs appear first (if available), followed by other media files. Users can swipe through all media files for each product.

## Implementation Plan

### 1. Add Dependencies

- Add Three.js core library via CDN to `index.html`
- Add STLLoader and 3MFLoader (from three/examples/jsm/loaders) via CDN
- Add OrbitControls for 3D interaction
- Use minimal imports to keep bundle size small

### 2. Fetch Product Folder Media Files

- Create `fetchProductMediaFiles()` function in `script.js`:
- Use GitHub API to list all files in product folder
- Filter for media files: .stl, .3mf, .png, .jpg, .jpeg, .gif, .webp, .mp4
- Sort files based on product type:
  - For "prints": 3D files (.stl, .3mf) first, then other media alphabetically
  - For "tools": animated GIFs (.gif) first, then other media alphabetically
- Return array of file objects with type, URL, and name

### 3. Create Carousel Component

- Replace `#product-3d-image` container with carousel structure:
- Carousel wrapper with overflow hidden
- Slide container with flex layout
- Individual slide elements for each media file
- Navigation indicators (dots or arrows)
- Touch/swipe event handlers

### 4. Create 3D Viewer Component

- Create `init3DViewer()` function:
- Sets up Three.js scene, camera, renderer in canvas element
- Handles STL and 3MF file loading
- Provides orbit controls for rotate/zoom/pan
- Returns cleanup function for resource disposal

### 5. Create Media Slide Renderers

- Create `renderMediaSlide()` function:
- For 3D files: creates canvas and initializes Three.js viewer
- For images (including GIFs): creates img element with proper sizing
- For videos: creates video element with controls
- Handles loading states and errors

### 6. Implement Carousel Navigation

- Add swipe/touch support:
- Touch event handlers for swipe gestures
- Mouse drag support for desktop
- Keyboard navigation (arrow keys)
- Programmatic navigation functions
- Add visual indicators:
- Dot indicators showing current slide
- Optional arrow buttons for navigation
- Smooth transitions between slides

### 7. Update Product Display Logic

- Modify `updateProductDisplay()` function:
- Check if product type is "prints" or "tools"
- If prints or tools: fetch media files and initialize carousel
- For other product types: use existing single image display
- Handle cleanup when switching products

### 8. Styling for Carousel

- Update `styles.css`:
- Carousel container with fixed dimensions (320x320px)
- Slide container with horizontal scroll (hidden scrollbar)
- Individual slide styling
- Navigation indicator styles
- Loading state styles
- Responsive adjustments for mobile

### 9. Error Handling & Fallbacks

- Handle cases where:
- GitHub API fails (fallback to existing image)
- 3D file fails to load (show error, continue to next slide)
- No media files found (show placeholder)
- Product type is prints/tools but folder structure differs
- Animated GIF fails to load (skip to next media file)

## Files to Modify

- `no3d-tools-website/index.html` - Add Three.js CDN links, update product image container structure
- `no3d-tools-website/script.js` - Add carousel logic, media fetching, 3D viewer, and update product display
- `no3d-tools-website/styles.css` - Add carousel styles, slide transitions, navigation indicators

## Technical Details

- Use Three.js r150+ (latest stable via CDN)
- GitHub API endpoint: `https://api.github.com/repos/{owner}/{repo}/contents/{path}`
- Carousel uses CSS transforms for smooth transitions
- Touch events: touchstart, touchmove, touchend
- Maintain aspect ratio for all media types
- Lazy load media files (load on slide view)
- Clean up Three.js resources on slide change to prevent memory leaks
- For tools section: Detect animated GIFs by file extension (.gif) and prioritize in sort order
- For prints section: Detect 3D files by extension (.stl, .3mf) and prioritize in sort order

### To-dos

- [ ] Add Three.js core library and loaders (STLLoader, 3MFLoader, OrbitControls) via CDN to index.html
- [ ] Replace product-image container with carousel structure (wrapper, slides container, navigation indicators)
- [ ] Create fetchProductMediaFiles() function to get all media files from product folder via GitHub API, with sorting logic for prints (3D first) and tools (GIFs first)
- [ ] Create init3DViewer() function that sets up Three.js scene, camera, renderer, and loads STL/3MF files
- [ ] Create renderMediaSlide() function to render different media types (3D, images including GIFs, videos) in carousel slides
- [ ] Create carousel component with slide management, navigation, and state handling
- [ ] Add touch/swipe event handlers for mobile and mouse drag for desktop navigation
- [ ] Modify updateProductDisplay() to conditionally use carousel for prints and tools products, single image for others
- [ ] Add CSS for carousel layout, slide transitions, navigation indicators, and responsive design
- [ ] Implement cleanup functions to dispose Three.js resources and remove event listeners when switching products