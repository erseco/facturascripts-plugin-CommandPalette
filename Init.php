<?php

/**
 * This file is part of CommandPalette plugin for FacturaScripts.
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
