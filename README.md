# TMGMT personal time reporting too

Simple time reporting tool featuring a CLI interface/view and json export.

Still in early stages, may eat your dog and look ugly. :)

## Installation

```
npm install -g tmgmt
```

## Configuration

By default application stores time reports to `./tmgmt.sqlite` database file. Path can be changes with `TMGMT_DB_PATH=` environment variable.

## Usage

Run `tmgmt` for help

eg.

```
>tmgmt log 7,30 "Nice project with a tag: #tag1"

>tmgmt show
Time reports between 2018-01-29 - 2018-02-04
┌───────┬────────────────────────────────┬──────┬────────┬────────────┐
│ id    │ description                    │ tags │ time   │ date       │
├───────┼────────────────────────────────┼──────┼────────┼────────────┤
│ 1     │ Nice project with a tag: #tag1 │ tag1 │ 7h 30m │ 2018-02-01 │
├───────┼────────────────────────────────┼──────┼────────┼────────────┤
│ Total │                                │      │ 7h 30m │            │
└───────┴────────────────────────────────┴──────┴────────┴────────────┘

>tmgmt export
{"reports":[{"id":1,"description":"Nice project with a tag: #tag1","date":"2018-02-01","time_in_minutes":450,"tags":"tag1"}]}

>tmgmt rm 1

```



