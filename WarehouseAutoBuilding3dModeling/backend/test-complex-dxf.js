import DXFTo3DService from './services/dxfTo3D.js';
import fs from 'fs';

const dxfContent = fs.readFileSync('../samples/complex-factory-warehouse.dxf', 'utf8');
const parser = new DXFTo3DService();

console.log('Starting to parse complex-factory-warehouse.dxf...');
const entities = parser.parseDXF(dxfContent);
console.log(`Parsing complete, found ${entities.length} entities`);

// Count entity types
const typeCount = {};
entities.forEach(e => {
  typeCount[e.type] = (typeCount[e.type] || 0) + 1;
});
console.log('Entity type distribution:', typeCount);

// Generate 3D model
console.log('\nStarting 3D model generation...');
const scene = parser.generate3DGeometry(entities);
console.log('\n3D model generation complete!');
console.log(`Total objects: ${scene.objects.length}`);
console.log(`Wall count: ${scene.metadata.totalWalls}`);

// Count object types
const objTypeCount = {};
scene.objects.forEach(obj => {
  objTypeCount[obj.type] = (objTypeCount[obj.type] || 0) + 1;
});
console.log('Object type distribution:', objTypeCount);

// Export to JSON for inspection
const jsonOutput = parser.exportToJSON(scene);
fs.writeFileSync('../test-output-complex.json', jsonOutput);
console.log('\nExported to test-output-complex.json');
