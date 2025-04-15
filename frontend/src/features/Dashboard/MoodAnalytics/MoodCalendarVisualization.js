import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './MoodCalendarVisualization.css';

// Mood colors configuration
const moodColors = {
  'excited': '#eab308', // yellow
  'happy': '#22c55e',   // green
  'content': '#3b82f6',  // blue
  'neutral': '#64748b',  // gray
  'anxious': '#f97316',  // orange
  'tired': '#8b5cf6',    // purple
  'sad': '#0ea5e9',      // light blue
  'angry': '#ef4444'     // red
};

// Mood emoji mapping
const moodEmojis = {
  'excited': '😃',
  'happy': '😊',
  'content': '😌',
  'neutral': '😐',
  'anxious': '😰',
  'tired': '😴',
  'sad': '😢',
  'angry': '😠'
};

const MoodCalendarVisualization = ({ moodData, onDayClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  
  // Process mood data whenever the data or month changes
  useEffect(() => {
    generateCalendarData();
  }, [moodData, currentMonth]);
  
  // Generate calendar data for the current month
  const generateCalendarData = () => {
    // Get the year and month
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Adjust for starting the week on Monday (0 = Monday, 6 = Sunday)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Create calendar grid with empty cells for days before the first day of month
    const calendarGrid = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarGrid.push({
        day: null,
        mood: null,
        isCurrentMonth: false
      });
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find mood entry for this day
      const dayMoodEntry = moodData.find(entry => entry.date === dateString);
      
      calendarGrid.push({
        day,
        date: dateString,
        mood: dayMoodEntry ? dayMoodEntry.mood : null,
        intensity: dayMoodEntry ? dayMoodEntry.intensity : null,
        isCurrentMonth: true,
        isToday: isToday(date)
      });
    }
    
    // Add empty cells for days after the last day of month to complete the grid
    const remainingCells = 42 - calendarGrid.length; // 6 rows x 7 columns = 42 cells
    for (let i = 0; i < remainingCells; i++) {
      calendarGrid.push({
        day: null,
        mood: null,
        isCurrentMonth: false
      });
    }
    
    setCalendarData(calendarGrid);
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };
  
  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Handle click on a day
  const handleDayClick = (day) => {
    if (day.isCurrentMonth && day.day && onDayClick) {
      onDayClick(day);
    }
  };
  
  // Format the current month and year for display
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Render day cell with mood indicator
  const renderDayCell = (day, index) => {
    if (!day.isCurrentMonth) {
      return <div key={`empty-${index}`} className="calendar-day empty"></div>;
    }
    
    const moodColor = day.mood ? moodColors[day.mood] : 'transparent';
    const moodEmoji = day.mood ? moodEmojis[day.mood] : '';
    const intensityClass = day.intensity ? `intensity-${day.intensity}` : '';
    
    return (
      <div 
        key={day.date || index}
        className={`calendar-day ${day.isToday ? 'today' : ''} ${day.mood ? 'has-mood' : ''} ${intensityClass}`}
        onClick={() => handleDayClick(day)}
        style={{ 
          '--mood-color': moodColor,
          '--mood-color-transparent': `${moodColor}40` // 25% opacity
        }}
      >
        <span className="day-number">{day.day}</span>
        {day.mood && (
          <div className="mood-indicator">
            <span className="mood-emoji">{moodEmoji}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render weekday headers
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="mood-calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <Calendar size={20} />
          <h2>Mood Calendar</h2>
        </div>
        
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
            <ChevronLeft size={20} />
          </button>
          <button className="calendar-today-btn" onClick={goToCurrentMonth}>
            {formatMonthYear(currentMonth)}
          </button>
          <button className="calendar-nav-btn" onClick={goToNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {/* Weekday headers */}
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
        
        {/* Calendar days */}
        {calendarData.map((day, index) => renderDayCell(day, index))}
      </div>
      
      {/* Mood legend */}
      <div className="mood-legend">
        <h3>Mood Legend</h3>
        <div className="legend-items">
          {Object.entries(moodEmojis).map(([mood, emoji]) => (
            <div key={mood} className="legend-item">
              <span 
                className="legend-color-dot" 
                style={{ backgroundColor: moodColors[mood] }}
              ></span>
              <span className="legend-emoji">{emoji}</span>
              <span className="legend-label">{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodCalendarVisualization;