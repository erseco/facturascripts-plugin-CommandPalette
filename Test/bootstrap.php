<?php

/**
 * This file is part of CommandPalette plugin for FacturaScripts.
 * Copyright (C) 2026 Ernesto Serrano <info@ernesto.es>
 *
 * PHPUnit bootstrap file for testing
 */

// Define FacturaScripts folder
// When running in Docker/CI, tests are copied to /var/www/html/Test/Plugins/
// so we need to go up two levels to reach the FacturaScripts root
if (file_exists(__DIR__ . '/../../Core')) {
    // Running in FacturaScripts environment (CI/Docker)
    define('FS_FOLDER', __DIR__ . '/../..');
} else {
    // Running in plugin development environment
    define('FS_FOLDER', __DIR__ . '/..');
}

// Load composer autoloader
require_once FS_FOLDER . '/vendor/autoload.php';

// Load FacturaScripts configuration
if (file_exists(FS_FOLDER . '/config.php')) {
    require_once FS_FOLDER . '/config.php';
}

// Initialize minimal FacturaScripts environment for testing
if (!defined('FS_LANG')) {
    define('FS_LANG', 'es_ES');
}

if (!defined('FS_TIMEZONE')) {
    define('FS_TIMEZONE', 'Europe/Madrid');
}

if (!defined('FS_ROUTE')) {
    define('FS_ROUTE', '');
}
