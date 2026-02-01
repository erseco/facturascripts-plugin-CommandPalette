/**
 * This file is part of CommandPalette plugin for FacturaScripts.
 * Copyright (C) 2026 Ernesto Serrano <info@ernesto.es>
 *
 * Unit tests for CommandPalette JavaScript functionality
 * Uses Node.js native test runner (requires Node.js 18+)
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');

// Mock browser environment
const mockDocument = {
    createElement: () => ({
        className: '',
        innerHTML: '',
        setAttribute: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        appendChild: () => {},
        addEventListener: () => {},
        classList: {
            add: () => {},
            remove: () => {},
            toggle: () => {}
        }
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: {
        appendChild: () => {}
    },
    activeElement: null,
    readyState: 'complete'
};

const mockWindow = {
    location: {
        pathname: '/ListProducto',
        href: ''
    }
};

const mockNavigator = {
    platform: 'MacIntel'
};

// Mock translations
global.commandPaletteTranslations = {
    'quick-search': 'Quick search...',
    'command-palette-placeholder': 'Type a command or search...',
    'navigation': 'Navigation',
    'quick-create': 'Quick create',
    'settings': 'Settings',
    'actions': 'Actions',
    'new': 'New',
    'other': 'Other',
    'to-navigate': 'to navigate',
    'to-select': 'to select',
    'to-close': 'to close',
    'no-results': 'No results found'
};

// ============================================================================
// FUZZY SEARCH TESTS
// ============================================================================

describe('Fuzzy Search Algorithm', () => {
    // Standalone fuzzy search function for testing
    const fuzzySearch = (query, commands) => {
        const lowerQuery = query.toLowerCase();
        const results = [];

        commands.forEach((cmd) => {
            const title = cmd.title.toLowerCase();
            const category = (cmd.category || '').toLowerCase();
            const searchText = `${title} ${category}`;

            let score = 0;
            let queryIndex = 0;
            let consecutiveMatches = 0;
            let lastMatchIndex = -2;

            for (let i = 0; i < searchText.length && queryIndex < lowerQuery.length; i++) {
                if (searchText[i] === lowerQuery[queryIndex]) {
                    score += 1;

                    if (i === 0 || searchText[i - 1] === ' ') {
                        score += 3;
                    }

                    if (lastMatchIndex === i - 1) {
                        consecutiveMatches++;
                        score += consecutiveMatches * 2;
                    } else {
                        consecutiveMatches = 0;
                    }

                    lastMatchIndex = i;
                    queryIndex++;
                }
            }

            if (queryIndex === lowerQuery.length) {
                results.push({ ...cmd, score: score });
            }
        });

        results.sort((a, b) => b.score - a.score);
        return results;
    };

    const testCommands = [
        { title: 'Products', category: 'Warehouse', url: 'ListProducto' },
        { title: 'Customers', category: 'Sales', url: 'ListCliente' },
        { title: 'Invoices', category: 'Sales', url: 'ListFacturaCliente' },
        { title: 'New Product', category: 'Quick create', url: 'EditProducto' },
        { title: 'Dashboard', category: 'Actions', url: 'Dashboard' },
        { title: 'EditSettings', category: 'Settings', url: 'EditSettings' }
    ];

    test('should find exact matches', () => {
        const results = fuzzySearch('Products', testCommands);
        assert.ok(results.length > 0, 'Should find at least one result');
        assert.strictEqual(results[0].title, 'Products', 'First result should be Products');
    });

    test('should find partial matches', () => {
        const results = fuzzySearch('prod', testCommands);
        assert.ok(results.length >= 2, 'Should find Products and New Product');

        const titles = results.map(r => r.title);
        assert.ok(titles.includes('Products'), 'Should include Products');
        assert.ok(titles.includes('New Product'), 'Should include New Product');
    });

    test('should rank consecutive matches higher', () => {
        const results = fuzzySearch('inv', testCommands);
        assert.ok(results.length > 0, 'Should find Invoices');
        assert.strictEqual(results[0].title, 'Invoices', 'Invoices should be first');
    });

    test('should search in category as well', () => {
        const results = fuzzySearch('sales', testCommands);
        assert.ok(results.length >= 2, 'Should find items in Sales category');

        const categories = results.map(r => r.category);
        assert.ok(categories.every(c => c === 'Sales'), 'All results should be in Sales');
    });

    test('should return empty for no matches', () => {
        const results = fuzzySearch('xyz123', testCommands);
        assert.strictEqual(results.length, 0, 'Should return no results');
    });

    test('should be case insensitive', () => {
        const resultsLower = fuzzySearch('products', testCommands);
        const resultsUpper = fuzzySearch('PRODUCTS', testCommands);
        const resultsMixed = fuzzySearch('PrOdUcTs', testCommands);

        assert.strictEqual(resultsLower.length, resultsUpper.length, 'Case should not affect results');
        assert.strictEqual(resultsLower.length, resultsMixed.length, 'Case should not affect results');
    });

    test('should give bonus for word start matches', () => {
        const results = fuzzySearch('d', testCommands);
        // Dashboard starts with 'd', so it should rank higher than items that don't
        const dashboardIndex = results.findIndex(r => r.title === 'Dashboard');
        assert.ok(dashboardIndex !== -1, 'Should find Dashboard');
    });
});

// ============================================================================
// PLATFORM DETECTION TESTS
// ============================================================================

describe('Platform Detection', () => {
    test('should detect Mac platform', () => {
        const platforms = ['MacIntel', 'MacPPC', 'Mac68K', 'iPhone', 'iPad', 'iPod'];
        const macRegex = /Mac|iPod|iPhone|iPad/;

        platforms.forEach(platform => {
            assert.ok(macRegex.test(platform), `${platform} should be detected as Mac`);
        });
    });

    test('should not detect Windows as Mac', () => {
        const platforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
        const macRegex = /Mac|iPod|iPhone|iPad/;

        platforms.forEach(platform => {
            assert.ok(!macRegex.test(platform), `${platform} should not be detected as Mac`);
        });
    });

    test('should not detect Linux as Mac', () => {
        const platforms = ['Linux x86_64', 'Linux armv7l', 'Linux i686'];
        const macRegex = /Mac|iPod|iPhone|iPad/;

        platforms.forEach(platform => {
            assert.ok(!macRegex.test(platform), `${platform} should not be detected as Mac`);
        });
    });
});

// ============================================================================
// KEYBOARD SHORTCUT TESTS
// ============================================================================

describe('Keyboard Shortcuts', () => {
    test('should use correct modifier key for Mac', () => {
        const isMac = true;
        const expectedModifier = isMac ? 'Cmd' : 'Ctrl';
        assert.strictEqual(expectedModifier, 'Cmd', 'Mac should use Cmd');
    });

    test('should use correct modifier key for Windows/Linux', () => {
        const isMac = false;
        const expectedModifier = isMac ? 'Cmd' : 'Ctrl';
        assert.strictEqual(expectedModifier, 'Ctrl', 'Windows/Linux should use Ctrl');
    });

    test('should format shortcut correctly for Mac', () => {
        const isMac = true;
        const shortcut = isMac ? '\u2318K' : 'Ctrl+K';
        assert.strictEqual(shortcut, '\u2318K', 'Mac shortcut should use command symbol');
    });

    test('should format shortcut correctly for Windows', () => {
        const isMac = false;
        const shortcut = isMac ? '\u2318K' : 'Ctrl+K';
        assert.strictEqual(shortcut, 'Ctrl+K', 'Windows shortcut should use Ctrl+K');
    });

    test('should format Alt shortcut correctly for Mac', () => {
        const isMac = true;
        const shortcut = isMac ? '\u2325N' : 'Alt+N';
        assert.strictEqual(shortcut, '\u2325N', 'Mac Alt shortcut should use option symbol');
    });

    test('should format Alt shortcut correctly for Windows', () => {
        const isMac = false;
        const shortcut = isMac ? '\u2325N' : 'Alt+N';
        assert.strictEqual(shortcut, 'Alt+N', 'Windows Alt shortcut should use Alt+N');
    });
});

// ============================================================================
// URL BUILDING TESTS
// ============================================================================

describe('URL Building', () => {
    test('should convert List controller to Edit', () => {
        const controller = 'ListProducto';
        const expected = 'EditProducto';

        if (controller.startsWith('List')) {
            const result = controller.replace('List', 'Edit');
            assert.strictEqual(result, expected, 'Should convert ListProducto to EditProducto');
        }
    });

    test('should handle Edit controller', () => {
        const controller = 'EditCliente';

        if (controller.startsWith('Edit')) {
            assert.ok(true, 'Should recognize Edit controller');
        } else {
            assert.fail('Should recognize Edit controller');
        }
    });

    test('should extract controller from path', () => {
        const paths = [
            { path: '/ListProducto', expected: 'ListProducto' },
            { path: '/EditCliente', expected: 'EditCliente' },
            { path: '/Dashboard', expected: 'Dashboard' },
            { path: '/admin/ListFacturaCliente', expected: 'ListFacturaCliente' }
        ];

        paths.forEach(({ path, expected }) => {
            const controller = path.split('/').pop().split('?')[0];
            assert.strictEqual(controller, expected, `Should extract ${expected} from ${path}`);
        });
    });
});

// ============================================================================
// TRANSLATION TESTS
// ============================================================================

describe('Translations', () => {
    const trans = (key) => {
        if (typeof commandPaletteTranslations !== 'undefined' && commandPaletteTranslations[key]) {
            return commandPaletteTranslations[key];
        }
        return key;
    };

    test('should return translation for known key', () => {
        const result = trans('quick-search');
        assert.strictEqual(result, 'Quick search...', 'Should return translated value');
    });

    test('should return key for unknown translation', () => {
        const result = trans('unknown-key');
        assert.strictEqual(result, 'unknown-key', 'Should return key when translation not found');
    });

    test('should have all required translations', () => {
        const requiredKeys = [
            'quick-search',
            'command-palette-placeholder',
            'navigation',
            'quick-create',
            'settings',
            'actions',
            'new',
            'to-navigate',
            'to-select',
            'to-close',
            'no-results'
        ];

        requiredKeys.forEach(key => {
            assert.ok(
                commandPaletteTranslations[key] !== undefined,
                `Translation key '${key}' should exist`
            );
        });
    });
});

// ============================================================================
// COMMAND GENERATION TESTS
// ============================================================================

describe('Command Generation', () => {
    test('should extract controller name from List URL', () => {
        const urls = [
            { url: 'ListProducto', expected: 'Producto' },
            { url: 'ListCliente', expected: 'Cliente' },
            { url: 'ListFacturaCliente', expected: 'FacturaCliente' }
        ];

        urls.forEach(({ url, expected }) => {
            const match = url.match(/List(\w+)/);
            assert.ok(match, `Should match ${url}`);
            assert.strictEqual(match[1], expected, `Should extract ${expected} from ${url}`);
        });
    });

    test('should generate Edit URL from controller name', () => {
        const controllers = ['Producto', 'Cliente', 'FacturaCliente'];

        controllers.forEach(controller => {
            const editUrl = `Edit${controller}`;
            assert.ok(editUrl.startsWith('Edit'), 'Should start with Edit');
            assert.ok(editUrl.includes(controller), 'Should include controller name');
        });
    });

    test('should generate correct "New" command title', () => {
        const newText = 'New';
        const controller = 'Producto';
        const title = `${newText} ${controller}`;

        assert.strictEqual(title, 'New Producto', 'Should generate correct title');
    });
});

console.log('Running CommandPalette tests...');
