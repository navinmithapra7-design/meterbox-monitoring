import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, READINGS_TABLE, DEVICES_TABLE, ALERTS_TABLE, REPORTS_TABLE } from '../lib/supabaseClient';

/**
 * Master hook for all Supabase data: readings, devices, alerts, reports.
 * Includes Realtime subscriptions and fallback polling.
 */
export function useSupabaseData() {
  const [readings, setReadings] = useState([]);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [toastAlerts, setToastAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const channelRef = useRef(null);
  const pollingRef = useRef(null);
  const alertsRef = useRef([]); // To keep track of latest alerts for the websocket callback
  const devicesRef = useRef([]);

  // ── FETCH ALL DATA ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [readingsRes, devicesRes, alertsRes, reportsRes] = await Promise.all([
        supabase.from(READINGS_TABLE).select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from(DEVICES_TABLE).select('*').order('created_at', { ascending: false }),
        supabase.from(ALERTS_TABLE).select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from(REPORTS_TABLE).select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (readingsRes.error) throw readingsRes.error;
      setReadings(readingsRes.data || []);

      // Devices/alerts/reports may not exist yet (before SQL migration), handle gracefully
      if (!devicesRes.error) {
        setDevices(devicesRes.data || []);
        devicesRef.current = devicesRes.data || [];
      }
      if (!alertsRes.error) {
        setAlerts(alertsRes.data || []);
        alertsRef.current = alertsRes.data || [];
      }
      if (!reportsRes.error) setReports(reportsRes.data || []);

      setLastSyncTime(new Date());
      setError(null);
    } catch (err) {
      console.error('[useSupabaseData] fetch error:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── DEVICE CRUD ────────────────────────────────────────────
  const addDevice = useCallback(async (device) => {
    try {
      const { data, error: err } = await supabase.from(DEVICES_TABLE).insert([device]).select();
      if (err) throw err;
      setDevices(prev => [data[0], ...prev]);
      return { success: true, data: data[0] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateDevice = useCallback(async (id, updates) => {
    try {
      const { error: err } = await supabase.from(DEVICES_TABLE).update(updates).eq('id', id);
      if (err) throw err;
      setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteDevice = useCallback(async (id) => {
    try {
      const { error: err } = await supabase.from(DEVICES_TABLE).delete().eq('id', id);
      if (err) throw err;
      setDevices(prev => prev.filter(d => d.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // ── ALERT ACTIONS ──────────────────────────────────────────
  const createAlert = useCallback(async (alertData) => {
    try {
      const { data, error: err } = await supabase.from(ALERTS_TABLE).insert([alertData]).select();
      if (err) throw err;
      if (!isRealtime) {
        setAlerts(prev => [data[0], ...prev]);
        alertsRef.current = [data[0], ...alertsRef.current];
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isRealtime]);

  const acknowledgeAlert = useCallback(async (id) => {
    try {
      const { error: err } = await supabase.from(ALERTS_TABLE)
        .update({ is_acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;
      setAlerts(prev => {
        const next = prev.map(a => a.id === id ? { ...a, is_acknowledged: true, acknowledged_at: new Date().toISOString() } : a);
        alertsRef.current = next;
        return next;
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const resolveAlert = useCallback(async (id) => {
    try {
      const { error: err } = await supabase.from(ALERTS_TABLE)
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;
      setAlerts(prev => {
        const next = prev.map(a => a.id === id ? { ...a, is_resolved: true, resolved_at: new Date().toISOString() } : a);
        alertsRef.current = next;
        return next;
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // ── REPORTS ────────────────────────────────────────────────
  const saveReport = useCallback(async (reportData) => {
    try {
      const { data, error: err } = await supabase.from(REPORTS_TABLE).insert([reportData]).select();
      if (err) throw err;
      setReports(prev => [data[0], ...prev]);
      return { success: true, data: data[0] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // ── MANUAL READING INSERT ──────────────────────────────────
  const insertReading = useCallback(async (row) => {
    try {
      const { error: err } = await supabase.from(READINGS_TABLE).insert([row]);
      if (err) throw err;
      if (!isRealtime) await fetchAll();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isRealtime, fetchAll]);

  // ── QUERY READINGS BY DATE RANGE ───────────────────────────
  const queryReadings = useCallback(async (from, to, deviceId = null) => {
    try {
      let query = supabase.from(READINGS_TABLE)
        .select('*')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false });

      if (deviceId) query = query.eq('device_id', deviceId);

      const { data, error: err } = await query;
      if (err) throw err;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  }, []);

  // ── REALTIME + POLLING ─────────────────────────────────────
  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('smartmeter-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: READINGS_TABLE }, (payload) => {
        setReadings(prev => [payload.new, ...prev].slice(0, 500));
        setLastSyncTime(new Date());

        // Client-Side Auto-Alert Generation (Fallback if SQL Trigger isn't active)
        const reading = payload.new;
        const isTempDanger = reading.temperature >= 60;
        const isSmokeDanger = reading.smoke >= 850;
        
        if (isTempDanger || isSmokeDanger) {
          const device = devicesRef.current.find(d => d.id === reading.device_id) || devicesRef.current[0];
          const loc = device?.location || reading.location || 'Unknown Sector';
          const severity = (reading.temperature >= 75 || reading.smoke >= 1000) ? 'critical' : 'warning';
          const msg = `SYSTEM DETECTED DANGER: ${isTempDanger ? `Temperature at ${reading.temperature}°C` : `Smoke at ${reading.smoke}`} exceeded limits.`;
          
          // Check if there's already an active (unresolved) alert for this location
          const existingAlert = alertsRef.current.find(a => !a.is_resolved && a.location === loc);
          
          if (existingAlert) {
            // Update the existing alert instead of creating a new one (prevents spam)
            supabase.from(ALERTS_TABLE).update({
              temperature: reading.temperature,
              smoke: reading.smoke,
              severity: severity,
              message: msg,
              created_at: new Date().toISOString() // Bump to top
            }).eq('id', existingAlert.id).then(({ error }) => {
              if (error) console.error("Auto-alert update failed:", error);
            });
          } else {
            // Create a brand new alert
            const alertData = {
              device_id: reading.device_id || null,
              alert_type: isTempDanger ? 'temperature' : 'smoke',
              severity: severity,
              message: msg,
              temperature: reading.temperature,
              smoke: reading.smoke,
              location: loc,
              is_acknowledged: false,
              is_resolved: false
            };
            
            supabase.from(ALERTS_TABLE).insert([alertData]).then(({ error }) => {
              if (error) console.error("Auto-alert insert failed:", error);
            });
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: ALERTS_TABLE }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlerts(prev => {
            const next = [payload.new, ...prev].slice(0, 200);
            alertsRef.current = next;
            return next;
          });
          
          // Trigger UI pop-up toast only on NEW alerts
          const newToastId = Date.now() + Math.random();
          const alertWithId = { ...payload.new, toastId: newToastId };
          setToastAlerts(prev => [...prev, alertWithId]);
          
          setTimeout(() => {
            setToastAlerts(prev => prev.filter(t => t.toastId !== newToastId));
          }, 8000);
        } 
        else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => {
            // Replace the updated alert, and sort by created_at to bump updated ones to the top
            const updatedList = prev.map(a => a.id === payload.new.id ? payload.new : a);
            updatedList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const next = updatedList.slice(0, 200);
            alertsRef.current = next;
            return next;
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: DEVICES_TABLE }, () => {
        // Refetch devices on any change
        supabase.from(DEVICES_TABLE).select('*').order('created_at', { ascending: false })
          .then(({ data }) => { 
            if (data) {
              setDevices(data); 
              devicesRef.current = data;
            }
          });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtime(true);
          if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
        } else {
          setIsRealtime(false);
        }
      });

    channelRef.current = channel;

    pollingRef.current = setInterval(() => {
      fetchAll();
    }, 5000);

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    readings,
    devices,
    alerts,
    toastAlerts,
    reports,
    isLoading,
    error,
    isRealtime,
    lastSyncTime,
    latestReading: readings[0] || null,
    // Actions
    refetch: fetchAll,
    insertReading,
    addDevice,
    updateDevice,
    deleteDevice,
    createAlert,
    acknowledgeAlert,
    resolveAlert,
    saveReport,
    queryReadings,
  };
}
