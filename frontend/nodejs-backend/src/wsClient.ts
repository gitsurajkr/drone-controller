// wsClient.ts
import WebSocket from 'ws';
import EventEmitter from 'events';

export class WebSocketClient extends EventEmitter {
    url: string;
    private ws?: WebSocket;
    private reconnectInterval: number;
    private maxReconnectAttempts: number;
    private reconnectAttempts: number;
    private isClosing: boolean;
    private reconnectTimeout?: NodeJS.Timeout | undefined;

    constructor(url: string, reconnectInterval = 2000, maxReconnectAttempts = 10) {
        super();
        this.url = url;
        this.reconnectInterval = reconnectInterval;
        this.maxReconnectAttempts = maxReconnectAttempts;
        this.reconnectAttempts = 0;
        this.isClosing = false;
        this.connect();
    }

    connect() {
        if (this.isClosing) {
            return;
        }

        try {
            this.ws = new WebSocket(this.url);

            this.ws.on('open', () => {
                console.log(`[WS] Connected to ${this.url}`);
                this.reconnectAttempts = 0;
                this.emit('open');
            });

            this.ws.on('message', (data) => {
                try {
                    const json = JSON.parse(data.toString());
                    this.emit('message', json);
                } catch (err) {
                    console.error('[WS] JSON parse error:', err, 'Data:', data.toString());
                    this.emit('error', err);
                }
            });

            this.ws.on('close', (code, reason) => {
                console.warn(`[WS] Connection closed (${code}): ${reason}`);
                this.emit('close', code, reason);
                
                if (!this.isClosing && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('[WS] Max reconnection attempts reached');
                    this.emit('maxReconnectAttemptsReached');
                }
            });

            this.ws.on('error', (error) => {
                console.error('[WS] Error:', error);
                this.emit('error', error);
            });
        } catch (err) {
            console.error('[WS] Failed to connect:', err);
            this.emit('error', err);
            if (!this.isClosing && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        }
    }

    private scheduleReconnect() {
        if (this.isClosing) {
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectInterval * Math.pow(2, Math.min(this.reconnectAttempts - 1, 5)); // Exponential backoff with cap
        
        console.log(`[WS] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    sendMessage(message: any) {
        try {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(message));
                return true;
            } else {
                console.warn('[WS] Cannot send message, WS not open. ReadyState:', this.ws?.readyState);
                return false;
            }
        } catch (err) {
            console.error('[WS] Send message failed:', err);
            this.emit('error', err);
            return false;
        }
    }

    close() {
        console.log('[WS] Closing WebSocket connection...');
        this.isClosing = true;
        
        // Clear any pending reconnection
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = undefined;
        }
        
        if (this.ws) {
            this.ws.close(1000, 'Client closing');
        }
        
        this.emit('close', 1000, 'Client closing');
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    getConnectionState(): string {
        if (!this.ws) return 'DISCONNECTED';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }
}
