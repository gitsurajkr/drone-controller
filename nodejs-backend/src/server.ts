// server.ts
import express from 'express';
import { createServer } from 'http';
import { CacheService } from './services/CacheService';
import { HealthService } from './services/HealthService';
import { DroneService } from './services/DroneService';

const app = express();
const PORT = 3000;

// CORS middleware to allow requests from frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Parse JSON bodies
app.use(express.json());

// Initialize services
const cacheService = new CacheService();
let healthService: HealthService;
const droneService = new DroneService(cacheService);

let httpServer: any = null;
let isShuttingDown = false;

// Initialize health service with proper dependencies
const initializeHealthService = () => {
    healthService = new HealthService(
        cacheService,
        droneService.getDroneWS(),
        () => isShuttingDown
    );
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);
    
    try {
        // Stop drone service
        await droneService.stop();
        
        // Stop cache service
        cacheService.stop();
        
        // Close HTTP server
        if (httpServer) {
            console.log('[Server] Closing HTTP server...');
            await new Promise<void>((resolve, reject) => {
                httpServer.close((err: any) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        
        console.log('[Server] Graceful shutdown completed');
        process.exit(0);
        
    } catch (error) {
        console.error('[Server] Error during graceful shutdown:', error);
        process.exit(1);
    }
};

// Setup signal handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Setup middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    try {
        if (isShuttingDown) {
            res.status(503).json({ error: 'Service shutting down' });
            return;
        }

        const health = healthService.getSystemHealth();
        const droneHealth = {
            connected: droneService.isConnected(),
            connection_state: droneService.getConnectionState()
        };
        const cacheStats = cacheService.getCacheStats();

        res.json({
            ...health,
            drone: droneHealth,
            cache: cacheStats,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('[Server] /health endpoint error:', err);
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Telemetry endpoints
app.get('/telemetry', (req, res) => {
    try {
        if (isShuttingDown) {
            res.status(503).json({ error: 'Service shutting down' });
            return;
        }
        
        const currentTelemetry = cacheService.getCurrentTelemetry();
        res.json(currentTelemetry);
    } catch (err) {
        console.error('[Server] /telemetry endpoint error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/telemetry/history', (req, res) => {
    try {
        if (isShuttingDown) {
            res.status(503).json({ error: 'Service shutting down' });
            return;
        }
        
        const limit = parseInt(req.query.limit as string) || 50;
        const history = cacheService.getTelemetryHistory(limit);
        res.json({
            entries: history,
            total: history.length
        });
    } catch (err) {
        console.error('[Server] /telemetry/history endpoint error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start services
const startServices = async () => {
    try {
        // Start cache service
        cacheService.start();
        
        // Start drone service
        await droneService.start();
        
        // Initialize and start health service
        initializeHealthService();
        healthService.start();
        
        console.log('[Server] All services started successfully');
    } catch (error) {
        console.error('[Server] Failed to start services:', error);
        process.exit(1);
    }
};

// Start HTTP server
httpServer = createServer(app);

httpServer.listen(PORT, async () => {
    console.log(`[Server] HTTP server running at http://localhost:${PORT}`);
    console.log(`[Server] Health check available at http://localhost:${PORT}/health`);
    console.log(`[Server] Telemetry available at http://localhost:${PORT}/telemetry`);
    
    // Start all services
    await startServices();
});

// Handle server errors
httpServer.on('error', (error: any) => {
    console.error('[Server] HTTP server error:', error);
    if (!isShuttingDown) {
        gracefulShutdown('ERROR');
    }
});

export { app, httpServer };
