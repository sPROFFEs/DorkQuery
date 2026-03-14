# DorkQuery

DorkQuery is a static web app to build and run search dorks with a visual drag-and-drop workspace.

## What it does

- Build queries with predefined operators (`site:`, `inurl:`, `filetype:`, etc.)
- Create custom reusable blocks stored in LocalStorage
- Explore and import dorks from a local dataset (GHDB + DorkHub)
- Filter explorer results by category, source, and keyword
- Open generated queries directly in Google, Bing, or DuckDuckGo

## Project structure

- `index.html`: App layout and script includes
- `style.css`: UI styles
- `js/`: Frontend logic
  - `main.js`: App bootstrap and search execution
  - `blockManager.js`: Workspace and palette state
  - `dnd.js`: Drag and drop behavior (SortableJS)
  - `ghdbService.js`: Data loading/filtering/pagination
  - `ghdbExplorerUI.js`: Explorer rendering and interactions
  - `customBlock.js`: Custom block form handling
- `data/`: Datasets and parser scripts

## Run locally

Use a local HTTP server (required for `fetch` to load `data/*`).

```bash
python -m http.server 8000
```

Then open:

- `http://localhost:8000`

## Data notes

The app tries to load:

1. `data/unified_dorks.json.gz` (preferred)
2. `data/ghdb_clean.json` (fallback)

If gzip is used, `pako` must be available (loaded from CDN in `index.html`).

## Regenerating datasets

Python scripts in `data/` can refresh and merge sources:

- `data/ghdb_extractor.py`
- `data/dorkhub_parser.py`

They generate files such as:

- `ghdb_clean.json`
- `dorkhub_clean.json(.gz)`
- `unified_dorks.json(.gz)`

## Known limitations

- No automated tests in repository yet
- Large datasets can increase initial load time and memory usage
- Query export/share is not implemented
