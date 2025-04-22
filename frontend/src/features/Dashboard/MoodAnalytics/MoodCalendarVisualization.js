import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './MoodCalendarVisualization.css';

// Mood colors configuration (matching parent component)
const moodColors = {
  'excited': '#FFD700', // bright gold
  'happy': '#4CAF50',   // bright green
  'content': '#3F51B5',  // bright blue
  'neutral': '#94A3B8',  // light slate
  'anxious': '#FF9800',  // bright orange
  'tired': '#A78BFA',    // bright purple
  'sad': '#2196F3',      // bright sky blue
  'angry': '#F44336'     // bright red
};

// Mood emoji mapping
const moodEmojis = {
  'excited': '😃',
  'happy': '😊',
  'content': '😌',
  'neutral': '😐',
  'anxious': '😰',
  'tired': '😴',
  'sad': '😔',
  'angry': '😠'
};

const MoodCalendarVisualization = ({ onDayClick, timeRange, moodData = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Process mood data into calendar days
  useEffect(() => {
    if (!moodData.length) {
      generateEmptyCalendar();
      return;
    }
    
    generateCalendarWithMoods();
  }, [moodData, currentDate, timeRange]);
  
  // Generate empty calendar
  const generateEmptyCalendar = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    const days = eachDayOfInterval({ start, end }).map(day => ({
      date: day,
      isCurrentMonth: true,
      hasMood: false,
      mood: null,
      intensity: null
    }));
    
    setCalendarDays(days);
  };
  
  // Generate calendar with mood data
  const generateCalendarWithMoods = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    const days = eachDayOfInterval({ start, end }).map(day => {
      const formattedDay = format(day, 'yyyy-MM-dd');
      
      // Find mood entries for this day
      const dayMoods = moodData.filter(entry => {
        // Handle different date formats
        let entryDate;
        
        if (entry.date instanceof Date) {
          entryDate = entry.date;
        } else if (typeof entry.date === 'string') {
          entryDate = parseISO(entry.date);
        } else if (entry.date && entry.date.$date) {
          entryDate = new Date(entry.date.$date);
        } else {
          return false;
        }
        
        return isSameDay(entryDate, day);
      });
      
      if (dayMoods.length === 0) {
        return {
          date: day,
          isCurrentMonth: isSameMonth(day, currentDate),
          hasMood: false,
          mood: null,
          intensity: null
        };
      }
      
      // If multiple moods in a day, use the one with highest intensity
      const primaryMood = dayMoods.reduce((prev, current) => 
        (current.intensity || 0) > (prev.intensity || 0) ? current : prev
      );
      
      return {
        date: day,
        isCurrentMonth: isSameMonth(day, currentDate),
        hasMood: true,
        mood: primaryMood.mood,
        intensity: primaryMood.intensity,
        moodCount: dayMoods.length
      };
    });
    
    setCalendarDays(days);
  };
  
  // Handle navigation to previous month
  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Handle navigation to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Handle day click from calendar
  const handleDayClick = (day) => {
    if (day.hasMood && onDayClick) {
      onDayClick(day);
    }
  };
  
  // Generate weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="mood-calendar">
      <div className="calendar-header">
        <div className="month-navigation">
          <button 
            className="nav-button"
            onClick={previousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="current-month">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          <button 
            className="nav-button"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="weekdays">
        {weekdays.map((day, index) => (
          <div key={index} className="weekday">
            {day}
          </div>
        ))}
      </div>
      
      <div className="days-grid">
        {calendarDays.map((day, index) => {
          // Calculate the starting offset for the first week
          const startOffset = new Date(day.date.getFullYear(), day.date.getMonth(), 1).getDay();
          
          // Add empty cells for days before the 1st of the month
          if (index === 0) {
            const emptyCells = [];
            for (let i = 0; i < startOffset; i++) {
              emptyCells.push(
                <div key={`empty-${i}`} className="calendar-day other-month"></div>
              );
            }
            return [
              ...emptyCells,
              <div
                key={index}
                className={`calendar-day 
                  ${!day.isCurrentMonth ? 'other-month' : ''} 
                  ${day.hasMood ? 'has-mood' : ''}
                  ${isToday(day.date) ? 'today' : ''}
                `}
                style={day.hasMood ? { backgroundColor: moodColors[day.mood] } : {}}
                onClick={() => handleDayClick(day)}
              >
                <div className="day-number">
                  {format(day.date, 'd')}
                </div>
                {day.hasMood && (
                  <div className="mood-indicator">
                    {moodEmojis[day.mood]}
                  </div>
                )}
                {day.hasMood && day.moodCount > 1 && (
                  <div className="mood-details">
                    +{day.moodCount - 1}
                  </div>
                )}
              </div>
            ];
          }
          
          return (
            <div
              key={index}
              className={`calendar-day 
                ${!day.isCurrentMonth ? 'other-month' : ''} 
                ${day.hasMood ? 'has-mood' : ''}
                ${isToday(day.date) ? 'today' : ''}
              `}
              style={day.hasMood ? { backgroundColor: moodColors[day.mood] } : {}}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-number">
                {format(day.date, 'd')}
              </div>
              {day.hasMood && (
                <div className="mood-indicator">
                  {moodEmojis[day.mood]}
                </div>
              )}
              {day.hasMood && day.moodCount > 1 && (
                <div className="mood-details">
                  +{day.moodCount - 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {moodData.length === 0 && (
        <div className="no-moods-message">
          No mood data available for this time period.
        </div>
      )}
      
      <div className="mood-legend">
        {Object.keys(moodColors).map((mood, index) => (
          <div key={index} className="legend-item">
            <div 
              className="color-box" 
              style={{ backgroundColor: moodColors[mood] }}
            ></div>
            <span>{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodCalendarVisualization;