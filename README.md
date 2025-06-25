# Pack-App - Digitale Umzugsplanung

Eine Web-App für die digitale Umzugsplanung, die es Kunden ermöglicht, Umzüge selbstständig zu planen und detaillierte Umzugsgutlisten zu erstellen.

## Features

- **Umzug anlegen**: Neue Umzüge erstellen und verwalten
- **Raumverwaltung**: Räume hinzufügen, bearbeiten und löschen
- **Möbel- und Inventarverwaltung**: Möbelstücke mit Maßen und Gewicht erfassen
- **Zusätzliche Services**: Verpackungsmaterial und Zusatzleistungen verwalten
- **Volumenberechnung**: Automatische Berechnung des Gesamtvolumens
- **Kostenvoranschlag**: Detaillierte Kostenaufstellung mit Transport- und Materialkosten
- **Datenpersistenz**: Sichere Speicherung aller Daten in SQLite-Datenbank
- **Mehrbenutzerzugriff**: JWT-basierte Authentifizierung
- **Export-Funktionen**: PDF-Export von Umzugslisten und Kostenvoranschlägen

## Technologie-Stack

- **Frontend**: React mit TypeScript, Tailwind CSS
- **Backend**: Node.js mit Express
- **Datenbank**: SQLite
- **Authentifizierung**: JWT (JSON Web Tokens)

## Installation und Setup

### Voraussetzungen

- Node.js (Version 16 oder höher)
- npm (wird mit Node.js installiert)

### Schnellstart

1. **Repository klonen**:
   ```bash
   git clone <repository-url>
   cd pack-app
   ```

2. **Automatisches Setup ausführen**:
   
   **Windows (PowerShell)**:
   ```powershell
   .\setup.ps1
   ```
   
   **Windows (Command Prompt)**:
   ```cmd
   setup.bat
   ```
   
   **Manuell**:
   ```bash
   # Server-Abhängigkeiten installieren
   cd server
   npm install
   cd ..
   
   # Client-Abhängigkeiten installieren
   cd client
   npm install
   cd ..
   ```

### Anwendung starten

1. **Server starten** (Terminal 1):
   ```bash
   cd server
   npm start
   ```
   Der Server läuft dann auf `http://localhost:3001`

2. **Client starten** (Terminal 2):
   ```bash
   cd client
   npm start
   ```
   Die Anwendung öffnet sich automatisch im Browser auf `http://localhost:3000`

## Projektstruktur

```
pack-app/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React-Komponenten
│   │   │   ├── Auth/       # Authentifizierung
│   │   │   ├── Moves/      # Umzugsverwaltung
│   │   │   ├── Rooms/      # Raumverwaltung
│   │   │   ├── Furniture/  # Möbelverwaltung
│   │   │   └── Services/   # Service- und Materialverwaltung
│   │   └── App.tsx         # Haupt-App-Komponente
│   └── package.json
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── routes/         # API-Routen
│   │   ├── database/       # Datenbankinitialisierung
│   │   └── index.ts        # Server-Einstiegspunkt
│   └── package.json
├── setup.bat              # Windows Setup-Skript
├── setup.ps1              # PowerShell Setup-Skript
└── README.md
```

## API-Endpunkte

### Authentifizierung
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Benutzer anmelden

### Umzüge
- `GET /api/moves` - Alle Umzüge abrufen
- `POST /api/moves` - Neuen Umzug erstellen
- `PUT /api/moves/:id` - Umzug bearbeiten
- `DELETE /api/moves/:id` - Umzug löschen

### Räume
- `GET /api/rooms/:moveId` - Räume eines Umzugs abrufen
- `POST /api/rooms` - Neuen Raum erstellen
- `PUT /api/rooms/:id` - Raum bearbeiten
- `DELETE /api/rooms/:id` - Raum löschen

### Möbel
- `GET /api/furniture/:roomId` - Möbel eines Raums abrufen
- `POST /api/furniture` - Neues Möbelstück erstellen
- `PUT /api/furniture/:id` - Möbelstück bearbeiten
- `DELETE /api/furniture/:id` - Möbelstück löschen

### Services
- `GET /api/services/:moveId` - Services eines Umzugs abrufen
- `POST /api/services` - Neuen Service erstellen
- `PUT /api/services/:id` - Service bearbeiten
- `DELETE /api/services/:id` - Service löschen

## Entwicklung

### Datenbank zurücksetzen
```bash
cd server
npm run reset-db
```

### Tests ausführen
```bash
# Frontend-Tests
cd client
npm test

# Backend-Tests
cd server
npm test
```

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

## Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository. 