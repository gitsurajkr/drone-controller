import { WebSocketClient } from '../wsClient';
import { CacheService } from './CacheService';

export class DroneService {
    private droneWS: WebSocketClient | null = null;
    private telemetryInterval?: NodeJS.Timeout | undefined;
    private readonly telemetryIntervalMs: number;

    constructor(
        private cacheService: CacheService,
        private wsUrl: string = 'ws://localhost:8765',
        telemetryIntervalMs: number = 1000
    ) {
        this.telemetryIntervalMs = telemetryIntervalMs;
    }

    async start(): Promise<void> {
        try {
            this.droneWS = new WebSocketClient(this.wsUrl);

            this.droneWS.on('message', (data) => {
                try {
                    this.cacheService.updateTelemetryCache(data);
                } catch (err) {
                    console.error('[DroneService] Error updating telemetry cache:', err);
                }
            });

            this.droneWS.on('error', (error) => {
                console.error('[DroneService] WebSocket error:', error);
            });

            this.droneWS.on('close', (code, reason) => {
                console.warn(`[DroneService] WebSocket closed (${code}): ${reason}`);
            });

            this.droneWS.on('maxReconnectAttemptsReached', () => {
                console.error('[DroneService] Max reconnection attempts reached');
            });

            // Start telemetry polling
            this.startTelemetryPolling();

            console.log('[DroneService] Drone service started successfully');
        } catch (err) {
            console.error('[DroneService] Failed to start drone service:', err);
            throw err;
        }
    }

    private startTelemetryPolling(): void {
        this.telemetryInterval = setInterval(() => {
            try {
                if (this.droneWS && this.droneWS.isConnected()) {
                    const success = this.droneWS.sendMessage({ action: 'get_telemetry' });
                    if (!success) {
                        console.warn('[DroneService] Failed to send telemetry request');
                    }
                }
            } catch (err) {
                console.error('[DroneService] Error sending telemetry request:', err);
            }
        }, this.telemetryIntervalMs);
    }

    async stop(): Promise<void> {
        console.log('[DroneService] Stopping drone service...');

        // Stop telemetry polling
        if (this.telemetryInterval) {
            clearInterval(this.telemetryInterval);
            this.telemetryInterval = undefined;
        }

        // Close WebSocket connection
        if (this.droneWS) {
            this.droneWS.close();
            this.droneWS = null;
        }

        console.log('[DroneService] Drone service stopped');
    }

    getDroneWS(): WebSocketClient | null {
        return this.droneWS;
    }

    isConnected(): boolean {
        return this.droneWS?.isConnected() || false;
    }

    getConnectionState(): string {
        return this.droneWS?.getConnectionState() || 'DISCONNECTED';
    }
}