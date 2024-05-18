// Vector 4 Coords Type
export type coordsV4 = {
    x: number;
    y: number;
    z: number;
    w: number;
};

// Vector 3 Coords Type
export type coordsV3 = {
    x: number;
    y: number;
    z: number;
};

// Vector 2 Coords Type
export type coordsV2 = {
    x: number;
    y: number;
};

// Multiple V4 Coords Type
export type multiplecoordsV4 = [
    coordsV4
]

// Create additional logs
export type logDetail = {
    title: string;
    message: string;
}

// Create additional logs
export type additionalLogsDetail = {
    title: string,
    message: string
}[]

// Create a callback event
export type allCallbackEvents = {
    [key: string]: any,
}

// Create a callback event detail
export type callbackEventDetail = {
    name: string | number;
    id: any;
}

// Create reactive config details
export type reactiveConfigDetail = {
    [key: string]: any,
}

// Color Details
export type colorDetails = {
    r: number;
    g: number;
    b: number
}

export type playerDetails = {
    source: number;
    cid: string;
    license: string;
    firstname: string;
    lastname: string;
    job: {
        name: string;
        label: string;
        payment: number;
        onduty: boolean;
        grade: {
            name: string;
            level: number;
        }
    },
    gang: {
        name: string;
        label: string;
        isboss: boolean;
        grade: {
            name: string;
            level: number
        }
    },
    metadata: any
}

// Created Profile Callbacks
export type createdProfiles = reactiveProfileCallback[string]

// Created Reactive Callback
export type reactiveProfileCallback = {
    [key: string]: any,
    key: string;
    value: any;
    response: boolean;
    callback: Function;
    resource: string;
    update: Function;
}

// Gang Rank
export type gangRank = {
    name: string,
    isBoss: boolean
}

// Gang Detail
export type gangDetail = {
    label: string,
    grades: gangRank[]
}

// Job Rank
export type jobRank = {
    name: string,
    payment: number,
    isBoss: boolean
}

// Job Detail
export type jobDetail = {
    label: string,
    grades: jobRank[]
}