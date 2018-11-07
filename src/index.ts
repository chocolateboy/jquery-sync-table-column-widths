import { EventEmitter } from 'events'
import * as _           from 'lodash'

// FIXME import error: 'sprintf' is not exported by node_modules/sprintf-js/src/sprintf.js
// import { sprintf } from 'sprintf-js'
const { sprintf } = require('sprintf-js')

type Debug = boolean | Function;
type Input = typeof defaultInput;
type Output = typeof defaultOutput;
type MasterSelector = JQuery.Selector | HTMLTableElement | ((HTMLTableElement) => boolean);
type MasterCellWidths = { [key: string]: number };

type Options = {
    input?: Input;
    output?: Output;
    master?: MasterSelector;
    debug?: Debug;
};

declare global {
    interface JQuery<TElement = HTMLElement> {
        syncColumnWidths: (this: JQuery<TElement>, master?: MasterSelector) => this;
    }
}

// return an array of the table's first row of cells (TH or TD)
function cells (table: HTMLTableElement): Array<HTMLTableCellElement> {
    const $table = $(table)

    const $cells = _.find(
        [
            $table.find('thead > tr:first > th'),
            $table.find('tbody:first > tr:first > td'),
            $table.find('tr:first > th, tr:first > td'),
        ],
        $cells => $cells.length > 0
    )

    // return $cells.get() as unknown as Array<HTMLTableCellElement>
    // FIXME work around TypeScript error:
    // src/index.ts(40,28): semantic error TS2304 Cannot find name 'unknown'.
    return $cells.get() as any
}

// return the nth (0-based) item from a comma-separated string list
function nth (list: string, index: number): string {
    if (list && list.match(/\S/)) {
        return list.trim().split(/\s*,\s*/)[index]
    }
}

const defaultDebug = console.warn.bind(console)

function defaultOutput (
    this: { index: number; state: Object },
    cell: HTMLTableCellElement,
    table: HTMLTableElement
): string {
    const state = this.state

    // TODO use the `this` object/state to cache the split string
    let port = $(cell).data('port') || nth($(table).data('ports'), this.index)

    if (!port) {
        const text = $(cell).text().trim()

        // FIXME the names should be the same (i.e. this code should be
        // executed) even if a custom port name is used
        if (text.match(/\S/)) {
            const template = $(table).data('port-template') || '%(name)s'
            const name = _.kebabCase(text)
            const count = state[name] = (state[name] || 0) + 1
            const index = this.index
            const id = sprintf('%s-%d', name, count)

            port = sprintf(template, {
                count,
                index: this.index,
                name,
                id,
                pos: this.index + 1,
                text,
            })
        }
    }

    return port
}

function defaultInput (
    { index: number, state: Object },
    cell: HTMLTableCellElement,
    table: HTMLTableElement
): string {
    return $(cell).data('port') || nth($(table).data('ports'), this.index)
}

// if master is undefined, the first table is used which we get
// via a predicate which returns true
function defaultMaster (table: HTMLTableElement): boolean {
    return true
}

const OPTIONS: Options = {
    input: defaultInput,
    output: defaultOutput,
    master: defaultMaster,
    debug: false,
}

// FIXME temporarily make this a named export, rather than the default export, to
// work around a bundling issue: https://github.com/developit/microbundle/issues/193
export class Plugin extends EventEmitter {
    input: Input;
    output: Output;
    masterSelector: MasterSelector;
    debug: Function;

    public static register ($: JQueryStatic, options?: Options): Plugin {
        const plugin = new this(options)

        $.fn.syncColumnWidths = function syncColumnWidths (
            this: JQuery<HTMLElement>,
            master?: MasterSelector
        ): JQuery<HTMLElement> {
            plugin.syncColumnWidths(this, master)
            return this
        }

        return plugin
    }

    public constructor (_options: Options) {
        super()

        const options: Options = _.assign({}, OPTIONS, _options || {})
        const { debug } = options

        this.input = options.input
        this.output = options.output
        this.masterSelector = options.master
        this.debug = _.isFunction(debug) ? debug : debug ? defaultDebug : _.noop
    }

    public syncColumnWidths ($group: JQuery<HTMLElement>, masterSelector: MasterSelector): void {
        let master: HTMLTableElement
        let isMaster: (HTMLTableElement) => boolean

        if (!masterSelector) {
            masterSelector = this.masterSelector
        }

        if (_.isString(masterSelector)) {
            isMaster = table => $(table).is(masterSelector)
        } else if (masterSelector instanceof HTMLTableElement) {
            master = masterSelector
        } else {
            throw new TypeError('invalid master') // FIXME better error message
        }

        const $tables = $group.find('table')

        if (!$tables.length) {
            return
        }

        const slaveTables = []

        $tables.each(function (this: HTMLTableElement, index) {
            const table = this

            if (!master && isMaster(table)) {
                master = table
            } else if (table !== master) {
                slaveTables.push(table)
            }
        })

        if (!master) {
            return // XXX warning? exception?
        }

        this.emit('master', master)

        const masterCells = cells(master)
        const masterCellWidths: MasterCellWidths = {}
        const outputState = {}
        const getInput = this.input
        const getOutput = this.output
        const $outputThis = { index: -1, state: {} }

        // populate masterCellWidths with port -> width pairs
        masterCells.forEach((cell, index) => {
            $outputThis.index = index

            const port = getOutput.call($outputThis, cell, master)

            if (port) {
                masterCellWidths[port] = $(cell).width()
            }
        })

        slaveTables.forEach(table => {
            this.emit('slave', table)

            const slaveCells = cells(table)
            const $inputThis = { index: -1, state: {} }

            slaveCells.forEach((cell, index) => {
                $inputThis.index = index

                const port = getInput.call($inputThis, cell, table)

                // FIXME don't modify slave tables
                if (port && !$(cell).data('port')) {
                    $(cell).data('port', port)
                }
            })

            this.emit('sync:before', table, master)
            this._sync(masterCellWidths, masterCells, slaveCells)
            this.emit('sync:after', table, master)
        })
    }

    private _sync(
        masterCellWidths: MasterCellWidths,
        masterCells: Array<HTMLTableCellElement>,
        slaveCells: Array<HTMLTableCellElement>
    ): void {
        const pairs = _.zip(
            _.clone(masterCells).reverse(),
            _.clone(slaveCells).reverse()
        )

        for (const [masterCell, slaveCell] of pairs) {
            if (!(masterCell && slaveCell)) {
                break
            }

            const $masterCell = $(masterCell)
            const $slaveCell = $(slaveCell)
            const port = $slaveCell.data('port')

            let masterCellWidth: number

            if (port) {
                masterCellWidth = masterCellWidths[port]

                if (masterCellWidth) {
                    console.warn(`Found width in master table port (${port}): ${masterCellWidth}`)
                } else {
                    console.warn(`Can't find port in master table: ${port}`)
                    break
                }
            } else {
                masterCellWidth = $masterCell.width()
            }

            // for diagnostics
            const slaveCellWidth = $slaveCell.width()
            this.debug(`master (${masterCellWidth}) -> slave (${slaveCellWidth})`)

            $slaveCell.width(masterCellWidth)
        }
    }
}

export function register (jQuery: JQueryStatic, options?: Options): Plugin {
    return Plugin.register(jQuery, options)
}
