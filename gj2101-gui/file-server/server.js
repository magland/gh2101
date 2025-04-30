const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const port = process.env.PORT || 8091;

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Get serve path from environment variable
const servePath = process.env.SERVE_PATH;
if (!servePath) {
    console.error('Error: SERVE_PATH environment variable must be set');
    process.exit(1);
}

// Verify the serve path exists
if (!fs.existsSync(servePath)) {
    console.error(`Error: Directory ${servePath} does not exist`);
    process.exit(1);
}

// Configure CORS
const corsOptions = {
    origin: ['http://localhost:5173', 'https://gj2101-gui.vercel.app'],
    methods: ['GET', 'HEAD'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Serve files with range request support
app.get('*', (req, res) => {
    const filePath = path.join(servePath, req.path);

    // Check if file exists and is within serve path
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return res.status(404).send('File not found');
    }

    if (!filePath.startsWith(path.resolve(servePath))) {
        console.error(`Invalid path - attempt to access file outside serve path: ${filePath}`);
        return res.status(403).send('Access denied');
    }

    const stat = fs.statSync(filePath);
    console.log(`Accessing file: ${filePath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);

    // Handle range request
    const range = req.headers.range;
    if (range) {
        console.log(`Range request received: ${range}`);
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;

        console.log(`Serving bytes ${start}-${end}/${stat.size} (${((end-start+1) / 1024 / 1024).toFixed(2)} MB)`);
        const file = fs.createReadStream(filePath, { start, end });

        // Handle client disconnection
        req.on('close', () => {
            file.destroy();
            console.log(`${new Date().toISOString()} Range request canceled: ${filePath} (bytes ${start}-${end})`);
        });
        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        const head = {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=0',
            'Last-Modified': stat.mtime.toUTCString()
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        // Handle non-range request
        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        const head = {
            'Content-Length': stat.size,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=0',
            'Last-Modified': stat.mtime.toUTCString()
        };
        res.writeHead(200, head);
        const file = fs.createReadStream(filePath);

        // Handle client disconnection
        req.on('close', () => {
            file.destroy();
            console.log(`${new Date().toISOString()} Request canceled: ${filePath}`);
        });

        file.pipe(res);
    }
});

// Handle server errors
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
    console.log('='.repeat(50));
    console.log(`File Server Started`);
    console.log('-'.repeat(50));
    console.log(`Server URL: http://localhost:${port}`);
    console.log(`Serve Path: ${servePath}`);
    console.log(`CORS enabled for:`);
    console.log(`- http://localhost:5173`);
    console.log(`- https://gh2101-gui.vercel.app`);
    console.log(`Port: ${port}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
});
