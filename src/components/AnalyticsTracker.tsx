'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Skip tracking for admin paths
        if (pathname && pathname.startsWith('/admin')) return;

        const trackVisit = async () => {
            try {
                // 1. Get or create Visitor ID (Persistent)
                let visitorId = localStorage.getItem('pyper_visitor_id');
                let isNewVisitor = false;
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem('pyper_visitor_id', visitorId);
                    isNewVisitor = true;
                }

                // 2. Get or create Session ID (Temporary)
                let sessionId = sessionStorage.getItem('pyper_session_id');
                let isNewSession = false;
                if (!sessionId) {
                    sessionId = crypto.randomUUID();
                    sessionStorage.setItem('pyper_session_id', sessionId);
                    isNewSession = true;
                }

                // 3. Detect device type (simpler version)
                const userAgent = navigator.userAgent;
                const deviceType = /Mobile|Android|iPhone/i.test(userAgent) ? 'mobile' : 'desktop';

                // 4. Send to Supabase
                const { error } = await supabase.from('analytics').insert({
                    visitor_id: visitorId,
                    session_id: sessionId,
                    page_path: pathname || '/',
                    referrer: document.referrer || null,
                    device_type: deviceType,
                    is_new_visitor: isNewVisitor,
                    is_new_session: isNewSession
                });

                if (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Analytics error:', error.message);
                    }
                }
            } catch (err) {
                console.error('Tracking failed:', err);
            }
        };

        trackVisit();
    }, [pathname]);

    return null;
}
