# CLAUDE.md - Development Guide for CommandPalette Plugin

This document contains the conventions, coding styles, and best practices for developing FacturaScripts plugins.

## Plugin Structure

```
CommandPalette/
├── Assets/
│   ├── CSS/
│   │   └── CommandPalette.css
│   └── JS/
│       └── CommandPalette.js
├── Extension/
│   └── View/
│       └── MenuTemplate_JsFooter_100.html.twig
├── Translation/
│   ├── en_EN.json
│   └── es_ES.json
├── Test/
│   └── main/
│       └── InitTest.php
├── Init.php
├── README.md
├── QUICKSTART.md
├── LICENSE
└── facturascripts.ini
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `Init` |
| Methods | camelCase | `init()` |
| Properties | camelCase | `$initialized` |
| Constants | UPPER_SNAKE_CASE | `const MAX_ITEMS = 50` |
| PHP Files | PascalCase.php | `Init.php` |
| Translation Keys | kebab-case | `command-palette` |

### Namespaces

```php
// Main plugin namespace
namespace FacturaScripts\Plugins\CommandPalette;
```

## PHP Coding Style (PSR-12)

### Basic Rules

- **Indentation:** 4 spaces (NOT tabs)
- **Max line length:** 120 characters
- **Arrays:** Short syntax `[]`, NOT `array()`
- **Strings:** Single quotes preferred
- **Trailing comma:** In multiline arrays

### Init.php Example

```php
<?php
/**
 * This file is part of CommandPalette plugin for FacturaScripts
 * Copyright (C) 2026 Ernesto Serrano <info@ernesto.es>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

namespace FacturaScripts\Plugins\CommandPalette;

use FacturaScripts\Core\Template\InitClass;

/**
 * Plugin initialization class.
 * JavaScript is loaded via Extension/View/MenuTemplate_JsFooter_100.html.twig
 */
class Init extends InitClass
{
    public function init(): void
    {
        // JS loaded via Extension/View template
    }

    public function update(): void
    {
    }

    public function uninstall(): void
    {
    }
}
```

### Extension/View Template

To load JavaScript globally, use Extension/View templates with naming pattern:
`{ParentTemplate}_{Position}_{Order}.html.twig`

Example: `Extension/View/MenuTemplate_JsFooter_100.html.twig`
```twig
<link rel="stylesheet" href="{{ asset('Plugins/CommandPalette/Assets/CSS/CommandPalette.css') }}">
<script src="{{ asset('Plugins/CommandPalette/Assets/JS/CommandPalette.js') }}"></script>
```

Available positions for MenuTemplate:
- `HeadFirst`, `CssBefore`, `CssAfter`, `JsHeadBefore`, `JsHeadAfter`, `HeadEnd`
- `BodyFirst`, `JsFooter`, `BodyEnd`

## JavaScript

### Recommended Structure

```javascript
/**
 * This file is part of CommandPalette plugin for FacturaScripts
 * Copyright (C) 2026 Ernesto Serrano <info@ernesto.es>
 */

(() => {
    'use strict';

    const CommandPalette = {
        init: function () {
            this.createModal();
            this.bindEvents();
        },

        open: function () {
            // Open palette
        },

        close: function () {
            // Close palette
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CommandPalette.init());
    } else {
        CommandPalette.init();
    }
})();
```

## Translations

### JSON Format

```json
{
    "command-palette-placeholder": "Type a command or search...",
    "quick-search": "Quick search..."
}
```

### Usage in PHP

```php
Tools::lang()->trans('command-palette-placeholder')
```

### Usage in JavaScript

```javascript
commandPaletteTranslations['command-palette-placeholder']
```

## Useful Commands

```bash
# Check code style
make lint

# Fix code style automatically
make format

# Check JavaScript code style
make lint-js

# Fix JavaScript code style
make format-js

# Run tests
make test
```

## References

- **FacturaScripts Core:** `./facturascripts/Core/`
- **Official Documentation:** https://facturascripts.com/documentacion
