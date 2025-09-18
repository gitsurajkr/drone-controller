import { CacheService } from './CacheService';
import type { CacheStats } from './CacheService';
import { WebSocketClient } from '../wsClient';

export interface HealthStatus {
    status: string;
    uptime_seconds: number;
    drone_connected: boolean;
    telemetry_available: boolean;
    memory_usage: {
        rss_mb: number;
        heap_used_mb: number;
        heap_total_mb: number;
        external_mb: number;
    };
    cache_stats: CacheStats;
    timestamp: string;
}

export class HealthService {
    constructor(
        private cacheService: CacheService,
        private droneWS: WebSocketClient | null,
        private isShuttingDown: () => boolean
    ) {}

    start(): void {
        console.log('[HealthService] Health service started');
    }

    getSystemHealth(): HealthStatus {
        const uptime = process.uptime();
        const memUsage = process.memoryUsage();
        const cacheStats = this.cacheService.getStats();
        
        return {
            status: this.isShuttingDown() ? 'shutting_down' : 'healthy',
            uptime_seconds: uptime,
            drone_connected: this.droneWS?.isConnected() || false,
            telemetry_available: Object.keys(this.cacheService.getTelemetryCache()).length > 0,
            memory_usage: {
                rss_mb: memUsage.rss / 1024 / 1024,
                heap_used_mb: memUsage.heapUsed / 1024 / 1024,
                heap_total_mb: memUsage.heapTotal / 1024 / 1024,
                external_mb: memUsage.external / 1024 / 1024
            },
            cache_stats: cacheStats,
            timestamp: new Date().toISOString()
        };
    }

    getHealthStatus(): HealthStatus {
        return this.getSystemHealth();
    }
}