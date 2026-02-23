import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/marketStore';

const CLOB_WSS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';

export function usePolymarketWSS() {
    const { subscribeToTokens, updatePrice } = useMarketStore();
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!subscribeToTokens.length) return;

        // Initialize websocket
        const ws = new WebSocket(CLOB_WSS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Polymarket Live Data Connected');
            
            // Subscribe to asset/token updates
            ws.send(JSON.stringify({
                assets: subscribeToTokens,
                type: 'market'
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                  data.forEach(msg => {
                    if (msg.event_type === 'price_change' && msg.asset_id && msg.price) {
                      updatePrice(msg.asset_id, parseFloat(msg.price));
                    }
                  });
                }
            } catch (err) {
                // Ignore silent parsing errors on pings
            }
        };

        ws.onerror = (error) => {
            console.error('Polymarket WSS Error:', error);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };

    }, [subscribeToTokens, updatePrice]);
}
