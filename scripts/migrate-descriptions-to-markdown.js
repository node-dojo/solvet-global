#!/usr/bin/env node

/**
 * Migration script to create desc_*.md files from existing JSON descriptions
 * 
 * This script:
 * 1. Scans product folders in no3d-tools-website
 * 2. Reads JSON files to extract descriptions
 * 3. Creates desc_*.md files with the description content
 * 4. Skips if desc_*.md already exists
 */

const fs = require('fs').promises
const path = require('path')

const PRODUCTS_DIR = path.join(__dirname, '..', 'no3d-tools-website')

// Product folders to process (from website script.js)
const PRODUCT_FOLDERS = [
  'Dojo Bolt Gen v05',
  'Dojo Bolt Gen v05_Obj',
  'Dojo Bool v5',
  'Dojo Calipers',
  'Dojo Crv Wrapper v4',
  'Dojo Gluefinity Grid_obj',
  'Dojo Knob',
  'Dojo Knob_obj',
  'Dojo Mesh Repair',
  'Dojo Print Viz_V4.5',
  'Dojo Squircle v4.5_obj',
  'Dojo_Squircle v4.5'
]

function generateDescFilename(folderName) {
  // Generate desc_*.md filename matching the folder name pattern
  // Examples:
  // "Dojo Bolt Gen v05" -> "desc_Dojo Bolt Gen v05.md"
  // "Dojo_Squircle v4.5" -> "desc_Dojo_Squircle v4.5.md"
  return `desc_${folderName}.md`
}

function shouldSkipDescription(description) {
  // Skip placeholder or sync-related descriptions
  const skipPatterns = [
    /LOCAL SYNC/i,
    /GIT SYNC/i,
    /POLAR SYNC/i,
    /WEBSITE SYNC/i,
    /^Blender asset:/i
  ]
  
  return skipPatterns.some(pattern => pattern.test(description))
}

async function migrateProduct(folderName) {
  const productDir = path.join(PRODUCTS_DIR, folderName)
  const jsonFile = path.join(productDir, `${folderName}.json`)
  const descFile = path.join(productDir, generateDescFilename(folderName))
  
  try {
    // Check if JSON file exists
    try {
      await fs.access(jsonFile)
    } catch {
      console.log(`⚠️  JSON file not found: ${jsonFile}`)
      return { skipped: true, reason: 'JSON file not found' }
    }
    
    // Check if desc file already exists
    try {
      await fs.access(descFile)
      console.log(`⏭️  Skipping ${folderName}: desc_*.md already exists`)
      return { skipped: true, reason: 'desc_*.md already exists' }
    } catch {
      // File doesn't exist, proceed
    }
    
    // Read JSON file
    const jsonContent = await fs.readFile(jsonFile, 'utf-8')
    const jsonData = JSON.parse(jsonContent)
    
    // Extract description
    let description = jsonData.description || ''
    
    // Skip if description is empty or should be skipped
    if (!description || !description.trim()) {
      console.log(`⏭️  Skipping ${folderName}: No description in JSON`)
      return { skipped: true, reason: 'No description in JSON' }
    }
    
    if (shouldSkipDescription(description)) {
      console.log(`⏭️  Skipping ${folderName}: Placeholder description detected`)
      return { skipped: true, reason: 'Placeholder description' }
    }
    
    // Create desc_*.md file
    // Convert newlines to markdown paragraphs if needed
    const markdownContent = description
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim())
      .join('\n\n')
    
    await fs.writeFile(descFile, markdownContent, 'utf-8')
    console.log(`✅ Created ${generateDescFilename(folderName)} for ${folderName}`)
    
    return { success: true, file: descFile }
  } catch (error) {
    console.error(`❌ Error processing ${folderName}:`, error.message)
    return { error: error.message }
  }
}

async function main() {
  console.log('🚀 Starting description migration...\n')
  console.log(`📁 Products directory: ${PRODUCTS_DIR}\n`)
  
  const results = {
    success: 0,
    skipped: 0,
    errors: 0
  }
  
  for (const folderName of PRODUCT_FOLDERS) {
    const result = await migrateProduct(folderName)
    
    if (result.success) {
      results.success++
    } else if (result.skipped) {
      results.skipped++
    } else if (result.error) {
      results.errors++
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Created: ${results.success}`)
  console.log(`   ⏭️  Skipped: ${results.skipped}`)
  console.log(`   ❌ Errors: ${results.errors}`)
  console.log('='.repeat(50))
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = { migrateProduct, generateDescFilename }

