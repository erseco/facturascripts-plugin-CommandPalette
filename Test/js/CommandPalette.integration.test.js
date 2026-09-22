const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');

// Small DOM adapter: execute the shipped script and interact through its event listeners.
function element(textContent = '', attributes = {}) {
    const listeners = {};
    const children = new Map();
    const classes = new Set();
    return {
        textContent, attributes, children, dataset: {}, className: '', value: '',
        classList: {
            add: key => classes.add(key),
            remove: key => classes.delete(key),
            toggle: (key, enabled) => enabled ? classes.add(key) : classes.delete(key),
            contains: key => classes.has(key)
        },
        getAttribute: key => attributes[key] ?? null,
        setAttribute: (key, value) => { attributes[key] = value; },
        addEventListener: (name, fn) => { (listeners[name] ??= []).push(fn); },
        emit(name, event = {}) {
            event.preventDefault ??= () => { event.prevented = true; };
            event.stopPropagation ??= () => {};
            for (const fn of listeners[name] ?? []) fn(event);
            return event;
        },
        appendChild(child) { this.appended = child; },
        insertBefore(child) { this.inserted = child; },
        querySelector(selector) { return children.get(selector) ?? null; },
        querySelectorAll(selector) {
            if (selector === '.command-palette-item') return this.items ?? [];
            return children.get(selector) ?? [];
        },
        closest() { return this.parent ?? null; },
        focus() { this.focused = true; },
        blur() { this.focused = false; },
        click() { this.clicked = true; this.emit('click'); },
        scrollIntoView() { this.scrolled = true; },
        set innerHTML(html) {
            this.html = html;
            this.items = Array.from(html.matchAll(/data-index="(\d+)"/g), match => {
                const item = element();
                item.dataset.index = match[1];
                return item;
            });
            if (this.items.length) children.set('.command-palette-item.selected', this.items[0]);
        },
        get innerHTML() { return this.html ?? ''; }
    };
}

function start({ platform = 'Linux', loading = false, navbar = true } = {}) {
    const document = element();
    document.readyState = loading ? 'loading' : 'complete';
    document.body = element();
    const input = element();
    const results = element();
    const overlay = element();
    overlay.children.set('.command-palette-input', input);
    overlay.children.set('.command-palette-results', results);
    const trigger = element();
    const nav = element();
    const navItems = element();
    nav.children.set('.navbar-nav.ml-auto, .navbar-nav.ms-auto, .navbar-collapse .navbar-nav:last-child', navItems);
    if (navbar) document.children.set('.navbar', nav);
    document.createElement = tag => {
        if (tag === 'div') return overlay;
        const item = element();
        item.children.set('button', trigger);
        return item;
    };
    const product = element('Products', { href: 'ListProducto' });
    product.children.set('i', { className: 'fas fa-box' });
    product.parent = element();
    product.parent.children.set('.dropdown-toggle', element('Warehouse'));
    const customer = element('Customers', { href: 'ListCliente' });
    document.children.set('.navbar a.dropdown-item, .navbar .nav-link', [
        product, customer, element('Invalid'), element('Empty', { href: '#' }),
        element('Script', { href: 'javascript:void(0)' }), element('', { href: 'ListEmpty' })
    ]);
    const newButton = element('New', { title: 'Create' });
    newButton.href = 'EditProducto?new=true';
    const saveButton = element('Save', { title: 'Save document' });
    saveButton.children.set('.fa-save, .fa-floppy-disk, [data-icon="floppy-disk"]', element());
    document.children.set('a.btn-success, button.btn-success', [newButton]);
    document.children.set('button.btn-primary, a.btn-primary', [saveButton]);
    const window = { location: { pathname: '/ListProducto', href: '' } };
    const filename = resolve(__dirname, '../../Assets/JS/CommandPalette.js');
    runInNewContext(readFileSync(filename, 'utf8'), {
        document, window, navigator: { platform }, setTimeout: fn => fn(),
        commandPaletteTranslations: { new: 'New', navigation: 'Navigation', 'no-results': 'No results' }
    }, { filename });
    if (loading) document.emit('DOMContentLoaded');
    return { document, window, overlay, input, results, trigger, newButton, saveButton };
}

test('shipped palette opens, searches, navigates and closes using keyboard and pointer', () => {
    const app = start();
    app.trigger.click();
    assert.equal(app.overlay.classList.contains('open'), true);
    assert.equal(app.input.focused, true);
    assert.match(app.results.innerHTML, /Products/);
    assert.match(app.results.innerHTML, /New Producto/);
    app.input.value = 'prod';
    app.input.emit('input');
    assert.match(app.results.innerHTML, /Products/);
    assert.doesNotMatch(app.results.innerHTML, /Customers/);
    app.input.value = 'wh';
    app.input.emit('input');
    assert.match(app.results.innerHTML, /Products/);
    app.input.value = 'no-such-command';
    app.input.emit('input');
    assert.match(app.results.innerHTML, /No results/);
    app.input.emit('keydown', { key: 'Enter' });
    assert.equal(app.window.location.href, '');
    app.input.value = '';
    app.input.emit('input');
    app.input.emit('keydown', { key: 'ArrowUp' });
    app.input.emit('keydown', { key: 'ArrowDown' });
    assert.equal(app.results.items[1].attributes['aria-selected'], 'true');
    app.input.emit('keydown', { key: 'ArrowUp' });
    assert.equal(app.results.items[0].attributes['aria-selected'], 'true');
    app.results.items[1].emit('mouseenter');
    app.results.items[1].click();
    assert.equal(app.window.location.href, 'ListCliente');
    assert.equal(app.overlay.classList.contains('open'), false);
    app.document.emit('keydown', { key: 'k', ctrlKey: true });
    assert.equal(app.overlay.classList.contains('open'), true);
    assert.equal(app.overlay.emit('keydown', { key: 'Tab' }).prevented, true);
    app.input.emit('keydown', { key: 'Escape' });
    assert.equal(app.overlay.classList.contains('open'), false);
    app.document.emit('keydown', { key: 'k', ctrlKey: true });
    app.document.emit('keydown', { key: 'k', ctrlKey: true });
    assert.equal(app.overlay.classList.contains('open'), false);
    app.trigger.click();
    app.overlay.emit('click', { target: app.input });
    assert.equal(app.overlay.classList.contains('open'), true);
    app.overlay.emit('click', { target: app.overlay });
    assert.equal(app.overlay.classList.contains('open'), false);
    app.trigger.click();
    app.input.emit('keydown', { key: 'Enter' });
    assert.equal(app.window.location.href, 'ListProducto');
});

test('shipped shortcuts save and create records, with controller and button fallbacks', () => {
    const app = start({ platform: 'MacIntel', loading: true });
    assert.match(app.newButton.attributes.title, /⌥N/);
    assert.match(app.saveButton.attributes.title, /⌥S/);
    app.document.emit('keydown', { altKey: true, code: 'KeyN' });
    assert.equal(app.window.location.href, 'EditProducto?new=true');
    app.document.emit('keydown', { altKey: true, code: 'KeyS' });
    assert.equal(app.saveButton.clicked, true);
    app.document.children.set('a.btn-success, button.btn-success', [element('Other')]);
    app.document.emit('keydown', { altKey: true, key: 'Insert' });
    assert.equal(app.window.location.href, 'EditProducto');
    app.window.location.pathname = '/EditCliente';
    app.document.emit('keydown', { altKey: true, code: 'KeyN' });
    assert.equal(app.window.location.href, 'EditCliente');
    app.window.location.pathname = '/Dashboard';
    app.document.emit('keydown', { altKey: true, code: 'KeyN' });
    assert.equal(app.window.location.href, 'EditCliente');
    app.saveButton.children.clear();
    app.saveButton.clicked = false;
    app.document.emit('keydown', { altKey: true, code: 'KeyS' });
    assert.equal(app.saveButton.clicked, true);
    app.document.children.set('button.btn-primary, a.btn-primary', []);
    const fallback = element();
    fallback.children.set('.fa-save, .fa-floppy-disk, [data-icon="floppy-disk"]', element());
    app.document.children.set('button, a.btn', [fallback]);
    app.document.emit('keydown', { altKey: true, code: 'KeyS' });
    assert.equal(fallback.clicked, true);
    app.document.children.set('button, a.btn', []);
    app.document.emit('keydown', { altKey: true, code: 'KeyS' });
    app.document.emit('keydown', { key: 'k', metaKey: true });
    assert.equal(app.overlay.classList.contains('open'), true);
    app.document.emit('keydown', { altKey: true, code: 'KeyN' });
    assert.equal(app.window.location.href, 'EditCliente');
    const noNavbar = start({ navbar: false });
    noNavbar.document.emit('keydown', { key: 'k', ctrlKey: true });
    assert.equal(noNavbar.overlay.classList.contains('open'), true);
});
