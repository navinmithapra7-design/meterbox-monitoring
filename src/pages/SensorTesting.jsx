import React, { useState, useMemo } from 'react';
import { useSupabase } from '../context/SupabaseDataContext';
import { THRESHOLDS, evaluateReading, evaluateFullReading } from '../data/sensorReadings';

export default function SensorTesting() {
  const { readings, insertReading, isLoading } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const [formData, setFormData] = useState({
    temperature: '',
    smoke: '',
    location: '',
    notes: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.temperature || !formData.smoke) {
      setSubmitResult({ success: false, error: 'Please fill temperature and smoke fields' });
      return;
    }

    const temp = Number(formData.temperature);
    const smoke = Number(formData.smoke);

    // Determine status based on ESP32 thresholds
    const status = (temp > 60 || smoke > 850) ? 'ALERT' : 'NORMAL';

    setIsSubmitting(true);
    setSubmitResult(null);

    const result = await insertReading({
      temperature: temp,
      smoke,
      status,
      location: formData.location || 'Manual Test',
    });

    setIsSubmitting(false);
    setSubmitResult(result);

    if (result.success) {
      setFormData({ temperature: '', smoke: '', location: '', notes: '' });
      setTimeout(() => setSubmitResult(null), 3000);
    }
  };

  // Evaluate each reading for display
  const evaluatedReadings = useMemo(() => {
    return readings.slice(0, 50).map((r) => {
      const { results, overall } = evaluateFullReading(r);
      return { ...r, results, overall };
    });
  }, [readings]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-primary bg-tertiary-fixed';
      case 'warning': return 'text-on-tertiary-container bg-tertiary-container';
      case 'fail': return 'text-on-error-container bg-error-container';
      default: return 'text-on-surface-variant bg-surface-container-high';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto min-h-[calc(100vh-4rem)]">
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">Sensor Calibration & Testing</h2>
          <p className="text-base text-on-surface-variant">Loading readings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">Sensor Calibration & Testing</h2>
        <p className="text-base text-on-surface-variant">
          Submit manual readings to Supabase and verify sensor accuracy against thresholds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Testing Form */}
        <div className="lg:col-span-4 bg-surface border border-outline-variant p-6 rounded-xl h-fit">
          <h3 className="text-xl font-semibold text-primary mb-6 border-b border-outline-variant/30 pb-2">
            Submit Manual Reading
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Sector 12 Yard"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
                  Temp ({THRESHOLDS.temperature.unit})
                </label>
                <input
                  type="number" step="0.1" name="temperature"
                  value={formData.temperature} onChange={handleInputChange}
                  placeholder={`< ${THRESHOLDS.temperature.warning}`}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">
                  Smoke ({THRESHOLDS.smoke.unit})
                </label>
                <input
                  type="number" step="1" name="smoke"
                  value={formData.smoke} onChange={handleInputChange}
                  placeholder={`< ${THRESHOLDS.smoke.warning}`}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Submit result feedback */}
            {submitResult && (
              <div className={`p-3 rounded text-sm font-medium ${
                submitResult.success
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-error-container text-on-error-container'
              }`}>
                {submitResult.success ? '✓ Reading submitted to Supabase!' : `✗ ${submitResult.error}`}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary py-2.5 rounded font-semibold text-sm hover:bg-surface-tint transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Submitting…
                </>
              ) : (
                'Submit to Supabase'
              )}
            </button>
          </form>

          {/* Reference Info */}
          <div className="mt-6 p-4 bg-surface-container-low rounded border border-outline-variant/50">
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Threshold Reference</h4>
            <ul className="text-xs space-y-1.5 text-on-surface">
              <li><span className="font-semibold w-16 inline-block">Temp:</span> Warn &ge; {THRESHOLDS.temperature.warning}°C, Crit &ge; {THRESHOLDS.temperature.critical}°C</li>
              <li><span className="font-semibold w-16 inline-block">Smoke:</span> Warn &ge; {THRESHOLDS.smoke.warning}, Crit &ge; {THRESHOLDS.smoke.critical}</li>
            </ul>
            <p className="text-[10px] text-on-surface-variant mt-3">
              ESP32 firmware thresholds: TEMP_LIMIT = 60°C, SMOKE_LIMIT = 850
            </p>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-primary">All Readings (from Supabase)</h3>
            <span className="text-xs text-on-surface-variant">{evaluatedReadings.length} of {readings.length}</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Time / Location</th>
                  <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Metrics</th>
                  <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {evaluatedReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 px-6 align-top">
                      <div className="font-semibold text-sm text-primary">{reading.location || 'Unknown'}</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {new Date(reading.created_at).toLocaleString()}
                      </div>
                      <div className={`text-[10px] font-bold tracking-wider uppercase mt-1 ${
                        reading.status === 'ALERT' ? 'text-error' : 'text-green-600'
                      }`}>
                        ESP32: {reading.status}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-w-[250px]">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant font-medium">Temp:</span>
                          <span className={`font-semibold px-1.5 rounded ${getStatusColor(reading.results.temperature)}`}>
                            {reading.temperature}°C
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-on-surface-variant font-medium">Smoke:</span>
                          <span className={`font-semibold px-1.5 rounded ${getStatusColor(reading.results.smoke)}`}>
                            {reading.smoke}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-center align-middle">
                      <span className={`inline-block px-3 py-1 rounded text-[11px] font-bold tracking-widest uppercase ${getStatusColor(reading.overall)}`}>
                        {reading.overall}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {evaluatedReadings.length === 0 && (
              <div className="py-8 text-center text-sm text-on-surface-variant">
                No readings in database yet. Waiting for ESP32 or manual input…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
