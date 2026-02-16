const fs = require('fs');
const path = require('path');

// Files that need alert replacements
const filesToUpdate = [
  'client/pages/SupplyChain.tsx',
  'client/pages/PlantReports.tsx', 
  'client/pages/Payments.tsx',
  'client/pages/Stock.tsx',
  'client/pages/ESGDashboard.tsx',
  'client/pages/Portfolio.tsx',
  'client/components/analysis/TestSection.tsx',
  'client/pages/PlantInventory.tsx',
  'client/pages/Tests.tsx',
  'client/pages/Clients.tsx'
];

// Alert patterns to replace
const alertReplacements = [
  {
    pattern: /alert\(`([^`]+)`\)/g,
    replacement: 'alert.featureUnderConstruction("$1")'
  },
  {
    pattern: /alert\(`([^`]+) is under construction`\)/g,
    replacement: 'alert.featureUnderConstruction("$1")'
  },
  {
    pattern: /alert\(`Exporting ([^`]+) is under construction`\)/g,
    replacement: 'alert.featureUnderConstruction("$1 export")'
  },
  {
    pattern: /alert\(`([^`]+) report is under construction`\)/g,
    replacement: 'alert.featureUnderConstruction("$1 report")'
  },
  {
    pattern: /alert\(`Viewing ([^`]+) is under construction`\)/g,
    replacement: 'alert.featureUnderConstruction("$1 view")'
  },
  {
    pattern: /alert\(`Creating ([^`]+) is under construction`\)/g,
    replacement: 'alert.featureUnderConstruction("$1 creation")'
  }
];

function updateFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;

    // Check if useAlert is already imported
    if (!content.includes('import { useAlert }')) {
      // Add useAlert import
      const importMatch = content.match(/import.*from.*["']@\/hooks\/use-alert["'];/);
      if (!importMatch) {
        // Find the last import statement
        const lastImportMatch = content.match(/import.*from.*["'][^"']+["'];\s*\n/g);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          const insertIndex = content.indexOf(lastImport) + lastImport.length;
          content = content.slice(0, insertIndex) + 
                   'import { useAlert } from "@/hooks/use-alert";\n' + 
                   content.slice(insertIndex);
          hasChanges = true;
        }
      }
    }

    // Add useAlert hook to component
    if (!content.includes('const alert = useAlert()')) {
      // Find the component function
      const componentMatch = content.match(/export default function \w+\(/);
      if (componentMatch) {
        const insertIndex = content.indexOf(componentMatch[0]) + componentMatch[0].length;
        const nextLine = content.indexOf('\n', insertIndex);
        content = content.slice(0, nextLine) + '\n  const alert = useAlert();' + content.slice(nextLine);
        hasChanges = true;
      }
    }

    // Apply alert replacements
    alertReplacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Update all files
console.log('Starting alert replacement...');
filesToUpdate.forEach(updateFile);
console.log('Alert replacement completed!');
