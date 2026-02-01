# Quick Start Guide

## 1. Start FacturaScripts

```bash
make up
```

Wait for the containers to start (about 30 seconds).

## 2. Access FacturaScripts

Open your browser and go to:
```
http://localhost:8080
```

Login with:
- **Username:** `admin`
- **Password:** `admin`

## 3. Enable the Plugin

Go to **Admin Panel > Plugins** and enable **CommandPalette**.

Or run:
```bash
make enable-plugin
```

## 4. Use the Command Palette

After enabling the plugin, you can use these shortcuts:

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Command Palette | `Ctrl+K` | `Cmd+K` |
| Create new record | `Alt+N` | `Option+N` |
| Save | `Alt+S` | `Option+S` |
| Navigate results | `Arrow Up/Down` | `Arrow Up/Down` |
| Select item | `Enter` | `Enter` |
| Close palette | `Escape` | `Escape` |

### Examples

1. Press `Ctrl+K` (or `Cmd+K` on Mac) to open the palette
2. Type "prod" to filter to Products
3. Use arrow keys to navigate
4. Press `Enter` to go to that page

Or use `Alt+N` on any List page to quickly create a new record!

### Navbar Button

Look for the "Quick search..." button in the navbar - click it to open the Command Palette.

## 5. Stop FacturaScripts

```bash
make down
```

## Need Help?

Run `make help` to see all available commands.

Check the full [README.md](README.md) for detailed documentation.
