export interface Data {
    y: string;
    x: number;
    width: number;
}

export interface Hour {
    hour: number;
}

export const DATA: Data[] = [
    {y: 'Phy1', x: 0, width: 8},
    {y: 'Phy2', x: 6, width: 10},
    {y: 'App1', x: 10, width: 4},
    {y: 'Scribe1', x: 11, width: 12},
    {y: 'App2', x: 19, width: 4},
    {y: 'Scribe2', x: 21, width: 2},
];

export const HOUR: Hour[] = [
    {hour: 0},
    {hour: 1},
    {hour: 2},
    {hour: 3},
    {hour: 4},
    {hour: 5},
    {hour: 6},
    {hour: 7},
    {hour: 8},
    {hour: 9},
    {hour: 10},
    {hour: 11},
    {hour: 12},
    {hour: 13},
    {hour: 14},
    {hour: 15},
    {hour: 16},
    {hour: 17},
    {hour: 18},
    {hour: 19},
    {hour: 20},
    {hour: 21},
    {hour: 22},
    {hour: 23}
];