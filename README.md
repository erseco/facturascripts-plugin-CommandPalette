# CommandPalette Plugin for FacturaScripts

A FacturaScripts plugin that adds a Command Palette (similar to VS Code, GitHub, or Cloudflare) for quick navigation and actions.

## Features

- **Command Palette**: Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac) to open
- **Quick Search Button**: Visual button in the navbar to open the palette
- **Fuzzy Search**: Find menu items, pages, and actions quickly
- **Quick Create**: Generate "New X" commands for all List controllers
- **Keyboard Navigation**: Use arrow keys, Enter, and Escape
- **Alt+N Shortcut**: Quick shortcut to create new records from any List/Edit page

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Command Palette | `Ctrl+K` | `Cmd+K` |
| Create new record | `Alt+N` | `Option+N` |
| Save | `Alt+S` | `Option+S` |
| Navigate results | `Arrow Up/Down` | `Arrow Up/Down` |
| Select item | `Enter` | `Enter` |
| Close palette | `Escape` | `Escape` |

## Command Categories

The Command Palette automatically discovers and organizes commands into categories:

- **Navigation**: All menu items from the navbar
- **Quick Create**: "New Product", "New Customer", etc. (auto-generated from List controllers)
- **Settings**: EditSettings, AdminPlugins
- **Actions**: Dashboard, MegaSearch

## Screenshots

When you press `Ctrl+K` / `Cmd+K`, a modal appears:

```
+--------------------------------------------------+
| Search icon  Type a command or search...    [ESC] |
+--------------------------------------------------+
| NAVIGATION                                        |
| [icon] Products                        Warehouse  |
| [icon] Customers                          Sales   |
| [icon] Invoices                           Sales   |
|                                                   |
| QUICK CREATE                                      |
| [+] New Product                                   |
| [+] New Customer                                  |
+--------------------------------------------------+
| [Up][Down] to navigate  [Enter] to select  [Esc] |
+--------------------------------------------------+
```

## Requirements

- FacturaScripts 2025 or later
- PHP 8.2+

## Installation

1. Download the latest `CommandPalette-X.zip` from [GitHub Releases](../../releases/latest)
2. Go to **Admin Panel > Plugins** in FacturaScripts
3. Click **Upload plugin** and select the downloaded ZIP file
4. Enable the plugin

> **Note**: Do not download the repository directly as a ZIP from GitHub's "Code" button. The release ZIP is specifically packaged for FacturaScripts and excludes development files.

## License

This plugin is released under the GNU LGPLv3 license. See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### Development Setup

```bash
# Clone the repository
git clone git@github.com:erseco/facturascripts-plugin-CommandPalette.git
cd facturascripts-plugin-CommandPalette

# Start development environment with Docker
make up

# Open http://localhost:8080 (login: admin / admin)

# Run linting
make lint
make lint-js

# Run tests
make test
```
