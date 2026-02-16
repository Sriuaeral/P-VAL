#!/usr/bin/env node

/**
 * Migration script to help identify and update date picker implementations
 * This script scans the codebase for common date picker patterns and suggests
 * replacements with the new DatePicker component.
 */

const fs = require('fs');
const path = require('path');

// Patterns to look for
const patterns = [
  {
    name: 'React Calendar Import',
    pattern: /import.*Calendar.*from.*react-calendar/,
    suggestion: 'Replace with: import { DatePicker } from "@/components/ui/date-picker";'
  },
  {
    name: 'Calendar CSS Import',
    pattern: /import.*react-calendar\/dist\/Calendar\.css/,
    suggestion: 'Remove this import - no longer needed with DatePicker component'
  },
  {
    name: 'Calendar State Variables',
    pattern: /const \[.*Calendar.*\] = useState/,
    suggestion: 'Remove calendar-specific state - DatePicker manages its own state'
  },
  {
    name: 'Calendar Handler Functions',
    pattern: /const handle.*Calendar|const handleOpen.*Calendar|const handleClose.*Calendar/,
    suggestion: 'Remove calendar handler functions - DatePicker handles interactions internally'
  }
];

// File extensions to scan
const extensions = ['.tsx', '.ts', '.jsx', '.js'];

// Directories to scan
const directories = [
  'components',
  'pages',
  'hooks'
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        issues.push({
          pattern: pattern.name,
          suggestion: pattern.suggestion,
          matches: matches.length
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          results.push(...scanDirectory(fullPath));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        const issues = scanFile(fullPath);
        if (issues.length > 0) {
          results.push({
            file: fullPath,
            issues: issues
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return results;
}

function generateReport(results) {
  console.log('🔍 Date Picker Migration Report\n');
  console.log('=' .repeat(50));
  
  if (results.length === 0) {
    console.log('✅ No date picker patterns found that need migration!');
    return;
  }
  
  console.log(`Found ${results.length} file(s) with potential migration needs:\n`);
  
  results.forEach(({ file, issues }) => {
    console.log(`📁 ${file}`);
    issues.forEach(issue => {
      console.log(`  ⚠️  ${issue.pattern}`);
      console.log(`     💡 ${issue.suggestion}`);
      if (issue.matches > 1) {
        console.log(`     📊 Found ${issue.matches} occurrences`);
      }
      console.log('');
    });
    console.log('-'.repeat(40));
  });
  
  console.log('\n📋 Migration Checklist:');
  console.log('1. Replace react-calendar imports with DatePicker import');
  console.log('2. Remove calendar-specific state variables');
  console.log('3. Remove calendar handler functions');
  console.log('4. Replace Popover + Calendar patterns with DatePicker');
  console.log('5. Update JSX to use DatePicker component');
  console.log('6. Test the updated components');
  
  console.log('\n📖 For detailed migration examples, see:');
  console.log('   - client/docs/DATEPICKER_COMPONENT.md');
  console.log('   - client/components/ui/date-picker-examples.tsx');
}

function main() {
  console.log('🚀 Starting Date Picker Migration Scan...\n');
  
  const allResults = [];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`📂 Scanning ${dir}...`);
      allResults.push(...scanDirectory(dir));
    } else {
      console.log(`⚠️  Directory ${dir} not found, skipping...`);
    }
  });
  
  generateReport(allResults);
  
  if (allResults.length > 0) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Review the files listed above');
    console.log('2. Apply the suggested changes');
    console.log('3. Test the updated components');
    console.log('4. Run this script again to verify migration');
  }
}

// Run the migration scan
main();
