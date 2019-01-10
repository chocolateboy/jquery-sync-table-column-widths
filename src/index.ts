import 'core-js/fn/string/repeat' // XXX required by sprintf-js for IE11 support
import EventEmitter from 'little-emitter'
import _            from 'lodash'
import Sprintf      from 'sprintf-js'

type Debug = boolean | Function;
type Input = typeof defaultInput;
type Output = typeof defaultOutput;
type MasterSelector = JQuery.Selector | HTMLTableElement | ((table: HTMLTableElement) => boolean);
type MasterCellWidths = { [key: string]: number | undefined };

type Options = {
    debug?: Debug;
    input?: Input;
    master?: MasterSelector;
    output?: Output;
};

type State = {
    [key: string]: number;
}

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
    return $cells ? ($cells.get() as any) : []
}

// return the nth (0-based) item from a comma-separated string list
function nth (list: string, index: number): string | void {
    if (list && list.match(/\S/)) {
        return list.trim().split(/\s*,\s*/)[index]
    }
}

const defaultDebug = console.warn.bind(console)

function defaultOutput (
    this: { index: number; state: State },
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
            const id = Sprintf.sprintf('%s-%d', name, count)

            port = Sprintf.sprintf(template, {
                count,
                index,
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
    this: { index: number; state: State },
    cell: HTMLTableCellElement,
    table: HTMLTableElement
): string {
    return $(cell).data('source') || nth($(table).data('sources'), this.index)
}

// if master is undefined, the first table is used which we get
// via a predicate which returns true
function defaultMaster (_table: HTMLTableElement): boolean {
    return true
}

// FIXME temporarily make this a named export, rather than the default export, to
// work around a bundling issue: https://github.com/developit/microbundle/issues/193
export default class Plugin extends EventEmitter {
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

    public constructor (_options?: Options) {
        super()

        const options: Options = _options || {}
        const debug = options.debug || false

        this.input = options.input || defaultInput
        this.output = options.output || defaultOutput
        this.masterSelector = options.master || defaultMaster
        this.debug = _.isFunction(debug) ? debug : debug ? defaultDebug : _.noop
    }

    public syncColumnWidths ($group: JQuery<HTMLElement>, masterSelector = this.masterSelector): void {
        let master: HTMLTableElement | undefined
        let isMaster: (table: HTMLTableElement) => boolean

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

        const slaveTables: Array<HTMLTableElement> = []

        $tables.each(function (this: HTMLElement) {
            const table = this as HTMLTableElement

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
        const getInput = this.input
        const getOutput = this.output
        const $outputThis = { index: -1, state: {} }

        // populate masterCellWidths with port -> width pairs
        masterCells.forEach((cell, index) => {
            $outputThis.index = index

            // FIXME master type should have been narrowed to exclude undefined
            const port = getOutput.call($outputThis, cell, master!)

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

                const source = getInput.call($inputThis, cell, table)

                // FIXME don't modify slave tables
                if (source && !$(cell).data('source')) {
                    $(cell).data('source', source)
                }
            })

            this._sync(masterCellWidths, masterCells, slaveCells)
            this.emit('sync', table, master)
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
            const source = $slaveCell.data('source')

            let masterCellWidth

            if (source) {
                masterCellWidth = masterCellWidths[source]

                if (masterCellWidth) {
                    console.warn(`Found width in master table port (${source}): ${masterCellWidth}`)
                } else {
                    console.warn(`Can't find port in master table: ${source}`)
                    break
                }
            } else {
                masterCellWidth = $masterCell.width()
            }

            // for diagnostics
            const slaveCellWidth = $slaveCell.width()
            this.debug(`master (${masterCellWidth}) -> slave (${slaveCellWidth})`)

            $slaveCell.width(masterCellWidth!)
        }
    }
}
