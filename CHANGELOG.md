## 0.4.0 - 2019-01-10

- **Breaking change**:
   - remove the (incomplete) UMD build (`jquery-sync-table-column-widths/register`).
   - remove the redundant `register` export
- remove `require`s from the ESM build

## 0.3.1 - 2019-01-07

- fix import error in Webpack 4/Angular 6+

## 0.3.0 - 2018-11-22

- **Breaking change**:
   - rename the master-table outlets consumed by slave tables: port/ports -> source/sources

## 0.2.0 - 2018-11-11

- **Breaking change**:
   - replace the `sync:after` event with `sync` and remove `sync:before`

## 0.0.3 - 2018-11-07

- **Breaking change**:
   - temporarily make the default Plugin export a named export to work around
     a bundling issue

## 0.0.2 - 2018-11-07

- add typings

## 0.0.1 - 2018-11-06

- initial release
