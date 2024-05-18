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

// Vector 2 Coords Typesv
export type coordsV2 = {
    x: number;
    y: number;
};

// Rotation Coords
export type rotationCoords = {
    x: number;
    y: number;
};

// Multiple V4 Coords Type
export type multiplecoordsV4 = coordsV4[]

// Multiple V2 Coords Type
export type multiplecoordsV2 = coordsV2[]

// Ray Detail Type
export type rayDetail = {
    state: boolean;
    hit: any[number];
    coords: any[number];
    entity: number
};

// Clothing Detail Type
export type clothingDetail = {
    label: string;
    id: string;
    value: number;
    min: number;
    max: number;
}

// Clothing Multi
export type clothingDetailPlus = clothingDetail[]

// Target menu Option Type
export type targetMenuOption = {
    icon: string;
    label: string;
    value: any;
    range: number;
}

// Target menu Options Type
export type targetMenuOptions = targetMenuOption[]

// Target deletion
export type targetDelete = string[]

// Vehicle Detials Type
export type vehicleDetails = {
    hash: number;
    vehicle: number;
    distance: number;
    plate: string;
}

// Several Vehicles
export type severalVehicles = vehicleDetails[]

// Ped Detials Type
export type pedDetails = {
    hash: number;
    ped: number;
    distance: number;
    plate: string;
}

// Several Peds
export type severalPeds = [
    pedDetails
]

// Object Detials Type
export type objectDetails = {
    hash: number;
    object: number;
    distance: number;
    plate: string;
}

// Several Objects
export type severalObjects = [
    objectDetails
]

// Rotation Type
export type rotation = [
    number,
    number,
    number
]

// Clothing Table Type
export type clothingOption = {
    id: string;
    value: number
}

// Created Callback
export type createdCallback = {
    [key: string]: any,
    id: string;
    name: string;
    ready: boolean;
    function: Function;
}

// Created Callbacks
export type createdCallbacks = createdCallback[string]

// Created Reactive Callback
export type reactiveCreatedCallback = {
    [key: string]: any,
    key: string;
    value: any;
    response: boolean;
    callback: Function;
    resource: string;
    update: Function;
}

// Created Reactive Callbacks
export type createdReactiveCallbacks = reactiveCreatedCallback[string]

// Create radial options
export type radialOptions = {
    [key: string]: any
}

// Menu Option Type
export type menuOption = {
    label: string;
    description: string;
    value: any;
}

// Menu Options Type
export type menuOptions = menuOption[]

// Create global option
export type globalOption = {
    [key: string]: any
}

// Create blip details
export type blipDetails = {
    [key: string]: any
}

// Color Details
export type colorDetails = {
    r: number;
    g: number;
    b: number
}

// Dui Details
export type duiDetails = {
    destroyScreen: Function,
    setCoords: Function,
    setRotation: Function,
    setScale: Function,
    duiWindow: number
}

// Door Details
export type doorDetail = {
    objectName: string | number;
    location: [number, number, number];
    closedHeading: number;
    openHeading?: number;
    isGate: boolean;
    autoLockDelay?: number;
}

// Door Details
export type doorDetails = {
    objectName: string | number;
    location: [number, number, number];
    closedHeading: number;
    openHeading?: number;
    isGate: boolean;
    autoLockDelay?: number;
}[]

// Callback Event
export interface callbackEvent {
    id: string;
    name: string;
    ready: boolean;
    // Add a more specific type for the callback function
    // For example, you can use (args: any[]) => void
    // Modify it based on the actual signature of your callbacks
    function: Function;
}

// Callback Event (Prox Marker)
type addProxMarkerType = (
    message: string,
    location: coordsV4,
    radius: number,
    activationRadius: number,
    marker: number,
    color: { r: number, g: number, b: number, a: number },
    spinning: boolean,
    bouncing: boolean
) => void

// Callback Event (Text Marker)
type addProxTextMarkerType = (
    message: string,
    location: coordsV4,
    radius: number,
    activationRadius: number,
    marker: number,
    color: { r: number, g: number, b: number, a: number },
    spinning: boolean,
    bouncing: boolean
) => void

// Callback Event (Entity Model)
type addTargetEntityModelType = (
    message: string,
    model: string,
    range: number,
    location: coordsV4,
    animationTable: { dictionary: string, animation: string } | null,
    scenario: string
) => void

// Callback Event (Entity Object)
type addTargetEntityObject = (
    message: string,
    model: string,
    range: number,
    location: coordsV4
) => void

// Callback Event (Entity Vehicle)
type addTargetEntityVehicle = (
    message: string,
    model: string,
    range: number,
    location: coordsV4
) => void

// Callback Event (Open Zone)
type addOpenZone = (
    message: string,
    locations: coordsV2[],
    minZ: number,
    maxZ: number
) => void

// Callback Event (Raw Zone)
type addRawZoneType = (
    message: string,
    location: coordsV4,
    length: number,
    width: number,
    minZ: number,
    maxZ: number
) => void

// Callback Event (Range Finder)
type addRangeFinderType = (
    message: string,
    location: coordsV4,
    distance: number,
    delay: number
) => void

// Callback Event (Job Requirement)
type addJobRequirementType = (
    jobName: string,
    jobRank: number,
    onDuty: boolean
) => void

// Callback Event (Gang Requirement)
type addGangRequirementType = (
    gangName: string,
    gangRank: number
) => void

// Callback Event (Cid Requirement)
type addCidRequirementType = (citizenIdentifier: string) => void

// Callback Event (Code Requirement)
type addCodeRequirementType = (passCode: string) => void

// Callback Event (Code Requirement)
type addOptCodeRequirementType = (passCode: string) => void

// Callback Event (Item Requirement)
type addItemRequirementType = (name: string, amount: number, remove: boolean) => void

// Callback Event (Item Degrade Requirement)
type addItemDegradeRequirement = (name: string, amount: number, level: number) => void

// Callback Event (Socieity Requirement)
type addSocietyRequirementType = (accountName: string, accountLimit: number) => void

// Callback Event (Config Requirement)
type addConfigInteractionType = (key: string, value: boolean) => void

// Callback Event (Config Requirement)
type activateLogs = (tableName: string, message: string, additionalDetails: { id: string, value: string }[]) => void


// Callback Event (Prox Interaction)
type addProxInteractionType = (
    message: string,
    location: coordsV4,
    radius: number,
    activationRadius: number
) => void

// Callback Event
export type interactionSystem = {
    addProxMarker: addProxMarkerType
    addProxTextMarker: addProxTextMarkerType
    addTargetEntityModel: addTargetEntityModelType
    addTargetEntityObject: addTargetEntityObject
    addTargetEntityVehicle: addTargetEntityVehicle
    addOpenZone: addOpenZone
    addRawZone: addRawZoneType
    addRangeFinder: addRangeFinderType
    addJobRequirement: addJobRequirementType
    addGangRequirement: addGangRequirementType
    addCidRequirement: addCidRequirementType
    addCodeRequirement: addCodeRequirementType
    addOptionalPassCode: addOptCodeRequirementType
    addItemDegradeRequirement: addItemDegradeRequirement
    addItemRequirement: addItemRequirementType
    addSocietyRequirements: addSocietyRequirementType
    addProxIneteraction: addProxInteractionType
    addConfigRequirements: addConfigInteractionType
    activateLogs: activateLogs
}

// Light Controller (Set Location)
type setLocation = (newCoords: coordsV3) => void

// Light Controller (Set Direction)
type setDirection = (newCoords: coordsV3) => void

// Light Controller (Set Color)
type setColor = (newColor: { r: number, g: number, b: number }) => void

// Light Controller (Set Distance)
type setDistance = (newDistance: number) => void

// Light Controller (Set Brightness)
type setBrightness = (newBrightness: number) => void

// Light Controller (Set Size)
type setSize = (newSize: number) => void

// Light Controller (Set Pause State)
type setPause = (state: boolean) => void

// Light Controller (Kill The Light)
type killLight = () => void

// Light Controller
export type lightModifierFunction = {
    setLocation: setLocation,
    setDirection: setDirection,
    setColor: setColor,
    setDistance: setDistance,
    setBrightness: setBrightness,
    setSize: setSize,
    setPause: setPause,
    killLight: killLight
}