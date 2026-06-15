# Guitar Scale Trainer

![Demo](assets/demo.gif)

An interactive fretboard tool for learning and visualising guitar scales and chords using the CAGED system. Built with vanilla HTML, CSS, and JavaScript — no dependencies, no build step.

## Features

- Major and natural minor scales across all 12 keys
- 5 CAGED system box positions per scale (selectable, stackable)
- Pentatonic overlay (major or minor depending on selected scale)
- Three display modes: note names, scale degrees (1–7), or both
- Full-fretboard view by default; click positions to isolate box patterns
- Chord finder with SVG diagrams for every key: major, minor, dom7, maj7, m7, 9th, m9, dim, dim7, m7b5, sus2, sus4

## How to use

### Scales

1. **Pick a key** — click any of the 12 key buttons at the top
2. **Pick a scale** — toggle between Major and Minor
3. **Explore the fretboard** — all scale notes are shown by default; the info card lists the notes of the scale
4. **Focus on a box pattern** — click one or more CAGED position buttons (A Shape, G Shape, …) to highlight specific boxes; non-selected notes dim out
5. **Overlay the pentatonic** — click the Pentatonic button to highlight the 5-note pentatonic subset in green (bright green = root)
6. **Change the label** — switch between Notes, Intervals, and Both using the display buttons

### Chords

1. **Open the Chords tab** — click the Chords button in the navigation
2. **Search for a chord** — type a chord name (e.g. `Am9`, `Cdim7`, `Fmaj7`) and select from the suggestions
3. **Browse the diagrams** — open-position shapes appear first, followed by moveable barre shapes, triads, and 4-string voicings

## Installation

### Quickstart — Docker pull

```bash
docker run -d -p 8080:80 ghcr.io/nfonteyne/guitar-scale:latest
```

Open [http://localhost:8080](http://localhost:8080).

### Quickstart — Docker Compose

Create a `docker-compose.yml`:

```yaml
services:
  guitar-scale:
    image: ghcr.io/nfonteyne/guitar-scale:latest
    container_name: guitar-scale
    ports:
      - 8080:80
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080). Change `8080` to use a different port.

### Build from source

```bash
git clone https://github.com/nfonteyne/guitar-scale.git
cd guitar-scale
docker compose up -d
```

### Local development server

Requires Node.js.

```bash
npx serve .
```

Open the URL printed in the terminal (usually [http://localhost:3000](http://localhost:3000)).

## Running tests

```bash
npm test
```
