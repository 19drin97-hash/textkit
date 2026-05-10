import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-blue-700">TextKit KI</div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">Anmelden</Link>
            <Link href="/sign-up" className="btn-primary">Kostenlos starten</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Professionelle Texte<br />
          <span className="text-blue-600">mit KI erstellen</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          E-Mails verbessern, Texte optimieren, Zusammenfassungen erstellen – alles mit modernster KI-Technologie.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up" className="btn-primary text-lg px-8 py-4">
            Jetzt kostenlos testen
          </Link>
          <Link href="#features" className="btn-secondary text-lg px-8 py-4">
            Mehr erfahren
          </Link>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-24">
          {[
            { icon: '✉️', title: 'E-Mail Verbesserer', desc: 'Professionelle E-Mails in Sekunden' },
            { icon: '✏️', title: 'Text Optimierer', desc: 'Klare und überzeugende Texte' },
            { icon: '📋', title: 'Zusammenfassung', desc: 'Lange Texte kurz zusammengefasst' },
          ].map((f) => (
            <div key={f.title} className="card text-left">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-12">Einfache Preise</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-4">CHF 0<span className="text-sm font-normal">/Monat</span></div>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>✓ 5 Anfragen pro Tag</li>
                <li>✓ Alle Tools</li>
                <li>✓ Keine Kreditkarte nötig</li>
              </ul>
              <Link href="/sign-up" className="btn-secondary w-full block text-center">Kostenlos starten</Link>
            </div>
            <div className="card border-blue-500 border-2">
              <div className="text-blue-600 font-semibold text-sm mb-2">BELIEBT</div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">CHF 9<span className="text-sm font-normal">/Monat</span></div>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>✓ Unbegrenzte Anfragen</li>
                <li>✓ Alle Tools</li>
                <li>✓ Prioritäts-Support</li>
                <li>✓ Früher Zugang zu neuen Features</li>
              </ul>
              <Link href="/sign-up" className="btn-primary w-full block text-center">Pro starten</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-500 text-sm">
        © 2025 TextKit KI · <Link href="/impressum">Impressum</Link> · <Link href="/datenschutz">Datenschutz</Link>
      </footer>
    </div>
  );
          }
