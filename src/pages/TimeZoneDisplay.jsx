import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const TimeZoneDisplay = () => {
  const [inputTime, setInputTime] = useState('12:00');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceTimezone, setSourceTimezone] = useState('America/New_York');
  const [comparisonZones, setComparisonZones] = useState([
    'Europe/London',
    'Asia/Tokyo',
    'Asia/Shanghai'
  ]);

  const allTimezones = [
    // GMT Offsets
    { value: 'Etc/GMT+12', label: 'GMT-12 (Baker Island)' },
    { value: 'Etc/GMT+11', label: 'GMT-11 (American Samoa)' },
    { value: 'Etc/GMT+10', label: 'GMT-10 (Hawaii)' },
    { value: 'Etc/GMT+9', label: 'GMT-9 (Alaska)' },
    { value: 'Etc/GMT+8', label: 'GMT-8 (PST)' },
    { value: 'Etc/GMT+7', label: 'GMT-7 (MST)' },
    { value: 'Etc/GMT+6', label: 'GMT-6 (CST)' },
    { value: 'Etc/GMT+5', label: 'GMT-5 (EST)' },
    { value: 'Etc/GMT+4', label: 'GMT-4 (AST)' },
    { value: 'Etc/GMT+3', label: 'GMT-3 (Argentina)' },
    { value: 'Etc/GMT+2', label: 'GMT-2 (Mid-Atlantic)' },
    { value: 'Etc/GMT+1', label: 'GMT-1 (Azores)' },
    { value: 'Etc/GMT', label: 'GMT+0 (London)' },
    { value: 'Etc/GMT-1', label: 'GMT+1 (Berlin)' },
    { value: 'Etc/GMT-2', label: 'GMT+2 (Cairo)' },
    { value: 'Etc/GMT-3', label: 'GMT+3 (Moscow)' },
    { value: 'Etc/GMT-4', label: 'GMT+4 (Dubai)' },
    { value: 'Etc/GMT-5', label: 'GMT+5 (Karachi)' },
    { value: 'Etc/GMT-6', label: 'GMT+6 (Dhaka)' },
    { value: 'Etc/GMT-7', label: 'GMT+7 (Bangkok)' },
    { value: 'Etc/GMT-8', label: 'GMT+8 (Singapore)' },
    { value: 'Etc/GMT-9', label: 'GMT+9 (Tokyo)' },
    { value: 'Etc/GMT-10', label: 'GMT+10 (Sydney)' },
    { value: 'Etc/GMT-11', label: 'GMT+11 (Noumea)' },
    { value: 'Etc/GMT-12', label: 'GMT+12 (Auckland)' },
    
    // Major Cities
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' }
  ];

  const convertInputTime = (targetTimezone) => {
    if (!inputTime || !inputDate) return 'Invalid input';

    try {
      const [hours, minutes] = inputTime.split(':');
      const sourceDate = new Date(`${inputDate}T${hours}:${minutes}:00`);
      
      const sourceTime = new Date(sourceDate.toLocaleString('en-US', {timeZone: sourceTimezone}));
      const localTime = new Date(sourceDate.toLocaleString('en-US'));
      const offset = localTime.getTime() - sourceTime.getTime();
      const adjustedTime = new Date(sourceDate.getTime() + offset);

      return new Intl.DateTimeFormat('en-US', {
        timeZone: targetTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(adjustedTime);
    } catch (error) {
      console.error('Timezone conversion error:', error);
      return 'Error converting';
    }
  };

  const getTimezoneLabel = (timezone) => {
    const tz = allTimezones.find(t => t.value === timezone);
    return tz ? tz.label : timezone;
  };

  const addComparisonZone = () => {
    if (comparisonZones.length < 8) {
      setComparisonZones([...comparisonZones, 'Europe/Berlin']);
    }
  };

  const removeComparisonZone = (index) => {
    if (comparisonZones.length > 1) {
      setComparisonZones(comparisonZones.filter((_, i) => i !== index));
    }
  };

  const updateComparisonZone = (index, value) => {
    const newZones = [...comparisonZones];
    newZones[index] = value;
    setComparisonZones(newZones);
  };

  return (
    <div className="timezone-container">
      {/* Time Zone Converter */}
      <div className="timezone-section">
        <h1 className="timezone-title">Time Zone Converter</h1>

        {/* Input Controls */}
        <div className="converter-controls">
          <div className="converter-field">
            <label className="converter-label">Date</label>
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="converter-input"
            />
          </div>

          <div className="converter-field">
            <label className="converter-label">Time (24h format)</label>
            <input
              type="time"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              className="converter-input"
            />
          </div>
          
          <div className="converter-field">
            <label className="converter-label">Source Timezone</label>
            <select
              value={sourceTimezone}
              onChange={(e) => setSourceTimezone(e.target.value)}
              className="converter-select"
            >
              {allTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversion Results */}
        <div>
          <div className="converter-results-header">
            <h3 className="converter-results-title">Converted Times:</h3>
            <button
              onClick={addComparisonZone}
              disabled={comparisonZones.length >= 8}
              className="add-zone-btn"
            >
              <Plus size={14} /> Add Zone
            </button>
          </div>

          {/* Source Time Display */}
          <div className="source-time-display">
            <div className="source-time-label">
              {getTimezoneLabel(sourceTimezone)} (Source)
            </div>
            <div className="source-time-value">
              {inputDate} {inputTime}
            </div>
          </div>

          {/* Comparison Times */}
          {comparisonZones.map((timezone, index) => (
            <div key={index} className="comparison-time-item">
              <div className="comparison-time-content">
                <div className="comparison-time-info">
                  <select
                    value={timezone}
                    onChange={(e) => updateComparisonZone(index, e.target.value)}
                    className="comparison-time-select"
                  >
                    {allTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                  <div className="comparison-time-value">
                    {convertInputTime(timezone)}
                  </div>
                </div>
                
                {comparisonZones.length > 1 && (
                  <button
                    onClick={() => removeComparisonZone(index)}
                    className="remove-zone-btn"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeZoneDisplay;