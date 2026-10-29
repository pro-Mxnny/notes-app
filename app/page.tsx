
'use client';

import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { checkNote } from './actions';

type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
};

export default function Home() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('notes');

      if (savedNotes) {
        setNotes(JSON.parse(savedNotes) as Note[]);
      }
    } catch (error) {
      console.error('Could not load saved notes:', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem('notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Could not save notes:', error);
    }
  }, [notes, loaded]);

  const filteredNotes = notes.filter((note) => {
    const matchesTag = selectedTag
      ? note.tags.includes(selectedTag)
      : true;

    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      note.title.toLowerCase().includes(query) ||
      note.body.toLowerCase().includes(query);

    return matchesTag && matchesSearch;
  });

  async function handleSubmit(formData: FormData) {
    setError('');

    const result = await checkNote(formData);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setNotes((currentNotes) => [result.note, ...currentNotes]);
    setTitle('');
    setBody('');
    setTags('');
  }

  function handleDelete(id: string) {
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== id)
    );
  }

  return (
    <main className="notes-page">
      <header className="page-header">
        <p className="eyebrow">YOUR PERSONAL SPACE</p>
        <h1>Notes<span>.</span></h1>
        <p className="subtitle">
          Your thoughts, ideas and little reminders — all in one place.
        </p>
      </header>

      <section className="note-editor">
        <h2>Write a note</h2>

        <form action={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            placeholder="Give your note a title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <label htmlFor="body">Your note</label>
          <textarea
            id="body"
            name="body"
            placeholder="Start writing your thoughts here..."
            rows={7}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
          />

          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            placeholder="school, ideas, personal"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
          <p className="field-hint">Separate each tag with a comma.</p>

          {error && <p className="error-message">{error}</p>}

          <button type="submit">
            Save note <span>↗</span>
          </button>
        </form>
      </section>

      <section className="notes-section">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>
          <input
            type="search"
            className="search-input"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search notes by title or content"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h2>{selectedTag ? `#${selectedTag}` : 'All notes'}</h2>
          </div>

          <div className="collection-actions">
            {selectedTag && (
              <button
                type="button"
                className="clear-filter"
                onClick={() => setSelectedTag(null)}
              >
                ← All notes
              </button>
            )}

            <span className="note-count">
              {filteredNotes.length}{' '}
              {filteredNotes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✳</span>
            <h3>
              {searchQuery
                ? 'No matching notes'
                : selectedTag
                  ? 'No notes with this tag'
                  : 'Your space is still empty'}
            </h3>
            <p>
              {searchQuery
                ? 'Try a different search term.'
                : selectedTag
                  ? 'Try another tag or return to all notes.'
                  : 'Write your first note above and it will show up here.'}
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <article className="note-card" key={note.id}>
                <h3>{note.title}</h3>

                <div className="note-preview markdown-content">
                  <ReactMarkdown>{note.body}</ReactMarkdown>
                </div>

                <div className="tag-list">
                  {note.tags.map((tag) => (
                    <button
                      type="button"
                      className={`tag ${selectedTag === tag ? 'active' : ''}`}
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="delete-note"
                  onClick={() => handleDelete(note.id)}
                  aria-label={`Delete note: ${note.title}`}
                >
                  Delete ×
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
