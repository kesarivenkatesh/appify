import { useState, useEffect } from 'react';
import { BookHeart, Plus, Send, Edit2, Trash2, X, Calendar, Clock, Tag, Smile, Meh, Frown } from 'lucide-react';
import JournalService from '../../../services/JournalService';


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

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
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
    switch (mood) {
      case 'happy':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'neutral':
        return <Meh className="h-5 w-5 text-yellow-500" />;
      case 'sad':
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-yellow-500" />;
    }
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
    <div className="max-w-6xl mx-auto px-4 ">
      <div className="flex justify-between items-center mb-8 pt-14">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal</h1>
          <p className="text-gray-600">A safe space for your thoughts and feelings</p>
        </div>
        {!isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            New Entry
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-500">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {isWriting ? (
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-auto max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Give your entry a title..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood
              </label>
              <div className="flex gap-4">
                {['happy', 'neutral', 'sad'].map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setNewEntry({ ...newEntry, mood })}
                    className={`p-3 rounded-lg flex items-center gap-2 ${
                      newEntry.mood === mood
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {getMoodIcon(mood)}
                    <span className="capitalize">{mood}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newEntry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-full"
                  >
                    <Tag className="h-4 w-4" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-purple-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add tags (press Enter to add)..."
              />
            </div>

            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                rows={8}
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Write your thoughts here..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsWriting(false);
                  setEditingEntry(null);
                  setNewEntry({ title: '', content: '', mood: 'neutral', tags: [] });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                <Send className="h-5 w-5" />
                {editingEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) :  entries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm max-w-3xl mx-auto">
          <BookHeart className="h-16 w-16 text-purple-200 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your Journal Awaits</h3>
          <p className="text-gray-600 mb-8">Start writing your first entry to begin your journey</p>
          <button
            onClick={() => setIsWriting(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Write First Entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 max-h-[80vh] overflow-y-auto whitespace-nowrap md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {entries.slice(0).reverse().map((entry) => (
            <div key={entry._id.$oid} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-auto h-full flex flex-col">
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getMoodIcon(entry.mood)}
                    <h3 className="text-xl font-semibold text-gray-900">{entry.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(entry.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(entry.date)}</span>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <p className="text-gray-600 whitespace-pre-wrap line-clamp-6">
                    {entry.content}
                  </p>
                </div>
                
                {entry.content.length > 300 && (
                  <button 
                    onClick={() => handleEdit(entry)}
                    className="text-purple-600 hover:text-purple-800 text-sm mt-4 self-start"
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