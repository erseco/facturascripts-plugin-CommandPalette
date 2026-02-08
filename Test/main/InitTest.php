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

namespace FacturaScripts\Test\Plugins\CommandPalette;

use FacturaScripts\Core\Template\InitClass;
use FacturaScripts\Plugins\CommandPalette\Init;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

class InitTest extends TestCase
{
    private ReflectionClass $reflection;

    protected function setUp(): void
    {
        $this->reflection = new ReflectionClass(Init::class);
    }

    // =========================================================================
    // CLASS STRUCTURE TESTS
    // =========================================================================

    public function testClassExists(): void
    {
        $this->assertTrue(
            class_exists(Init::class),
            'Init class should exist'
        );
    }

    public function testExtendsInitClass(): void
    {
        $this->assertTrue(
            is_subclass_of(Init::class, InitClass::class),
            'Init should extend InitClass'
        );
    }

    public function testCorrectNamespace(): void
    {
        $this->assertEquals(
            'FacturaScripts\\Plugins\\CommandPalette',
            $this->reflection->getNamespaceName(),
            'Init should be in correct namespace'
        );
    }

    public function testClassIsNotAbstract(): void
    {
        $this->assertFalse(
            $this->reflection->isAbstract(),
            'Init class should not be abstract'
        );
    }

    public function testClassIsNotFinal(): void
    {
        $this->assertFalse(
            $this->reflection->isFinal(),
            'Init class should not be final'
        );
    }

    // =========================================================================
    // METHOD EXISTENCE TESTS
    // =========================================================================

    public function testInitMethodExists(): void
    {
        $this->assertTrue(
            method_exists(Init::class, 'init'),
            'init method should exist'
        );
    }

    public function testUpdateMethodExists(): void
    {
        $this->assertTrue(
            method_exists(Init::class, 'update'),
            'update method should exist'
        );
    }

    public function testUninstallMethodExists(): void
    {
        $this->assertTrue(
            method_exists(Init::class, 'uninstall'),
            'uninstall method should exist'
        );
    }

    // =========================================================================
    // METHOD VISIBILITY TESTS
    // =========================================================================

    public function testInitMethodIsPublic(): void
    {
        $method = $this->reflection->getMethod('init');
        $this->assertTrue($method->isPublic(), 'init method should be public');
    }

    public function testUpdateMethodIsPublic(): void
    {
        $method = $this->reflection->getMethod('update');
        $this->assertTrue($method->isPublic(), 'update method should be public');
    }

    public function testUninstallMethodIsPublic(): void
    {
        $method = $this->reflection->getMethod('uninstall');
        $this->assertTrue($method->isPublic(), 'uninstall method should be public');
    }

    // =========================================================================
    // METHOD RETURN TYPE TESTS
    // =========================================================================

    public function testInitMethodReturnType(): void
    {
        $method = $this->reflection->getMethod('init');
        $returnType = $method->getReturnType();
        $this->assertNotNull($returnType, 'init method should have a return type');
        $this->assertEquals('void', $returnType->getName());
    }

    public function testUpdateMethodReturnType(): void
    {
        $method = $this->reflection->getMethod('update');
        $returnType = $method->getReturnType();
        $this->assertNotNull($returnType, 'update method should have a return type');
        $this->assertEquals('void', $returnType->getName());
    }

    public function testUninstallMethodReturnType(): void
    {
        $method = $this->reflection->getMethod('uninstall');
        $returnType = $method->getReturnType();
        $this->assertNotNull($returnType, 'uninstall method should have a return type');
        $this->assertEquals('void', $returnType->getName());
    }

    // =========================================================================
    // INSTANTIATION TESTS
    // =========================================================================

    public function testInitClassCanBeInstantiated(): void
    {
        $init = new Init();
        $this->assertInstanceOf(Init::class, $init);
    }
}
