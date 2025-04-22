import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval
} from 'date-fns';
import MoodService from '../../../services/MoodService';
import './MoodAnalyticsSummary.css';

const moodValueMap = {
  angry: -2,
  sad: -1,
  anxious: 0,
  tired: 1,
  neutral: 2,
  content: 3,
  happy: 4,
  excited: 5
};

const moodColorMap = {
  angry: '#F44336',
  sad: '#2196F3',
  anxious: '#FF9800',
  tired: '#A78BFA',
  neutral: '#9E9E9E',
  content: '#3F51B5',
  happy: '#4CAF50',
  excited: '#FFD700'
};

const MoodAnalyticsSummary = ({ timeRange = 'month' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [activePeriod, setActivePeriod] = useState('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const service = new MoodService();
        const entries = await service.getAllMoodData(timeRange);
        const processed = entries
          .map(e => ({
            ...e,
            date: e.date ? new Date(e.date) : new Date(),
            moodValue: moodValueMap[e.mood] ?? 2,
            color: moodColorMap[e.mood] || moodColorMap.neutral
          }))
          .filter(e => !isNaN(e.date));
        processed.sort((a, b) => a.date - b.date);
        setMoodData(processed);
      } catch (err) {
        console.error(err);
        setError('Failed to load mood data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const calculateStats = () => {
    const grouped = {};
    const counts = {};
    if (moodData.length === 0) return { timelineData: [], distributionData: [] };

    let intervals = [];
    let dateFormatter = 'yyyy-MM-dd';
    const firstDate = moodData[0].date;
    const lastDate = moodData[moodData.length - 1].date;

    if (activePeriod === 'day') {
      intervals = eachDayOfInterval({ start: firstDate, end: lastDate });
      dateFormatter = 'yyyy-MM-dd';
    } else if (activePeriod === 'week') {
      intervals = eachWeekOfInterval({ start: firstDate, end: lastDate });
      dateFormatter = 'yyyy-ww';
    } else if (activePeriod === 'month') {
      intervals = eachMonthOfInterval({ start: firstDate, end: lastDate });
      dateFormatter = 'yyyy-MM';
    } else if (activePeriod === 'year') {
      intervals = eachYearOfInterval({ start: firstDate, end: lastDate });
      dateFormatter = 'yyyy';
    }

    intervals.forEach(date => {
      const key = format(date, dateFormatter);
      grouped[key] = [];
    });

    moodData.forEach(entry => {
      let key = format(entry.date, dateFormatter);
      grouped[key] = grouped[key] || [];
      grouped[key].push(entry);
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });

    const timelineData = Object.entries(grouped).map(([date, entries]) => {
      const avgMood =
        entries.length > 0 ? entries.reduce((acc, e) => acc + e.moodValue, 0) / entries.length : null;
      return { date, avgMood };
    });

    const distributionData = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: moodColorMap[name] || '#ccc'
    }));

    return { timelineData, distributionData };
  };

  if (loading) return <div className="loading">Loading mood analytics...</div>;
  if (error) return (
    <div className="error">
      <AlertTriangle size={24} /> {error}
    </div>
  );
  if (!moodData.length) return (
    <div className="empty">
      <PlusCircle size={48} />
      <p>No mood entries found. Start tracking to see analytics.</p>
    </div>
  );

  const stats = calculateStats();

  const renderTimelineChart = () => {
    return (
      <div className="chart-section">
        <h3>Mood Timeline ({activePeriod}) <Info size={16} /></h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={stats.timelineData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={d => d} />
            <YAxis domain={[-2, 5]} tickFormatter={v => v} />
            <Tooltip labelFormatter={l => l} />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="avgMood" stroke="#8884d8" fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDistributionChart = () => (
    <div className="chart-section">
      <h3>Mood Distribution ({activePeriod}) <Info size={16} /></h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={stats.distributionData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {stats.distributionData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="mood-analytics-summary">
      <div className="period-toggle">
        {['day','week','month','year'].map(p => (
          <button
            key={p}
            className={p === activePeriod ? 'active' : ''}
            onClick={() => setActivePeriod(p)}
          >{p.charAt(0).toUpperCase() + p.slice(1)}</button>
        ))}
      </div>

      <div className="charts-container">
        {renderTimelineChart()}
        {renderDistributionChart()}
      </div>
    </div>
  );
};

export default MoodAnalyticsSummary;
