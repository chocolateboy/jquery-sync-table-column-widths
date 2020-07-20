# jquery-sync-table-column-widths

[![Build Status](https://travis-ci.org/chocolateboy/jquery-sync-table-column-widths.svg)](https://travis-ci.org/chocolateboy/jquery-sync-table-column-widths)
[![NPM Version](https://img.shields.io/npm/v/jquery-sync-table-column-widths.svg)](https://www.npmjs.org/package/jquery-sync-table-column-widths)

<!-- toc -->

- [NAME](#name)
- [INSTALLATION](#installation)
- [SYNOPSIS](#synopsis)
  - [Load](#load)
  - [Use](#use)
- [TYPES](#types)
  - [Input](#input)
  - [Output](#output)
  - [MasterSelector](#masterselector)
  - [Options](#options)
- [EXPORTS](#exports)
  - [Plugin (default)](#plugin-default)
- [METHODS](#methods)
  - [JQuery#syncColumnWidths](#jquerysynccolumnwidths)
- [DEVELOPMENT](#development)
  - [NPM Scripts](#npm-scripts)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- tocstop -->

# NAME

jquery-sync-table-column-widths - a jQuery plugin to synchronize table column widths

# INSTALLATION

    $ npm install jquery-sync-table-column-widths

# SYNOPSIS

## Load

```javascript
import Plugin from 'jquery-sync-table-column-widths'

const jQuery = require('jquery')
const plugin = Plugin.register(jQuery, options)

plugin.on('sync', table => { ... })
```

## Use

```javascript
$('.my-tables').syncColumnWidths()

// or

$('.my-tables').syncColumnWidths(master)
```

# TYPES

The following types are referenced in the [exports](#exports) below.

## Input

```typescript
type Input = (
    this: HTMLTableCellElement,
    index: number,
    table: HTMLTableElement,
    cell: HTMLTableCellElement
) => string;
```

## Output

```typescript
type Output = (
    this: { index: number; state: Object },
    cell: HTMLTableCellElement,
    table: HTMLTableElement
) => string;
```

## MasterSelector

```typescript
type MasterSelector = JQuery.Selector | HTMLTableElement | ((HTMLTableElement) => boolean)
```

## Options

```typescript
type Options {
    input?: Input,
    output?: Output,
    debug?: boolean,
    master?: MasterSelector,
}
```

# EXPORTS

## Plugin (default)

```javascript
import Plugin from 'jquery-sync-column-widths'

Plugin.register(jQuery, options)
```

# METHODS

## JQuery#syncColumnWidths

**Signature**: syncColumnWidths(jQuery: JQuery, options?: [Options](#options)) => this

# DEVELOPMENT

<details>

## NPM Scripts

The following NPM scripts are available:

- build - compile the plugin and package it for release
- clean - remove temporary files and build artifacts
- test - run the test suite

</details>

# COMPATIBILITY

This plugin should work in any browser supported by jQuery. It has been tested with jQuery 3.3.1,
though it may work with older versions.

# SEE ALSO

* [jQuery](https://www.npmjs.com/package/jquery)

# VERSION

0.4.0

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2018-2020 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).
