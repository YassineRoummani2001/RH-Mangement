const fs = require('fs');
const path = require('path');

const entitiesDir = 'd:/SupMti/PFC/RH-Mangement/backend-symfony/src/Entity';
const modelsDir = 'd:/SupMti/PFC/RH-Mangement/backend/src/models';

const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.php'));

function mapType(phpType, propertyName) {
    if (phpType.includes('int')) return 'Number';
    if (phpType.includes('bool')) return 'Boolean';
    if (phpType.includes('DateTime')) return 'Date';
    if (phpType.includes('array')) return '[String]';
    if (phpType.includes('float') || phpType.includes('decimal')) return 'Number';
    
    // Check for relation
    if (phpType.match(/^[A-Z]/) && phpType !== 'DateTimeImmutable' && phpType !== 'DateTimeInterface') {
        if (phpType === 'Collection') return `[{ type: mongoose.Schema.Types.ObjectId, ref: 'Unknown' }]`;
        return `{ type: mongoose.Schema.Types.ObjectId, ref: '${phpType}' }`;
    }

    return 'String';
}

files.forEach(file => {
    if (file === 'User.php' || file === 'Employe.php') return; // already done

    const content = fs.readFileSync(path.join(entitiesDir, file), 'utf8');
    const classNameMatch = content.match(/class\s+(\w+)/);
    if (!classNameMatch) return;
    
    const className = classNameMatch[1];
    let schemaStr = `import mongoose from 'mongoose';\n\nconst ${className.toLowerCase()}Schema = new mongoose.Schema({\n`;
    
    const propertyRegex = /private\s+(?:\?)?([\w\\]+)\s+\$(\w+)(?:\s*=\s*([^;]+))?;/g;
    let match;
    let hasProperties = false;

    while ((match = propertyRegex.exec(content)) !== null) {
        let [, type, name, defaultValue] = match;
        if (name === 'id' || name === 'createdAt' || name === 'updatedAt') continue;
        
        type = type.replace(/^\\/, ''); // remove leading slash
        const mongooseType = mapType(type, name);
        
        if (mongooseType.startsWith('{') || mongooseType.startsWith('[')) {
            schemaStr += `  ${name}: ${mongooseType},\n`;
        } else {
            schemaStr += `  ${name}: { type: ${mongooseType} },\n`;
        }
        hasProperties = true;
    }
    
    schemaStr += `}, {\n  timestamps: true\n});\n\n`;
    schemaStr += `const ${className} = mongoose.model('${className}', ${className.toLowerCase()}Schema);\n`;
    schemaStr += `export default ${className};\n`;

    fs.writeFileSync(path.join(modelsDir, `${className}.js`), schemaStr);
    console.log(`Generated ${className}.js`);
});
