const fs = require('fs');
const { createCanvas } = require('canvas');

// Create textures with cartoon-like patterns
function createTexture(filename, drawFunction, width = 512, height = 512) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill with color or pattern
    drawFunction(ctx, width, height);
    
    // Save to file
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    fs.writeFileSync(`assets/textures/kitchen/${filename}`, buffer);
    console.log(`Created ${filename}`);
}

// Wood texture for counter and floor - improved cartoon style
createTexture('wood.jpg', (ctx, width, height) => {
    // Base color - warmer, richer wood tone
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#A0522D');  // Sienna
    gradient.addColorStop(0.3, '#CD853F'); // Peru
    gradient.addColorStop(0.7, '#CD853F'); // Peru
    gradient.addColorStop(1, '#A0522D');  // Sienna
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add cartoon-style wood planks
    const plankHeight = 64;
    
    // Draw horizontal planks
    for (let y = 0; y < height; y += plankHeight) {
        // Plank background with slight color variation
        const brightness = 0.9 + Math.random() * 0.2; // Random brightness factor
        
        // Draw plank with slight color variation
        ctx.fillStyle = `rgba(${Math.floor(160 * brightness)}, ${Math.floor(82 * brightness)}, ${Math.floor(45 * brightness)}, 1)`;
        ctx.fillRect(0, y, width, plankHeight - 2);
        
        // Draw plank divider
        ctx.fillStyle = '#5E2612'; // Dark brown
        ctx.fillRect(0, y + plankHeight - 2, width, 2);
        
        // Add wood grain lines within each plank
        ctx.strokeStyle = '#8B4513'; // Darker grain color
        ctx.lineWidth = 1;
        
        // Add curved grain lines
        for (let i = 0; i < 7; i++) {
            const xStart = Math.random() * width;
            const yStart = y + 5 + Math.random() * (plankHeight - 10);
            
            ctx.beginPath();
            ctx.moveTo(xStart, yStart);
            
            // Create a gentle curve across the plank
            let xControl1 = xStart + 100 + Math.random() * 50;
            let yControl1 = yStart + (Math.random() * 20 - 10);
            let xControl2 = xStart + 200 + Math.random() * 50;
            let yControl2 = yStart + (Math.random() * 20 - 10);
            let xEnd = xStart + 300 + Math.random() * 100;
            let yEnd = yStart + (Math.random() * 20 - 10);
            
            ctx.bezierCurveTo(xControl1, yControl1, xControl2, yControl2, xEnd, yEnd);
            ctx.stroke();
        }
        
        // Add knots (occasionally)
        if (Math.random() > 0.7) {
            const knotX = Math.random() * width;
            const knotY = y + 10 + Math.random() * (plankHeight - 20);
            const knotSize = 5 + Math.random() * 10;
            
            // Draw knot
            const knotGradient = ctx.createRadialGradient(
                knotX, knotY, 0,
                knotX, knotY, knotSize
            );
            knotGradient.addColorStop(0, '#5E2612');
            knotGradient.addColorStop(0.5, '#8B4513');
            knotGradient.addColorStop(1, '#A0522D');
            
            ctx.fillStyle = knotGradient;
            ctx.beginPath();
            ctx.arc(knotX, knotY, knotSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Add circular grain around knot
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 0.5;
            for (let r = knotSize + 2; r < knotSize + 15; r += 2) {
                ctx.beginPath();
                ctx.arc(knotX, knotY, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Add highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y + 5);
        ctx.lineTo(width, y + 5);
        ctx.stroke();
    }
});

// Tile texture for countertop
createTexture('tiles.jpg', (ctx, width, height) => {
    // Base color
    ctx.fillStyle = '#EFEFEF';
    ctx.fillRect(0, 0, width, height);
    
    // Tile size
    const tileSize = 64;
    
    // Draw tiles
    for (let x = 0; x < width; x += tileSize) {
        for (let y = 0; y < height; y += tileSize) {
            // Tile base
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y, tileSize, tileSize);
            
            // Tile border
            ctx.strokeStyle = '#DDDDDD';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
            
            // Random slight color variation for each tile
            const hue = Math.random() * 10;
            ctx.fillStyle = `rgba(230, 230, ${230 + hue}, 0.1)`;
            ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        }
    }
});

// Wall texture with cartoon pattern
createTexture('wall.jpg', (ctx, width, height) => {
    // Base color - light creamy
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#FFF9E8');
    gradient.addColorStop(1, '#FFF0DB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle pattern
    ctx.strokeStyle = 'rgba(200, 180, 160, 0.2)';
    ctx.lineWidth = 1;
    
    // Draw horizontal lines
    for (let y = 0; y < height; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw a few vertical lines
    for (let x = 0; x < width; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
});

// Metal texture for appliances
createTexture('metal.jpg', (ctx, width, height) => {
    // Base color - metallic
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#AAAAAA');
    gradient.addColorStop(0.5, '#DDDDDD');
    gradient.addColorStop(1, '#AAAAAA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add brush texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    
    // Draw horizontal brush lines
    for (let y = 0; y < height; y += 4) {
        const yOffset = Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y + yOffset);
        ctx.lineTo(width, y + yOffset);
        ctx.stroke();
    }
});

// Cartoony stove top
createTexture('stove.jpg', (ctx, width, height) => {
    // Base color - dark gray
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, width, height);
    
    // Add burner circles
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    // Outer ring
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner details
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    // Small center
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
});

// Tomato texture - solid red with minimal details
createTexture('tomato.jpg', (ctx, width, height) => {
    // Base color - tomato red
    ctx.fillStyle = '#E63946'; // Bright tomato red
    ctx.fillRect(0, 0, width, height);
    
    // Add very subtle texture
    ctx.fillStyle = 'rgba(180, 0, 0, 0.1)'; // Slightly darker red with low opacity
    
    // Random subtle speckles
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 2 + Math.random() * 5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Subtle highlight gradient on top
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
});

// Cucumber texture - solid green
createTexture('cucumber.jpg', (ctx, width, height) => {
    // Base color - cucumber green
    ctx.fillStyle = '#2A9D8F'; // Cucumber green
    ctx.fillRect(0, 0, width, height);
    
    // Add very subtle darker stripes
    ctx.strokeStyle = 'rgba(20, 80, 20, 0.15)';
    ctx.lineWidth = 10;
    
    // Subtle horizontal stripes
    for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Add light highlight on top
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
});

// Carrot texture - solid orange
createTexture('carrot.jpg', (ctx, width, height) => {
    // Base color - carrot orange
    ctx.fillStyle = '#F77F00'; // Bright orange
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle texture
    ctx.fillStyle = 'rgba(200, 100, 0, 0.1)';
    
    // Random subtle speckles
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 1 + Math.random() * 3;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add subtle highlight
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
});

// Onion texture - solid purple
createTexture('onion.jpg', (ctx, width, height) => {
    // Base color - purple onion
    ctx.fillStyle = '#9D4EDD'; // Purple
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle circular layers
    ctx.strokeStyle = 'rgba(120, 40, 140, 0.1)';
    ctx.lineWidth = 8;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Circular rings
    for (let r = 20; r < Math.max(width, height); r += 40) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Add subtle highlight
    const gradient = ctx.createRadialGradient(
        width/3, height/3, 0,
        width/3, height/3, width/1.5
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
});

console.log('All kitchen textures created successfully!'); 