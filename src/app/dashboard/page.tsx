'use client';
import { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

const TOOLS = [
  { id: 'email', name: 'E-Mail Verbesserer', icon: '✉️', placeholder: 'Füge deine E-Mail hier ein...' },
  { id: 'text', name: 'Text Optimierer', icon: '✏️', placeholder: 'Füge deinen Text hier ein...' },
  { id: 'summary', name: 'Zusammenfassung', icon: '📋', placeholder: 'Füge den Text ein, der zusammengefasst werden soll...' },
];

export default function DashboardPage() {
  const { user } = useUser();
  const [activeTool, setActiveTool] = useState('email');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const currentTool = TOOLS.find(t => t.id === activeTool)!;

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: activeTool, text: input }),
      });
      const data = await res.json();
      if (data.error) {
        setOutput('Fehler: ' + data.error);
      } else {
        setOutput(data.result);
      }
    } catch {
      setOutput('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-700">TextKit KI</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hallo, {user?.firstName}!</span>
          <Link href="/upgrade" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
            Pro upgraden
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Deine KI-Tools</h1>

        {/* Tool Selection */}
        <div className="flex gap-3 mb-6">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setInput(''); setOutput(''); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTool === tool.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {tool.icon} {tool.name}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Eingabe</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={currentTool.placeholder}
              className="w-full h-64 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verarbeite...' : currentTool.name + ' starten'}
            </button>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ergebnis</label>
            <div className="h-64 p-3 border rounded-lg overflow-auto bg-gray-50">
              {loading && <div className="text-gray-500 animate-pulse">KI denkt nach...</div>}
              {output && !loading && <p className="whitespace-pre-wrap text-gray-800">{output}</p>}
              {!output && !loading && <p className="text-gray-400">Das Ergebnis erscheint hier...</p>}
            </div>
            {output && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="mt-3 w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50"
              >
                📋 Kopieren
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
    }
