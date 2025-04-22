import { useState, useEffect } from 'react';
import { 
  BookHeart, Plus, Send, Edit2, Trash2, X, Calendar, Clock, Tag, 
  Smile, Meh, Frown, Zap, Music, Cloud, Coffee, AlertTriangle, 
  Sun, Moon
} from 'lucide-react';
import JournalService from '../../../services/JournalService';
import { useEmojiAnimation } from '../../EmojiAnimationContext';
import './Journal.css';

// Mood configurations matching the Dashboard moodTrendConfig
const moodConfig = {
  'excited': { 
    label: 'Excited',
    colorClass: 'mood-excited',
    icon: <Sun size={18} strokeWidth={2} className="mood-icon" />
  },
  'happy': { 
    label: 'Positive', 
    colorClass: 'mood-happy',
    icon: <Smile size={18} strokeWidth={2} className="mood-icon" />
  },
  'content': { 
    label: 'Content', 
    colorClass: 'mood-content',
    icon: <Music size={18} strokeWidth={2} className="mood-icon" />
  },
  'neutral': { 
    label: 'Neutral', 
    colorClass: 'mood-neutral',
    icon: <Meh size={18} strokeWidth={2} className="mood-icon" />
  },
  'fluctuating': { 
    label: 'Fluctuating', 
    colorClass: 'mood-fluctuating',
    icon: <Cloud size={18} strokeWidth={2} className="mood-icon" />
  },
  'anxious': { 
    label: 'Anxious', 
    colorClass: 'mood-anxious',
    icon: <AlertTriangle size={18} strokeWidth={2} className="mood-icon" />
  },
  'tired': { 
    label: 'Tired', 
    colorClass: 'mood-tired',
    icon: <Coffee size={18} strokeWidth={2} className="mood-icon" />
  },
  'sad': { 
    label: 'Sad', 
    colorClass: 'mood-sad',
    icon: <Frown size={18} strokeWidth={2} className="mood-icon" />
  },
  'angry': { 
    label: 'Angry', 
    colorClass: 'mood-angry',
    icon: <Zap size={18} strokeWidth={2} className="mood-icon" />
  }
};

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const isAuthenticated = true;
  const journalService = new JournalService();
  const { applyTheme } = useEmojiAnimation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
      applyTheme('calm');
    }
  }, [isAuthenticated]);

  const fetchEntries = async () => {
    try {
      const response = await journalService.read();
      setEntries(response.data);
    } catch (err) {
      setError('Failed to load journal entries');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please sign in to save your journal entries');
      return;
    }

    if (!newEntry.title || !newEntry.content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (editingEntry) {
        await journalService.update({
          _id: editingEntry._id,
          title: newEntry.title,
          content: newEntry.content,
          mood: newEntry.mood,
          tags: newEntry.tags,
        });
      } else {
        await journalService.create({
          title: newEntry.title,
          content: newEntry.content,
          mood: newEntry.mood,
          tags: newEntry.tags,
          date: new Date(),
        });
      }

      setIsWriting(false);
      setEditingEntry(null);
      setNewEntry({ title: '', content: '', mood: 'neutral', tags: [] });
      fetchEntries();
    } catch (err) {
      setError('Failed to save journal entry');
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!newEntry.tags.includes(newTag.trim())) {
        setNewEntry({
          ...newEntry,
          tags: [...newEntry.tags, newTag.trim()],
        });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const getMoodIcon = (mood) => {
    const config = moodConfig[mood] || moodConfig.neutral;
    return config.icon;
  };

  const getMoodColorClass = (mood) => {
    const config = moodConfig[mood] || moodConfig.neutral;
    return config.colorClass;
  };

  const handleEdit = (entry) => {
    if (!isAuthenticated) {
      setError('Please sign in to edit journal entries');
      return;
    }
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
    });
    setIsWriting(true);
  };

  const handleDelete = async (entry) => {
    if (!isAuthenticated) {
      setError('Please sign in to delete journal entries');
      return;
    }
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await journalService.delete(entry);
        fetchEntries();
      } catch (err) {
        setError('Failed to delete journal entry');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="journal-container">
      <div className="journal-header">
        <div>
          <h1 className="journal-title">Journal</h1>
          <p className="journal-subtitle">A safe space for your thoughts and feelings</p>
        </div>
        {!isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="new-entry-button"
          >
            <Plus className="button-icon" />
            New Entry
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-error">
            <X className="icon-sm" />
          </button>
        </div>
      )}

      {isWriting ? (
        <div className="journal-editor">
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                className="form-input"
                placeholder="Give your entry a title..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Mood
              </label>
                <div className="mood-selector">
                {Object.keys(moodConfig).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setNewEntry({ ...newEntry, mood })}
                    className={`mood-button ${
                      newEntry.mood === mood ? 'selected' : ''
                    } ${getMoodColorClass(mood)}`}
                    title={moodConfig[mood].label}
                  >
                    <div className={`mood-circle-icon ${getMoodColorClass(mood)}`}>
                      {getMoodIcon(mood)}
                    </div>
                    <span className="mood-label">{moodConfig[mood].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Tags
              </label>
              <div className="tags-container">
                {newEntry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag"
                  >
                    <Tag className="icon-xs" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                    >
                      <X className="icon-xs" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="form-input"
                placeholder="Add tags (press Enter to add)..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Content
              </label>
              <textarea
                id="content"
                rows={8}
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                className="form-textarea"
                placeholder="Write your thoughts here..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setIsWriting(false);
                  setEditingEntry(null);
                  setNewEntry({ title: '', content: '', mood: 'neutral', tags: [] });
                }}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
              >
                <Send className="button-icon" />
                {editingEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : entries.length === 0 ? (
        <div className="empty-journal">
          <BookHeart className="empty-icon" />
          <h3 className="empty-title">Your Journal Awaits</h3>
          <p className="empty-subtitle">Start writing your first entry to begin your journey</p>
          <button
            onClick={() => setIsWriting(true)}
            className="start-writing-button"
          >
            <Plus className="button-icon" />
            Write First Entry
          </button>
        </div>
      ) : (
        <div className="entries-grid">
          {entries.slice(0).reverse().map((entry) => (
            <div key={entry._id.$oid} className={`entry-card ${getMoodColorClass(entry.mood)}-border`}>
              <div className="entry-content">
                <div className="entry-header">
                  <div className="entry-title-container">
                    <div className={`mood-emoji-circle ${getMoodColorClass(entry.mood)}`}>
                      {getMoodIcon(entry.mood)}
                    </div>
                    <h3 className="entry-title">{entry.title}</h3>
                  </div>
                  <div className="entry-actions">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="edit-button"
                    >
                      <Edit2 className="icon-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="delete-button"
                    >
                      <Trash2 className="icon-sm" />
                    </button>
                  </div>
                </div>
                
                <div className="entry-tags">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-small"
                    >
                      <Tag className="icon-xs" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="entry-date">
                  <div className="date-item">
                    <Calendar className="icon-xs" />
                    <span>{formatDate(entry.date)}</span>
                  </div>
                  <div className="date-item">
                    <Clock className="icon-xs" />
                    <span>{formatTime(entry.date)}</span>
                  </div>
                </div>
                
                <div className="entry-body">
                  <p className="entry-text">
                    {entry.content}
                  </p>
                </div>
                
                {entry.content.length > 300 && (
                  <button 
                    onClick={() => handleEdit(entry)}
                    className="read-more"
                  >
                    Read more
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Journal;