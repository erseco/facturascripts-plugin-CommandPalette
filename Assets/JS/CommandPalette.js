/**
 * This file is part of CommandPalette plugin for FacturaScripts.
 * Copyright (C) 2026 Ernesto Serrano <info@ernesto.es>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

(() => {
    'use strict';

    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    /**
     * Command Palette - Cloudflare/GitHub style command palette
     */
    const CommandPalette = {
        isOpen: false,
        commands: [],
        filteredCommands: [],
        selectedIndex: 0,
        overlay: null,
        input: null,
        resultsContainer: null,

        init: function () {
            this.parseCommands();
            this.createModal();
            this.createNavbarButton();
            this.bindEvents();
        },

        trans: (key) => {
            if (typeof commandPaletteTranslations !== 'undefined' && commandPaletteTranslations[key]) {
                return commandPaletteTranslations[key];
            }
            return key;
        },

        parseCommands: function () {
            this.commands = [];

            // Parse navigation items from menu
            this.parseMenuItems();

            // Generate quick create commands
            this.generateCreateCommands();

            // Add predefined settings commands
            this.addSettingsCommands();

            // Add predefined action commands
            this.addActionCommands();
        },

        parseMenuItems: function () {
            const menuItems = document.querySelectorAll('.navbar a.dropdown-item, .navbar .nav-link');
            menuItems.forEach((item) => {
                const href = item.getAttribute('href');
                if (!href || href === '#' || href.startsWith('javascript:')) {
                    return;
                }

                const icon = item.querySelector('i');
                const iconClass = icon ? icon.className : 'fas fa-file';

                // Get the text, excluding icon text
                const title = item.textContent.trim();
                if (!title) {
                    return;
                }

                // Find parent dropdown for category
                const dropdown = item.closest('.dropdown');
                const dropdownToggle = dropdown ? dropdown.querySelector('.dropdown-toggle') : null;
                const category = dropdownToggle ? dropdownToggle.textContent.trim() : '';

                this.commands.push({
                    type: 'navigation',
                    title: title,
                    url: href,
                    icon: iconClass,
                    category: category || this.trans('navigation')
                });
            });
        },

        generateCreateCommands: function () {
            // Find all List controllers in the menu and generate Edit commands
            const listControllers = new Set();
            this.commands.forEach((cmd) => {
                if (cmd.url) {
                    const match = cmd.url.match(/List(\w+)/);
                    if (match) {
                        listControllers.add(match[1]);
                    }
                }
            });

            listControllers.forEach((controller) => {
                const editUrl = `Edit${controller}`;
                this.commands.push({
                    type: 'create',
                    title: `${this.trans('new')} ${controller}`,
                    url: editUrl,
                    icon: 'fas fa-plus',
                    category: this.trans('quick-create')
                });
            });
        },

        addSettingsCommands: function () {
            const settingsCommands = [
                { title: 'EditSettings', url: 'EditSettings', icon: 'fas fa-cog' },
                { title: 'AdminPlugins', url: 'AdminPlugins', icon: 'fas fa-plug' }
            ];
            settingsCommands.forEach((cmd) => {
                this.commands.push({
                    type: 'settings',
                    title: cmd.title,
                    url: cmd.url,
                    icon: cmd.icon,
                    category: this.trans('settings')
                });
            });
        },

        addActionCommands: function () {
            const actionCommands = [
                { title: 'Dashboard', url: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                { title: 'MegaSearch', url: 'MegaSearch', icon: 'fas fa-search' }
            ];
            actionCommands.forEach((cmd) => {
                this.commands.push({
                    type: 'action',
                    title: cmd.title,
                    url: cmd.url,
                    icon: cmd.icon,
                    category: this.trans('actions')
                });
            });
        },

        createModal: function () {
            this.overlay = document.createElement('div');
            this.overlay.className = 'command-palette-overlay';
            this.overlay.setAttribute('role', 'dialog');
            this.overlay.setAttribute('aria-modal', 'true');
            this.overlay.setAttribute('aria-label', this.trans('command-palette-placeholder'));
            this.overlay.innerHTML = `
                <div class="command-palette" role="listbox">
                    <div class="command-palette-header">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text"
                               class="command-palette-input"
                               placeholder="${this.trans('command-palette-placeholder')}"
                               autocomplete="off"
                               spellcheck="false"
                               aria-label="${this.trans('command-palette-placeholder')}"
                               aria-autocomplete="list"
                               aria-controls="command-palette-results">
                        <span class="close-hint">ESC</span>
                    </div>
                    <div class="command-palette-results" id="command-palette-results" role="listbox"></div>
                    <div class="command-palette-footer">
                        <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> ${this.trans('to-navigate')}</span>
                        <span><kbd>&crarr;</kbd> ${this.trans('to-select')}</span>
                        <span><kbd>Esc</kbd> ${this.trans('to-close')}</span>
                    </div>
                </div>
            `;

            document.body.appendChild(this.overlay);

            this.input = this.overlay.querySelector('.command-palette-input');
            this.resultsContainer = this.overlay.querySelector('.command-palette-results');
        },

        createNavbarButton: function () {
            // Find the navbar icons area (right side)
            const navbar = document.querySelector('.navbar');
            if (!navbar) {
                return;
            }

            // Look for the search icon or the right side of navbar
            const navbarNav = navbar.querySelector('.navbar-nav.ml-auto, .navbar-nav.ms-auto, .navbar-collapse .navbar-nav:last-child');
            if (!navbarNav) {
                return;
            }

            // Create the search trigger button
            const shortcutKey = isMac ? '\u2318K' : 'Ctrl+K';
            const searchTrigger = document.createElement('li');
            searchTrigger.className = 'nav-item d-none d-md-block';
            searchTrigger.innerHTML = `
                <button type="button" class="command-palette-trigger" title="${this.trans('quick-search')}">
                    <i class="fas fa-search"></i>
                    <span class="trigger-text">${this.trans('quick-search')}</span>
                    <kbd>${shortcutKey}</kbd>
                </button>
            `;

            // Insert at the beginning of the navbar icons
            navbarNav.insertBefore(searchTrigger, navbarNav.firstChild);

            // Bind click event
            searchTrigger.querySelector('button').addEventListener('click', () => {
                this.open();
            });
        },

        bindEvents: function () {

            // Open with Ctrl+K / Cmd+K (global)
            document.addEventListener('keydown', (e) => {
                const isModifier = isMac ? e.metaKey : e.ctrlKey;
                if (isModifier && e.key === 'k') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggle();
                }
            });

            // Close on overlay click
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });

            // Input events
            this.input.addEventListener('input', () => {
                this.filter(this.input.value);
            });

            // Keyboard navigation on input
            this.input.addEventListener('keydown', (e) => {
                this.handleKeydown(e);
            });

            // Focus trap - keep focus inside modal
            this.overlay.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    // Keep focus on input
                    e.preventDefault();
                    this.input.focus();
                }
            });
        },

        toggle: function () {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        open: function () {
            this.isOpen = true;
            this.overlay.classList.add('open');
            this.input.value = '';
            this.selectedIndex = 0;
            this.filter('');
            setTimeout(() => {
                this.input.focus();
            }, 50);
        },

        close: function () {
            this.isOpen = false;
            this.overlay.classList.remove('open');
            this.input.blur();
        },

        filter: function (query) {
            if (!query) {
                this.filteredCommands = [...this.commands];
            } else {
                this.filteredCommands = this.fuzzySearch(query);
            }
            this.selectedIndex = 0;
            this.render();
        },

        fuzzySearch: function (query) {
            const lowerQuery = query.toLowerCase();
            const results = [];

            this.commands.forEach((cmd) => {
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

                        // Bonus for start of word
                        if (i === 0 || searchText[i - 1] === ' ') {
                            score += 3;
                        }

                        // Bonus for consecutive matches
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

                // Only include if all query characters were found
                if (queryIndex === lowerQuery.length) {
                    results.push({ ...cmd, score: score });
                }
            });

            // Sort by score descending
            results.sort((a, b) => b.score - a.score);

            return results;
        },

        render: function () {

            if (this.filteredCommands.length === 0) {
                this.resultsContainer.innerHTML = `
                    <div class="command-palette-empty">
                        <div class="empty-icon"><i class="fas fa-search"></i></div>
                        <div class="empty-text">${this.trans('no-results')}</div>
                    </div>
                `;
                return;
            }

            // Group by category
            const grouped = {};
            this.filteredCommands.forEach((cmd, index) => {
                const cat = cmd.category || this.trans('other');
                if (!grouped[cat]) {
                    grouped[cat] = [];
                }
                grouped[cat].push({ ...cmd, globalIndex: index });
            });

            let html = '';
            Object.keys(grouped).forEach((category) => {
                html += `<div class="command-palette-category">${category}</div>`;
                grouped[category].forEach((cmd) => {
                    const selected = cmd.globalIndex === this.selectedIndex ? 'selected' : '';
                    const ariaSelected = cmd.globalIndex === this.selectedIndex ? 'true' : 'false';
                    html += `
                        <div class="command-palette-item ${selected}"
                             data-index="${cmd.globalIndex}"
                             role="option"
                             aria-selected="${ariaSelected}"
                             tabindex="-1">
                            <div class="item-icon"><i class="${cmd.icon}"></i></div>
                            <div class="item-content">
                                <div class="item-title">${cmd.title}</div>
                            </div>
                            ${cmd.category ? `<span class="item-badge">${cmd.category}</span>` : ''}
                        </div>
                    `;
                });
            });

            this.resultsContainer.innerHTML = html;

            // Bind click events
            this.resultsContainer.querySelectorAll('.command-palette-item').forEach((item) => {
                item.addEventListener('click', () => {
                    this.selectedIndex = parseInt(item.dataset.index, 10);
                    this.executeSelected();
                });
                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = parseInt(item.dataset.index, 10);
                    this.updateSelection();
                });
            });

            this.scrollToSelected();
        },

        handleKeydown: function (e) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectNext();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectPrevious();
                    break;
                case 'Enter':
                    e.preventDefault();
                    e.stopPropagation();
                    this.executeSelected();
                    break;
                case 'Escape':
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                    break;
            }
        },

        selectNext: function () {
            if (this.selectedIndex < this.filteredCommands.length - 1) {
                this.selectedIndex++;
                this.updateSelection();
            }
        },

        selectPrevious: function () {
            if (this.selectedIndex > 0) {
                this.selectedIndex--;
                this.updateSelection();
            }
        },

        updateSelection: function () {
            this.resultsContainer.querySelectorAll('.command-palette-item').forEach((item) => {
                const index = parseInt(item.dataset.index, 10);
                const isSelected = index === this.selectedIndex;
                item.classList.toggle('selected', isSelected);
                item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            });
            this.scrollToSelected();
        },

        scrollToSelected: function () {
            const selected = this.resultsContainer.querySelector('.command-palette-item.selected');
            if (selected) {
                selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        },

        executeSelected: function () {
            const cmd = this.filteredCommands[this.selectedIndex];
            if (cmd?.url) {
                this.close();
                window.location.href = cmd.url;
            }
        }
    };

    /**
     * Keyboard Shortcuts - Alt+N for new record, Alt+S for save
     */
    const KeyboardShortcuts = {
        isMac: isMac,

        init: function () {
            this.bindKeyboardShortcuts();
            this.addTooltipToNewButton();
            this.addTooltipToSaveButton();
        },

        bindKeyboardShortcuts: function () {
            document.addEventListener('keydown', (e) => {
                // Skip if command palette is open
                if (CommandPalette.isOpen) {
                    return;
                }

                // Alt+N (Option+N on Mac): Create new record
                // Use e.code instead of e.key to work even when Alt produces special characters
                if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyN') {
                    e.preventDefault();
                    this.navigateToNew();
                    return;
                }

                // Alt+S (Option+S on Mac): Save
                if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyS') {
                    e.preventDefault();
                    this.triggerSave();
                    return;
                }

                // Alt+Insert (Windows/Linux only): Create new record
                if (e.altKey && e.key === 'Insert') {
                    e.preventDefault();
                    this.navigateToNew();
                }
            });
        },

        findNewButton: () => {
            // Strategy 1: Look for green button with "Nuevo" text or plus icon
            const greenBtns = document.querySelectorAll('a.btn-success, button.btn-success');
            for (const btn of greenBtns) {
                const text = btn.textContent.toLowerCase();
                if (text.includes('nuevo') || text.includes('new') || btn.querySelector('.fa-plus')) {
                    return btn;
                }
            }

            // Strategy 2: Look for any link with new=true parameter
            const newLink = document.querySelector('a[href*="new=true"], a[href*="new=TRUE"]');
            if (newLink) {
                return newLink;
            }

            return null;
        },

        addTooltipToNewButton: function () {
            const newBtn = this.findNewButton();
            if (newBtn && !newBtn.dataset.shortcutTooltip) {
                const shortcut = this.isMac ? '\u2325N' : 'Alt+N';
                const currentTitle = newBtn.getAttribute('title') || '';
                const newTitle = currentTitle ? `${currentTitle} (${shortcut})` : shortcut;
                newBtn.setAttribute('title', newTitle);
                newBtn.dataset.shortcutTooltip = 'true';
            }
        },

        findSaveButton: () => {
            // Strategy 1: Look for primary button with save icon (fa-save or fa-floppy-disk)
            const primaryBtns = document.querySelectorAll('button.btn-primary, a.btn-primary');
            for (const btn of primaryBtns) {
                if (btn.querySelector('.fa-save, .fa-floppy-disk, [data-icon="floppy-disk"]')) {
                    return btn;
                }
            }

            // Strategy 2: Look for button with "Guardar" or "Save" text
            for (const btn of primaryBtns) {
                const text = btn.textContent.toLowerCase().trim();
                if (text.includes('guardar') || text.includes('save')) {
                    return btn;
                }
            }

            // Strategy 3: Look for any button with save icon
            const allBtns = document.querySelectorAll('button, a.btn');
            for (const btn of allBtns) {
                if (btn.querySelector('.fa-save, .fa-floppy-disk, [data-icon="floppy-disk"]')) {
                    return btn;
                }
            }

            return null;
        },

        addTooltipToSaveButton: function () {
            const saveBtn = this.findSaveButton();
            if (saveBtn && !saveBtn.dataset.shortcutTooltipSave) {
                const shortcut = this.isMac ? '\u2325S' : 'Alt+S';
                const currentTitle = saveBtn.getAttribute('title') || '';
                const newTitle = currentTitle ? `${currentTitle} (${shortcut})` : shortcut;
                saveBtn.setAttribute('title', newTitle);
                saveBtn.dataset.shortcutTooltipSave = 'true';
            }
        },

        triggerSave: function () {
            const saveBtn = this.findSaveButton();
            if (saveBtn) {
                saveBtn.click();
            }
        },

        navigateToNew: function () {
            const newUrl = this.findNewUrl();
            if (newUrl) {
                window.location.href = newUrl;
            }
        },

        findNewUrl: function () {
            // Strategy 1: Look for existing "New" button
            const newBtn = this.findNewButton();
            if (newBtn?.href) {
                return newBtn.href;
            }

            // Strategy 2: Build URL from current controller name
            const path = window.location.pathname;
            const controller = path.split('/').pop().split('?')[0];

            if (controller.startsWith('List')) {
                // ListProducto -> EditProducto
                const editController = controller.replace('List', 'Edit');
                return editController;
            }

            if (controller.startsWith('Edit')) {
                // Already on Edit, just remove the code parameter
                return controller;
            }

            return null;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            KeyboardShortcuts.init();
            CommandPalette.init();
        });
    } else {
        KeyboardShortcuts.init();
        CommandPalette.init();
    }
})();
