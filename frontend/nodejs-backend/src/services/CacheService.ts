export interface CacheEntry {
    timestamp: number;
    data: any;
}

export interface CacheStats {
    total_entries: number;
    oldest_entry_age_ms: number;
    newest_entry_age_ms: number;
    cache_size_estimate_kb: number;
    current_size: number;
    max_size: number;
}

export class CacheService {
    private telemetryCache: any = {};
    private telemetryHistory: CacheEntry[] = [];
    private readonly maxHistorySize: number;
    private readonly cacheTtlMs: number;
    private cleanupInterval?: NodeJS.Timeout | undefined;

    constructor(maxHistorySize = 100, cacheTtlMs = 5 * 60 * 1000) {
        this.maxHistorySize = maxHistorySize;
        this.cacheTtlMs = cacheTtlMs;
    }

    start(): void {
        // Start the cleanup worker
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000); // 60 seconds
        
        console.log('[CacheService] Cache service started');
    }

    stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
        
        // Clear all data
        this.telemetryCache = {};
        this.telemetryHistory = [];
        
        console.log('[CacheService] Cache service stopped');
    }

    getCurrentTelemetry(): any {
        return this.telemetryCache;
    }

    getTelemetryHistory(limit?: number): CacheEntry[] {
        const result = this.telemetryHistory.slice();
        return limit ? result.slice(-limit) : result;
    }

    getCacheStats(): CacheStats {
        const now = Date.now();
        const totalEntries = this.telemetryHistory.length;
        
        if (totalEntries === 0) {
            return {
                total_entries: 0,
                oldest_entry_age_ms: 0,
                newest_entry_age_ms: 0,
                cache_size_estimate_kb: 0,
                current_size: 0,
                max_size: this.maxHistorySize
            };
        }
        
        const timestamps = this.telemetryHistory.map((entry: CacheEntry) => entry.timestamp);
        const oldestTimestamp = Math.min(...timestamps);
        const newestTimestamp = Math.max(...timestamps);
        
        // Rough size estimate
        const sizeEstimate = JSON.stringify(this.telemetryHistory).length / 1024;
        
        return {
            total_entries: totalEntries,
            oldest_entry_age_ms: now - oldestTimestamp,
            newest_entry_age_ms: now - newestTimestamp,
            cache_size_estimate_kb: sizeEstimate,
            current_size: totalEntries,
            max_size: this.maxHistorySize
        };
    }

    stopCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }

    private cleanup(): void {
        const now = Date.now();
        
        // Remove expired entries from history
        this.telemetryHistory = this.telemetryHistory.filter(
            entry => now - entry.timestamp < this.cacheTtlMs
        );
        
        // Enforce size limit
        if (this.telemetryHistory.length > this.maxHistorySize) {
            this.telemetryHistory = this.telemetryHistory.slice(-this.maxHistorySize);
        }
        
        console.log(`[CacheService] Cleanup: ${this.telemetryHistory.length} entries in history`);
    }

    addToHistory(data: any): void {
        const entry: CacheEntry = {
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(data)) // Deep copy
        };
        
        this.telemetryHistory.push(entry);
        
        // Immediate size check
        if (this.telemetryHistory.length > this.maxHistorySize * 1.2) {
            this.telemetryHistory = this.telemetryHistory.slice(-this.maxHistorySize);
        }
    }

    updateTelemetryCache(data: any): void {
        this.telemetryCache = data;
        this.addToHistory(data);
    }

    getTelemetryCache(): any {
        return this.telemetryCache;
    }

    getStats(): CacheStats {
        const now = Date.now();
        const totalEntries = this.telemetryHistory.length;
        
        if (totalEntries === 0) {
            return {
                total_entries: 0,
                oldest_entry_age_ms: 0,
                newest_entry_age_ms: 0,
                cache_size_estimate_kb: 0,
                current_size: 0,
                max_size: this.maxHistorySize
            };
        }
        
        const timestamps = this.telemetryHistory.map(entry => entry.timestamp);
        const oldestTimestamp = Math.min(...timestamps);
        const newestTimestamp = Math.max(...timestamps);
        
        // Rough size estimate
        const sizeEstimate = JSON.stringify(this.telemetryHistory).length / 1024;
        
        return {
            total_entries: totalEntries,
            oldest_entry_age_ms: now - oldestTimestamp,
            newest_entry_age_ms: now - newestTimestamp,
            cache_size_estimate_kb: sizeEstimate,
            current_size: totalEntries,
            max_size: this.maxHistorySize
        };
    }

    clear(): void {
        this.telemetryCache = {};
        this.telemetryHistory = [];
    }
}