# jquery-sync-table-column-widths

[![Build Status](https://secure.travis-ci.org/chocolateboy/jquery-sync-table-column-widths.svg)](http://travis-ci.org/chocolateboy/jquery-sync-table-column-widths)
[![NPM Version](http://img.shields.io/npm/v/jquery-sync-table-column-widths.svg)](https://www.npmjs.org/package/jquery-sync-table-column-widths)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

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
  - [register](#register)
- [METHODS](#methods)
  - [JQuery#syncColumnWidths](#jquerysynccolumnwidths)
- [DEVELOPMENT](#development)
  - [NPM Scripts](#npm-scripts)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# NAME

jquery-sync-table-column-widths - a jQuery plugin to synchronize table column widths

# INSTALLATION

    $ npm install jquery-sync-table-column-widths

# SYNOPSIS

## Load

```javascript
// register against window.jQuery or window.$ with default options

import 'jquery-sync-table-column-widths/register'

// or customize:

import { register } from 'jquery-sync-table-column-widths'

const jQuery = require('jquery')
const plugin = register(jQuery, options)

plugin.on('sync:after', table => { ... })
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

## register

**Signature**: register(JQueryStatic: jQuery, [Options](#options)) => [Plugin](#plugin)

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

- build:plugin - compile the plugin and save it to the target directory
- build:register - compile the UMD build and save it to the root directory as register.js
- clean - remove the target directory and its contents

</details>

# COMPATIBILITY

This plugin should work in any browser supported by jQuery. It has been tested with jQuery 3.3.1,
though it may work with older versions.

# SEE ALSO

* [jQuery](https://www.npmjs.com/package/jquery)

# VERSION

0.0.1

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2018 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](http://www.opensource.org/licenses/artistic-license-2.0.php).
