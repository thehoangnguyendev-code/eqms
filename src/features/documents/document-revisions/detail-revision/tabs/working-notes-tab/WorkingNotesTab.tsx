import React, { useState } from "react";
import { StickyNote, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateTime } from "@/utils/format";

interface WorkingNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export const WorkingNotesTab: React.FC = () => {
  const { user } = useAuth();
  const authorName = user ? `${user.firstName} ${user.lastName}`.trim() : "Unknown User";

  const [input, setInput] = useState("");
  const [notes, setNotes] = useState<WorkingNote[]>([]);

  const handleAddNote = () => {
    if (!input.trim()) return;
    const newNote: WorkingNote = {
      id: `note-${Date.now()}`,
      author: authorName,
      timestamp: new Date().toISOString(),
      content: input.trim(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setInput("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAddNote();
    }
  };

  return (
    <div className="space-y-5">
      {/* Input area */}
      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-medium text-slate-700">Working Note</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your working note or comment about this revision... (Ctrl+Enter to submit)"
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"
        />
        <div className="flex items-center justify-start">
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300"
          >
            Add Note
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group relative bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5 transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold text-amber-800">{note.author}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(note.timestamp)}
                </span>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-amber-600 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                  title="Delete note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
