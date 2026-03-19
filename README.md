# Cron Expression Generator

Build cron expressions visually from 5-field inputs with human-readable description and next-run preview, entirely in the browser.

**Live Demo:** https://file-converter-free.com/en/developer-tools/cron-generator-online

## How It Works

The five cron fields (minute, hour, day-of-month, month, day-of-week) are assembled by `getExpression()` into a space-separated string. `describe(expr)` checks for 6 common exact-match patterns first (e.g., `0 0 * * *` = "Every day at midnight"), then builds a natural-language description from the individual field values. `parsePart(val, min, max)` expands each field into a concrete set of integers supporting all standard cron notations: `*`, `*/step`, `N-M` ranges, and `a,b,c` lists. `nextRuns(expr, count)` simulates forward minute-by-minute from now (capped at 50,000 iterations) applying the expanded sets for month, day-of-week/day-of-month (union logic when both are non-`*`), hour, and minute, collecting the next 5 firing times. Preset buttons populate all 5 field inputs via `data-expr` attributes.

## Features

- 5-field cron input (minute, hour, DOM, month, DOW)
- Human-readable description of the expression
- Next 5 scheduled run times displayed
- Preset buttons for common patterns
- Copy expression to clipboard

## Browser APIs Used

- Clipboard API (`navigator.clipboard.writeText`)

## Code Structure

| File | Description |
|------|-------------|
| `cron-generator.js` | `getExpression` assembler, `describe` natural-language converter, `parsePart` field expander (`*`/step/range/list), `nextRuns` forward-simulation (5 runs, 50k limit), preset buttons |

## Usage

| Element ID / Selector | Purpose |
|----------------------|---------|
| `#crgMinute` | Minute field input |
| `#crgHour` | Hour field input |
| `#crgDom` | Day-of-month field input |
| `#crgMonth` | Month field input |
| `#crgDow` | Day-of-week field input |
| `#crgExpression` | Live cron expression display |
| `#crgDescription` | Human-readable description |
| `#crgNextRuns` | List of next 5 run times |
| `#crgCopy` | Copy expression to clipboard |
| `.crg-preset-btn` | Preset buttons (data-expr attribute) |

## License

MIT
