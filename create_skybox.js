const fs = require('fs');
const { createCanvas } = require('canvas');

// Create skybox textures with a cartoon-like gradient
function createSkyboxTexture(filename, colorFunction) {
    const size = 512; // Size of the texture
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fill with gradient based on the side
    const gradient = colorFunction(ctx, size);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add some cartoon-like clouds or stars
    addCartoonElements(ctx, size);
    
    // Save to file
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    fs.writeFileSync(`assets/textures/cartoon_skybox/${filename}`, buffer);
    console.log(`Created ${filename}`);
}

// Add cartoon elements like clouds or stars
function addCartoonElements(ctx, size) {
    // Add some stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // Generate 30-50 random stars
    const numStars = Math.floor(Math.random() * 20) + 30;
    
    for (let i = 0; i < numStars; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 2 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create all six sides of the skybox
// Positive X (right)
createSkyboxTexture('px.jpg', (ctx, size) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#5D3FD3'); // Bright purple at top
    gradient.addColorStop(1, '#9370DB'); // Lighter purple at bottom
    return gradient;
});

// Negative X (left)
createSkyboxTexture('nx.jpg', (ctx, size) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#5D3FD3');
    gradient.addColorStop(1, '#9370DB');
    return gradient;
});

// Positive Y (top)
createSkyboxTexture('py.jpg', (ctx, size) => {
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
    gradient.addColorStop(0, '#7B68EE'); // Medium purple at center
    gradient.addColorStop(1, '#4B0082'); // Indigo at edges
    return gradient;
});

// Negative Y (bottom)
createSkyboxTexture('ny.jpg', (ctx, size) => {
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#9370DB'); // Light purple
    gradient.addColorStop(1, '#8A2BE2'); // Slightly darker
    return gradient;
});

// Positive Z (front)
createSkyboxTexture('pz.jpg', (ctx, size) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#5D3FD3');
    gradient.addColorStop(1, '#9370DB');
    return gradient;
});

// Negative Z (back)
createSkyboxTexture('nz.jpg', (ctx, size) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#5D3FD3');
    gradient.addColorStop(1, '#9370DB');
    return gradient;
});

console.log('All skybox textures created successfully!'); 