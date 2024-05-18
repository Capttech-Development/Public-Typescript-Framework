import { requiredResources } from '../config';
import "./CPT_Client_Natives";
import {
    blipDetails,
    callbackEvent,
    clothingDetailPlus,
    clothingOption,
    coordsV2,
    coordsV3,
    coordsV4,
    createdReactiveCallbacks,
    doorDetail,
    doorDetails,
    duiDetails,
    interactionSystem,
    lightModifierFunction,
    menuOptions,
    multiplecoordsV2,
    objectDetails,
    pedDetails,
    radialOptions,
    rayDetail,
    reactiveCreatedCallback,
    rotationCoords,
    severalVehicles,
    targetMenuOptions,
    vehicleDetails
} from "./CPT_Client_Types";
export const vector2 = (x: number, y: number): coordsV2 => { return { x, y } }
export const vector3 = (x: number, y: number, z: number): coordsV3 => { return { x, y, z } }
export const vector4 = (x: number, y: number, z: number, w: number): coordsV4 => { return { x, y, z, w } }
export const QBCore = exports['qb-core']['GetCoreObject']()


//==============================================================\\
//====================| COLOR CONSOLE CORE |====================\\
class terminal {

    /**
     * Color Codes
     */
    private static colorCode: any = { orange: '^1', green: '^2', yellow: '^3', darkBlue: '^4', lightBlue: '^5', violet: '^6', white: '^7', red: '^8', pink: '^9' }

    /**
    * Log to terminal
    * @param title
    * @param message
    */
    public static log(title: string, message: string, color: string) {
        console.log(`${this.colorCode.white}${title}: ${this.colorCode[color]}${message} ${this.colorCode.white}`)
    }

    /**
     * Title to terminal
     * @param title
     * @param message
     */
    public static title(title: string) {
        console.log(`${this.colorCode.white}${title} ${this.colorCode.white}`)
    }
};


// //===================================================================\\
// //====================| REQUIRED RESOURCE CHECK |====================\\
class RequiredResources_Core_V3 {
    constructor() { }

    /**
     * Check if all required Resources are found
     */
    checkRequiredResources() {
        let foundAllResources: boolean = true

        requiredResources.forEach((resourceName: string) => {
            if (GetResourceState(resourceName) != 'started') {
                foundAllResources = false
                terminal.log('Missing', resourceName, 'orange')
            }
        })

        if (foundAllResources == true) {
            terminal.log('Required Resources:', 'Loaded', 'green')
        }
    }
}


//======================================================\\
//====================| ERROR CORE |====================\\
class Error_Core_V3 extends RequiredResources_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Returns the error code
     * @param errorDetails
     */
    public reportError(errorDetails: string): void {
        console.error('CPT FRAMEWORK DETECTED A ERROR')
        console.error(errorDetails)
        emitNet(`CPT_Core:Server:ReportError:${GetCurrentResourceName()}`, errorDetails)
    }
}


//=========================================================\\
//====================| SECURITY CORE |====================\\
class Security_Core_V2 extends Error_Core_V3 {
    private bannedValues: string;
    constructor() {
        super()
        this.bannedValues = "[{]};:'|,<.>/?!@#$%^&*()_+=-"
    }

    /**
     * Create exploit report
     * @param objectId 
     * @param message 
     */
    public reportExploit(objectId: string, message: string): void {
        var myLocation = GetEntityCoords(PlayerPedId(), true)
        var myVector = vector3(myLocation[0], myLocation[1], myLocation[2])
        emitNet(`CPT_Core:Server:SendExploitAlert:${GetCurrentResourceName()}`, message, objectId, myVector)
    }

    /**
     * Validate a string that it is not harmfull to security
     * @param value
     * @returns if it contains a banned value
     */
    public validateSecurityString(value: string): boolean {
        const bannedValueTable = this.bannedValues.split('');
        let isBanned: boolean = false
        bannedValueTable.forEach((bannedValue: string) => {
            if (value.includes(bannedValue)) {
                isBanned = true
            }
        })
        return isBanned
    }
}


//======================================================\\
//====================| READY CORE |====================\\
class PlayerReady_Core_V3 extends Security_Core_V2 {
    public coreReady: Boolean
    public debugMode: Boolean
    constructor() {
        super()
        this.coreReady = false
        this.debugMode = false
    }

    /**
     * On ready event
     * @returns
     */
    public async onReady(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.coreReady == false) {
                const readyInterval = setInterval(() => {
                    if (this.coreReady == true) {
                        resolve()
                        clearInterval(readyInterval)
                    }
                }, 1);
            } else if (this.coreReady == true) {
                resolve()
            }
        })
    }
}


//======================================================\\
//====================| TOOLS CORE |====================\\
class Tools_Core_V3 extends PlayerReady_Core_V3 {
    public createdObject: number[]
    public createdPeds: number[]
    constructor() {
        super()
        this.createdObject = []
        this.createdPeds = []
        this.onScriptOff()
    }

    /**
     * Register a export in typescript
     * @param id
     * @param callback
     */
    public registerExport(id: string, callback: Function) {
        exports(id, callback)
    }

    /**
     * When the script turns off it will clear objects
     */
    private onScriptOff() {
        on('onResourceStop', (resourceName: string) => {
            if (resourceName == GetCurrentResourceName()) {
                this.createdObject.forEach((prop: number) => {
                    DeleteObject(prop)
                })

                this.createdPeds.forEach((entity: number) => {
                    DeleteEntity(entity)
                })
            }
        })
    }

    /**
     * Convert HEX to RGB
     * @param hex
     * @returns
     */
    public hexToRgb(hex: string): { r: number, g: number, b: number } {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) { return { r: 0, g: 0, b: 0 } }
        const rgbValues = {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        return rgbValues
    }

    /**
     * Trim Dashes
     * @param value
     * @returns
     */
    public trim(value: string) {
        const readyValue = value.replace("-", " ");
        return readyValue
    }

    /**
     * Turn off a entity audio lines
     * @param ped Target Ped
     */
    public disablePedAudio(ped: any): void {
        DisablePedPainAudio(ped, true)
        StopPedSpeaking(ped, true)
    }

    /**
      * Stream animation into the game
      * @param animation Stream a new animation to the server
      * @returns When the animation is finished streaming
      */
    public async streamAnimation(animation: string): Promise<void> {
        await this.onReady()
        return new Promise<void>((resolve, reject) => {
            let animationLoadInterval = 0
            const animationStreamLoop = setInterval(() => {
                animationLoadInterval += 1

                if (HasAnimDictLoaded(animation) == false) {
                    RequestAnimDict(animation)
                } else {
                    resolve()
                    clearInterval(animationStreamLoop)
                }

                if (animationLoadInterval == 1000) { resolve(); clearInterval(animationStreamLoop) }
            }, 1)
        })
    }

    /**
     * Stream a asset into the game
     * @param assetName Stream a new asset to the server
     * @returns When the asset is finished streaming
     */
    public async streamAsset(assetName: string): Promise<void> {
        await this.onReady()
        return new Promise<void>((resolve, reject) => {
            let assetLoadInterval = 0
            const assetStreamLoop = setInterval(() => {
                assetLoadInterval += 1

                if (HasNamedPtfxAssetLoaded(assetName) == false) {
                    RequestNamedPtfxAsset(assetName)
                } else {
                    resolve()
                    clearInterval(assetStreamLoop)
                }

                if (assetLoadInterval == 1000) { resolve(); clearInterval(assetStreamLoop) }
            }, 1)
        })
    }

    /**
     * Stream a particle into the game
     * @param particleName Stream a new particle to the server
     * @returns When the particle is finished streaming
     */
    public async streamParticle(particleName: string): Promise<void> {
        await this.onReady()
        return new Promise<void>((resolve, reject) => {
            let particleLoadInterval = 0
            const particleStreamLoop = setInterval(() => {
                particleLoadInterval += 1

                if (HasNamedPtfxAssetLoaded(particleName) == false) {
                    RequestNamedPtfxAsset(particleName)
                } else {
                    resolve()
                    clearInterval(particleStreamLoop)
                }

                if (particleLoadInterval == 5000) { resolve(); clearInterval(particleStreamLoop) }
            }, 1)
        })
    }

    /**
     * Play a animation on a ped
     * @param dictionary The dictionary the animation is from
     * @param animation The animation name
     * @param targetPed The player / ped to target
     * @returns When the entity is playing the animation
     */
    public async playAnimation(dictionary: string, animation: string, targetPed: number): Promise<void> {
        await this.onReady()
        await this.streamAnimation(dictionary)
        TaskPlayAnim(targetPed, dictionary, animation, 8.0, 1.0, -1, 1, 0, false, false, false)
        return
    }

    /**
     * Play mobile animation on a target ped
     * @param dictionary The dictionary the animation is from
     * @param animation The animation name
     * @param targetPed The player / ped to target
     *  @returns When the entity is playing the animation
     */
    public async playMobileAnimation(dictionary: string, animation: string, targetPed: number): Promise<void> {
        await this.onReady()
        await this.streamAnimation(dictionary)
        TaskPlayAnim(targetPed, dictionary, animation, 8.0, 1.0, -1, 51, 0, false, false, false)
        return
    }

    /**
     * Play a scenario on a target ped
     * @param dictionary The dictionary the scenario is from
     * @param targetPed The player / ped to target
     * @returns When the entity is playing the scenario
     */
    public async playScenario(dictionary: string, targetPed: number): Promise<void> {
        await this.onReady()
        TaskStartScenarioInPlace(targetPed, dictionary, 0, true)
        return
    }

    /**
     * Stream a model into the game
     * @param model Stream a new model to the server
     * @returns When the model has streamed
     */
    public async streamModel(model: string): Promise<void> {
        await this.onReady()
        return new Promise<void>(function (resolve, reject) {
            let modelLoadInterval = 0
            const modelStreamLoop = setInterval(() => {
                modelLoadInterval += 1

                if (HasModelLoaded(model) == false) {
                    RequestModel(model)
                } else {
                    resolve()
                    clearInterval(modelStreamLoop)
                }

                if (modelLoadInterval == 5000) { resolve(); clearInterval(modelStreamLoop) }
            }, 1)
        })
    }

    /**
     * Play a animation in a prop
     * @param dictionary The dictionary the animation is from
     * @param animation The animation name
     * @param prop1 The prop for the animation
     * @param bone The bone location on the model
     * @param propPosition The offset coords for the prop
     * @param targetPed The player / ped to target
     * @returns When the animation is playing and the prop used
     */
    public async playAnimationProp(dictionary: string, animation: string, prop1: string, bone: number, propPosition: any[number], targetPed: number): Promise<number> {
        await this.onReady()
        return new Promise<number>(async (resolve, reject) => {
            await this.streamAnimation(dictionary)
            await this.streamModel(prop1)
            TaskPlayAnim(targetPed, dictionary, animation, 8.0, 1.0, -1, 1, 0, false, false, false)
            const pedCoords = GetEntityCoords(targetPed, true)
            const propHash = GetHashKey(prop1)
            const createdProp = CreateObject(propHash, pedCoords[0], pedCoords[1], pedCoords[2] + 0.2, true, true, true)
            this.createdObject.push(createdProp)
            AttachEntityToEntity(createdProp, targetPed, GetPedBoneIndex(targetPed, bone), propPosition[0], propPosition[1], propPosition[2], propPosition[3], propPosition[4], propPosition[5], true, true, false, true, 1, true)
            SetModelAsNoLongerNeeded(createdProp)
            resolve(createdProp)
        })
    }

    /**
     * Play a animation that you can move in
     * @param dictionary The dictionary the animation is from
     * @param animation The animation name
     * @param prop1 The prop for the animation
     * @param bone The bone location on the model
     * @param propPosition The offset coords for the prop
     * @param targetPed The player / ped to target
     * @param callback The callback when the animation is playing
     * @returns When the animation is playing and the prop used
     */
    public async playMobileAnimationProp(dictionary: string, animation: string, prop1: string, bone: number, propPosition: any[number], targetPed: number): Promise<number> {
        await this.onReady()
        return new Promise<number>(async (resolve, reject) => {
            await this.streamAnimation(dictionary)
            await this.streamModel(prop1)
            TaskPlayAnim(targetPed, dictionary, animation, 8.0, 1.0, -1, 51, 0, false, false, false)
            const pedCoords = GetEntityCoords(targetPed, true)
            const createdProp = CreateObject(GetHashKey(prop1), pedCoords[0], pedCoords[1], pedCoords[2] + 0.2, true, true, true)
            this.createdObject.push(createdProp)
            AttachEntityToEntity(createdProp, targetPed, GetPedBoneIndex(targetPed, bone), propPosition[0], propPosition[1], propPosition[2], propPosition[3], propPosition[4], propPosition[5], true, true, false, true, 1, true)
            SetModelAsNoLongerNeeded(createdProp)
            resolve(createdProp)
        })
    }

    /**
     * Teleport a target entity to a new location
     * @param location New location
     * @param heading Heading of that location
     * @param targetEntity The entity to target
     * @param placeProperly Place the entity on the ground
     * @returns When the player has been teleported
     */
    public async teleport(location: coordsV4, targetEntity: number, placeProperly: boolean): Promise<void> {
        DoScreenFadeOut(500)
        setTimeout(() => {
            SetEntityCoords(targetEntity, location.x, location.y, location.z, true, false, false, false)
            SetEntityHeading(targetEntity, location.w)
            if (placeProperly == true) { PlaceObjectOnGroundProperly(targetEntity) }
            setTimeout(() => { DoScreenFadeIn(500) }, 150)
        }, 1500)
        return
    }

    /**
     * Teleport a target entity to a location with a varied Z coord
     * @param location New location
     * @param targetEntity The entity to target
     */
    public async tpmTeleport(location: coordsV2, targetEntity: number): Promise<void> {
        let currentZCoord = 0

        const teleportInterval = setInterval(() => {
            currentZCoord = currentZCoord + 1
            SetEntityCoords(targetEntity, location.x, location.y, currentZCoord, true, false, false, false)
            const groundCoords = GetGroundZFor_3dCoord(location.x, location.y, currentZCoord, true)
            const foundCoords = groundCoords[0]
            const foundZCoord = groundCoords[1]
            if (foundCoords == true) {
                SetEntityCoords(targetEntity, location.x, location.y, foundZCoord, true, false, false, false)
                clearInterval(teleportInterval)
            }
        }, 50)
    }

    /**
     * Create a entity in the game
     * @param model Model of the ped being created
     * @param location Where the ped is being created
     * @param frozen If the entity should be frozen or not
     * @param invincible If the entity should be invincible
     * @param networked If the entity should be network synced
     * @returns The ped created
     */
    public async createPed(model: string, location: coordsV4, frozen: boolean, invincible: boolean, networked: boolean): Promise<number> {
        await this.onReady()
        return new Promise<number>(async (resolve, reject) => {
            await this.streamModel(model)

            const createdPed = CreatePed(4, GetHashKey(model), location.x, location.y, location.z - 1.0, location.w, networked, true)
            this.createdPeds.push(createdPed)
            SetBlockingOfNonTemporaryEvents(createdPed, true)

            if (frozen == true) { FreezeEntityPosition(createdPed, true) }
            if (invincible == true) { SetEntityInvincible(createdPed, true) }

            resolve(createdPed)
        })
    }

    /**
     * Create a object in the game
     * @param model Model of the ped being created
     * @param location Where the ped is being created
     * @param frozen If the object should be frozen or not
     * @param invincible If the object should be invincible
     * @param networked If the object should be network synced
     * @returns The created object
     */
    public async createObject(model: string, location: coordsV4, frozen: boolean, invincible: boolean, networked: boolean): Promise<number> {
        await this.onReady()
        return new Promise<number>(async (resolve, reject) => {
            await this.streamModel(model)
            const createdObject = CreateObject(model, location.x, location.y, location.z, networked, false, true)
            this.createdObject.push(createdObject)
            SetBlockingOfNonTemporaryEvents(createdObject, true)
            SetEntityHeading(createdObject, location.w)

            if (frozen == true) { FreezeEntityPosition(createdObject, true) }
            if (invincible == true) { SetEntityInvincible(createdObject, true) }

            resolve(createdObject)
        })
    }

    /**
     * Get the closest vehicle to location
     * @param location Location of where to check for vehicles
     * @param distance Distance from that location to check
     * @returns Vehicle details
     */
    public getClosestVehicle(location: coordsV3, distance: number): vehicleDetails {
        const allVehicles = GetGamePool('CVehicle')
        let foundVehicles = {
            hash: 0,
            vehicle: 0,
            distance: 0,
            plate: ''
        }

        for (let i = 0; i < allVehicles.length; i++) {
            const vehicleCoords = GetEntityCoords(allVehicles[i], true)
            const vehicleDistance = GetDistanceBetweenCoords(location.x, location.y, location.z, vehicleCoords[0], vehicleCoords[1], vehicleCoords[2], true)

            if (vehicleDistance <= distance) {
                foundVehicles = {
                    hash: GetEntityModel(allVehicles[i]),
                    vehicle: allVehicles[i],
                    distance: vehicleDistance,
                    plate: GetVehicleNumberPlateText(allVehicles[i])
                }
            }
        }

        return foundVehicles
    }

    /**
     * Get the closest vehicle to location
     * @param location Location of where to check for vehicles
     * @param distance Distance from that location to check
     * @returns Vehicle details
     */
    public getClosestVehicleByModel(location: coordsV3, distance: number, model: string): vehicleDetails {
        const allVehicles = GetGamePool('CVehicle')
        let foundVehicles = {
            hash: 0,
            vehicle: 0,
            distance: 0,
            plate: ''
        }

        for (let i = 0; i < allVehicles.length; i++) {
            const vehicleCoords = GetEntityCoords(allVehicles[i], true)
            const vehicleDistance = GetDistanceBetweenCoords(location.x, location.y, location.z, vehicleCoords[0], vehicleCoords[1], vehicleCoords[2], true)

            // GetEntityModel(allVehicles[i])

            if (vehicleDistance <= distance) {
                foundVehicles = {
                    hash: GetEntityModel(allVehicles[i]),
                    vehicle: allVehicles[i],
                    distance: vehicleDistance,
                    plate: GetVehicleNumberPlateText(allVehicles[i])
                }
            }
        }

        return foundVehicles
    }

    /**
     * Get the closest ped to location
     * @param location Location of where to check for peds
     * @param distance Distance from that location to check
     * @returns Ped details
     */
    public getClosestPed(location: coordsV3, distance: number): pedDetails {
        const allPeds = GetGamePool('CPed')
        let foundPed = {
            hash: 0,
            ped: 0,
            distance: 0,
            plate: ''
        }

        for (let i = 0; i < allPeds.length; i++) {
            const pedCoords = GetEntityCoords(allPeds[i], true)
            const pedDistance = GetDistanceBetweenCoords(location.x, location.y, location.z, pedCoords[0], pedCoords[1], pedCoords[2], true)

            if (pedDistance <= distance) {
                foundPed = {
                    hash: GetEntityModel(allPeds[i]),
                    ped: allPeds[i],
                    distance: pedDistance,
                    plate: GetVehicleNumberPlateText(allPeds[i])
                }
            }
        }

        return foundPed
    }

    /**
     * Get the closest ped to location
     * @param location Location of where to check for peds
     * @param distance Distance from that location to check
     * @returns Ped details
     */
    public getClosestObject(location: coordsV3, distance: number): objectDetails {
        const allObjects = GetGamePool('CObject')
        let foundObject = {
            hash: 0,
            object: 0,
            distance: 0,
            plate: ''
        }

        for (let i = 0; i < allObjects.length; i++) {
            const objectCoords = GetEntityCoords(allObjects[i], true)
            const objectDistance = GetDistanceBetweenCoords(location.x, location.y, location.z, objectCoords[0], objectCoords[1], objectCoords[2], true)

            if (objectDistance <= distance) {
                foundObject = {
                    hash: GetEntityModel(allObjects[i]),
                    object: allObjects[i],
                    distance: objectDistance,
                    plate: GetVehicleNumberPlateText(allObjects[i])
                }
            }
        }

        return foundObject
    }

    /**
     * Get all vehicls from a location
     * @param location Location of where to check for vehicles
     * @param distance Distance from that location to check
     * @returns Vehicle detials
     */
    public async getAllVehicles(location: coordsV3, distance: number): Promise<severalVehicles> {
        await this.onReady()
        return new Promise<severalVehicles>((resolve, reject) => {
            const allVehicles = GetGamePool('CVehicle')
            let foundVehicles: severalVehicles = [
                { hash: 0, vehicle: 0, distance: 0, plate: '' }
            ]

            for (let i = 0; i < allVehicles.length; i++) {
                const vehicleCoords = GetEntityCoords(allVehicles[i], true)
                const vehicleDistance = GetDistanceBetweenCoords(location.x, location.y, location.z, vehicleCoords[0], vehicleCoords[1], vehicleCoords[2], true)

                if (vehicleDistance <= distance) {
                    foundVehicles.push({
                        hash: GetEntityModel(allVehicles[i]),
                        vehicle: parseInt(allVehicles[i]),
                        distance: vehicleDistance,
                        plate: GetVehicleNumberPlateText(allVehicles[i])
                    })
                }
            }

            resolve(foundVehicles)
        })
    }

    /**
     * Waits till the screen is faded out
     * @returns when the screen is not faded out
     */
    public waitScreenFadeout(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const screenFadeoutInterval = setInterval(() => {
                if (IsScreenFadedOut()) {
                    clearInterval(screenFadeoutInterval)
                    resolve()
                }
            }, 1);
        })
    }

    /**
     * Set first letter capital
     * @param value 
     * @returns The word but with a captale letter
     */
    public capitalizeFLetter(value: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            value = value.toLowerCase()
            resolve(`${value[0].toUpperCase()}${value.slice(1)}`)
        })
    }
}


//=====================================================\\
//====================| MATH CORE |====================\\
class Math_Core_V3 extends Tools_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Get random number
     * @param min The lowest number
     * @param max The highest number
     * @returns a random number
     */
    public mathRandom(min: number, max: number): number {
        var createdRandomNumber = Math.floor(Math.random() * (max - min + 1) + min)
        return createdRandomNumber
    }


    /**
     * Get the distance between two coords
     * @param x1 X coord for the first coord
     * @param y1 Y coord for the first coord
     * @param z1 Z coord for the first coord
     * @param x1 X coord for the first coord
     * @param y1 Y coord for the first coord
     * @param z1 Z coord for the first coord
     * @returns The distance
     */
    public async mathDistance(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): Promise<number> {
        await this.onReady()
        const distance = (p1: coordsV3, p2: coordsV3) => {
            var a = p2.x - p1.x;
            var b = p2.y - p1.y;
            var c = p2.z - p1.z;

            return Math.sqrt(a * a + b * b + c * c);
        }
        return distance({ x: x1, y: y1, z: z1 }, { x: x2, y: y2, z: z2 })
    }

    /**
     * Convert a number to a math format
     * @param amount Given number
     * @returns Formated string
     */
    public async mathCurrencyFormat(amount: number): Promise<string> {
        await this.onReady()
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }
}


//========================================================\\
//====================| RAYCAST CORE |====================\\
class RayCast_Core_V3 extends Math_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Rotation to direction
     * @param rotation 
     * @returns The direction to rotate to
     */
    public async rotationToDirection(rotation: any): Promise<coordsV3> {
        await this.onReady()
        const adjustedRotation = {
            x: (Math.PI / 180) * rotation[0],
            y: (Math.PI / 180) * rotation[1],
            z: (Math.PI / 180) * rotation[2]
        }
        const direction = {
            x: -Math.sin(adjustedRotation.z) * Math.abs(Math.cos(adjustedRotation.x)),
            y: Math.cos(adjustedRotation.z) * Math.abs(Math.cos(adjustedRotation.x)),
            z: Math.sin(adjustedRotation.x)
        }
        return direction
    }

    /**
     * Start up ready cast
     * @param testDistance 
     * @returns Ray cat details of what it hits
     */
    public async castRayRaw(testDistance: number): Promise<any> {
        await this.onReady()

        return new Promise<{ state: boolean; details: any }>((resolve, reject) => {
            const objectInterval = setInterval(async () => {
                const cameraRotation = GetGameplayCamRot(0);
                const cameraCoord = GetGameplayCamCoord();
                const direction = await this.rotationToDirection(cameraRotation);
                const destination = {
                    x: cameraCoord[0] + direction.x * 1000.0,
                    y: cameraCoord[1] + direction.y * 1000.0,
                    z: cameraCoord[2] + direction.z * 1000.0
                };

                const rayShape = StartShapeTestRay(cameraCoord[0], cameraCoord[1], cameraCoord[2], destination.x, destination.y, destination.z, -1, PlayerPedId(), 0);
                const shapeResults = GetShapeTestResult(rayShape);

                const myCoords = GetEntityCoords(PlayerPedId(), true);
                const distance = await this.mathDistance(myCoords[0], myCoords[1], myCoords[2], shapeResults[2][0], shapeResults[2][1], shapeResults[2][2]);

                if (distance < testDistance) {
                    clearInterval(objectInterval);
                    resolve({ state: true, details: shapeResults });
                }
            });

            setTimeout(() => {
                clearInterval(objectInterval);
                resolve({ state: false, details: null });
            }, 15000);
        });
    }


    /**
     * Start up ready cast
     * @param testDistance 
     * @returns Ray cat details of what it hits
     */
    public async castRay(testDistance: number): Promise<rayDetail> {
        await this.onReady()

        return new Promise<rayDetail>((resolve, reject) => {
            const objectInterval = setInterval(async () => {
                const cameraRotation = GetGameplayCamRot(0);
                const cameraCoord = GetGameplayCamCoord();
                const direction = await this.rotationToDirection(cameraRotation);
                const destination = {
                    x: cameraCoord[0] + direction.x * 1000.0,
                    y: cameraCoord[1] + direction.y * 1000.0,
                    z: cameraCoord[2] + direction.z * 1000.0
                };

                const rayShape = StartShapeTestRay(cameraCoord[0], cameraCoord[1], cameraCoord[2], destination.x, destination.y, destination.z, -1, PlayerPedId(), 0);
                const shapeResults = GetShapeTestResult(rayShape);

                const myCoords = GetEntityCoords(PlayerPedId(), true);
                const distance = await this.mathDistance(myCoords[0], myCoords[1], myCoords[2], shapeResults[2][0], shapeResults[2][1], shapeResults[2][2]);

                if (distance < testDistance) {
                    clearInterval(objectInterval);
                    resolve({
                        state: true,
                        hit: shapeResults[1],
                        coords: shapeResults[2],
                        entity: shapeResults[4]
                    });
                }
            });

            setTimeout(() => {
                clearInterval(objectInterval);
                resolve({
                    state: false,
                    hit: [],
                    coords: [],
                    entity: 0
                });
            }, 15000);
        });
    }

    /**
     * Created ped RAY cast
     * @param testDistance 
     * @returns Ray cat details of what it hits
     */
    public async castPedRay(testDistance: number): Promise<rayDetail> {
        await this.onReady()
        return new Promise<rayDetail>((resolve, reject) => {
            const objectInterval = setInterval(async () => {
                const cameraRotation = GetGameplayCamRot(0);
                const cameraCoord = GetGameplayCamCoord();
                const direction = await this.rotationToDirection(cameraRotation);
                const destination = {
                    x: cameraCoord[0] + direction.x * 1000.0,
                    y: cameraCoord[1] + direction.y * 1000.0,
                    z: cameraCoord[2] + direction.z * 1000.0
                };

                const rayShape = StartShapeTestRay(cameraCoord[0], cameraCoord[1], cameraCoord[2], destination.x, destination.y, destination.z, -1, PlayerPedId(), 0);
                const shapeResults = GetShapeTestResult(rayShape);

                const myCoords = GetEntityCoords(PlayerPedId(), true);
                const distance = await this.mathDistance(myCoords[0], myCoords[1], myCoords[2], shapeResults[2][0], shapeResults[2][1], shapeResults[2][2]);

                if (distance < testDistance && shapeResults[4]) {
                    clearInterval(objectInterval);
                    resolve({
                        state: true,
                        hit: shapeResults[1],
                        coords: shapeResults[2],
                        entity: shapeResults[4]
                    });
                }
            });

            setTimeout(() => {
                clearInterval(objectInterval);
                resolve({
                    state: false,
                    hit: [],
                    coords: [],
                    entity: 0
                });
            }, 15000);
        });
    }
}


//===============================================================\\
//====================| SCREEN EFFECTS CORE |====================\\
class ScreenEffects_Core_V3 extends RayCast_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Screen Effect
     * @param time 
     */
    public async effectMenuMGHeistOut(time: number): Promise<void> {
        await this.onReady()
        const effectInterval = setInterval(() => {
            AnimpostfxPlay('MenuMGHeistOut', 0, true)
        }, 1)

        setTimeout(() => {
            clearInterval(effectInterval)
            AnimpostfxStop('MenuMGHeistOut')
        }, time * 1000)
    }

    /**
     * Screen Effect
     * @param time 
     */
    public async effectPeyoteEndOut(time: number): Promise<void> {
        await this.onReady()
        AnimpostfxPlay('PeyoteEndOut', 0, true)

        setTimeout(() => {
            AnimpostfxStop('PeyoteEndOut')
        }, time * 1000)
    }

    /**
     * Modify players stress
     * @param value The amout of stress to modify
     */
    public async playerEffectStress(value: number): Promise<void> {
        await this.onReady()
        if (value > 0) {
            emitNet('hud:server:GainStress', value)
        } else {
            const positiveValue = Math.abs(value)
            emitNet('hud:server:RelieveStress', positiveValue)
        }
    }
}


//=========================================================\\
//====================| CLOTHING CORE |====================\\
class Clothing_Core_V3 extends ScreenEffects_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Return the player sex
     * @param targetPlayer
     * @returns male / female / unknown
     */
    public getEntitySex(targetPlayer: number): string {
        const playerModel = GetEntityModel(targetPlayer)
        const maleHashKey = GetHashKey('mp_m_freemode_01')
        const femaleHash = GetHashKey('mp_f_freemode_01')
        if (playerModel == maleHashKey) {
            return 'male'
        } else if (playerModel == femaleHash) {
            return 'female'
        } else {
            return 'unknown'
        }
    }

    /**
     * Set ped appearance ( Illenium )
     * @param targetPed 
     * @param fullAppreance 
     */
    illeniumSetSkin(targetPed: number, fullAppreance: any) {
        exports['illenium-appearance']['setPedAppearance'](targetPed, fullAppreance)
    }

    /**
     * Get Player skin variant number
     * @param targetPed Target Ped
     * @returns Varient of clothing item
     */
    private getCurrentVariant(fullTable: any, locationId: string): number {
        var foundElement = {
            id: '',
            value: 0
        }
        fullTable.forEach((clothingElement: clothingOption) => {
            if (clothingElement.id == locationId) {
                foundElement = clothingElement
            }
        })
        return foundElement.value
    }

    /**
     * Get player skin table
     * @param targetPed Target Ped
     * @returns Full character skin details
     */
    public async getPlayerSkin(targetPed: number): Promise<clothingDetailPlus> {
        await this.onReady()
        return new Promise<clothingDetailPlus>((resolve, reject) => {
            const allComponents = [
                { label: 'Sex', id: 'sex', value: 0, min: 0, max: 1 },

                //===| FACE |===\\
                { label: 'Mom', id: 'mom', value: 21, min: 21, max: 45 },
                { label: 'Dad', id: 'dad', value: 0, min: 0, max: 44 },
                { label: 'Resemblance', id: 'face_md_weight', value: 50, min: 0, max: 100 },
                { label: 'Skin Tone', id: 'skin_md_weight', value: 50, min: 0, max: 100 },
                { label: 'Nose Width', id: 'nose_1', value: 0, min: -10, max: 10 },
                { label: 'Nose Peak Height', id: 'nose_2', value: 0, min: -10, max: 10 },
                { label: 'Nose Peak Length', id: 'nose_3', value: 0, min: -10, max: 10 },
                { label: 'Nose Bone Height', id: 'nose_4', value: 0, min: -10, max: 10 },
                { label: 'Nose Peak Lowering', id: 'nose_5', value: 0, min: -10, max: 10 },
                { label: 'Nose Bone Twist', id: 'nose_6', value: 0, min: -10, max: 10 },
                { label: 'Cheekbones Height', id: 'cheeks_1', value: 0, min: -10, max: 10 },
                { label: 'Cheekbones Width', id: 'cheeks_2', value: 0, min: -10, max: 10 },
                { label: 'Cheeks Width', id: 'cheeks_3', value: 0, min: -10, max: 10 },
                { label: 'Lip Fullnesss', id: 'lip_fullness', value: 0, min: -10, max: 10 },
                { label: 'Jaw Bone Width', id: 'jaw_1', value: 0, min: -10, max: 10 },
                { label: 'Jaw Bone Length', id: 'jaw_2', value: 0, min: -10, max: 10 },
                { label: 'Chin Height', id: 'chin_1', value: 0, min: -10, max: 10 },
                { label: 'Chin Length', id: 'chin_2', value: 0, min: -10, max: 10 },
                { label: 'Chin Width', id: 'chin_3', value: 0, min: -10, max: 10 },
                { label: 'Chin Hole Size', id: 'chin_4', value: 0, min: -10, max: 10 },
                { label: 'Neck Thickness', id: 'neck_thickness', value: 0, min: -10, max: 10 },

                //===| EYES / MAKEUP |===\\
                { label: 'Eye Color', id: 'eye_color', value: 0, min: 0, max: 31 },
                { label: 'Eye Squint', id: 'eye_squint', value: 0, min: -10, max: 10 },
                { label: 'Eyebrow Type', id: 'eyebrows_1', value: 0, min: 0, max: GetNumHeadOverlayValues(2) - 1 },
                { label: 'Eyebrow Size', id: 'eyebrows_2', value: 0, min: 0, max: 10 },
                { label: 'Eyebrow Color 1', id: 'eyebrows_3', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Eyebrow Color 2', id: 'eyebrows_4', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Eyebrow Height', id: 'eyebrows_5', value: 0, min: 0, max: 10 },
                { label: 'Eyebrow Depth', id: 'eyebrows_6', value: 0, min: 0, max: 10 },
                { label: 'Makeup Type', id: 'makeup_1', value: 0, min: 0, max: GetNumHeadOverlayValues(4) - 1 },
                { label: 'Makeup Thickness', id: 'makeup_2', value: 0, min: 0, max: 10 },
                { label: 'Makeup Color 1', id: 'makeup_3', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Makeup Color 2', id: 'makeup_4', value: 0, min: 0, max: GetNumHairColors() - 1 },

                //===| LIPSTICK |===\\
                { label: 'Lipstick Type', id: 'lipstick_1', value: 0, min: 0, max: GetNumHeadOverlayValues(8) - 1 },
                { label: 'Lipstick Thickness', id: 'lipstick_2', value: 0, min: 0, max: 10 },
                { label: 'Lipstick Color 1', id: 'lipstick_3', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Lipstick Color 2', id: 'lipstick_4', value: 0, min: 0, max: GetNumHairColors() - 1 },

                //===| HAIR |===\\
                { label: 'Hair 1', id: 'hair_1', value: GetPedDrawableVariation(targetPed, 2), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 2) - 1 },
                { label: 'Hair Color 1', id: 'hair_color_1', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Hair Color 2', id: 'hair_color_2', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Chest Hair', id: 'chest_1', value: 0, min: 0, max: GetNumHeadOverlayValues(10) - 1 },
                { label: 'Chest Hair Thickness', id: 'chest_2', value: 0, min: 0, max: 10 },
                { label: 'Chest Hair Color', id: 'chest_3', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Beard Type', id: 'beard_1', value: 0, min: 0, max: GetNumHeadOverlayValues(1) - 1 },
                { label: 'Beard Size', id: 'beard_2', value: 0, min: 0, max: 10 },
                { label: 'Beard Color 1', id: 'beard_3', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Beard Color 2', id: 'beard_4', value: 0, min: 0, max: GetNumHairColors() - 1 },

                //===| CLOTHES |===\\
                { label: 'TShirt 1', id: 'tshirt_1', value: GetPedDrawableVariation(targetPed, 8), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 8) - 1 },
                { label: 'Torso 1', id: 'torso_1', value: GetPedDrawableVariation(targetPed, 11), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 11) - 1 },
                { label: 'Pants 1', id: 'pants_1', value: GetPedDrawableVariation(targetPed, 4), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 4) - 1 },
                { label: 'Shoes 1', id: 'shoes_1', value: GetPedDrawableVariation(targetPed, 6), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 6) - 1 },

                //===| ACCESSORIES |===\\
                { label: 'Ear Accessories', id: 'ears_1', value: -1, min: -1, max: GetNumberOfPedPropDrawableVariations(targetPed, 2) - 1 },

                //===| ADDONS |===\\
                { label: 'Decals 1', id: 'decals_1', value: GetPedDrawableVariation(targetPed, 10), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 10) - 1 },
                { label: 'Mask 1', id: 'mask_1', value: GetPedDrawableVariation(targetPed, 1), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 1) - 1 },
                { label: 'Bulletproof Vest 1', id: 'bproof_1', value: GetPedDrawableVariation(targetPed, 9), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 9) - 1 },
                { label: 'Chain 1', id: 'chain_1', value: GetPedDrawableVariation(targetPed, 7), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 7) - 1 },
                { label: 'Bag', id: 'bags_1', value: GetPedDrawableVariation(targetPed, 5), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 5) - 1 },
                { label: 'Helmet 1', id: 'helmet_1', value: -1, min: 0, max: GetNumberOfPedPropDrawableVariations(targetPed, 0) - 1 },
                { label: 'Glasses 1', id: 'glasses_1', value: -1, min: 0, max: GetNumberOfPedPropDrawableVariations(targetPed, 1) - 1 },
                { label: 'Watches 1', id: 'watches_1', value: -1, min: 0, max: GetNumberOfPedPropDrawableVariations(targetPed, 6) - 1 },
                { label: 'Bracelets 1', id: 'bracelets_1', value: -1, min: 0, max: GetNumberOfPedPropDrawableVariations(targetPed, 7) - 1 },

                //===| BODY |===\\
                { label: 'Arms 1', id: 'arms', value: GetPedDrawableVariation(targetPed, 3), min: 0, max: GetNumberOfPedDrawableVariations(targetPed, 3) - 1, },
                { label: 'Arms 2', id: 'arms_2', value: 0, min: 0, max: 10 },
                { label: 'Body Blemishes', id: 'bodyb_1', value: 0, min: 0, max: GetNumHeadOverlayValues(11) - 1 },
                { label: 'Body Blemishes Thickness', id: 'bodyb_2', value: 0, min: 0, max: 10 },
                { label: 'Blemishes Body Effect', id: 'bodyb_3', value: 0, min: 0, max: GetNumHeadOverlayValues(12) - 1 },
                { label: 'Blemishes Body Effect Thickness', id: 'bodyb_4', value: 0, min: 0, max: 10 },

                //===| COMPLEXION |===\\
                { label: 'Wrinkles', id: 'age_1', value: 0, min: 0, max: GetNumHeadOverlayValues(3) - 1 },
                { label: 'Wrinkles Thickness', id: 'age_2', value: 0, min: 0, max: 10 },
                { label: 'Blemishes', id: 'blemishes_1', value: 0, min: 0, max: GetNumHeadOverlayValues(0) - 1 },
                { label: 'Blemishes Size', id: 'blemishes_2', value: 0, min: 0, max: 10 },
                { label: 'Blush', id: 'blush_1', value: 0, min: 0, max: GetNumHeadOverlayValues(5) - 1 },
                { label: 'Blush Thickness', id: 'blush_2', value: 0, min: 0, max: 10 },
                { label: 'Blush Color', id: 'blush_3', value: 0, min: 0, max: GetNumHairColors() - 1 },
                { label: 'Complexion', id: 'complexion_1', value: 0, min: 0, max: GetNumHeadOverlayValues(6) - 1 },
                { label: 'Complexion Thickness', id: 'complexion_2', value: 0, min: 0, max: 10 },
                { label: 'Sun', id: 'sun_1', value: 0, min: 0, max: GetNumHeadOverlayValues(7) - 1 },
                { label: 'Sun Thickness', id: 'sun_2', value: 0, min: 0, max: 10 },
                { label: 'Freckles', id: 'moles_1', value: 0, min: 0, max: GetNumHeadOverlayValues(9) - 1 },
                { label: 'Freckles Thickness', id: 'moles_2', value: 0, min: 0, max: 10 },
            ]

            //===| SETUP VARATION 2 |===\\
            allComponents.push({ label: 'Hair 2', id: 'hair_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 2, this.getCurrentVariant(allComponents, 'hair_1')) - 1 })
            allComponents.push({ label: 'TShirt 2', id: 'tshirt_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 8, this.getCurrentVariant(allComponents, 'tshirt_1')) - 1 })
            allComponents.push({ label: 'Torso 2', id: 'torso_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 11, this.getCurrentVariant(allComponents, 'torso_1')) - 1 })
            allComponents.push({ label: 'Pants 2', id: 'pants_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 4, this.getCurrentVariant(allComponents, 'pants_1')) - 1 })
            allComponents.push({ label: 'Shoes 2', id: 'shoes_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 6, this.getCurrentVariant(allComponents, 'shoes_1')) - 1 })
            allComponents.push({ label: 'Ear Accessories Color', id: 'ears_2', value: 0, min: 0, max: GetNumberOfPedPropTextureVariations(targetPed, 2, this.getCurrentVariant(allComponents, 'ears_1') - 1) })
            allComponents.push({ label: 'Decals 2', id: 'decals_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 10, this.getCurrentVariant(allComponents, 'decals_1')) - 1 })
            allComponents.push({ label: 'Mask 2', id: 'mask_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 1, this.getCurrentVariant(allComponents, 'mask_1')) - 1 })
            allComponents.push({ label: 'Bulletproof Vest 2', id: 'bproof_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 9, this.getCurrentVariant(allComponents, 'bproof_1')) - 1 })
            allComponents.push({ label: 'Chain 2', id: 'chain_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 7, this.getCurrentVariant(allComponents, 'chain_1')) - 1 })
            allComponents.push({ label: 'Bag Color', id: 'bags_2', value: 0, min: 0, max: GetNumberOfPedTextureVariations(targetPed, 5, this.getCurrentVariant(allComponents, 'bags_1')) - 1 })
            allComponents.push({ label: 'Helmet 2', id: 'helmet_2', value: 0, min: 0, max: GetNumberOfPedPropTextureVariations(targetPed, 0, this.getCurrentVariant(allComponents, 'helmet_1')) - 1 })
            allComponents.push({ label: 'Glasses 2', id: 'glasses_2', value: 0, min: 0, max: GetNumberOfPedPropTextureVariations(targetPed, 1, this.getCurrentVariant(allComponents, 'glasses_1')), })
            allComponents.push({ label: 'Watches 2', id: 'watches_2', value: 0, min: 0, max: GetNumberOfPedPropTextureVariations(targetPed, 6, this.getCurrentVariant(allComponents, 'watches_1')) - 1 })
            allComponents.push({ label: 'Bracelets 2', id: 'bracelets_2', value: 0, min: 0, max: GetNumberOfPedPropTextureVariations(targetPed, 7, this.getCurrentVariant(allComponents, 'bracelets_1') - 1) })

            resolve(allComponents)
        })
    }

    /**
     * Get skin varient
     * @param fullSkin 
     * @param component 
     */
    private getSkinVarient(fullSkin: any, component: string) {
        for (let i = 0; i < fullSkin.length; i++) {
            if (fullSkin[i].id == component) {
                return fullSkin[i].value
            }
        }
    }

    /**
     * Set ped clothing components
     * @param targetPed 
     * @param allComponents 
     */
    public setPlayerSkin(targetPed: number, allComponents: any) {
        const face_weight = (this.getSkinVarient(allComponents, 'face_md_weight') / 100) + 0.0
        const skin_weight = (this.getSkinVarient(allComponents, 'skin_md_weight') / 100) + 0.0
        SetPedHeadBlendData(targetPed, this.getSkinVarient(allComponents, 'mom'), this.getSkinVarient(allComponents, 'dad'), 0, this.getSkinVarient(allComponents, 'mom'), this.getSkinVarient(allComponents, 'dad'), 0, face_weight, skin_weight, 0.0, false)

        SetPedFaceFeature(targetPed, 0, (this.getSkinVarient(allComponents, 'nose_1') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 1, (this.getSkinVarient(allComponents, 'nose_2') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 2, (this.getSkinVarient(allComponents, 'nose_3') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 3, (this.getSkinVarient(allComponents, 'nose_4') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 4, (this.getSkinVarient(allComponents, 'nose_5') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 5, (this.getSkinVarient(allComponents, 'nose_6') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 6, (this.getSkinVarient(allComponents, 'eyebrows_5') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 7, (this.getSkinVarient(allComponents, 'eyebrows_6') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 8, (this.getSkinVarient(allComponents, 'cheeks_1') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 9, (this.getSkinVarient(allComponents, 'cheeks_2') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 10, (this.getSkinVarient(allComponents, 'cheeks_3') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 11, (this.getSkinVarient(allComponents, 'eye_squint') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 12, (this.getSkinVarient(allComponents, 'lip_thickness') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 13, (this.getSkinVarient(allComponents, 'jaw_1') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 14, (this.getSkinVarient(allComponents, 'jaw_2') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 15, (this.getSkinVarient(allComponents, 'chin_1') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 16, (this.getSkinVarient(allComponents, 'chin_2') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 17, (this.getSkinVarient(allComponents, 'chin_3') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 18, (this.getSkinVarient(allComponents, 'chin_4') / 10) + 0.0)
        SetPedFaceFeature(targetPed, 19, (this.getSkinVarient(allComponents, 'neck_thickness') / 10) + 0.0)

        SetPedHairColor(targetPed, this.getSkinVarient(allComponents, 'hair_color_1'), this.getSkinVarient(allComponents, 'hair_color_2'))
        SetPedHeadOverlay(targetPed, 3, this.getSkinVarient(allComponents, 'age_1'), (this.getSkinVarient(allComponents, 'age_2') / 10) + 0.0)
        SetPedHeadOverlay(targetPed, 0, this.getSkinVarient(allComponents, 'blemishes_1'), (this.getSkinVarient(allComponents, 'blemishes_2') / 10) + 0.0)
        SetPedHeadOverlay(targetPed, 1, this.getSkinVarient(allComponents, 'beard_1'), (this.getSkinVarient(allComponents, 'beard_2') / 10) + 0.0)
        SetPedEyeColor(targetPed, this.getSkinVarient(allComponents, 'eye_color'))
        SetPedHeadOverlay(targetPed, 2, this.getSkinVarient(allComponents, 'eyebrows_1'), (this.getSkinVarient(allComponents, 'eyebrows_2') / 10) + 0.0)
        SetPedHeadOverlay(targetPed, 4, this.getSkinVarient(allComponents, 'makeup_1'), (this.getSkinVarient(allComponents, 'makeup_2') / 10) + 0.0)
        SetPedHeadOverlay(targetPed, 8, this.getSkinVarient(allComponents, 'lipstick_1'), (this.getSkinVarient(allComponents, 'lipstick_2') / 10) + 0.0)
        SetPedComponentVariation(targetPed, 2, this.getSkinVarient(allComponents, 'hair_1'), this.getSkinVarient(allComponents, 'hair_2'), 2)
        SetPedHeadOverlayColor(targetPed, 1, 1, this.getSkinVarient(allComponents, 'beard_3'), this.getSkinVarient(allComponents, 'beard_4'))
        SetPedHeadOverlayColor(targetPed, 2, 1, this.getSkinVarient(allComponents, 'eyebrows_3'), this.getSkinVarient(allComponents, 'eyebrows_4'))
        SetPedHeadOverlayColor(targetPed, 4, 2, this.getSkinVarient(allComponents, 'makeup_3'), this.getSkinVarient(allComponents, 'makeup_4'))
        SetPedHeadOverlayColor(targetPed, 8, 1, this.getSkinVarient(allComponents, 'lipstick_3'), this.getSkinVarient(allComponents, 'lipstick_4'))
        SetPedHeadOverlay(targetPed, 5, this.getSkinVarient(allComponents, 'blush_1'), (this.getSkinVarient(allComponents, 'blush_2') / 10) + 0.0)
        SetPedHeadOverlayColor(targetPed, 5, 2, this.getSkinVarient(allComponents, 'blush_3'), 0)
        SetPedHeadOverlay(targetPed, 6, this.getSkinVarient(allComponents, 'complexion_1'), (this.getSkinVarient(allComponents, 'complexion_2') / 10) + 0.0)
        SetPedHeadOverlay(targetPed, 7, this.getSkinVarient(allComponents, 'sun_1'), (this.getSkinVarient(allComponents, 'sun_2') / 10) + 0.0)
        SetPedHeadOverlay(targetPed, 9, this.getSkinVarient(allComponents, 'moles_1'), (this.getSkinVarient(allComponents, 'moles_2') / 10) + 0.0)
        SetPedHeadOverlay(targetPed, 10, this.getSkinVarient(allComponents, 'chest_1'), (this.getSkinVarient(allComponents, 'chest_2') / 10) + 0.0)
        SetPedHeadOverlayColor(targetPed, 10, 1, this.getSkinVarient(allComponents, 'chest_3'), 0)

        if (this.getSkinVarient(allComponents, 'bodyb_1') == -1) {
            SetPedHeadOverlay(targetPed, 11, 255, (this.getSkinVarient(allComponents, 'bodyb_2') / 10) + 0.0)
        } else {
            SetPedHeadOverlay(targetPed, 11, this.getSkinVarient(allComponents, 'bodyb_1'), (this.getSkinVarient(allComponents, 'bodyb_2') / 10) + 0.0)
        }

        if (this.getSkinVarient(allComponents, 'bodyb_3') == -1) {
            SetPedHeadOverlay(targetPed, 12, 255, (this.getSkinVarient(allComponents, 'bodyb_4') / 10) + 0.0)
        } else {
            SetPedHeadOverlay(targetPed, 12, this.getSkinVarient(allComponents, 'bodyb_3'), (this.getSkinVarient(allComponents, 'bodyb_4') / 10) + 0.0)
        }

        if (this.getSkinVarient(allComponents, 'ears_1') == -1) {
            ClearPedProp(targetPed, 2)
        } else {
            SetPedPropIndex(targetPed, 2, this.getSkinVarient(allComponents, 'ears_1'), this.getSkinVarient(allComponents, 'ears_2'), true)
        }

        SetPedComponentVariation(targetPed, 8, this.getSkinVarient(allComponents, 'tshirt_1'), this.getSkinVarient(allComponents, 'tshirt_2'), 2)
        SetPedComponentVariation(targetPed, 11, this.getSkinVarient(allComponents, 'torso_1'), this.getSkinVarient(allComponents, 'torso_2'), 2)
        SetPedComponentVariation(targetPed, 3, this.getSkinVarient(allComponents, 'arms'), this.getSkinVarient(allComponents, 'arms_2'), 2)
        SetPedComponentVariation(targetPed, 10, this.getSkinVarient(allComponents, 'decals_1'), this.getSkinVarient(allComponents, 'decals_2'), 2)
        SetPedComponentVariation(targetPed, 4, this.getSkinVarient(allComponents, 'pants_1'), this.getSkinVarient(allComponents, 'pants_2'), 2)
        SetPedComponentVariation(targetPed, 6, this.getSkinVarient(allComponents, 'shoes_1'), this.getSkinVarient(allComponents, 'shoes_2'), 2)
        SetPedComponentVariation(targetPed, 1, this.getSkinVarient(allComponents, 'mask_1'), this.getSkinVarient(allComponents, 'mask_2'), 2)
        SetPedComponentVariation(targetPed, 9, this.getSkinVarient(allComponents, 'bproof_1'), this.getSkinVarient(allComponents, 'bproof_2'), 2)
        SetPedComponentVariation(targetPed, 7, this.getSkinVarient(allComponents, 'chain_1'), this.getSkinVarient(allComponents, 'chain_2'), 2)
        SetPedComponentVariation(targetPed, 5, this.getSkinVarient(allComponents, 'bags_1'), this.getSkinVarient(allComponents, 'bags_2'), 2)

        if (this.getSkinVarient(allComponents, 'helmet_1') == -1) {
            ClearPedProp(targetPed, 0)
        } else {
            SetPedPropIndex(targetPed, 0, this.getSkinVarient(allComponents, 'helmet_1'), this.getSkinVarient(allComponents, 'helmet_2'), true)
        }

        if (this.getSkinVarient(allComponents, 'glasses_1') == -1) {
            ClearPedProp(targetPed, 1)
        } else {
            SetPedPropIndex(targetPed, 1, this.getSkinVarient(allComponents, 'glasses_1'), this.getSkinVarient(allComponents, 'glasses_2'), true)
        }

        if (this.getSkinVarient(allComponents, 'watches_1') == -1) {
            ClearPedProp(targetPed, 6)
        } else {
            SetPedPropIndex(targetPed, 6, this.getSkinVarient(allComponents, 'watches_1'), this.getSkinVarient(allComponents, 'watches_2'), true)
        }

        if (this.getSkinVarient(allComponents, 'bracelets_1') == -1) {
            ClearPedProp(targetPed, 7)
        } else {
            SetPedPropIndex(targetPed, 7, this.getSkinVarient(allComponents, 'bracelets_1'), this.getSkinVarient(allComponents, 'bracelets_2'), true)
        }
    }
}


//=========================================================\\
//====================| POLYZONE CORE |====================\\
class Polyzone_Core_V3 extends Clothing_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Create a box polyzone
     * @param id Unique ID of the polyzone
     * @param locaiton Location of the polyzone
     * @param length Length of the polyzone
     * @param width Width of the polyzone
     * @param minZ The minium Z of the polyzone
     * @param maxZ The maximum Z of the polyzone
     * @param callbackIn The function that will run when they enter the polyzone
     * @param callbackOut The function that will run when they leave the polyzone
     */
    public polyzoneCreateBox(id: string, location: coordsV4, length: number, width: number, minZ: number, maxZ: number, callbackIn: Function, callbackOut: Function): void {
        exports[GetCurrentResourceName()]['createBoxZone'](id, location, length, width, minZ, maxZ, callbackIn, callbackOut, this.debugMode)
    }

    /**
     * Create a circle polyzone
     * @param id Unique ID of the polyzone
     * @param locaiton Location of the polyzone
     * @param distance The distance of the polyzone
     * @param callbackIn The function that will run when they enter the polyzone
     * @param callbackOut The function that will run when they leave the polyzone
     */
    public polyzoneCreateCircle(id: string, location: coordsV4, distance: number, callbackIn: Function, callbackOut: Function): void {
        const LocationXPlus = vector4(location.x + distance, location.y, location.z, location.w)
        const LocationXMinus = vector4(location.x - distance, location.y, location.z, location.w)

        const LocationYPlus = vector4(location.x, location.y + distance, location.z, location.w)
        const LocationYMinus = vector4(location.x, location.y - distance, location.z, location.w)

        const halfDistance = (distance / 2) + ((distance / 2) / 2)

        const LocationXAndYPlus = vector4(location.x + halfDistance, location.y + halfDistance, location.z, location.w)
        const LocationXAndYMinus = vector4(location.x - halfDistance, location.y - halfDistance, location.z, location.w)

        const LocationXPlusYMinus = vector4(location.x + halfDistance, location.y - halfDistance, location.z, location.w)
        const LocationXMinusYPlus = vector4(location.x - halfDistance, location.y + halfDistance, location.z, location.w)

        const createdPoints = [
            vector2(LocationXPlus.x, LocationXPlus.y),
            vector2(LocationXAndYPlus.x, LocationXAndYPlus.y),
            vector2(LocationYPlus.x, LocationYPlus.y),
            vector2(LocationXMinusYPlus.x, LocationXMinusYPlus.y),
            vector2(LocationXMinus.x, LocationXMinus.y),
            vector2(LocationXAndYMinus.x, LocationXAndYMinus.y),
            vector2(LocationYMinus.x, LocationYMinus.y),
            vector2(LocationXPlusYMinus.x, LocationXPlusYMinus.y),
        ]

        this.polyzoneCreateFlex(id, createdPoints, location.z - distance, location.z + distance, callbackIn, callbackOut)
        // exports[GetCurrentResourceName()]['createCircleZone'](id, location, distance, callbackIn, callbackOut, this.debugMode)
    }

    /**
     * Create a circle top polyzone
     * @param id Unique ID of the polyzone
     * @param locaiton Location of the polyzone
     * @param distance The distance of the polyzone
     * @param callbackIn The function that will run when they enter the polyzone
     * @param callbackOut The function that will run when they leave the polyzone
     */
    public polyzoneCreateTopCircle(id: string, location: coordsV4, distance: number, callbackIn: Function, callbackOut: Function): void {
        exports[GetCurrentResourceName()]['createTopCircleZone'](id, location, distance, callbackIn, callbackOut, this.debugMode)
    }

    /**
     * Create a flex polyzone
     * @param id Unique ID of the polyzone
     * @param locations All locations of the polyzone
     * @param minZ The minium Z of the polyzone
     * @param maxZ The maximum Z of the polyzone
     * @param callbackIn The function that will run when they enter the polyzone
     * @param callbackOut The function that will run when they leave the polyzone
     */
    public polyzoneCreateFlex(id: string, locations: multiplecoordsV2, minZ: number, maxZ: number, callbackIn: Function, callbackOut: Function): void {
        exports[GetCurrentResourceName()]['createFlexZone'](id, locations, minZ, maxZ, callbackIn, callbackOut, this.debugMode)
    }

    /**
     * Delete a polyzone
     * @param id Unique ID of the polyzone
     */
    public polyzoneDelete(id: string): void {
        exports[GetCurrentResourceName()]['deletePoly'](id)
    }
}


//=======================================================\\
//====================| TARGET CORE |====================\\
class Target_Core_V3 extends Polyzone_Core_V3 {
    private targetEntityOptions: any;
    private targetEntities: any;
    constructor() {
        super()
        this.targetEntities = []
        this.targetEntityOptions = []
    }

    /**
     * Create a target
     * @param id Unique id of the target
     * @param title The title of the target
     * @param model The model of the entity
     * @param range The range of the entity
     * @param options All the options on the target menu
     * @param spawnModel If its a model that needs spawned
     * @param spawnObject If its a object that needs spawned
     * @param location Location of the entity
     * @param networked If the entity should be network synced
     * @param callback 
     * @returns
     */
    public async targetCreate(id: string, title: string, model: string, range: number, options: targetMenuOptions, spawnModel: boolean, spawnObject: boolean, location: coordsV4, networked: boolean, callback: Function, callbackObject: Function): Promise<void> {
        await this.onReady()
        let createdEntity = 0
        this.polyzoneCreateCircle(`target:${id}`, location, range, async () => {

            //===| CREATE ENTITY |===\\
            createdEntity = await new Promise<number>(async (resolve, reject) => {
                await this.streamModel(model)

                if (spawnModel == true) {
                    const createdPed = CreatePed(4, GetHashKey(model), location.x, location.y, location.z - 1.0, location.w, networked, true)
                    FreezeEntityPosition(createdPed, true)
                    SetEntityInvincible(createdPed, true)
                    SetBlockingOfNonTemporaryEvents(createdPed, true)
                    SetEntityHeading(createdPed, location.w)
                    this.createdPeds.push(createdPed)
                    resolve(createdPed)
                }

                if (spawnObject == true) {
                    const createdObject = CreateObject(model, location.x, location.y, location.z - 1.0, false, networked, true)
                    FreezeEntityPosition(createdObject, true)
                    SetEntityInvincible(createdObject, true)
                    SetBlockingOfNonTemporaryEvents(createdObject, true)
                    SetEntityHeading(createdObject, location.w)
                    this.createdObject.push(createdObject)
                    resolve(createdObject)
                }
            })

            //===| CREATE OPTIONS |===\\
            this.targetEntityOptions[id] = []
            let createdOptions = []
            for (let i = 0; i < options.length; i++) {
                this.targetEntityOptions[id].push(`Option:${id}:${i}`)
                createdOptions.push({
                    name: `Option:${id}:${i}`,
                    icon: options[i].icon,
                    label: options[i].label,
                    distance: options[i].range,
                    action: () => {
                        callback(options[i].value)
                    },
                    onSelect: () => {
                        callback(options[i].value)
                    }
                })
            }

            //===| TARGET ENTITY |===\\
            const netId = NetworkGetNetworkIdFromEntity(createdEntity)
            if (netId == 0) {
                this.targetEntities[id] = netId
                exports['ox_target']['addEntity'](netId, createdOptions)
            } else {
                this.targetEntities[id] = createdEntity
                exports['ox_target']['addLocalEntity'](createdEntity, createdOptions)
            }

            callbackObject(createdEntity)

        }, () => {

            SetEntityAsMissionEntity(createdEntity, true, true)
            DeleteEntity(createdEntity)
            DeleteObject(createdEntity)
            DeleteVehicle(createdEntity)
        })
    }

    /**
     * Create a target entity
     * @param id Unique id of the target
     * @param targetEntity The entity that is being target for options
     * @param options All the options on the target menu
     * @param callback 
     * @returns
     */
    public async targetEntity(id: string, targetEntityObj: number, options: targetMenuOptions, callback: Function): Promise<void> {
        await this.onReady()
        let createdOptions = []
        this.targetEntityOptions[id] = []

        for (let i = 0; i < options.length; i++) {
            this.targetEntityOptions[id].push(`Option:${id}:${i}`)
            createdOptions.push({
                name: `Option:${id}:${i}`,
                icon: options[i].icon,
                label: options[i].label,
                distance: options[i].range,
                onSelect: () => {
                    callback(options[i].value)
                }
            })
        }

        const netId = NetworkGetNetworkIdFromEntity(targetEntityObj)
        if (netId == 0) {
            this.targetEntities[id] = netId
            exports['ox_target']['addEntity'](netId, createdOptions)
        } else {
            this.targetEntities[id] = targetEntityObj
            exports['ox_target']['addLocalEntity'](targetEntityObj, createdOptions)
        }
    }

    /**
     * Create a target of the closest entity
     * @param id Unique id of the target
     * @param entityName The entity name 
     * @param options All the options on the target menu
     * @param callback 
     * @returns
     */
    public async targetClosest(id: string, entityName: string, entityLocation: coordsV4, options: targetMenuOptions, callback: Function): Promise<void> {
        await this.onReady()
        this.polyzoneCreateCircle(`target:entity:${id}`, entityLocation, 5.5, () => {

            //===| FIND ENTITY |===\\
            const targetEntity = GetClosestObjectOfType(entityLocation.x, entityLocation.y, entityLocation.z, 5.0, entityName, false, false, false)

            //===| CREATE OPTIONS |===\\
            const createdOptions = new Promise((resolve, reject) => {
                let newOptions = []
                this.targetEntityOptions[id] = []
                for (let i = 0; i < options.length; i++) {
                    this.targetEntityOptions[id].push(`Option:${id}:${i}`)
                    newOptions.push({
                        name: `Option:${id}:${i}`,
                        icon: options[i].icon,
                        label: options[i].label,
                        distance: options[i].range,
                        action: () => {
                            callback(options[i].value)
                        }
                    })
                }
                resolve(newOptions)
            })

            //===| TARGET ENTITY |===\\
            const netId = NetworkGetNetworkIdFromEntity(targetEntity)
            if (netId == 0) {
                this.targetEntities[id] = netId
                exports['ox_target']['addEntity'](netId, createdOptions)
            } else {
                this.targetEntities[id] = targetEntity
                exports['ox_target']['addLocalEntity'](targetEntity, createdOptions)
            }
        }, () => { })
    }

    /**
     * Create a target zone
     * @param id Unique id of the target
     * @param options All the options on the target menu
     * @param location Location of the entity
     * @param width Width of the polyzone
     * @param length Length of the polyzone
     * @param minZ The minium Z of the polyzone
     * @param maxZ The maximum Z of the polyzone
     * @param callback 
     * @returns
     */
    public async targetZone(id: string, options: targetMenuOptions, location: coordsV4, width: number, length: number, minZ: number, maxZ: number, callback: Function): Promise<void> {
        await this.onReady()

        //===| CREATE OPTIONS |===\\
        let createdOptions = []
        this.targetEntityOptions[id] = []
        for (let i = 0; i < options.length; i++) {
            this.targetEntityOptions[id].push(`Option:${id}:${i}`)
            createdOptions.push({
                name: `Option:${id}:${i}`,
                icon: options[i].icon,
                label: options[i].label,
                distance: options[i].range,
                action: () => {
                    callback(options[i].value)
                }
            })
        }

        //===| CREATE ZONE (QB & OX) |===\\
        exports["qb-target"]['AddBoxZone'](id, location, length, width, {
            name: id,
            heading: location.w,
            debugPoly: this.debugMode,
            minZ: minZ,
            maxZ: maxZ,
        }, {
            options: createdOptions,
            distance: 2.5
        })
    }

    /**
     * Create a polyzone and makes the closest entity target
     * @param id 
     * @param entityName 
     * @param entityLocation 
     * @param options 
     * @param callback 
     */
    public async targetCreateClosest(id: string, entityName: string, entityLocation: coordsV4, options: targetMenuOptions, callback: Function) {
        this.polyzoneCreateCircle(`target:entity:${id}`, entityLocation, 5.5, () => {
            const targetDoor = GetClosestObjectOfType(entityLocation.x, entityLocation.y, entityLocation.z, 5.0, entityName, false, false, false)
            const createdOptions = []
            this.targetEntityOptions[id] = []
            for (let i = 0; i < options.length; i++) {
                this.targetEntityOptions[id].push(`Option:${id}:${i}`)
                createdOptions.push({
                    name: `Option:${id}:${i}`,
                    icon: options[i].icon,
                    label: options[i].label,
                    distance: options[i].range,
                    action: function () {
                        callback(options[i].value)
                    }
                })
            }

            const netId = NetworkGetNetworkIdFromEntity(targetDoor)
            if (netId == 0) {
                this.targetEntities[id] = netId
                exports['ox_target']['addEntity'](netId, createdOptions)
            } else {
                this.targetEntities[id] = targetDoor
                exports['ox_target']['addLocalEntity'](targetDoor, createdOptions)
            }
        }, function () { })
    }

    /**
     * Delete Target
     * @param id Unique id of the target
     * @returns
     */
    public async targetDelete(id: string): Promise<void> {
        await this.onReady()
        exports['ox_target']['removeEntity'](this.targetEntities[id], this.targetEntityOptions[id])
        exports['ox_target']['removeLocalEntity'](this.targetEntities[id], this.targetEntityOptions[id])
    }
}


//=========================================================\\
//====================| CALLBACK CORE |====================\\
class Callback_Core_V3 extends Target_Core_V3 {
    private callbackCount: number;
    private callbackEvents: Record<string, callbackEvent>;
    constructor() {
        super();
        this.callbackCount = 0;
        this.callbackEvents = {};
        this.registerCallbackEvent();
    }

    /**
     * Register the required callback event
     */
    private registerCallbackEvent() {
        onNet(`CPT_Core:Client:CallbackSend:${GetCurrentResourceName()}`, (eventId: string, ...args: any[]) => {
            const callbackEvent = this.callbackEvents[eventId];

            if (callbackEvent) {
                callbackEvent.function(...args);
                // Remove the event from the array to avoid potential race conditions
                delete this.callbackEvents[eventId];
            } else {
                console.warn(`Callback event with ID '${eventId}' not found.`);
            }
        });
    }

    /**
     * Activate callback
     * @param eventName Name of the callback event
     * @param callback Function that the callback will call
     * @param args All the args of the callback
     * @returns
     */
    public async callbackSend(eventName: string, callback: Function, ...args: any[]): Promise<void> {
        await this.onReady();
        this.callbackCount += 1;

        const callbackEvent: callbackEvent = {
            id: `callbackID:${this.callbackCount}`,
            name: eventName,
            ready: true,
            function: callback,
        };

        this.callbackEvents[callbackEvent.id] = callbackEvent;

        emitNet(`CPT_Core:Server:CallbackSend:${GetCurrentResourceName()}`, callbackEvent, ...args);
    }
}


//===============================================================\\
//====================| REQUIRED ITEMS CORE |====================\\
class RequiredItems_Core_V3 extends Callback_Core_V3 {
    private requiredIntervals: any[];
    constructor() {
        super()
        this.requiredIntervals = []
    }

    public async showRequiredItems(requiredItems: any): Promise<void> {
        await this.onReady();
        // const allRequiredItems: { item: string; amount: number; state: boolean }[] = [];
        // const requiredItemTitleInterval = this.showRequiredItemTitle();

        // for (const requiredItem of requiredItems) {
        //     const itemDetails = this.getItemDetails(requiredItem);
        //     const formatedAmount = this.formatItemAmount(requiredItem.amount);

        //     const interval = setInterval(() => {
        //         const text = this.getItemText(itemDetails, formatedAmount, requiredItem.state);
        //         this.drawText(text, requiredItems.indexOf(requiredItem));
        //     }, 1);

        //     this.requiredIntervals.push(interval);
        // }

        // setTimeout(() => {
        //     this.requiredIntervals.forEach((textInterval: any) => {
        //         clearInterval(textInterval);
        //     });
        // }, 5000);
    }

    private showRequiredItemTitle(): any {
        return setInterval(() => {
            const text = "Required";
            this.drawText(text, 0);
        }, 1);
    }

    private getItemDetails(requiredItem: any): any {
        return requiredItem.item === "cash" || requiredItem.item === "bank"
            ? { label: requiredItem.item, type: "money" }
            : QBCore.Shared.Items[requiredItem.item];
    }

    private formatItemAmount(amount: number): string {
        return amount !== undefined ? `X${amount}` : "";
    }

    private getItemText(itemDetails: any, formatedAmount: string, state: boolean): string {
        let text = "";

        if (itemDetails.type === "money") {
            text = `${formatedAmount} (${itemDetails.label})`;
        } else {
            text = `${formatedAmount} ${itemDetails.label}`;
        }

        return text;
    }

    private drawText(text: string, index: number): void {
        DrawRect(0.08, 0.512 + (0.03 * index) + 0.03, 0.15, 0.03, 0, 0, 0, 195);
        SetTextFont(1);
        SetTextProportional(true);
        SetTextScale(0.0, 0.45);
        SetTextColour(255, 255, 255, 255);
        SetTextDropshadow(0, 0, 0, 0, 255);
        SetTextEdge(1, 0, 0, 0, 255);
        SetTextDropShadow();
        SetTextOutline();
        SetTextEntry("STRING");
        AddTextComponentString(text);
        DrawText(0.01, 0.5 + (0.03 * index) + 0.03);
    }
}


//================================================================\\
//====================| REACTIVE CONFIG CORE |====================\\
class ReactiveConfig_Core_V3 extends RequiredItems_Core_V3 {
    private reactiveConfigs: createdReactiveCallbacks
    constructor() {
        super()
        this.reactiveConfigs = []
        this.registerReactiveConfig()
    }

    /**
     * Create a reactive config item
     * @param key The key for the config
     * @param value The value of the config
     * @param callback The function the config uses
     * @returns
     */
    private createReactiveConfigItem(key: string, value: any, callback: Function): reactiveCreatedCallback {
        const configItem = {
            key: key,
            value: value,
            response: true,
            callback: callback,
            resource: GetInvokingResource(),
            update: (newValue: any) => {
                if (configItem.response == true) {
                    if (configItem.value != null) {
                        configItem.callback(newValue)
                    }
                    configItem.value = newValue
                }
            }
        }
        return configItem
    }

    /**
     * Create a reactive config
     * @param key The key for the config
     * @param value The value of the config
     * @param callback The function the config uses
     * @returns
     */
    public async reactiveConfigCreate(key: string, value: any, callback: Function): Promise<void> {
        await this.onReady()
        if (this.reactiveConfigs[key] == null) {
            this.reactiveConfigs[key] = this.createReactiveConfigItem(key, value, callback)
            this.callbackSend(`CPT_Core:Server:getAllReactiveConfigs:${GetCurrentResourceName()}`, (updateValue: any) => {
                if (updateValue != null) {
                    this.reactiveConfigs[key].value = updateValue
                    this.reactiveConfigs[key].callback(updateValue)
                } else {
                    this.reactiveConfigs[key].callback(this.reactiveConfigs[key].value)
                }
            }, key)
        } else {
            this.callbackSend(`CPT_Core:Server:getAllReactiveConfigs:${GetCurrentResourceName()}`, (updateValue: any) => {
                if (updateValue != null) { this.reactiveConfigs[key].value = updateValue }
                this.reactiveConfigs[key].response = true
                this.reactiveConfigs[key].callback = callback
                this.reactiveConfigs[key].callback(this.reactiveConfigs[key].value)
            }, key)
        }
    }

    /**
     * Get a reactive config value
     * @param key The key for the config
     * @returns
     */
    public async reactiveConfigGet(key: string): Promise<any> {
        await this.onReady()
        return new Promise((resolve, reject) => {
            if (this.reactiveConfigs[key] == null) {
                this.callbackSend(`CPT_Core:Server:getAllReactiveConfigs:${GetCurrentResourceName()}`, (updateValue: any) => {
                    resolve(updateValue)
                }, key)
            } else {
                resolve(this.reactiveConfigs[key].value)
            }
        })
    }

    /**
     * Update a reactive config value
     * @param key The key for the config
     * @param newValue The value of the config
     * @returns
     */
    public async reactiveConfigUpdate(key: string, newValue: any): Promise<any> {
        await this.onReady()
        emitNet(`CPT_Core:Server:UpdateReactiveConfig:${GetCurrentResourceName()}`, key, newValue)
    }

    /**
     * Disable a reactive config
     * @param key The key for the config
     * @returns
     */
    public async reactiveConfigDeactivate(key: string): Promise<void> {
        await this.onReady()
        if (this.reactiveConfigs[key]) {
            this.reactiveConfigs[key].response = false
        }
    }

    /**
     * Ready the reactive config system
     * @param key The key to the config
     * @param value The new value for the config
     * @returns
     */
    public async registerReactiveConfig(): Promise<void> {
        await this.onReady()
        onNet(`CPT_Core:Client:UpdateReactiveConfig:${GetCurrentResourceName()}`, (key: string, table: any) => {
            if (this.reactiveConfigs[key]) {
                this.reactiveConfigs[key].value = table
                this.reactiveConfigs[key].callback(table)
            }
        })
    }
}


//=======================================================\\
//====================| PROMPT CORE |====================\\
class Prompt_Core_V3 extends ReactiveConfig_Core_V3 {
    private textPromptInterval: any;
    private promptInterval: any;
    private promptCallback: any;
    constructor() {
        super();
        this.textPromptInterval = null;
        this.promptInterval = null;
        this.promptCallback = null;
    }

    /**
     * Prompt a message
     * @param message Message for the prompt
     * @param callback The function that gets called when they press E
     */
    public async promptShow(message: string, callback: Function): Promise<void> {
        await this.onReady();
        let currentShown = true;
        exports[GetCurrentResourceName()]['ox_text_ui'](message, 'left-center', '#1a1b1e', 'white');
        this.promptCallback = callback;
        this.promptInterval = setInterval(() => {
            if (IsControlJustReleased(0, 38) == true && currentShown == true) {
                exports[GetCurrentResourceName()]['ox_text_ui_hide']();
                currentShown = false;
                this.promptCallback();
            }
        });
    }

    /**
     * Prompt the message with a key
     * @param message Message for the prompt
     */
    public async promptRaw(message: string): Promise<void> {
        await this.onReady();
        let currentShown = true;
        exports[GetCurrentResourceName()]['ox_text_ui'](message, 'left-center', '#1a1b1e', 'white');
        this.promptInterval = setInterval(() => {
            if (IsControlJustReleased(0, 38) == true && currentShown == true) {
                exports[GetCurrentResourceName()]['ox_text_ui_hide']();
                currentShown = false;
            }
        });
    }

    /**
     * Hide the prompt
     */
    public async promptHide(): Promise<void> {
        await this.onReady();
        clearInterval(this.textPromptInterval);  // Fix: changed variable name
        clearInterval(this.promptInterval);
        this.promptCallback = null;
        exports[GetCurrentResourceName()]['ox_text_ui_hide']();
    }
}


//=========================================================\\
//====================| PROGRESS CORE |====================\\
class Progress_Core_V3 extends Prompt_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Start a progress bar
     * @param id Id of the progress bar
     * @param message The message on the progress bar
     * @param time The time that the progress bar
     * @param callbackEnd The function that gets called on the complete
     * @param callbackCancel The function that gets called on the cancel
     */
    public async progressStart(id: string, message: string, time: number, callbackEnd: Function, callbackCancel: Function): Promise<void> {
        await this.onReady()
        exports[GetCurrentResourceName()]['ox_progerss'](
            message,
            time,
            () => { callbackEnd() },
            () => { callbackCancel() }
        )
    }

    /**
     * Start a progress bar move
     * @param id Id of the progress bar
     * @param message The message on the progress bar
     * @param time The time that the progress bar
     * @param callbackEnd The function that gets called on the complete
     * @param callbackCancel The function that gets called on the cancel
     */
    public async progressStartMove(id: string, message: string, time: number, callbackEnd: Function, callbackCancel: Function): Promise<void> {
        await this.onReady()
        exports[GetCurrentResourceName()]['ox_progerss_move'](
            message,
            time,
            () => { callbackEnd() },
            () => { callbackCancel() }
        )
    }
}


//==========================================================\\
//====================| PLAYSOUND CORE |====================\\
class PlaySound_Core_V3 extends Progress_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Play a sound in the game
     * @param id Unique ID of the sound player
     * @param song The link to the song
     * @param distance The distance players can hear the sound
     * @param location Location of where the player is located
     * @param volume The volume of the player
     */
    public async playSoundStart(id: string, song: string, distance: number, location: coordsV3, volume: number): Promise<void> {
        await this.onReady()
        emitNet(`CPT_Core:Server:PlaySound:${GetCurrentResourceName()}`, id, song, distance, location, volume)
    }

    /**
     * Pause the sound
     * @param id Unique ID of the sound player
     */
    public async playSoundPause(id: string): Promise<void> {
        await this.onReady()
        emitNet(`CPT_Core:Server:PauseSound:${GetCurrentResourceName()}`, id)
    }

    /**
     * Resume the sound
     * @param id Unique ID of the sound player
     */
    public async playSoundResume(id: string): Promise<void> {
        await this.onReady()
        emitNet(`CPT_Core:Server:ResumeSound:${GetCurrentResourceName()}`, id)
    }

    /**
     * Set the volume of the sound
     * @param id Unique ID of the sound player
     * @param volume New volume of the player
     */
    public async playSoundVolume(id: string, volume: number): Promise<void> {
        await this.onReady()
        emitNet(`CPT_Core:Server:VolumeSound:${GetCurrentResourceName()}`, id, volume)
    }

    /**
     * Stop a player
     * @param id Unique ID of the sound player
     */
    public async playSoundStop(id: string): Promise<void> {
        await this.onReady()
        emitNet(`CPT_Core:Server:StopSound:${GetCurrentResourceName()}`, id)
    }
}


//=========================================================\\
//====================| MINIGAME CORE |====================\\
class Minigames_Core_V3 extends PlaySound_Core_V3 {
    createdGameObjects: number[]
    constructor() {
        super()
        this.createdGameObjects = []
    }

    /**
     * Drill Minigame
     */
    public async minigameDrill(): Promise<boolean> {
        await this.onReady()

        if (GetResourceState('fivem-drilling') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Drilling Minigame Script Missing');
                resolve(false);
            });
        }

        return new Promise<boolean>((resolve, reject) => {
            const playerLocation = GetEntityCoords(PlayerPedId(), true);
            const playerVector = vector3(playerLocation[0], playerLocation[1], playerLocation[2]);

            // Play drill sound
            this.playSoundStart('DrillSound', 'https://www.youtube.com/watch?v=Jmku86bANRw&ab_channel=FreeSoundLibrary', 5.0, playerVector, 0.15);

            // Play drilling animation
            this.playAnimation('anim@heists@fleeca_bank@drilling', 'drill_straight_idle', PlayerPedId());

            // Create drilling object and attach it to the player
            const drillObject = CreateObject(`hei_prop_heist_drill`, playerLocation[0], playerLocation[1], playerLocation[2], true, true, true);
            this.createdObject.push(drillObject)
            this.createdGameObjects.push(drillObject)
            AttachEntityToEntity(drillObject, PlayerPedId(), GetPedBoneIndex(PlayerPedId(), 57005), 0.14, 0, -0.01, 90.0, -90.0, 180.0, true, true, false, true, 1, true);

            // Start drilling with the 'fivem-drilling' resource
            exports['fivem-drilling']['startDrilling']((state: boolean) => {
                this.playSoundStop('DrillSound');
                StopAnimTask(PlayerPedId(), "anim@heists@fleeca_bank@drilling", "drill_straight_idle", 1.0);
                this.createdGameObjects.forEach((savedObject: number) => {
                    DetachEntity(savedObject, true, true);
                    DeleteObject(savedObject);
                    DeleteEntity(savedObject)
                })
                resolve(state);
            });
        });
    }

    /**
     * Circle minigame
     * @param circles Number of circles in the minigame
     * @param seconds The amount of time it takes to do the minigame
     */
    public async minigameCircle(circles: number, seconds: number): Promise<boolean> {
        await this.onReady();

        // Check if 'ps-ui' resource is started
        if (GetResourceState('ps-ui') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Project Slots UI Not On');
                resolve(false);
            });
        }

        // Proceed with the minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['ps-ui']['Circle']((success: boolean) => {
                resolve(success);
            }, circles, seconds);
        });
    }

    /**
     * Scrambler minigame
     * @param type The type of the scrambler
     * @param seconds The time it takes in seconds
     * @param mirrored If the minigame is mirroed or not
     */
    public async minigameScrambler(type: string, seconds: number, mirrored: boolean): Promise<boolean> {
        await this.onReady();

        // Check if 'ps-ui' resource is started
        if (GetResourceState('ps-ui') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Project Slots UI Not On');
                resolve(false);
            });
        }

        // Proceed with the minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['ps-ui']['Scrambler']((success: boolean) => {
                resolve(success);
            }, type, seconds, mirrored);
        });
    }

    /**
     * Maze Minigame
     * @param timeLimit The amount of time the player is limited to
     */
    public async minigameMaze(timeLimit: number): Promise<boolean> {
        await this.onReady();

        // Check if 'ps-ui' resource is started
        if (GetResourceState('ps-ui') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Project Slots UI Not On');
                resolve(false);
            });
        }

        // Proceed with the minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['ps-ui']['Maze']((success: boolean) => {
                resolve(success);
            }, timeLimit);
        });
    }

    /**
     * Var minigame
     * @param blocks The amount of blocks to click
     * @param time The amount of time it takes
     */
    public async minigameVar(blocks: number, time: number): Promise<boolean> {
        await this.onReady();

        // Check if 'ps-ui' resource is started
        if (GetResourceState('ps-ui') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Project Slots UI Not On');
                resolve(false);
            });
        }

        // Proceed with the minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['ps-ui']['VarHack']((success: boolean) => {
                resolve(success);
            }, blocks, time);
        });
    }

    /**
     * Thermite minigame
     * @param time The amount of time the player is limited to
     * @param size The size of the minigame
     * @param incorrect The amount of blocks the player can get incorrect
     */
    public async minigameThermite(time: number, size: number, incorrect: number): Promise<boolean> {
        await this.onReady();

        // Check if 'ps-ui' resource is started
        if (GetResourceState('ps-ui') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Project Slots UI Not On');
                resolve(false);
            });
        }

        // Proceed with the minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['ps-ui']['Thermite']((success: boolean) => {
                resolve(success);
            }, time, size, incorrect);
        });
    }

    /**
     * Safe cracker minigame
     * @param combo The safe combination data
     */
    public async minigameSafeCracker(combo: number[]): Promise<boolean> {
        await this.onReady();

        // Check if 'safecracker' resource is started
        if (GetResourceState('safecracker') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Safe Cracker Script Not On');
                resolve(false);
            });
        }

        // Proceed with the minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['safecracker']['startMinigame'](combo, (state: boolean) => {
                resolve(state);
            });
        });
    }

    /**
     * Path minigame
     * @param gridSize
     * @param lives
     * @param timeLimit
     * @returns
     */
    public async minigamePath(gridSize: number, lives: number, timeLimit: number): Promise<boolean> {
        await this.onReady();

        // Check if 'glow_minigames' resource is started
        if (GetResourceState('glow_minigames') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Glow Minigames Script Not On');
                resolve(false);
            });
        }

        // Proceed with the path minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['glow_minigames']['StartMinigame']((state: boolean) => {
                resolve(state);
            }, 'path', { gridSize: gridSize, lives: lives, timeLimit: timeLimit });
        });
    }

    /**
     * spot minigame
     * @returns 
     */
    public async minigameSpot(): Promise<boolean> {
        await this.onReady();

        // Check if 'glow_minigames' resource is started
        if (GetResourceState('glow_minigames') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Glow Minigames Script Not On');
                resolve(false);
            });
        }

        // Proceed with the spot minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['glow_minigames']['StartMinigame']((state: boolean) => {
                resolve(state);
            }, 'spot');
        });
    }

    /**
     * math minigame
     * @returns 
     */
    public async minigameMath(): Promise<boolean> {
        await this.onReady();

        // Check if 'glow_minigames' resource is started
        if (GetResourceState('glow_minigames') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('Glow Minigames Script Not On');
                resolve(false);
            });
        }

        // Proceed with the math minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['glow_minigames']['StartMinigame']((state: boolean) => {
                resolve(state);
            }, 'math');
        });
    }

    /**
     * password minigame
     * @param length 
     * @param time 
     * @returns 
     */
    public async minigamePassword(length: number, time: number): Promise<boolean> {
        await this.onReady();

        // Check if 'eth-vault' resource is started
        if (GetResourceState('eth-vault') !== 'started') {
            return new Promise<boolean>((resolve, reject) => {
                console.error('ETH Vault Script Not On');
                resolve(false);
            });
        }

        // Proceed with the password minigame
        return new Promise<boolean>((resolve, reject) => {
            exports['eth-vault']['OpenVaultGame']((state: boolean) => {
                resolve(state);
            }, length, time);
        });
    }
}


//=======================================================\\
//====================| RADIAL CORE |====================\\
class Radial_Core_V3 extends Minigames_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Add a radial menu option
     * @param id Id of the radial menu
     * @param label Label of the option
     * @param icon Icon on the radial menu
     * @param callback Callback when the button is clicked
     */
    public radialAdd(id: string, options: { id: string, label: string, icon: string, onSelect?: string }[], callback: Function) {
        let createdOptions: { label: string, icon: string, onSelect: string | Function }[] = []

        for (let i = 0; i < options.length; i++) {
            if (typeof options[i].onSelect == 'string') {
                const eventName: any = options[i].onSelect
                createdOptions.push({
                    label: options[i].label, icon: options[i].icon, onSelect: () => {
                        emit(eventName)
                    }
                })
            } else {
                createdOptions.push({
                    label: options[i].label, icon: options[i].icon, onSelect: () => {
                        callback(options[i].id)
                    }
                })
            }

        }

        exports[GetCurrentResourceName()]['ox_register_radial'](id, createdOptions)
    }

    /**
     * Add a radial menu option
     * @param id Id of the radial menu
     * @param label Label of the option
     * @param icon Icon on the radial menu
     * @param callback Callback when the button is clicked
     */
    public radialRegister(options: { id: string, label: string, icon: string, menu?: string, onSelect?: Function }) {
        exports[GetCurrentResourceName()]['ox_add_radial']([options])
    }

    /**
     * Remove a radial option
     * @param id Id of the radial menu
     */
    public radialRemove(id: string) {
        exports[GetCurrentResourceName()]['ox_remove_radial'](id)
    }

    /**
     * Clear all radial options
     */
    public radialClear() {
        exports[GetCurrentResourceName()]['ox_clear_radial']()
    }
}


//========================================================\\
//====================| MESSAGE CORE |====================\\
class Messages_Core_V3 extends Radial_Core_V3 {
    constructor() {
        super();
    }

    /**
     * Send a message thorugh the phone
     * @param application The application it will appear as 
     * @param title The title of the message 
     * @param content The content of the message
     */
    public sendPhoneMessage(application: string, title: string, content: string) {
        exports["lb-phone"]['SendNotification']({
            app: application,
            title: title,
            content: content
        })

    }

    /**
     * Send a normal message
     * @param message The message you want to send
     */
    public async messageSend(message: string): Promise<void> {
        await this.onReady();
        exports[GetCurrentResourceName()]['ox_message'](message, '', 'success');
    }

    /**
     * Send a message in the chat
     * @param message The message you want to send
     */
    public async messageChat(title: string, type: string, message: string): Promise<void> {
        await this.onReady();

        if (message) {
            emit('chatMessage', title, type, message);
        } else {
            emit('chatMessage', 'System', 'success', title);
        }
    }

    /**
     * Send a error message
     * @param message The message you want to send
     */
    public async messageError(message: string): Promise<void> {
        await this.onReady();
        exports[GetCurrentResourceName()]['ox_message'](message, '', 'error');
    }
}


//=====================================================\\
//====================| MENU CORE |====================\\
class Menu_Core_V3 extends Messages_Core_V3 {
    constructor() {
        super();
    }

    /**
     * Show an image
     * @param url The URL to show
     */
    public async showImage(url: string): Promise<void> {
        await this.onReady();
        exports['ps-ui']['ShowImage'](url);
    }

    /**
     * Open a menu
     * @param label Set the label of the menu
     * @param options All the options of the menus
     * @param callback The function the menu calls
     */
    public async menuOpen(label: string, options: menuOptions, callback: Function): Promise<void> {
        await this.onReady();
        let createdMenu: any = [];

        for (let i = 0; i < options.length; i++) {
            createdMenu[createdMenu.length] = {
                title: options[i].label,
                description: options[i].description,
                icon: "fa-solid fa-arrow-right-from-bracket",
                onSelect: () => { callback(options[i].value) }
            };
        }

        const randomMenuId = this.mathRandom(1000, 9999);
        exports[GetCurrentResourceName()]['ox_context'](
            `CPT_Context_Menu:${randomMenuId}`,
            label,
            createdMenu,
            () => { }
        );
    }

    /**
     * Close the menu
     */
    public async menuClose(): Promise<void> {
        await this.onReady();
        exports[GetCurrentResourceName()]['ox_input_close']();
    }

    /**
     * Open Advanced Menu (OX ONLY)
     * @param id
     * @param title
     * @param position
     * @param options
     */
    public async menuOpenAdvanced(id: string, title: string, position: string, options: any, onSelect: Function, onHover: Function, onClose: Function) {
        return new Promise((resolve, reject) => {
            exports[GetCurrentResourceName()]['ox_menu'](
                id,
                title,
                position,
                options,
                (selected: any, scrollIndex: any, args: any) => {
                    // Handle selection
                },
                (selected: any, secondary: any, args: any) => {
                    onHover(selected - 1);
                    // Handle hover
                },
                (selected: any, checked: any, args: any) => {
                    // Handle checkbox
                },
                (keyPressed: string) => {
                    // Handle key press
                    onClose();
                },
                (selected: any, checked: any, args: any) => {
                    // Handle select
                    onSelect(selected)
                }
            );
        });
    }

    /**
     * Close the advanced menu
     */
    public menuCloseAdvanced() {
        exports[GetCurrentResourceName()]['ox_menu_hide']();
    }
}


//=============================================================\\
//====================| GLOBAL EVENT CORE |====================\\
class GlobalEvent_Core_V3 extends Menu_Core_V3 {
    private globalEvents: Record<string, Function> = {};
    constructor() {
        super();
        this.registerGlobalRecall();
    }

    /**
     * Register global event
     */
    private registerGlobalRecall(): void {
        onNet(`CPT_Core:Client:SendGlobalEvent:${GetCurrentResourceName()}`,
            (eventName: string, ...args: any[]) => {
                const callback = this.globalEvents[eventName];
                if (callback) {
                    callback(...args);
                }
            }
        );
    }

    /**
     * Register global event
     * @param eventName The event name
     * @param callback The function the global event will call
     */
    public async globalRegister(eventName: string, callback: Function): Promise<void> {
        await this.onReady();
        this.globalEvents[eventName] = callback;
    }

    /**
     * Trigger global event
     * @param eventName The event name
     * @param args All the arguments sent
     */
    public async globalTrigger(eventName: string, ...args: any[]): Promise<void> {
        await this.onReady();
        emitNet(`CPT_Core:Server:SendGlobalEvent:${GetCurrentResourceName()}`, eventName, ...args);
    }
}



//============================================================\\
//====================| HOSTILE PED CORE |====================\\
class HostilePed_Core_V3 extends GlobalEvent_Core_V3 {
    constructor() {
        super()
        AddRelationshipGroup('Merryweather')
        this.registerHostileEvent()
    }

    /**
     * Create a hostile ped
     * @param model Ped Model
     * @param weapon Peds weapon
     * @param accuracy Number between 0-100
     * @param gender True = Female / False = Male
     * @param allowHeadShot True = allow head shots
     * @param combatMovement 0 = Stationary / 1 = Defensive / 2 = Offensive / 3 = Suicidal
     * @param combatRange 0 = Near / 1 = Medium / 2 = Far
     * @returns Ped
     */
    public async spawnHostilePed(model: string, location: coordsV4, armor: number, weapon: string, accuracy: number, gender: boolean, allowHeadShot: boolean, combatMovement: number, combatRange: number): Promise<number> {
        await this.onReady()
        return new Promise<number>(async (resolve, reject) => {
            await this.streamModel(model)

            const createdPed = CreatePed(30, model, location.x, location.y, location.z, location.w, true, true)
            SetPedArmour(createdPed, armor)
            SetPedRelationshipGroupHash(createdPed, 'Merryweather')
            SetPedRelationshipGroupDefaultHash(createdPed, 'Merryweather')
            SetRelationshipBetweenGroups(1, 'Merryweather', 'Merryweather')
            GiveWeaponToPed(createdPed, GetHashKey(weapon), 250, false, true)
            TaskCombatPed(createdPed, PlayerPedId(), 0, 16)
            SetPedAccuracy(createdPed, accuracy)
            SetPedAudioGender(createdPed, gender)
            SetPedDropsWeaponsWhenDead(createdPed, false)
            SetPedSuffersCriticalHits(createdPed, allowHeadShot)
            SetEntityAsMissionEntity(createdPed, true, true)
            //SetPedFleeAttributes(createdPed, 0, true)
            SetPedCanSwitchWeapon(createdPed, true)
            SetEntityVisible(createdPed, true, false)
            SetEntityAlpha(createdPed, 255, false)
            SetEntityInvincible(createdPed, false)
            SetBlockingOfNonTemporaryEvents(createdPed, true)
            SetPedCombatMovement(createdPed, combatMovement)
            SetPedCombatRange(createdPed, combatRange)
            TaskSetBlockingOfNonTemporaryEvents(createdPed, true)
            SetRelationshipBetweenGroups(5, 'PLAYER', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'ARMY', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_BALLAS', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_CULT', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_FAMILY', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_LOST', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_MARABUNTE', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_MEXICAN', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_SALVA', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_WEICHENG', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_HILLBILLY', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'COP', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'COUGER', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'SECURITY_GUARD', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'PRIVATE_SECURITY', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'PRISONER', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'FIREMAN', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'GANG_1	', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'GANG_2', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'GANG_9', 'Merryweather')
            SetRelationshipBetweenGroups(1, 'GANG_10', 'Merryweather')
            const currentNetId = NetworkGetNetworkIdFromEntity(createdPed)
            this.globalTrigger('syncHostilePed', currentNetId)
            this.createdPeds.push(createdPed)
            resolve(createdPed)
        })
    }

    /**
     * Create a hostile ped with a anger range
     * @param model Ped Model
     * @param weapon Peds weapon
     * @param accuracy Number between 0-100
     * @param gender True = Female / False = Male
     * @param allowHeadShot True = allow head shots
     * @param combatMovement 0 = Stationary / 1 = Defensive / 2 = Offensive / 3 = Suicidal
     * @param combatRange 0 = Near / 1 = Medium / 2 = Far
     * @returns Ped
     */
    public async spawnHostileZonePed(model: string, location: coordsV4, armor: number, weapon: string, accuracy: number, gender: boolean, allowHeadShot: boolean, combatMovement: number, combatRange: number, activation: number): Promise<number> {
        await this.onReady()
        return new Promise<number>(async (resolve, reject) => {
            await this.streamModel(model)

            const createdPed = CreatePed(30, model, location.x, location.y, location.z, location.w, true, true)

            SetPedArmour(createdPed, armor)
            GiveWeaponToPed(createdPed, GetHashKey(weapon), 250, false, true)
            SetPedAccuracy(createdPed, accuracy)
            SetPedAudioGender(createdPed, gender)
            SetPedDropsWeaponsWhenDead(createdPed, false)
            SetPedSuffersCriticalHits(createdPed, allowHeadShot)
            SetEntityAsMissionEntity(createdPed, true, true)
            SetPedCanSwitchWeapon(createdPed, true)
            SetEntityVisible(createdPed, true, false)
            SetEntityAlpha(createdPed, 255, false)
            SetEntityInvincible(createdPed, false)
            SetBlockingOfNonTemporaryEvents(createdPed, true)
            SetPedCombatMovement(createdPed, combatMovement)
            SetPedCombatRange(createdPed, combatRange)
            TaskSetBlockingOfNonTemporaryEvents(createdPed, true)
            this.createdPeds.push(createdPed)

            const currentNetId = NetworkGetNetworkIdFromEntity(createdPed)
            this.globalTrigger('CPT_Core:hostilePedRange', location, currentNetId, activation)
            resolve(createdPed)
        })
    }

    /**
     * Make ped hostile
     * @param createdPed Ped Model
     */
    public async forceHostilePed(createdPed: number): Promise<void> {
        await this.onReady()
        return new Promise((resolve, reject) => {
            let currentRate = 60
            const hostileInterval = setInterval(() => {
                if (currentRate <= 0) {
                    clearInterval(hostileInterval)
                } else {
                    currentRate = currentRate - 1
                    SetPedRelationshipGroupHash(createdPed, 'Merryweather')
                    SetPedRelationshipGroupDefaultHash(createdPed, 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'Merryweather', 'Merryweather')
                    TaskCombatPed(createdPed, PlayerPedId(), 0, 16)
                    SetPedDropsWeaponsWhenDead(createdPed, false)
                    SetEntityAsMissionEntity(createdPed, true, true)
                    //SetPedFleeAttributes(createdPed, 0, true)
                    SetPedCanSwitchWeapon(createdPed, true)
                    SetEntityVisible(createdPed, true, false)
                    SetEntityAlpha(createdPed, 255, false)
                    SetEntityInvincible(createdPed, false)
                    SetBlockingOfNonTemporaryEvents(createdPed, true)
                    SetRelationshipBetweenGroups(5, 'PLAYER', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'ARMY', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_BALLAS', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_CULT', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_FAMILY', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_LOST', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_MARABUNTE', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_MEXICAN', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_SALVA', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_WEICHENG', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_HILLBILLY', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'COP', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'COUGER', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'SECURITY_GUARD', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'PRIVATE_SECURITY', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'PRISONER', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'FIREMAN', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'GANG_1	', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'GANG_2', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'GANG_9', 'Merryweather')
                    SetRelationshipBetweenGroups(1, 'GANG_10', 'Merryweather')
                }
            }, 500)
        })
    }

    /**
     * Created Ally Ped
     * @param createdPed
     */
    public async forceAllyPed(createdPed: number): Promise<void> {
        await this.onReady()
        let currentRate = 60
        const allyInterval = setInterval(() => {
            if (currentRate <= 0) {
                clearInterval(allyInterval)
            } else {
                currentRate = currentRate - 1
                SetPedRelationshipGroupHash(createdPed, 'Merryweather')
                SetPedRelationshipGroupDefaultHash(createdPed, 'Merryweather')
                SetRelationshipBetweenGroups(1, 'Merryweather', 'Merryweather')
                SetPedDropsWeaponsWhenDead(createdPed, false)
                SetEntityAsMissionEntity(createdPed, true, true)
                SetEntityVisible(createdPed, true, false)
                SetEntityAlpha(createdPed, 255, false)
                SetEntityInvincible(createdPed, false)
                SetBlockingOfNonTemporaryEvents(createdPed, true)
                SetRelationshipBetweenGroups(1, 'PLAYER', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'ARMY', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_BALLAS', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_CULT', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_FAMILY', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_LOST', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_MARABUNTE', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_MEXICAN', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_SALVA', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_WEICHENG', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'AMBIENT_GANG_HILLBILLY', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'COP', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'COUGER', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'SECURITY_GUARD', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'PRIVATE_SECURITY', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'PRISONER', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'FIREMAN', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'GANG_1	', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'GANG_2', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'GANG_9', 'Merryweather')
                SetRelationshipBetweenGroups(1, 'GANG_10', 'Merryweather')
            }
        }, 5000)
    }

    /**
     * Sync global
     * @param pedId Ped Model
     */
    private async registerHostileEvent(): Promise<void> {
        await this.onReady()
        this.globalRegister('syncHostilePed', (pedId: number) => {
            const allPeds = GetGamePool('CPed')
            allPeds.forEach((entity: number) => {
                if (pedId == NetworkGetNetworkIdFromEntity(entity)) {
                    this.forceHostilePed(entity)
                }
            })
        })

        this.globalRegister('CPT_Core:hostilePedRange', async (location: coordsV3, netId: number, activation: number) => {
            const hostilePedId = this.mathRandom(1000, 9999)
            this.polyzoneCreateCircle(`hostilePedZone:${hostilePedId}`, vector4(location.x, location.y, location.z, 0), activation, () => {
                this.polyzoneDelete(`hostilePedZone:${hostilePedId}`)
                const allPeds = GetGamePool('CPed')
                allPeds.forEach((entity: number) => {
                    if (netId == NetworkGetNetworkIdFromEntity(entity)) {
                        this.forceHostilePed(entity)
                    }
                })
            }, () => { })
        })
    }
}


//========================================================\\
//====================| VEHICLE CORE |====================\\
class Vehicle_Core_V3 extends HostilePed_Core_V3 {
    constructor() {
        super()
        this.globalRegister('CPT_Core:Vehicle:ScanForVehicle', (eventName: string, plateNumber: string) => {
            const allVehicles = GetGamePool('CVehicle')
            for (let i = 0; i < allVehicles.length; i++) {
                const testPlate = GetVehicleNumberPlateText(allVehicles[i])
                if (plateNumber == testPlate) {
                    const vehicleCoords = GetEntityCoords(allVehicles[i], false)
                    const vehCoords = vector3(vehicleCoords[0], vehicleCoords[1], vehicleCoords[2])
                    this.globalTrigger(eventName, vehCoords)
                }
            }
        })

        this.globalRegister('CPT_Core:Global:DeleteBike', (bikeNetId: number) => {
            const foundEntity: number = NetworkGetEntityFromNetworkId(bikeNetId)
            SetEntityAsMissionEntity(foundEntity, true, true)
            DeleteVehicle(foundEntity)
            DeleteEntity(foundEntity)
        })
    }

    /**
     * Set vehicle fuel
     * @param currentVehicle The vehicle you want to set the fuel of
     * @param fuelLevel The level of the fuel you want the vehicle to be at
     * @returns
     */
    public async setFuel(currentVehicle: number, fuelLevel: number): Promise<void> {
        await this.onReady()
        exports['ps-fuel']['SetFuel'](currentVehicle, fuelLevel)
    }

    /**
     * Give keys of vehicle
     * @param plateNumber The plate number of the vehicle
     * @returns
     */
    public async giveKeys(vehicle: number): Promise<void> {
        await this.onReady()
        emit("vehiclekeys:client:SetOwner", QBCore.Functions.GetPlate(vehicle))
    }

    /**
     * Delete a vehicle
     * @param entity The vehicle that needs to be deleted
     * @returns
     */
    public async vehicleDelete(entity: number): Promise<void> {
        await this.onReady()
        if (entity) {
            SetEntityAsMissionEntity(entity, true, true)
            DeleteVehicle(entity)
            DeleteEntity(entity)
        }
    }

    /**
     * Get vehicle model name
     * @param vehicleModel Get the vehicle model name
     * @returns
     */
    public async getVehicleName(vehicleModel: string): Promise<string> {
        await this.onReady()
        const foundVehicle = QBCore.Shared.Vehicles[vehicleModel]
        if (foundVehicle) {
            return foundVehicle.name
        } else {
            return vehicleModel
        }
    }

    /**
     * Check the nearby spawn location
     * @param location
     * @returns
     */
    private checkVehicleSpawn(location: coordsV3): Promise<boolean> {
        return new Promise<boolean>(async (resolve2, reject2) => {
            const foundVehicle = this.getClosestVehicle(location, 2.5)
            if (foundVehicle.plate == '') {
                resolve2(true)
            } else {
                this.callbackSend(`CPT_Core:Server:testForVehicle:${GetCurrentResourceName()}`, (state: boolean) => {
                    if (state == true) {
                        console.error('Spawn location blocked by owned vehicle')
                        this.messageError('Spawn location blocked by owned vehicle')
                        resolve2(false)
                    } else {
                        this.vehicleDelete(foundVehicle.vehicle)
                        resolve2(true)
                    }
                }, foundVehicle.plate)
            }
        })
    }

    /**
     * Create a vehicle
     * @param location Location where the vehicle is being created
     * @param model The model of the vehicle that is getting created
     * @param networked If the vehicle should be network synced
     * @param placeProperly If the vehicle should be placed properly on the ground
     * @returns
     */
    public async vehicleCreate(location: coordsV4, model: string, networked: boolean, placeProperly: boolean, timed: number | null): Promise<number> {
        await this.onReady()
        return new Promise(async (resolve, reject) => {
            const modelExists: boolean = await new Promise((resolve2, reject2) => {
                if (IsModelInCdimage(model) == true) {
                    resolve2(true)
                } else {
                    resolve2(false)
                    console.error('Unable to spawn vehicle')
                }
            })

            const checkSpawn: boolean = await this.checkVehicleSpawn(location)

            if (modelExists == true) {
                if (checkSpawn == true) {
                    await this.streamModel(model)
                    const createdVehicle = CreateVehicle(GetHashKey(model), location.x, location.y, location.z, location.w, networked, false)
                    SetEntityAsMissionEntity(createdVehicle, true, false)
                    SetVehicleHasBeenOwnedByPlayer(createdVehicle, true)
                    SetVehicleNeedsToBeHotwired(createdVehicle, false)
                    SetModelAsNoLongerNeeded(model)
                    SetVehRadioStation(createdVehicle, 'OFF')
                    if (placeProperly == true) { PlaceObjectOnGroundProperly(createdVehicle) }
                    // if (timed != null && timed != 0) { this.setTimed(createdVehicle, timed) }
                    resolve(createdVehicle)
                } else {
                    this.messageError('Spawn is blocked')
                    console.error('Spawn is blocked')
                }
            } else {
                console.error('Unable to spawn vehicle')
            }
        })
    }

    /**
     * Set vehicle timed
     * @param createdVehicle
     * @param time
     */
    private setTimed(createdVehicle: number, time: number) {
        const bikeNetId: number = NetworkGetEntityNetScriptId(createdVehicle)
        let bikeTimeout: any
        let offBike: boolean = false

        const bikeTacker = setInterval(() => {
            const currentBike = GetVehiclePedIsIn(PlayerPedId(), false)

            if (currentBike == 0) {
                if (offBike == false) {
                    offBike = true
                    bikeTimeout = setTimeout(() => {
                        this.globalTrigger('CPT_Core:Global:DeleteBike', bikeNetId)
                        clearInterval(bikeTacker)
                    }, time * (60 * 1000))
                }
            } else if (currentBike != createdVehicle) {
                offBike = false
                this.globalTrigger('CPT_Core:Global:DeleteBike', bikeNetId)
                clearInterval(bikeTacker)
                clearTimeout(bikeTimeout)
            } else {
                clearTimeout(bikeTimeout)
                offBike = false
            }
        }, 5000)
    }

    /**
     * Get vehicle mods
     * @param vehicle The vehicle that is being broken down
     * @returns
     */
    public async getMods(vehicle: number): Promise<any> {
        await this.onReady()
        const vehicleMods = QBCore.Functions.GetVehicleProperties(vehicle)
        return vehicleMods
        // if (DoesEntityExist(vehicle) == true) {

        //     //===| Vehicle Extras Colors |===\\
        //     const [pearlescentColor, wheelColor] = GetVehicleExtraColours(vehicle)

        //     //===| Vehicle Colors |===\\
        //     let [colorPrimary, colorSecondary]: [number | { r: number, g: number, b: number }, number | { r: number, g: number, b: number }] = GetVehicleColours(vehicle)
        //     if (GetIsVehiclePrimaryColourCustom(vehicle) == true) {
        //         const [r, g, b] = GetVehicleCustomPrimaryColour(vehicle)
        //         colorPrimary = { r, g, b }
        //     }
        //     if (GetIsVehicleSecondaryColourCustom(vehicle) == true) {
        //         const [r, g, b] = GetVehicleCustomSecondaryColour(vehicle)
        //         colorSecondary = { r, g, b }
        //     }

        //     //===| Vehicle EXtras |===\\
        //     let extras: any = {}
        //     for (let i = 0; i < 12; i++) {
        //         if (DoesExtraExist(vehicle, i)) {
        //             if (IsVehicleExtraTurnedOn(vehicle, i) == true) {
        //                 extras[i] = true
        //             } else {
        //                 extras[i] = false
        //             }
        //         }
        //     }

        //     //===| Vehicle Tire Health |===\\
        //     let tireHealth: any = {}
        //     for (let i = 0; i < 3; i++) {
        //         tireHealth[i] = GetVehicleWheelHealth(vehicle, i)
        //     }

        //     //===| Vehicle Burst State |===\\
        //     let tireBurstState: any = {}
        //     for (let i = 0; i < 5; i++) {
        //         tireBurstState[i] = IsVehicleTyreBurst(vehicle, i, false)
        //     }
        //     tireBurstState[45] = IsVehicleTyreBurst(vehicle, 45, false)
        //     tireBurstState[47] = IsVehicleTyreBurst(vehicle, 47, false)

        //     //===| Vehicle Burst Completly |===\\
        //     let tireBurstCompletely: any = {}
        //     for (let i = 0; i < 5; i++) {
        //         tireBurstCompletely[i] = IsVehicleTyreBurst(vehicle, i, true)
        //     }

        //     //===| Window Status |===\\
        //     let windowStatus: any = {}
        //     for (let i = 0; i < 7; i++) {
        //         windowStatus[i] = IsVehicleWindowIntact(vehicle, i)
        //     }

        //     //===| Door Status |===\\
        //     let doorStatus: any = {}
        //     for (let i = 0; i < 7; i++) {
        //         doorStatus[i] = IsVehicleDoorDamaged(vehicle, i)
        //     }

        //     //===| Neon Color |===\\
        //     const [neonRed, neonGreen, neonBlue] = GetVehicleNeonLightsColour(vehicle)

        //     //===| Return Details |===\\
        //     return {
        //         model: GetEntityModel(vehicle),
        //         plate: QBCore.Functions.GetPlate(vehicle),
        //         plateIndex: GetVehicleNumberPlateTextIndex(vehicle),
        //         bodyHealth: QBCore.Shared.Round(GetVehicleBodyHealth(vehicle), 0.1),
        //         engineHealth: QBCore.Shared.Round(GetVehicleEngineHealth(vehicle), 0.1),
        //         tankHealth: QBCore.Shared.Round(GetVehiclePetrolTankHealth(vehicle), 0.1),
        //         fuelLevel: 0,
        //         dirtLevel: QBCore.Shared.Round(GetVehicleDirtLevel(vehicle), 0.1),
        //         oilLevel: QBCore.Shared.Round(GetVehicleOilLevel(vehicle), 0.1),
        //         color1: colorPrimary,
        //         color2: colorSecondary,
        //         pearlescentColor: pearlescentColor,
        //         dashboardColor: GetVehicleDashboardColour(vehicle),
        //         wheelColor: wheelColor,
        //         wheels: GetVehicleWheelType(vehicle),
        //         wheelSize: GetVehicleWheelSize(vehicle),
        //         wheelWidth: GetVehicleWheelWidth(vehicle),
        //         tireHealth: tireHealth,
        //         tireBurstState: tireBurstState,
        //         tireBurstCompletely: tireBurstCompletely,
        //         windowTint: GetVehicleWindowTint(vehicle),
        //         windowStatus: windowStatus,
        //         doorStatus: doorStatus,
        //         xenonColor: GetVehicleXenonLightsColour(vehicle),
        //         neonEnabled: [
        //             IsVehicleNeonLightEnabled(vehicle, 0),
        //             IsVehicleNeonLightEnabled(vehicle, 1),
        //             IsVehicleNeonLightEnabled(vehicle, 2),
        //             IsVehicleNeonLightEnabled(vehicle, 3)
        //         ],
        //         neonColor: [neonRed, neonGreen, neonBlue],
        //         headlightColor: GetVehicleHeadlightsColour(vehicle),
        //         interiorColor: GetVehicleInteriorColour(vehicle),
        //         extras: extras,
        //         tyreSmokeColor: GetVehicleTyreSmokeColor(vehicle),
        //         modSpoilers: GetVehicleMod(vehicle, 0),
        //         modFrontBumper: GetVehicleMod(vehicle, 1),
        //         modRearBumper: GetVehicleMod(vehicle, 2),
        //         modSideSkirt: GetVehicleMod(vehicle, 3),
        //         modExhaust: GetVehicleMod(vehicle, 4),
        //         modFrame: GetVehicleMod(vehicle, 5),
        //         modGrille: GetVehicleMod(vehicle, 6),
        //         modHood: GetVehicleMod(vehicle, 7),
        //         modFender: GetVehicleMod(vehicle, 8),
        //         modRightFender: GetVehicleMod(vehicle, 9),
        //         modRoof: GetVehicleMod(vehicle, 10),
        //         modEngine: GetVehicleMod(vehicle, 11),
        //         modBrakes: GetVehicleMod(vehicle, 12),
        //         modTransmission: GetVehicleMod(vehicle, 13),
        //         modHorns: GetVehicleMod(vehicle, 14),
        //         modSuspension: GetVehicleMod(vehicle, 15),
        //         modArmor: GetVehicleMod(vehicle, 16),
        //         modKit17: GetVehicleMod(vehicle, 17),
        //         modTurbo: IsToggleModOn(vehicle, 18),
        //         modKit19: GetVehicleMod(vehicle, 19),
        //         modSmokeEnabled: IsToggleModOn(vehicle, 20),
        //         modKit21: GetVehicleMod(vehicle, 21),
        //         modXenon: IsToggleModOn(vehicle, 22),
        //         modFrontWheels: GetVehicleMod(vehicle, 23),
        //         modBackWheels: GetVehicleMod(vehicle, 24),
        //         modCustomTiresF: GetVehicleModVariation(vehicle, 23),
        //         modCustomTiresR: GetVehicleModVariation(vehicle, 24),
        //         modPlateHolder: GetVehicleMod(vehicle, 25),
        //         modVanityPlate: GetVehicleMod(vehicle, 26),
        //         modTrimA: GetVehicleMod(vehicle, 27),
        //         modOrnaments: GetVehicleMod(vehicle, 28),
        //         modDashboard: GetVehicleMod(vehicle, 29),
        //         modDial: GetVehicleMod(vehicle, 30),
        //         modDoorSpeaker: GetVehicleMod(vehicle, 31),
        //         modSeats: GetVehicleMod(vehicle, 32),
        //         modSteeringWheel: GetVehicleMod(vehicle, 33),
        //         modShifterLeavers: GetVehicleMod(vehicle, 34),
        //         modAPlate: GetVehicleMod(vehicle, 35),
        //         modSpeakers: GetVehicleMod(vehicle, 36),
        //         modTrunk: GetVehicleMod(vehicle, 37),
        //         modHydrolic: GetVehicleMod(vehicle, 38),
        //         modEngineBlock: GetVehicleMod(vehicle, 39),
        //         modAirFilter: GetVehicleMod(vehicle, 40),
        //         modStruts: GetVehicleMod(vehicle, 41),
        //         modArchCover: GetVehicleMod(vehicle, 42),
        //         modAerials: GetVehicleMod(vehicle, 43),
        //         modTrimB: GetVehicleMod(vehicle, 44),
        //         modTank: GetVehicleMod(vehicle, 45),
        //         modWindows: GetVehicleMod(vehicle, 46),
        //         modKit47: GetVehicleMod(vehicle, 47),
        //         modLivery: GetVehicleMod(vehicle, 48),
        //         modLivery2: GetVehicleLivery(vehicle),
        //         modKit49: GetVehicleMod(vehicle, 49),
        //         liveryRoof: GetVehicleRoofLivery(vehicle),
        //     }
        // } else {
        //     return
        // }
    }

    /**
     * Set vehicle mods
     * @param vehicle The vehicle that is being modified
     * @param properties All the modifications to the vehicle
     * @returns
     */
    public async setMods(vehicle: number, properties: any): Promise<void> {
        await this.onReady()
        QBCore.Functions.SetVehicleProperties(vehicle, properties)
        return
        // if (DoesEntityExist(vehicle) == true) {

        //     //===| Vehicle Extras |===\\
        //     if (properties.extras) {
        //         for (let i = 0; i < properties.extras.length; i++) {
        //             if (properties.extras[i] == true) {
        //                 SetVehicleExtra(vehicle, i, false)
        //             } else {
        //                 SetVehicleExtra(vehicle, i, true)
        //             }
        //         }
        //     }

        //     //===| Color |===\\
        //     const [colorPrimary, colorSecondary] = GetVehicleColours(vehicle)
        //     const [pearlescentColor, wheelColor] = GetVehicleExtraColours(vehicle)
        //     SetVehicleModKit(vehicle, 0)

        //     //===| Plate |===\\
        //     if (properties.plate != null || properties.plate != undefined) {
        //         SetVehicleNumberPlateText(vehicle, properties.plate)
        //     }

        //     //===| Plate Index |===\\
        //     if (properties.plateIndex != null || properties.plateIndex != undefined) {
        //         SetVehicleNumberPlateTextIndex(vehicle, properties.plateIndex)
        //     }

        //     //===| Body Health |===\\
        //     if (properties.bodyHealth != null || properties.bodyHealth != undefined) {
        //         SetVehicleBodyHealth(vehicle, properties.bodyHealth + 0.0)
        //     }

        //     //===| Engine Health |===\\
        //     if (properties.engineHealth != null || properties.engineHealth != undefined) {
        //         SetVehicleEngineHealth(vehicle, properties.engineHealth + 0.0)
        //     }

        //     //===| Tank Health |===\\
        //     if (properties.tankHealth != null || properties.tankHealth != undefined) {
        //         SetVehiclePetrolTankHealth(vehicle, properties.tankHealth)
        //     }

        //     //===| Fuel Level |===\\
        //     if (properties.fuelLevel != null || properties.fuelLevel != undefined) {
        //         //Config.sendExport('ps-fuel', 'SetFuel', vehicle, properties.fuelLevel)
        //     }

        //     //===| Dirt Level |===\\
        //     if (properties.dirtLevel != null || properties.dirtLevel != undefined) {
        //         SetVehicleDirtLevel(vehicle, properties.dirtLevel + 0.0)
        //     }

        //     //===| Oil Level |===\\
        //     if (properties.oilLevel != null || properties.oilLevel != undefined) {
        //         SetVehicleOilLevel(vehicle, properties.oilLevel)
        //     }

        //     //===| Color 1 |===\\
        //     if (properties.color1 != null || properties.color1 != undefined) {
        //         if (typeof properties.color1 == 'number') {
        //             ClearVehicleCustomPrimaryColour(vehicle)
        //             SetVehicleColours(vehicle, properties.color1, colorSecondary)
        //         } else {
        //             SetVehicleCustomPrimaryColour(vehicle, properties.color1[0], properties.color1[1], properties.color1[2])
        //         }
        //     }

        //     //===| Color 2 |===\\
        //     if (properties.color2 != null || properties.color2 != undefined) {
        //         if (typeof properties.color2 == 'number') {
        //             ClearVehicleCustomSecondaryColour(vehicle)
        //             SetVehicleColours(vehicle, properties.color1 || colorPrimary, properties.color2)
        //         } else {
        //             SetVehicleCustomSecondaryColour(vehicle, properties.color2[0], properties.color2[1], properties.color2[2])
        //         }
        //     }

        //     //===| Pearlesent Color |===\\
        //     if (properties.pearlescentColor != null || properties.pearlescentColor != undefined) {
        //         SetVehicleExtraColours(vehicle, properties.pearlescentColor, wheelColor)
        //     }

        //     //===| Interior Color |===\\
        //     if (properties.interiorColor != null || properties.interiorColor != undefined) {
        //         SetVehicleInteriorColor(vehicle, properties.interiorColor)
        //     }

        //     //===| Dashboard Color |===\\
        //     if (properties.dashboardColor != null || properties.dashboardColor != undefined) {
        //         SetVehicleDashboardColour(vehicle, properties.dashboardColor)
        //     }

        //     //===| Wheel Color |===\\
        //     if (properties.wheelColor != null || properties.wheelColor != undefined) {
        //         SetVehicleExtraColours(vehicle, properties.pearlescentColor || pearlescentColor, properties.wheelColor)
        //     }

        //     //===| Wheels |===\\
        //     if (properties.wheels != null || properties.wheels != undefined) {
        //         SetVehicleWheelType(vehicle, properties.wheels)
        //     }

        //     //===| Tire Health |===\\
        //     if (properties.tireHealth) {
        //         for (let i = 0; i < properties.tireHealth.length; i++) {
        //             SetVehicleWheelHealth(vehicle, i, properties.tireHealth[i])
        //         }
        //     }

        //     //===| Tire Burst State |===\\
        //     if (properties.tireBurstState) {
        //         for (let i = 0; i < properties.tireBurstState.length; i++) {
        //             if (properties.tireBurstState[i] == true) {
        //                 SetVehicleTyreBurst(vehicle, i, false, 1000.0)
        //             }
        //         }
        //     }

        //     //===| Tire Burst Completly |===\\
        //     if (properties.tireBurstCompletely) {
        //         for (let i = 0; i < properties.tireBurstCompletely.length; i++) {
        //             if (properties.tireBurstCompletely[i] == true) {
        //                 SetVehicleTyreBurst(vehicle, i, true, 1000.0)
        //             }
        //         }
        //     }

        //     //===| Window Tint |===\\
        //     if (properties.windowTint) {
        //         SetVehicleWindowTint(vehicle, properties.windowTint)
        //     }

        //     //===| Window Status |===\\
        //     if (properties.windowStatus) {
        //         for (let i = 0; i < properties.windowStatus.length; i++) {
        //             if (properties.windowStatus[i] == false) {
        //                 SmashVehicleWindow(vehicle, i)
        //             }
        //         }
        //     }

        //     //===| Door Status |===\\
        //     if (properties.doorStatus) {
        //         for (let i = 0; i < properties.doorStatus.length; i++) {
        //             if (properties.doorStatus[i] == true) {
        //                 SetVehicleDoorBroken(vehicle, i, true)
        //             }
        //         }
        //     }

        //     //===| Neon Available |===\\
        //     if (properties.neonEnabled) {
        //         SetVehicleNeonLightEnabled(vehicle, 0, properties.neonEnabled[0])
        //         SetVehicleNeonLightEnabled(vehicle, 1, properties.neonEnabled[1])
        //         SetVehicleNeonLightEnabled(vehicle, 2, properties.neonEnabled[2])
        //         SetVehicleNeonLightEnabled(vehicle, 3, properties.neonEnabled[3])
        //     }

        //     //===| Neon Color |===\\
        //     if (properties.neonColor) {
        //         SetVehicleNeonLightsColour(vehicle, properties.neonColor[0], properties.neonColor[1], properties.neonColor[2])
        //     }

        //     //===| Headlight Color |===\\
        //     if (properties.headlightColor) {
        //         SetVehicleHeadlightsColour(vehicle, properties.headlightColor)
        //     }

        //     //===| Interior Color |===\\
        //     if (properties.interiorColor) {
        //         SetVehicleHeadlightsColour(vehicle, properties.interiorColor)
        //     }

        //     //===| Apply Mod Kits |===\\
        //     if (properties.wheelSize) { SetVehicleWheelSize(vehicle, properties.wheelSize) }
        //     if (properties.wheelWidth) { SetVehicleWheelWidth(vehicle, properties.wheelWidth) }
        //     if (properties.tyreSmokeColor) { SetVehicleTyreSmokeColor(vehicle, properties.tyreSmokeColor[1], properties.tyreSmokeColor[2], properties.tyreSmokeColor[3]) }
        //     if (properties.modSpoilers) { SetVehicleMod(vehicle, 0, properties.modSpoilers, false) }
        //     if (properties.modFrontBumper) { SetVehicleMod(vehicle, 1, properties.modFrontBumper, false) }
        //     if (properties.modRearBumper) { SetVehicleMod(vehicle, 2, properties.modRearBumper, false) }
        //     if (properties.modSideSkirt) { SetVehicleMod(vehicle, 3, properties.modSideSkirt, false) }
        //     if (properties.modExhaust) { SetVehicleMod(vehicle, 4, properties.modExhaust, false) }
        //     if (properties.modFrame) { SetVehicleMod(vehicle, 5, properties.modFrame, false) }
        //     if (properties.modGrille) { SetVehicleMod(vehicle, 6, properties.modGrille, false) }
        //     if (properties.modHood) { SetVehicleMod(vehicle, 7, properties.modHood, false) }
        //     if (properties.modFender) { SetVehicleMod(vehicle, 8, properties.modFender, false) }
        //     if (properties.modRightFender) { SetVehicleMod(vehicle, 9, properties.modRightFender, false) }
        //     if (properties.modRoof) { SetVehicleMod(vehicle, 10, properties.modRoof, false) }
        //     if (properties.modEngine) { SetVehicleMod(vehicle, 11, properties.modEngine, false) }
        //     if (properties.modBrakes) { SetVehicleMod(vehicle, 12, properties.modBrakes, false) }
        //     if (properties.modTransmission) { SetVehicleMod(vehicle, 13, properties.modTransmission, false) }
        //     if (properties.modHorns) { SetVehicleMod(vehicle, 14, properties.modHorns, false) }
        //     if (properties.modSuspension) { SetVehicleMod(vehicle, 15, properties.modSuspension, false) }
        //     if (properties.modArmor) { SetVehicleMod(vehicle, 16, properties.modArmor, false) }
        //     if (properties.modKit17) { SetVehicleMod(vehicle, 17, properties.modKit17, false) }
        //     if (properties.modTurbo) { ToggleVehicleMod(vehicle, 18, properties.modTurbo) }
        //     if (properties.modKit19) { SetVehicleMod(vehicle, 19, properties.modKit19, false) }
        //     if (properties.modSmokeEnabled) { ToggleVehicleMod(vehicle, 20, properties.modSmokeEnabled) }
        //     if (properties.modKit21) { SetVehicleMod(vehicle, 21, properties.modKit21, false) }
        //     if (properties.modXenon) { ToggleVehicleMod(vehicle, 22, properties.modXenon) }
        //     if (properties.xenonColor) { SetVehicleXenonLightsColor(vehicle, properties.xenonColor) }
        //     if (properties.modFrontWheels) { SetVehicleMod(vehicle, 23, properties.modFrontWheels, false) }
        //     if (properties.modBackWheels) { SetVehicleMod(vehicle, 24, properties.modBackWheels, false) }
        //     if (properties.modCustomTiresF) { SetVehicleMod(vehicle, 23, properties.modFrontWheels, properties.modCustomTiresF) }
        //     if (properties.modCustomTiresR) { SetVehicleMod(vehicle, 24, properties.modBackWheels, properties.modCustomTiresR) }
        //     if (properties.modPlateHolder) { SetVehicleMod(vehicle, 25, properties.modPlateHolder, false) }
        //     if (properties.modVanityPlate) { SetVehicleMod(vehicle, 26, properties.modVanityPlate, false) }
        //     if (properties.modTrimA) { SetVehicleMod(vehicle, 27, properties.modTrimA, false) }
        //     if (properties.modOrnaments) { SetVehicleMod(vehicle, 28, properties.modOrnaments, false) }
        //     if (properties.modDashboard) { SetVehicleMod(vehicle, 29, properties.modDashboard, false) }
        //     if (properties.modDial) { SetVehicleMod(vehicle, 30, properties.modDial, false) }
        //     if (properties.modDoorSpeaker) { SetVehicleMod(vehicle, 31, properties.modDoorSpeaker, false) }
        //     if (properties.modSeats) { SetVehicleMod(vehicle, 32, properties.modSeats, false) }
        //     if (properties.modSteeringWheel) { SetVehicleMod(vehicle, 33, properties.modSteeringWheel, false) }
        //     if (properties.modShifterLeavers) { SetVehicleMod(vehicle, 34, properties.modShifterLeavers, false) }
        //     if (properties.modAPlate) { SetVehicleMod(vehicle, 35, properties.modAPlate, false) }
        //     if (properties.modSpeakers) { SetVehicleMod(vehicle, 36, properties.modSpeakers, false) }
        //     if (properties.modTrunk) { SetVehicleMod(vehicle, 37, properties.modTrunk, false) }
        //     if (properties.modHydrolic) { SetVehicleMod(vehicle, 38, properties.modHydrolic, false) }
        //     if (properties.modEngineBlock) { SetVehicleMod(vehicle, 39, properties.modEngineBlock, false) }
        //     if (properties.modAirFilter) { SetVehicleMod(vehicle, 40, properties.modAirFilter, false) }
        //     if (properties.modStruts) { SetVehicleMod(vehicle, 41, properties.modStruts, false) }
        //     if (properties.modArchCover) { SetVehicleMod(vehicle, 42, properties.modArchCover, false) }
        //     if (properties.modAerials) { SetVehicleMod(vehicle, 43, properties.modAerials, false) }
        //     if (properties.modTrimB) { SetVehicleMod(vehicle, 44, properties.modTrimB, false) }
        //     if (properties.modTank) { SetVehicleMod(vehicle, 45, properties.modTank, false) }
        //     if (properties.modWindows) { SetVehicleMod(vehicle, 46, properties.modWindows, false) }
        //     if (properties.modKit47) { SetVehicleMod(vehicle, 47, properties.modKit47, false) }
        //     if (properties.modLivery) { SetVehicleMod(vehicle, 48, properties.modLivery, false) }
        //     if (properties.modLivery2) { SetVehicleLivery(vehicle, properties.modLivery2) }
        //     if (properties.modKit49) { SetVehicleMod(vehicle, 49, properties.modKit49, false) }
        //     if (properties.liveryRoof) { SetVehicleRoofLivery(vehicle, properties.liveryRoof) }
        // }
    }

    /**
     * Scan for vehicle in world
     * @param plateNumber 
     * @param timeoutInterval 
     * @returns 
     */
    public async scanForVehiclePlate(plateNumber: string, timeoutInterval: number): Promise<[boolean, coordsV4]> {
        await this.onReady()
        return new Promise(async (resolve, reject) => {
            const scanNumber = this.mathRandom(1000, 9999)
            this.globalTrigger('CPT_Core:Vehicle:ScanForVehicle', `VehicleScan:${scanNumber}`, plateNumber)
            const returnTimeout = setTimeout(() => {
                resolve([false, vector4(0, 0, 0, 0)])
            }, timeoutInterval * 1000);
            this.globalRegister(`VehicleScan:${scanNumber}`, (vehicleCoords: coordsV4) => {
                clearTimeout(returnTimeout)
                resolve([true, vehicleCoords])
            })
        })
    }
}


//======================================================\\
//====================| EMAIL CORE |====================\\
class Email_Core_V3 extends Vehicle_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Send a email to the players phone
     * @param subject The subject of the message
     * @param message The message in the email
     * @param callback The function the email will call
     * @returns
     */
    public async sendEmail(sender: string, subject: string, message: string, callback: Function): Promise<void> {
        await this.onReady()
        const returnNumber = this.mathRandom(1000, 9999)
        const eventName = `CPT_Core:Client:ReceiveMail:${returnNumber}:${GetCurrentResourceName()}`

        emitNet('qb_core:server:sendEmail', subject, message, [
            {
                label: "Activate",
                data: {
                    event: eventName,
                    isServer: false
                }
            }
        ])

        onNet(eventName, () => {
            if (callback) {
                callback()
            } else {
                console.error('Not Defined')
            }
        })
    }
}


//=======================================================\\
//====================| DIALOG CORE |====================\\
class Dialog_Core_V3 extends Email_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Open a dialog menu (LEGACY)
     * @param label The label of the menu
     * @param description The description of the menu
     * @param callback Function for the dialog menu
     * @returns
     */
    public async dialogOpen(label: string, description: string): Promise<string> {
        await this.onReady()
        return new Promise<string>((resolve, reject) => {
            exports[GetCurrentResourceName()]['ox_input'](
                label,
                description,
                (value: any) => {
                    if (value) {
                        resolve(value[0])
                    } else {
                        resolve('')
                    }
                },
            )
        })
    }

    /**
     * Create a advanced dialog menu
     * @param title
     * @param options
     * @returns
     */
    public dialogMenu(title: string, options: any): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                exports[GetCurrentResourceName()]['ox_input_advanced'](
                    title,
                    options,
                    (value: any) => {
                        if (value) {
                            resolve(value)
                        } else {
                            resolve('')
                        }
                    },
                )
            } catch (error) {
                console.error('This is not supported by QB')
            }
        })
    }
}


//=====================================================\\
//====================| BLIP CORE |====================\\
class Blips_Core_V3 extends Dialog_Core_V3 {
    private allBlips: blipDetails
    constructor() {
        super()
        this.allBlips = []
    }

    /**
     * Create a new blip
     * @param id Unique identifier for the blip
     * @param label Label of the blip
     * @param location Location of the blip
     * @param sprite Blip sprite
     * @param color Blip color
     * @returns
     */
    public async blipCreate(id: string, label: string, location: coordsV3, sprite: number, color: number, size?: number): Promise<number> {
        await this.onReady()
        const createdBlip = AddBlipForCoord(location.x, location.y, location.z)
        let blipSize: number = 0.5
        if (size) { blipSize = size }
        SetBlipSprite(createdBlip, sprite)
        SetBlipDisplay(createdBlip, 2)
        SetBlipScale(createdBlip, blipSize)
        SetBlipAsShortRange(createdBlip, true)
        SetBlipColour(createdBlip, color)
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentSubstringPlayerName(label)
        EndTextCommandSetBlipName(createdBlip)
        this.allBlips[id] = createdBlip
        return createdBlip
    }

    /**
     * Create a tracking blip
     * @param location
     * @param color
     * @param timeoutTime
     */
    public blipTracking(id: string, location: coordsV3, color: number, timeoutTime: number) {
        const locateBlip = AddBlipForCoord(location.x, location.y, location.z)
        SetBlipColour(locateBlip, color)
        SetBlipRoute(locateBlip, true)
        SetBlipRouteColour(locateBlip, color)

        const blipTimeout = setTimeout(() => {
            RemoveBlip(locateBlip)
            clearTimeout(blipTimeout)
            this.polyzoneDelete(`blipTracking:${id}`)
        }, (timeoutTime * 60) * 1000)

        this.polyzoneCreateCircle(`blipTracking:${id}`, vector4(location.x, location.y, location.z, 0), 5, () => {
            RemoveBlip(locateBlip)
            clearTimeout(blipTimeout)
            this.polyzoneDelete(`blipTracking:${id}`)
        }, () => { })

        this.allBlips[id] = locateBlip
    }

    /**
     * Delete a blip
     * @param id Unique identifier for the blip
     * @returns
     */
    public async blipDelete(id: string): Promise<void> {
        await this.onReady()
        RemoveBlip(this.allBlips[id])
    }
}


//======================================================\\
//====================| SHELL CORE |====================\\
class Shell_Core_V3 extends Blips_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Create a Shell
     * @param modelName 
     * @param location 
     * @returns 
     */
    public createIPL(modelName: string, location: coordsV3): Promise<number> {
        return new Promise(async (resolve, reject) => {
            await this.streamModel(modelName)
            const createdIPL = CreateObject(modelName, location.x, location.y, location.z, false, false, false)
            this.createdObject.push(createdIPL)
            FreezeEntityPosition(createdIPL, true)
            resolve(createdIPL)
        })
    }
}


//==========================================================\\
//====================| Door Lock Core |====================\\
class DoorLock_Core_V3 extends Shell_Core_V3 {
    forceDoorInterval: any
    lockingInterval: any
    lockingTimeout: any
    constructor() {
        super()
        this.readyDoorEvents()
        this.forceDoorInterval = null
        this.lockingInterval = []
        this.lockingTimeout = []
    }

    /**
     * Ready Door Exports
     */
    private readyDoorEvents() {
        onNet('CPT_Core:Client:UpdateDoor', (id: string, state: boolean) => {
            this.setDoorState(id, state)
        })
    }

    /**
     * Add a door to be locked / unlocked
     * @param id
     * @param location
     * @param distance
     * @param defaultState
     * @param doorDetails
     */
    public addDoor(id: string, location: coordsV4, distance: number, defaultState: boolean, doorDetails: doorDetails, validAccess: Function | null) {
        let createdDoors: string[] = []
        let doorInterval: any = null
        let doorInteractInterval: any = null
        let doorLocked: boolean = defaultState
        let doorChange: boolean = true

        //===| CFX Controller |===\\
        this.polyzoneCreateCircle(`CPT_Core:Door:Controller:${id}`, location, 40, () => {
            for (let i = 0; i < doorDetails.length; i++) {
                const createdDoorId = `cpt_door_${id}_${i}`
                AddDoorToSystem(createdDoorId, doorDetails[i].objectName, doorDetails[i].location[0], doorDetails[i].location[1], doorDetails[i].location[2], false, false, false)
                createdDoors.push(createdDoorId)

                //===| Standard |===\\
                if (doorLocked == true) {
                    this.setDoorLockedState(createdDoorId, doorDetails[i])
                } else if (doorLocked == false) {
                    this.setDoorUnlockedState(createdDoorId, doorDetails[i])
                }
            }
        }, () => {
            createdDoors.forEach((doorId: string) => {
                RemoveDoorFromSystem(doorId)
            })
        })

        //===| Interaction Circle |===\\
        this.polyzoneCreateCircle(`CPT_Core:Door:${id}`, location, distance, () => {
            doorChange = true

            //===| Door User Interface |===\\
            doorInterval = setInterval(() => {
                if (doorChange == true) {
                    doorChange = false
                    if (doorLocked == false) {
                        exports[GetCurrentResourceName()]['ox_text_ui']('[E] Unlocked', 'left-center', '#144a00', 'white');
                    } else {
                        exports[GetCurrentResourceName()]['ox_text_ui']('[E] Locked', 'left-center', '#4a0000', 'white');
                    }
                }
            }, 50)


            //===| Door Interaction |===\\
            doorInteractInterval = setInterval(async () => {
                if (IsControlJustReleased(0, 38) == true && validAccess == null) {
                    if (doorLocked == false) {
                        doorChange = true
                        this.reactiveConfigUpdate(`CPT_Core:DoorConfig:Locked:${id}`, true)
                    } else if (doorLocked == true) {
                        doorChange = true
                        this.playAnimation('anim@heists@keycard@', 'exit', PlayerPedId())
                        this.reactiveConfigUpdate(`CPT_Core:DoorConfig:Locked:${id}`, false)
                        setTimeout(() => { ClearPedTasks(PlayerPedId()) }, 500)
                    }
                } else if (IsControlJustReleased(0, 38) == true && validAccess != null) {
                    const accessGranted = await validAccess()
                    if (accessGranted == true) {
                        if (doorLocked == false) {
                            doorChange = true
                            this.reactiveConfigUpdate(`CPT_Core:DoorConfig:Locked:${id}`, true)
                        } else if (doorLocked == true) {
                            doorChange = true
                            this.reactiveConfigUpdate(`CPT_Core:DoorConfig:Locked:${id}`, false)
                        }
                    } else {
                        this.messageError('Invalid Access')
                    }
                }
            }, 1)

            //===| Door Target |===\\
            for (let i = 0; i < doorDetails.length; i++) {
                const doorObject = GetClosestObjectOfType(doorDetails[i].location[0], doorDetails[i].location[1], doorDetails[i].location[2], 5.0, doorDetails[i].objectName, false, false, false)
                this.targetEntity(`CPT_Door:${id}:${i}`, doorObject, [
                    { icon: 'fa-solid fa-lock-open', label: 'Unlock', value: 'unlock', range: 1.2 },
                    { icon: 'fa-solid fa-lock', label: 'Lock', value: 'lock', range: 1.2 }
                ], async (value: string) => {
                    let accessGranted: boolean = false
                    if (validAccess) {
                        accessGranted = await validAccess()
                    }
                    if (value == 'unlock' && accessGranted == true) {
                        this.reactiveConfigUpdate(`CPT_Core:DoorConfig:Locked:${id}`, false)
                    } else if (value == 'lock' && accessGranted == true) {
                        this.reactiveConfigUpdate(`CPT_Core:DoorConfig:Locked:${id}`, true)
                    } else if (accessGranted == false) {
                        this.messageError('Invalid Access')
                    }
                })
            }

        }, () => {
            for (let i = 0; i < doorDetails.length; i++) {
                this.targetDelete(`CPT_Door:${id}:${i}`)
            }
            exports[GetCurrentResourceName()]['ox_text_ui_hide']();
            clearInterval(doorInterval)
            clearInterval(doorInteractInterval)
        })

        //===| Reactive Config |===\\
        this.reactiveConfigCreate(`CPT_Core:DoorConfig:Locked:${id}`, defaultState, (doorLockState: boolean) => {
            doorLocked = doorLockState
            doorChange = true

            //===| Standard |===\\
            if (doorLocked == true) {
                for (let i = 0; i < doorDetails.length; i++) {
                    const createdDoorId = `cpt_door_${id}_${i}`
                    this.setDoorLockedState(createdDoorId, doorDetails[i])
                }
            } else if (doorLocked == false) {
                for (let i = 0; i < doorDetails.length; i++) {
                    const createdDoorId = `cpt_door_${id}_${i}`
                    this.setDoorUnlockedState(createdDoorId, doorDetails[i])
                }
            }
        })
    }

    /**
     * Set door unlocked
     * @param id
     * @param details
     */
    private setDoorUnlockedState(createdDoorId: string, details: doorDetail) {
        const doorObject = GetClosestObjectOfType(details.location[0], details.location[1], details.location[2], 5.0, details.objectName, false, false, false)
        DoorSystemSetAutomaticDistance(createdDoorId, 0.0, true, true)
        DoorSystemSetDoorState(createdDoorId, 0, false, false)

        //===| Clear Locking Intervals |===\\
        this.lockingTimeout.forEach((lockingTimeout: any) => { clearTimeout(lockingTimeout) })
        this.lockingInterval.forEach((lockingInterval: any) => { clearInterval(lockingInterval) })

        //===| Determine Gate Status |===\\
        if (details.isGate == true) { return }

        //===| Set Open Heading Door |===\\
        if (details.openHeading != null) {
            SetEntityHeading(doorObject, details.openHeading)
            FreezeEntityPosition(doorObject, false)
        } else {
            FreezeEntityPosition(doorObject, false)
        }
    }

    /**
     * Set door locked
     * @param id
     * @param details
     */
    private setDoorLockedState(createdDoorId: string, details: doorDetail) {
        let doorLocked = false
        const doorObject = GetClosestObjectOfType(details.location[0], details.location[1], details.location[2], 5.0, details.objectName, false, false, false)
        DoorSystemSetAutomaticDistance(createdDoorId, 30.0, true, true)
        DoorSystemSetDoorState(createdDoorId, 4, false, false)
        DoorSystemSetDoorState(createdDoorId, 1, false, false)

        //===| Determine Gate Status |===\\
        if (details.isGate == true) { return }

        //===| Set Open Heading Door |===\\
        if (details.openHeading != null) {
            SetEntityHeading(doorObject, details.closedHeading)
            FreezeEntityPosition(doorObject, true)
        }

        //===| Locking Door Interval |===\\
        // const lockingInterval = setInterval(() => {
        //     let headingRawDifference = GetEntityHeading(doorObject) - details.closedHeading
        //     let headingDifference = Math.abs(headingRawDifference)
        //     if (headingDifference < 5) {
        //         doorLocked = true
        //         SetEntityHeading(doorObject, details.closedHeading)
        //         FreezeEntityPosition(doorObject, true)
        //         clearInterval(this.lockingTimeout)
        //         clearInterval(lockingInterval)
        //     }
        // }, 50); this.lockingInterval.push(lockingInterval)

        //===| Locking Door Timeout |===\\
        // const lockingTimeout = setTimeout(() => {
        //     clearInterval(this.lockingTimeout)
        //     if (doorLocked == false) {
        //         SetEntityHeading(doorObject, details.closedHeading)
        //         FreezeEntityPosition(doorObject, true)
        //     }
        // }, 1500); this.lockingTimeout.push(lockingTimeout)
    }

    /**
     * Set door state
     * @param id
     * @param state
     */
    public setDoorState(id: string, state: boolean) {
        this.reactiveConfigUpdate(`CPT_Core:DoorConfig:Locked:${id}`, state)
    }
}


//==========================================================\\
//====================| LOADING CIRCLE |====================\\
class Loading_Core_V3 extends DoorLock_Core_V3 {
    private showingMessageInterval: any
    private showingMessageTimeout: any
    private loadTime: number
    constructor() {
        super()
        this.showingMessageInterval = null
        this.showingMessageTimeout = null
        this.loadTime = 30
    }

    /**
     * Show loading circle
     * @param message 
     */
    public showLoading(message: string) {
        AddTextEntry('HUD_QUITTING', message)
        this.stopLoadingMessage()
        clearTimeout(this.showingMessageTimeout)

        this.showingMessageInterval = setInterval(() => {
            BeginTextCommandBusyspinnerOn("HUD_QUITTING")
            EndTextCommandBusyspinnerOn(4)
        })

        this.showingMessageTimeout = setTimeout(() => {
            this.stopLoadingMessage()
        }, 30000)
    }

    /**
     * Update the loading messsage
     * @param message 
     */
    public updateLoadingMessage(message: string) {
        clearInterval(this.showingMessageInterval)
        BusyspinnerOff()

        AddTextEntry('HUD_QUITTING', message)

        this.showingMessageInterval = setInterval(() => {
            BeginTextCommandBusyspinnerOn("HUD_QUITTING")
            EndTextCommandBusyspinnerOn(4)
        })
    }

    /**
     * Stop loading message
     */
    public stopLoadingMessage() {
        clearInterval(this.showingMessageInterval)
        BusyspinnerOff()
    }

    /**
     * Load All Operations
     * @param allOperations
     */
    public async loadAllOperations(allOperations: { label: string, operation: Function }[]) {
        let loadingTime: number = 0

        for (let i = 0; i < allOperations.length; i++) {
            await new Promise<void>((resolve, reject) => {
                loadingTime = loadingTime + this.loadTime
                try {
                    allOperations[i].operation()
                    terminal.log('Loaded Operation', `${this.loadTime}ms / ${loadingTime}ms ${allOperations[i].label}`, 'green')
                    setTimeout(() => { resolve() }, this.loadTime)
                } catch (error) {
                    terminal.log('Error Loading', `${allOperations[i].label} | Error: ${error}`, 'red')
                    this.reportError(`Error Object ${allOperations[i].label} | Error: ${error}`)
                    setTimeout(() => { resolve() }, this.loadTime)
                }
            })
        }
    }
}


//====================================================\\
//====================| LUA CORE |====================\\
class Lua_Core_V3 extends Loading_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Get current time stamp in  lua
     */
    public luaGetTime(): number {
        return exports[GetCurrentResourceName()]['lua_time']()
    }
}


//============================================================\\
//====================| Interaction Core |====================\\
class Interaction_Core_V3 extends Lua_Core_V3 {
    private cachedIntervals: any
    private cachedTimeouts: any
    constructor() {
        super()
        this.cachedIntervals = []
        this.cachedTimeouts = []
    }

    /**
     * Delete interaction
     * @param id
     */
    public async deleteInteraction(id: string) {
        this.promptHide()
        this.polyzoneDelete(`FrameworkCreation:${id}:ProxBlip`)
        this.polyzoneDelete(`FrameworkCreation:${id}:TextProxBlip`)
        this.polyzoneDelete(`FrameworkCreation:${id}:EntityVehicle`)
        this.polyzoneDelete(`FrameworkCreation:${id}:DistanceCheck`)
        this.targetDelete(`FrameworkCreation:${id}:EntityVehicle`)
        this.targetDelete(`FrameworkCreation:${id}:RawZone`)
        this.targetDelete(`FrameworkCreation:${id}:EntityModel`)
        this.targetDelete(`FrameworkCreation:${id}:EntityObject`)
        this.cachedIntervals[id].forEach((activeIntervals: any) => { clearInterval(activeIntervals) })
        this.cachedTimeouts[id].forEach((activeTimeouts: any) => { clearTimeout(activeTimeouts) })
    }

    /**
     * Create interaction
     * @param id
     * @param permissionFunction
     * @param returnFunction
     * @returns
     */
    public async createInteraction(id: string, permissionFunction: Function, returnFunction: Function): Promise<interactionSystem> {
        let requiredJobs: { name: string, rank: number, duty: boolean }[] = []
        let requiredGangs: { name: string, rank: number }[] = []
        let requiredCids: { id: string }[] = []
        let requiredCodes: { code: string }[] = []
        let optPassCodes: { code: string }[] = []
        let requiredItems: { name: string, amount: number, remove: boolean }[] = []
        let requiredDegradeItems: { name: string, amount: number, level: number }[] = []
        let requiredAccounts: { name: string, limit: number }[] = []
        let requiredConfig: { key: string, value: boolean }[] = []
        let logFunction: Function = () => { console.log('Attempted to log') }
        this.cachedIntervals[id] = []
        this.cachedTimeouts[id] = []

        /**
         * Activate object
         */
        const activateObject: Function = async () => {
            let checkStatus: boolean = false
            let validAccess: boolean = false

            //===| Internal Permission |===\\
            const validPermission = await permissionFunction()
            if (validPermission == false) {
                checkStatus = false
                return
            }

            //===| Check Job |===\\
            if (requiredJobs.length > 0) {
                checkStatus = true
                await new Promise<void>((resolve, reject) => {
                    this.callbackSend('FrameworkCreation:CheckJob', (jobState: boolean) => {
                        if (jobState == true) { validAccess = true }
                        resolve()
                    }, requiredJobs)
                })
            }

            //===| Check Gang |===\\
            if (requiredGangs.length > 0) {
                checkStatus = true
                await new Promise<void>((resolve, reject) => {
                    this.callbackSend('FrameworkCreation:CheckGang', (gangState: boolean) => {
                        if (gangState == true) { validAccess = true }
                        resolve()
                    }, requiredGangs)
                })
            }

            //===| Check Cid |===\\
            if (requiredCids.length > 0) {
                checkStatus = true
                await new Promise<void>((resolve, reject) => {
                    this.callbackSend('FrameworkCreation:CheckCid', (cidState: boolean) => {
                        if (cidState == true) { validAccess = true } else { this.messageError('Invalid CID') }
                        resolve()
                    }, requiredCids)
                })
            }

            //===| Check Required Codes |===\\
            if (requiredCodes.length > 0) {
                checkStatus = true
                let validCode: boolean = true
                for (let i = 0; i < requiredCodes.length; i++) {
                    let validCheckCode: boolean = false
                    const givenCode = await this.dialogOpen('What is the code?', '')
                    requiredCodes.forEach((checkCode: { code: string }) => {
                        if (checkCode.code == givenCode) {
                            validCheckCode = true
                        }
                    })
                    if (validCheckCode == false) {
                        validCode = false
                    }
                }

                if (validCode == true) { validAccess = true }
            }

            //===| Check Optional Codes |===\\
            if (optPassCodes.length > 0) {
                checkStatus = true
                let validCode: any = false
                const givenCode = await this.dialogOpen('What is the code?', '')
                optPassCodes.forEach((checkCode: { code: string }) => {
                    if (checkCode.code == givenCode) {
                        validCode = true
                    }
                })

                if (validCode == true) { validAccess = true }
            }

            //===| Check Required Items |===\\
            if (requiredItems.length > 0) {
                checkStatus = true
                await new Promise<void>((resolve, reject) => {
                    this.callbackSend('FrameworkCreation:CheckItems', (itemState: boolean) => {
                        if (itemState == true) { validAccess = true } else { this.messageError('Invalid Items') }
                        resolve()
                    }, requiredItems)
                })
            }

            //===| Check Required Degrade Items |===\\
            if (requiredDegradeItems.length > 0) {
                checkStatus = true
                await new Promise<void>((resolve, reject) => {
                    this.callbackSend('FrameworkCreation:CheckDegradeItems', (itemState: boolean) => {
                        if (itemState == true) { validAccess = true } else { this.messageError('Invalid Items') }
                        resolve()
                    }, requiredDegradeItems)
                })
            }

            //===| Check Account |===\\
            if (requiredAccounts.length > 0) {
                checkStatus = true
                await new Promise<void>((resolve, reject) => {
                    this.callbackSend('FrameworkCreation:CheckAccounts', (accountState: boolean) => {
                        if (accountState == true) { validAccess = true } else { this.messageError('Invalid Account Ballance') }
                        resolve()
                    }, requiredAccounts)
                })
            }

            //===| Check Config |===\\
            if (requiredConfig.length > 0) {
                checkStatus = true
                await new Promise<void>((resolve, reject) => {
                    this.callbackSend('FrameworkCreation:CheckConfig', (configState: boolean) => {
                        if (configState == true) { validAccess = true } else { this.messageError(`You're not able to do this right now!`) }
                        resolve()
                    }, requiredConfig)
                })
            }

            //===| Check Admin |===\\
            // if (validAccess == false) {
            //     await new Promise<void>((resolve, reject) => {
            //         this.callbackSend('FrameworkCreation:CheckAdmin', (adminState: boolean) => {
            //             if (adminState == true) { validAccess = true; this.messageSend('Allowed with admin access') }
            //             resolve()
            //         })
            //     })
            // }

            //===| Check Access |===\\
            if (validAccess == true || checkStatus == false) {
                logFunction()
                returnFunction()
            } else {
                console.error('Invalid Permissions')
            }
        }

        return {

            /**
             * Add interaction prox
             * @param id Unique identifier
             * @param message Message to show the user
             * @param location Location of the marker
             * @param radius Radius the marker is going to show up
             * @param activationRadius Radius when the message shows up
             * @param marker Marker defined by FiveM
             * @param color RGBA table of the color of the marker
             * @param spinning State if the marker is spinning
             * @param bouncing State if the marker is bouncing
             * @returns
             */
            addProxIneteraction: (message: string, location: coordsV4, radius: number, activationRadius: number) => {
                let createdInterval: any = null
                let showingPrompt: boolean = false
                let activated: boolean = false
                let shownRequirements: boolean = false

                let activationFunction = () => {
                    this.promptShow(`[E] ${message}`, () => {
                        this.promptHide()
                        activated = true
                        activateObject()
                        const proxTimeout = setTimeout(() => {
                            if (activated == true) {
                                activationFunction()
                            }
                        }, 1200)
                        this.cachedTimeouts[id].push(proxTimeout)
                    })
                }

                this.polyzoneCreateCircle(`FrameworkCreation:${id}:ProxBlip`, location, radius, () => {
                    createdInterval = setInterval(() => {
                        let myLocation = GetEntityCoords(PlayerPedId(), false)
                        let myDistance = GetDistanceBetweenCoords(myLocation[0], myLocation[1], myLocation[2], location.x, location.y, location.z, false)
                        if (myDistance < activationRadius) {
                            if (showingPrompt == false) {
                                showingPrompt = true
                                activationFunction()
                            }
                        } else {
                            shownRequirements = false
                            activated = false
                            if (showingPrompt == true) {
                                showingPrompt = false
                                this.promptHide()
                            }
                        }
                    }, 1)
                    this.cachedIntervals[id].push(createdInterval)
                }, () => {
                    clearInterval(createdInterval)
                    if (showingPrompt == true) {
                        showingPrompt = false
                        this.promptHide()
                    }
                })
            },

            /**
             * Add interaction prox blip
             * @param id Unique identifier
             * @param message Message to show the user
             * @param location Location of the marker
             * @param radius Radius the marker is going to show up
             * @param activationRadius Radius when the message shows up
             * @param marker Marker defined by FiveM
             * @param color RGBA table of the color of the marker
             * @param spinning State if the marker is spinning
             * @param bouncing State if the marker is bouncing
             * @returns
             */
            addProxMarker: (message: string, location: coordsV4, radius: number, activationRadius: number, marker: number, color: { r: number, g: number, b: number, a: number }, spinning: boolean, bouncing: boolean) => {
                let createdInterval: any = null
                let showingPrompt: boolean = false
                let activated: boolean = false
                let shownRequirements: boolean = false

                let activationFunction = () => {
                    this.promptShow(`[E] ${message}`, () => {
                        this.promptHide()
                        activated = true
                        activateObject()
                        const proxTimeout = setTimeout(() => {
                            if (activated == true) {
                                activationFunction()
                            }
                        }, 1200)
                        this.cachedTimeouts[id].push(proxTimeout)
                    })
                }

                this.polyzoneCreateCircle(`FrameworkCreation:${id}:ProxBlip`, location, radius, () => {
                    createdInterval = setInterval(() => {
                        let myLocation = GetEntityCoords(PlayerPedId(), false)
                        let myDistance = GetDistanceBetweenCoords(myLocation[0], myLocation[1], myLocation[2], location.x, location.y, location.z, false)
                        if (myDistance < activationRadius) {
                            if (showingPrompt == false) {
                                showingPrompt = true
                                activationFunction()
                            }
                        } else {
                            shownRequirements = false
                            activated = false
                            if (showingPrompt == true) {
                                showingPrompt = false
                                this.promptHide()
                            }
                        }
                        DrawMarker(marker, location.x, location.y, location.z, 0.0, 0.0, 0.0, 0, 0.0, 0.0, 0.2, 0.2, 0.5, color.r, color.g, color.b, color.a, bouncing, true, 2, spinning, null, null, false)
                    }, 1)
                    this.cachedIntervals[id].push(createdInterval)
                }, () => {
                    clearInterval(createdInterval)
                    if (showingPrompt == true) {
                        showingPrompt = false
                        this.promptHide()
                    }
                })
            },

            /**
             * Aadd interaction text prop blip
             * @param id Unique identifier
             * @param message Message to show the user
             * @param location Location of the marker
             * @param radius Radius the marker is going to show up
             * @param activationRadius Radius when the message shows up
             * @param marker Marker defined by FiveM
             * @param color RGBA table of the color of the marker
             * @param spinning State if the marker is spinning
             * @param bouncing State if the marker is bouncing
             * @returns
             */
            addProxTextMarker: (message: string, location: coordsV4, radius: number, activationRadius: number, marker: number, color: { r: number, g: number, b: number, a: number }, spinning: boolean, bouncing: boolean) => {
                let createdInterval: any = null
                let activatedBlip: boolean = false
                let shownRequirements: boolean = false
                let textFont: number = 1
                let setTextName: string = `[E] ${message}`

                this.polyzoneCreateCircle(`FrameworkCreation:${id}:TextProxBlip`, location, radius, () => {
                    createdInterval = setInterval(() => {
                        let myLocation = GetEntityCoords(PlayerPedId(), false)
                        let myDistance = GetDistanceBetweenCoords(myLocation[0], myLocation[1], myLocation[2], location.x, location.y, location.z, true)
                        if (myDistance < activationRadius) {
                            let screenCoords = GetScreenCoordFromWorldCoord(location.x, location.y, location.z)
                            SetTextScale(0.5, 0.5); SetTextFont(textFont); SetTextProportional(true)
                            SetTextColour(255, 255, 255, 255)
                            SetTextEntry("STRING"); SetTextCentre(true); AddTextComponentString(setTextName)
                            DrawText(screenCoords[1], screenCoords[2])
                            let factor = (setTextName.length / 500) + 0.06
                            DrawRect(screenCoords[1], (screenCoords[2] + 0.0125), (0.015 + factor), 0.045, color.r, color.g, color.b, color.a)

                            if (IsControlJustReleased(0, 38) == true && activatedBlip == false) {
                                activatedBlip = true
                                setTextName = '| Activated |'
                                textFont = 4
                                const textTimeout = setTimeout(() => { setTextName = `| Cool Down |` }, 950)
                                const messageTimeout = setTimeout(() => { setTextName = `[E] ${message}`; activatedBlip = false; textFont = 1 }, 1000)
                                this.cachedTimeouts[id].push(textTimeout)
                                this.cachedTimeouts[id].push(messageTimeout)
                                activateObject()
                            }
                        } else {
                            shownRequirements = false
                            DrawMarker(marker, location.x, location.y, location.z, 0.0, 0.0, 0.0, 0, 0.0, 0.0, 0.2, 0.2, 0.5, color.r, color.g, color.b, color.a, bouncing, true, 2, spinning, null, null, false)
                        }
                    }, 1)
                    this.cachedIntervals[id].push(createdInterval)
                }, () => {
                    clearInterval(createdInterval)
                })
            },

            /**
             * Add interaction target entity model
             * @param id Unique identifier
             * @param message Message to show the user
             * @param model Model to show the player
             * @param range Range the ped will show up
             * @param location Location of the ped
             * @param animationTable Animation details for the ped to do
             * @param scenario Scenario for the ped to be put in
             * @returns
             */
            addTargetEntityModel: async (message: string, model: string, range: number, location: coordsV4, animationTable: { dictionary: string, animation: string } | null, scenario: string) => {
                this.targetCreate(`FrameworkCreation:${id}:EntityModel`, message, model, range, [
                    { label: message, icon: 'fa-solid fa-circle-dot', value: '', range: 1.2 }
                ], true, false, location, false, () => {
                    activateObject()
                }, (objectModel: number) => {
                    if (animationTable != null) { this.playAnimation(animationTable.dictionary, animationTable.animation, objectModel) }
                    if (scenario != '') { this.playScenario(scenario, objectModel) }
                    this.createdPeds.push(objectModel)
                })
            },

            /**
             * Add interaction target entity object
             * @param id Unique identifier
             * @param message Message to show the user
             * @param model Model to show the player
             * @param range Range the object will show up
             * @param location Location of the object
             * @returns
             */
            addTargetEntityObject: async (message: string, model: string, range: number, location: coordsV4) => {
                this.targetCreate(`FrameworkCreation:${id}:EntityObject`, message, model, range, [
                    { label: message, icon: 'fa-solid fa-circle-dot', value: '', range: 1.2 }
                ], false, true, location, false, () => {
                    activateObject()
                }, (objectModel: number) => {
                    this.createdObject.push(objectModel)
                })
            },

            /**
             * Add interaction target entity vehicle
             * @param id Unique identifier
             * @param message Message to show the user
             * @param model Model to show the player
             * @param range Range the vehicle will show up
             * @param location Location of the vehicle
             * @returns {none}
             */
            addTargetEntityVehicle: async (message: string, model: string, range: number, location: coordsV4) => {
                let createdVehicle: number = 0
                let setLockedInterval: any = null

                this.polyzoneCreateCircle(`FrameworkCreation:${id}:EntityVehicle`, location, range, () => {
                    this.vehicleCreate(location, model, false, true, null).then((vehicle) => {
                        createdVehicle = vehicle
                        this.targetEntity(`FrameworkCreation:${id}:EntityVehicle`, vehicle, [
                            { label: message, icon: '', value: '', range: 1.2 }
                        ], () => {
                            activateObject()
                        })
                        setLockedInterval = setInterval(() => {
                            FreezeEntityPosition(vehicle, true)
                            SetEntityInvincible(vehicle, true)
                            SetVehicleDoorsLocked(vehicle, 2)
                        }, 150)
                    })
                }, () => {
                    if (createdVehicle) { DeleteVehicle(createdVehicle); createdVehicle = 0 }
                    if (setLockedInterval) { clearInterval(setLockedInterval); setLockedInterval = null }
                })
            },

            /**
             * Add interaction open zone
             * @param id Unique identifier
             * @param message Message to show the user
             * @param locations All locations to make the zone
             * @param minZ Minimum Z coord of the polyzone
             * @param maxZ Maximum Z coord of the polyzone
             * @returns
             */
            addOpenZone: (message: string, locations: coordsV2[], minZ: number, maxZ: number) => {
                let activated = false
                let activationFunction = () => {
                    this.promptShow(`[E] ${message}`, () => {
                        activated = true
                        activateObject()
                        const proxTimeout = setTimeout(() => {
                            if (activated == true) {
                                activationFunction()
                            }
                        }, 1200)
                        this.cachedTimeouts[id].push(proxTimeout)
                    })
                }
            },

            /**
             * Add interaction raw zone
             * @param id Unique identifier
             * @param message Message to show the user
             * @param location Location of the zone
             * @param length Length of the polyzone
             * @param width Width of the polyzone
             * @param minZ Minimum Z coord of the polyzone
             * @param maxZ Maximum Z coord of the polyzone
             * @returns {none}
             */
            addRawZone: (message: string, location: coordsV4, length: number, width: number, minZ: number, maxZ: number) => {
                this.targetZone(`FrameworkCreation:${id}:RawZone`, [
                    { label: message, icon: '', value: '', range: 1.2 }
                ], location, width, length, minZ, maxZ, () => {
                    activateObject()
                })
            },

            /**
             * Add range finder
             * @param id Unique identifier
             * @param message Message to show the user
             * @param object location Location of the zone
             * @param distance Distance that it will check
             * @param delay Time it takes to activate
             * @returns
             */
            addRangeFinder: (message: string, location: coordsV4, distance: number, delay: number) => {
                let insideCheck = false

                this.polyzoneCreateCircle(`FrameworkCreation:${id}:DistanceCheck`, location, distance, () => {
                    insideCheck = true
                    this.progressStartMove(`FrameworkCreation:DistanceProgress:${id}`, message, delay, () => {
                        if (insideCheck == true) {
                            activateObject()
                        } else {
                            this.messageError('Canceled')
                        }
                    }, () => {
                        this.messageError('Canceled')
                    })
                }, () => {
                    insideCheck = false
                })
            },

            //===============| ADDED REQUIREMENTS |===============\\

            /**
             * Add job requirement
             * @param jobName Job id of the job that is required
             * @param jobRank Job rank of the job that is required
             * @param onDuty Require the person to be on duty
             * @returns
            */
            addJobRequirement: (jobName: string, jobRank: number, onDuty: boolean) => { requiredJobs.push({ name: jobName, rank: jobRank, duty: onDuty }) },

            /**
             * Add gang requirement
             * @param gangName Gang id of the gang that is required
             * @param gangRank Gang rank of the gang that is required
             * @returns
            */
            addGangRequirement: (gangName: string, gangRank: number) => { requiredGangs.push({ name: gangName, rank: gangRank }) },


            /**
             * Add CID requirement
             * @param citizenIdentifier Player Id
             * @returns
            */
            addCidRequirement: (citizenIdentifier: string) => { requiredCids.push({ id: citizenIdentifier }) },


            /**
             * Add code requirement
             * @param passCode The password that is required to open the action
             * @returns
            */
            addCodeRequirement: (passCode: string) => { requiredCodes.push({ code: passCode }) },


            /**
             * Add optional code
             * @param passCode The password that is required to open the action
             * @returns
            */
            addOptionalPassCode: (passCode: string) => { optPassCodes.push({ code: passCode }) },


            /**
             * Add item requirement
             * @param name The id of the item required
             * @param amount The amount of the item required
             * @param remove Remove the item upon checking?
             * @returns
            */
            addItemRequirement: (name: string, amount: number, remove: boolean) => { requiredItems.push({ name: name, amount: amount, remove: remove }) },


            /**
             * Add item requirement
             * @param name The id of the item required
             * @param amount The amount of the item required
             * @param level Remove the item upon checking?
             * @returns
            */
            addItemDegradeRequirement: (name: string, amount: number, level: number) => { requiredDegradeItems.push({ name: name, amount: amount, level: level }) },


            /**
             * Add society requirement
             * @param name 
             * @param limit 
             */
            addSocietyRequirements: (name: string, limit: number) => { requiredAccounts.push({ name: name, limit: limit }) },

            /**
             * Add society requirement
             * @param name 
             * @param limit 
             */
            addConfigRequirements: (key: string, value: boolean) => { requiredConfig.push({ key: key, value: value }) },

            //===============| ADDED LOGS |===============\\

            /**
             * Activate Log System 
             * @param tableName Table to direct the logs to 
             * @param message Message to send with the log
             */
            activateLogs: (tableName: string, message: string, additionalDetails: { id: string, value: string }[]) => {
                additionalDetails.push({ id: 'framework_interaction', value: id })
                logFunction = () => {
                    exports['CPT_Lib']['SendLog'](tableName, message, additionalDetails)
                }
            }
        }
    }
}


//============================================================\\
//====================| INVENTORY CIRCLE |====================\\
class Inventory_Core_V3 extends Interaction_Core_V3 {
    constructor() {
        super()
    }

    public async openTempInventory(label: string, items: { item: string, amount: number }[]) {
        let allItems: any = []
        items.forEach((item: { item: string, amount: number }) => {
            let definedItem: string = item.item
            let definedAmount: number = item.amount
            allItems.push([definedItem, definedAmount])
        })

        this.callbackSend('CPT_Framework:Server:OpenTempInv', () => {
            this.messageSend('Opening Temperary Storage')
        }, label, items, allItems)
    }

    /**
     * Open a crafting window
     * @param id
     * @param label
     * @param items
     */
    public async openCrafting(id: string, label: string, items: { item: string, amount: number, duration: number, recipe: { item: string, amount: number }[] }[]) {
        const craftAmountString: string = await this.dialogOpen(label, 'Quantity?')
        let craftingTable: any = []

        for (let i = 0; i < items.length; i++) {
            let craftAmount: number = parseInt(craftAmountString)
            if (!craftAmountString) { craftAmount = items[i].amount }
            if (craftAmount < 1) { craftAmount = 1 }

            let itemRecipe: any = {}

            let recipe = items[i].recipe
            for (let i2 = 0; i2 < recipe.length; i2++) {
                itemRecipe[recipe[i2].item] = (recipe[i2].amount * craftAmount)
            }

            craftingTable.push({
                name: items[i].item,
                ingredients: itemRecipe,
                duration: items[i].duration != null ? items[i].duration : 5000,
                count: craftAmount,
                cost: 2
            })
        }

        let createdTable = { items: craftingTable }

        emit('CPT_Framework:Client:RegisterCrafting', id, createdTable)
        this.callbackSend('CPT_Framework:Server:OpenCrafting', () => {
            exports['ox_inventory']['openInventory']('crafting', { id: id, index: 0 })
        }, id, createdTable)
    }

    /**
     * Open stash window
     * @param id
     * @param weight
     * @param slots
     */
    public openStash(id: string, weight: number, slots: number) {
        this.callbackSend('CPT_Framework:Server:OpenStash', () => {
            exports['ox_inventory']['openInventory']('stash', id)
        }, id, (weight * 1000), slots)
    }

    /**
     * Open shop window
     * @param id
     * @param label
     * @param items
     */
    public async openShop(id: string, label: string, items: { item: string, amount: number, price: number, license: string }[]) {
        let allShopItems: { name: string, price: number, amount: number, info: {}, type: string, slot: number }[] = []
        this.showLoading(`Loading The Shop | ${label}`)

        for (let i = 0; i < items.length; i++) {
            if (items[i].license == '' || !items[i].license) {
                allShopItems.push({
                    name: items[i].item,
                    price: items[i].price,
                    amount: items[i].amount,
                    info: {},
                    type: "item",
                    slot: i + 1,
                })
            } else {
                await new Promise<void>((resolve, reject) => {
                    this.callbackSend('CPT_Framework:Server:Shop:CheckLicense', async (licenseStatus: boolean) => {
                        if (licenseStatus == true) {
                            allShopItems.push({
                                name: items[i].item,
                                price: items[i].price,
                                amount: items[i].amount,
                                info: {},
                                type: "item",
                                slot: i + 1,
                            })
                        }
                        resolve()
                    }, items[i].license)
                })
            }
        }

        setTimeout(() => {
            this.stopLoadingMessage()
            let oxReadyInventory: { name: string, price: number }[] = []

            for (let i = 0; i < allShopItems.length; i++) {
                oxReadyInventory.push({ name: allShopItems[i].name, price: allShopItems[i].price })
            }

            let myLocation = GetEntityCoords(PlayerPedId(), false)
            this.callbackSend('CPT_Framework:Server:RegisterShop', () => {
                exports['ox_inventory']['openInventory']('shop', { type: id, id: 0 })
            }, id, label, oxReadyInventory, myLocation)
        }, 850);
    }
}


//---------------| This is required to be added in the ox_inventory (modules/crafting/client.lua) |---------------\\
//AddEventHandler('CPT_System:Client:RegisterCrafting', function (id, recipe)
//	createCraftingBench(id, recipe)
//end)


//==============================================================\\
//====================| PLAYER LOADED CORE |====================\\
class PlayerLoaded_Core_V3 extends Inventory_Core_V3 {
    private allowOnStart: boolean
    private onReadyFunctions: Function[]
    constructor() {
        super()
        this.allowOnStart = false
        this.onReadyFunctions = []
        this.registerOnPlayerReady()
    }

    /**
     * Register the on player ready event and on start
     */
    private registerOnPlayerReady() {
        onNet('onResourceStart', (resourceName: string) => {
            if (resourceName == GetCurrentResourceName() && this.allowOnStart == true) {
                this.onReadyFunctions.forEach((readyFunction: Function) => {
                    readyFunction()
                })
            }
        })

        onNet(`CPT_Framework:Client:Load:${GetCurrentResourceName()}`, () => {
            this.onReadyFunctions.forEach((readyFunction: Function) => {
                readyFunction()
            })
        })

        onNet(`CPT_Framework:Client:PlayerLoaded:${GetCurrentResourceName()}`, () => {
            this.onReadyFunctions.forEach((readyFunction: Function) => {
                readyFunction()
            })
        })
    }

    /**
     * On player loaded callback
     * @param callback
     */
    public async onPlayerLoaded(callback: Function) {
        this.onReadyFunctions.push(callback)
        //terminal.log('Player Loaded ByPass', 'Loading callback now!', 'yellow')
        //callback()
    }
}

//=====================================================\\
//====================| BUFF CORE |====================\\
class Buff_Core_V3 extends PlayerLoaded_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Get buff details
     * @param id
     * @returns
     */
    getBuffDetail(id: string): {
        type: string,
        length: number,
        timeLeft: number,
        strength: number,
        active: boolean
    } {
        return exports['CPT_Buffs']['getDetail'](id)
    }

    /**
     * Apply a buff to a player
     * @param id
     * @param time
     * @param strength
     */
    applyBuff(id: string, time: number, strength: number) {
        exports['CPT_Buffs']['activateBuff'](id, time, strength)
    }
}


//==========================================================\\
//====================| Spotlight Core |====================\\
class Spotlight_Core_V3 extends Buff_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Create a new spotlight
     * @param locationX 
     * @param locationY 
     * @param locationZ 
     * @param colorR 
     * @param colorG 
     * @param colorB 
     * @param distance 
     * @returns 
     */
    public async createLight(location: coordsV3, color: { r: number, g: number, b: number }, distance: number, brightness: number, size: number, direction: coordsV3, createProp?: boolean): Promise<lightModifierFunction> {
        //===| Set Values |===\\
        let lightLocation: coordsV3 = location
        let lightDirecton: coordsV3 = direction
        let lightColor: { r: number, g: number, b: number } = color
        let lightDistance: number = distance
        let lightBrightness: number = brightness
        let lightSize: number = size
        let lightPaused: boolean = false
        let createdProp: number = 0

        //===| Light Debug |===\\
        if (createProp) {
            createdProp = await this.createObject('h4_prop_battle_lights_floor', vector4(location.x, location.y, location.z, 0), true, true, false)
            SetEntityRotation(createdProp, 0, 180, 0, 1, true)
            this.createdObject.push(createdProp)
        }

        //===| Create The Light |===\\
        const lightInterval = setInterval(() => {
            if (lightPaused == false) {
                DrawSpotLight(
                    lightLocation.x,
                    lightLocation.y,
                    lightLocation.z,
                    lightDirecton.x,
                    lightDirecton.y,
                    lightDirecton.z,
                    lightColor.r,
                    lightColor.g,
                    lightColor.b,
                    lightDistance,
                    lightBrightness,
                    0.0,
                    lightSize,
                    1.0
                )
            }
        }, 1);

        //===| Return The Modifier |===\\
        return {
            setLocation: (newCoords: coordsV3) => { lightLocation = newCoords },
            setDirection: (newCoords: coordsV3) => { lightDirecton = newCoords },
            setColor: (newColor: { r: number, g: number, b: number }) => { lightColor = newColor },
            setDistance: (newDistance: number) => { lightDistance = newDistance },
            setBrightness: (newBrightness: number) => { lightBrightness = newBrightness },
            setSize: (newSize: number) => { lightSize = newSize },
            setPause: (state: boolean) => { lightPaused = state },
            killLight: () => {
                DeleteObject(createdProp)
                clearInterval(lightInterval)
            }
        }
    }
}


//========================================================\\
//====================| PRIMARY CORE |====================\\
class CPT_Client_V3 extends Spotlight_Core_V3 {
    private resourceAuthor: string;
    constructor(resourceAuthor?: string) {
        super()
        if (resourceAuthor == undefined) {
            this.resourceAuthor = 'Capttech'
        } else {
            this.resourceAuthor = resourceAuthor
        }
        this.startUp()
    }

    /**
     * Start the client side of the framework
     */
    private async startUp() {
        terminal.title('=====| CPT DEVELOPMENT |=====')
        terminal.log('Framework Author', 'Capttech', 'green')
        terminal.log('Resource Author', this.resourceAuthor, 'green')
        terminal.log('Organization', 'CPT_Development', 'green')
        terminal.log('Resource Name', GetCurrentResourceName(), 'yellow')
        terminal.log('Security', 'Recieved Code', 'green')
        this.checkRequiredResources()
        this.coreReady = true
    }
};

export const CPT_Framework = CPT_Client_V3
export const Terminal = terminal