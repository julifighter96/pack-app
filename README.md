# Pack-App - Digitale Umzugsplanung

Eine moderne Web-Anwendung zur digitalen Umzugsplanung mit React/TypeScript im Frontend, Node.js/Express im Backend und SQLite als Datenbank.

## 🚀 Features

- **Umzugserfassung**: Erstellen und verwalten Sie Umzüge mit Kundendaten
- **Raumverwaltung**: Automatische Standard-Räume (Wohnzimmer, Schlafzimmer, Küche, Bad, Flur)
- **Möbel- und Inventarverwaltung**: Detaillierte Erfassung von Möbelstücken mit Maßen und Gewicht
- **Zusatzleistungen**: Verwaltung von Umzugsleistungen und Verpackungsmaterial
- **Volumenberechnung**: Automatische Berechnung des Gesamtvolumens
- **Kostenvoranschlag**: Transparente Preisberechnung basierend auf Volumen und Leistungen
- **Datenpersistenz**: Sichere Speicherung aller Daten in SQLite-Datenbank
- **Mehrbenutzerzugriff**: Authentifizierung und Benutzerverwaltung
- **PDF-Export**: Export von Umzugsdaten (in Entwicklung)

## 🛠️ Technologie-Stack

### Frontend
- **React 18** mit TypeScript
- **Tailwind CSS** für das Styling
- **React Router** für die Navigation
- **Axios** für API-Kommunikation
- **Heroicons** für Icons

### Backend
- **Node.js** mit Express.js
- **TypeScript** für Typsicherheit
- **SQLite** als Datenbank
- **JWT** für Authentifizierung
- **Express Validator** für Eingabevalidierung

## 📦 Installation

### Voraussetzungen
- Node.js (Version 18 oder höher)
- npm oder yarn

### Setup

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd pack-app
   ```

2. **Backend-Dependencies installieren**
   ```bash
   cd server
   npm install
   ```

3. **Frontend-Dependencies installieren**
   ```bash
   cd ../client
   npm install
   ```

4. **Backend kompilieren**
   ```bash
   cd ../server
   npm run build
   ```

## 🚀 Entwicklung starten

### Backend starten
```bash
cd server
npm start
```
Das Backend läuft dann auf `http://localhost:5000`

### Frontend starten
```bash
cd client
npm start
```
Das Frontend läuft dann auf `http://localhost:3000`

### Beide gleichzeitig starten
```bash
# Im Hauptverzeichnis
npm start
```

## 📁 Projektstruktur

```
pack-app/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React Komponenten
│   │   │   ├── Auth/       # Login/Register
│   │   │   ├── Moves/      # Umzugsverwaltung
│   │   │   ├── Rooms/      # Raumverwaltung
│   │   │   ├── Furniture/  # Möbelverwaltung
│   │   │   └── Services/   # Zusatzleistungen
│   │   └── App.tsx         # Hauptkomponente
│   └── package.json
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── routes/         # API-Routen
│   │   ├── database/       # Datenbankinitialisierung
│   │   └── index.ts        # Server-Einstiegspunkt
│   └── package.json
└── README.md
```

## 🔧 API-Endpunkte

### Authentifizierung
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Benutzer anmelden

### Umzüge
- `GET /api/moves` - Alle Umzüge abrufen
- `POST /api/moves` - Neuen Umzug erstellen (mit Standard-Räumen)
- `GET /api/moves/:id` - Umzug abrufen
- `PUT /api/moves/:id` - Umzug aktualisieren
- `DELETE /api/moves/:id` - Umzug löschen
- `POST /api/moves/:id/rooms/standard` - Standard-Räume hinzufügen

### Räume
- `GET /api/rooms/move/:moveId` - Räume eines Umzugs abrufen
- `POST /api/rooms` - Raum erstellen
- `DELETE /api/rooms/:id` - Raum löschen

### Möbel
- `GET /api/furniture/room/:roomId` - Möbel eines Raums abrufen
- `POST /api/furniture` - Möbelstück erstellen
- `PUT /api/furniture/:id` - Möbelstück aktualisieren
- `DELETE /api/furniture/:id` - Möbelstück löschen
- `GET /api/furniture/categories` - Möbelkategorien abrufen

### Services
- `GET /api/services/move/:moveId` - Services eines Umzugs abrufen
- `POST /api/services` - Service erstellen
- `GET /api/services/materials/move/:moveId` - Materialien eines Umzugs abrufen

## 💡 Verwendung

1. **Registrieren/Anmelden**: Erstellen Sie ein Konto oder melden Sie sich an
2. **Umzug erstellen**: Geben Sie Kundendaten und Umzugsdetails ein
3. **Standard-Räume**: Werden automatisch hinzugefügt (Wohnzimmer, Schlafzimmer, Küche, Bad, Flur)
4. **Möbel hinzufügen**: Klicken Sie auf einen Raum und fügen Sie Möbelstücke hinzu
5. **Zusatzleistungen**: Wählen Sie gewünschte Services und Verpackungsmaterial
6. **Kostenübersicht**: Sehen Sie den automatisch berechneten Kostenvoranschlag

## 🔒 Sicherheit

- JWT-basierte Authentifizierung
- Eingabevalidierung auf Backend und Frontend
- SQL-Injection-Schutz durch parametrisierte Queries
- CORS-Konfiguration für sichere Cross-Origin-Requests

## 🚧 Entwicklung

### Backend kompilieren
```bash
cd server
npm run build
```

### Frontend Build
```bash
cd client
npm run build
```

## 📝 Lizenz

Dieses Projekt ist für Bildungs- und Entwicklungszwecke erstellt.

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Committen Sie Ihre Änderungen
4. Pushen Sie zum Branch
5. Erstellen Sie einen Pull Request

## 📞 Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository. 