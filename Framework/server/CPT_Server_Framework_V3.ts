import {
    coordsV4,
    coordsV3,
    coordsV2,
    additionalLogsDetail,
    logDetail,
    allCallbackEvents,
    callbackEventDetail,
    reactiveConfigDetail,
    playerDetails,
    gangRank,
    jobRank
} from "./CPT_Server_Types";
import fetch from 'node-fetch';
import "./CPT_Server_Natives"
import { frameworkVersion, mySQLDebug, requiredResources, staffRole } from '../config'
import { ApplicationCommandPermissionType } from "discord.js";
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
    static colorCode: any = { orange: '^1', green: '^2', yellow: '^3', darkBlue: '^4', lightBlue: '^5', violet: '^6', white: '^7', red: '^8', pink: '^9' }

    /**
     * Log to terminal
     * @param title Title of the message 
     * @param message Message content
     */
    public static log(title: string, message: string, color: string) {
        console.log(`${this.colorCode.white}${title}: ${this.colorCode[color]}${message} ${this.colorCode.white}`)
    }

    /**
    * title to terminal
     * @param title Title of the message 
     * @param message Message content
    */
    public static title(title: string) {
        console.log(`${this.colorCode.white}${title} ${this.colorCode.white}`)
    }
}


//===================================================================\\
//====================| REQUIRED RESOURCE CHECK |====================\\
class RequiredResources_Core_V3 {
    public registerNetEvent: { event: string, action: Function }[]
    constructor() {
        this.registerNetEvent = []
    }

    /**
     * Check if all required Resources are found
     */
    public checkRequiredResources() {
        for (let i = 0; i < requiredResources.length; i++) {
            if (GetResourceState(requiredResources[i]) != 'started') {
                terminal.log('Required Resource Missing', requiredResources[i], 'orange')
            }
        }
    }
}


//=======================================================\\
//====================| AUTHOR CORE |====================\\
class Author_Core_V3 extends RequiredResources_Core_V3 {
    public production: boolean;
    public coreReady: boolean;
    constructor() {
        super()
        this.production = false
        this.coreReady = false
    }

    /**
     * Check if environment is production
     */
    public checkProductionState(): void {
        const productionString = GetConvar('cpt_production', 'development')
        if (productionString != 'development') {
            terminal.log('Environment', 'Production', 'lightBlue')
            this.production = true
        } else {
            terminal.log('Environment', 'Development', 'pink')
        }
    }

    /**
 * On Framework Ready
 * @returns When core is ready
 */
    public onCoreReady(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const onReadyInterval = setInterval(() => {
                if (this.coreReady == true) {
                    resolve()
                    clearInterval(onReadyInterval)
                }
            }, 1);
        })
    }

    /**
     * Show author badge
     */
    public showAuthorBadge(): void {
        const resourceAuthor = GetResourceMetadata(GetCurrentResourceName(), 'author', 0)
        terminal.title('=====| CPT DEVELOPMENT |=====')
        terminal.log('Framework Author', 'Capttech', 'green')
        terminal.log('Resource Author', resourceAuthor, 'green')
        terminal.log('Organization', 'CPT_Development', 'green')
        terminal.log('Resource Name', GetCurrentResourceName(), 'yellow')
    }
}


//==========================================================\\
//====================| ANTICHEAT CORE |====================\\
class AntiCheat_Core_V3 extends Author_Core_V3 {
    private bannedValues: string;
    constructor() {
        super()
        this.bannedValues = "[{]};:'|,<.>/?!@#$%^&*()_+=-"
    }

    /**
     * Get player ip Address
     * @param source
     * @returns The ip address of the player
     */
    public async getPlayerIpAddress(source: string): Promise<string> {
        await this.onCoreReady()
        for (let i = 0; i < GetNumPlayerIdentifiers(source); i++) {
            const identifiers = GetPlayerIdentifier(source, i)
            if (identifiers) {
                const position = identifiers.search('ip')
                if (position == 0) {
                    return identifiers.slice(3, identifiers.length)
                }
            }
        }
        return ''
    }

    /**
     * Report Cheater
     * @param source 
     * @param reason 
     * @param duration 
     */
    public reportCheating(source: number, reason: string): void {
        if (GetResourceState('CPT_Anticheat') == 'started') {
            exports['CPT_Anticheat']['SendBan'](source, reason)
        } else {
            console.error('Missing CPT_Anticheat resource')
            console.error(`Anticheat attempted to ban ${source} for ${reason} but could not due to missing resource.`)
        }
    }

    /**
     * Validate a string that it is not harmfull to security
     * @param value
     * @returns if it contains a banned value
     */
    public validateSecurityString(value: string): boolean {
        const bannedValueTable = this.bannedValues.split('');
        let isBanned: boolean = false
        for (let i = 0; i < bannedValueTable.length; i++) {
            if (value.includes(bannedValueTable[i])) {
                isBanned = true
            }
        }
        return isBanned
    }
}


//======================================================\\
//====================| ERROR CORE |====================\\
class Error_Core_V3 extends AntiCheat_Core_V3 {
    constructor() {
        super()
        this.registerErrorEvent()
    }

    /**
     * Register the error report event
     */
    private registerErrorEvent() {
        const readyOnNet = (errorDetails: string) => {
            this.reportError(errorDetails)
        }
        this.registerNetEvent.push({ event: `CPT_Core:Server:ReportError:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:ReportError:${GetCurrentResourceName()}`, readyOnNet)
    }

    /**
     * Returns the error code
     * @param errorCode
     */
    public reportError(errorCode: string): void {
        console.error('CPT FRAMEWORK DETECTED A ERROR')
        console.error(errorCode)

        const errorWebHook: string = GetConvar('cpt_error_webhook', '')
        if (errorWebHook == '') { return }

        fetch(`${errorWebHook}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "content": "",
                "tts": false,
                "embeds": [
                    {
                        "id": 258495810,
                        "title": "Error Detected",
                        "color": 16711680,
                        "fields": [
                            {
                                "id": 46039831,
                                "name": `${GetCurrentResourceName()}`,
                                "value": `${errorCode}`
                            }
                        ]
                    }
                ],
                "components": [],
                "actions": {}
            }),
        })
    }
}


//=================================================================\\
//====================| TABLE CONTROLLER CORE |====================\\
class TableController_V3 {
    private tableName: string;
    private taskQueue: Function[]
    private columnList: string[]
    private finishFunction: Function
    constructor(tableName: string) {
        this.tableName = tableName
        this.taskQueue = []
        this.columnList = []
        this.finishFunction = () => { }
    }

    /**
     * Check for a column in a database
     * @param tableName 
     * @param columnName 
     * @returns If a column exists in a table
     */
    private checkForColumn(tableName: string, columnName: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const mySqlQuery = `SELECT ${columnName} FROM ${tableName} LIMIT 1;`
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            try {
                await exports['oxmysql']['query_async'](mySqlQuery, [])
                resolve(true)
            } catch (error) {
                resolve(false)
            }
        })
    }

    /**
     * Check for is a table exists
     * @param tableName
     * @returns is a table esists on the database
     */
    private async checkForTable(tableName: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const mySqlQuery = `SELECT * FROM ${tableName} LIMIT 1;`
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            try {
                await exports['oxmysql']['query_async'](mySqlQuery, [])
                resolve(true)
            } catch (error) {
                resolve(false)
            }
        })
    }

    /**
     * Create a new column
     * @param id 
     * @param type 
     */
    public create(id: string, type: string): void {
        this.taskQueue.push(() => {
            return new Promise(async (resolve, reject) => {
                this.columnList.push(id)
                const columnExits = await this.checkForColumn(this.tableName, id)
                if (columnExits == false) {
                    const mySqlQuery = `ALTER TABLE ${this.tableName} ADD ${id} ${type};`
                    if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
                    try {
                        await exports['oxmysql']['query_async'](mySqlQuery, [])
                    } catch (error) {
                        console.error(error)
                    }
                    resolve(true)
                } else {
                    resolve(true)
                }
            })
        })
    }

    /**
     * Delete the table from the database
     * @param tableName 
     * @returns When the table is deleted
     */
    private deleteTable(tableName: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const mySqlQuery = `DROP TABLE ${tableName};`
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            try {
                await exports['oxmysql']['query_async'](mySqlQuery, [])
            } catch (error) {
                console.error(error)
            }
        })
    }

    /**
     * Create a new database table
     * @param tableName
     * @returns When the table has been built
     */
    private async buildTable(tableName: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const mySqlQuery = `CREATE TABLE ${tableName} (ID INT AUTO_INCREMENT PRIMARY KEY);`
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            try {
                await exports['oxmysql']['query_async'](mySqlQuery, [])
                resolve(true)
            } catch (error) {
                console.error(error)
            }
        })
    }


    /**
     * Set table to auto wipe every start
     */
    public autoClear(): void {
        this.taskQueue.push(() => {
            return new Promise<void>(async (resolve, reject) => {
                const tableExists = await this.checkForTable(this.tableName)
                if (tableExists == true) {
                    await this.deleteTable(this.tableName)
                }
                await this.buildTable(this.tableName)
                resolve()
            })
        })
    }

    /**
     * Run the column creation
     * @returns When the creation is finished
     */
    public async run(): Promise<boolean> {
        //===| RUN ALL TASKS |===\\
        for (let i = 0; i < this.taskQueue.length; i++) {
            await this.taskQueue[i]()
        }

        //===| Complete |===\\
        if (this.finishFunction) { this.finishFunction(this.columnList) }
        return true
    }

    /**
     * Completion Callback
     * @param callback 
     */
    public finish(callback: Function): void { this.finishFunction = callback }
}


//===============================================================\\
//====================| DATABASE CONTROLLER |====================\\
class DataController_V3 {
    private tableName: string;
    private data: any;
    private columnList: string[]
    constructor(tableName: string, columnList: string[]) {
        this.tableName = tableName
        this.columnList = columnList
    }

    /**
     * Add new data to a table
     * @param args 
     * @returns 
     */
    public async add(...args: any) {
        let argsValue = 0
        let columnString = ''
        for (const index in this.columnList) {
            if (columnString != '') {
                columnString = `${columnString}, ${this.columnList[index]}`
            } else {
                columnString = `${this.columnList[index]}`
            }

            if (index != 'ID') {
                argsValue += 1
            }
        }

        if (argsValue != arguments.length) { return console.error(`Unable to add. There are not enough parameters | Parameters given: ${args}`) }

        let insertValues = ''
        for (const index in args) {
            if (insertValues != '') {
                insertValues = `${insertValues}, '${args[index]}'`
            } else {
                insertValues = `'${args[index]}'`
            }
        }

        const mySqlQuery = `INSERT INTO ${this.tableName} (${columnString}) VALUES (${insertValues});`
        if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
        try {
            await exports['oxmysql']['query_async'](mySqlQuery, [])
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Remove a row in the table
     * @param indexNumber 
     * @returns 
     */
    public async removeIndex(indexNumber: number) {
        if (!indexNumber) { return console.error('Please give a index number to remove') }
        const mySqlQuery = `DELETE FROM ${this.tableName} WHERE ID = ?;`
        if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
        try {
            await exports['oxmysql']['query_async'](mySqlQuery, [indexNumber])
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Update the row id
     * @param rowId 
     * @param columnName 
     * @param newValue 
     * @returns 
     */
    public async update(rowId: string, columnName: string, newValue: any) {
        let foundColumn = false
        for (const index in this.columnList) {
            if (this.columnList[index] == columnName) {
                foundColumn = true
            }
        }

        if (!rowId) { return console.error('No row id value specified') }
        if (foundColumn == false) { return console.error(`No Column Found with name ${columnName}`) }
        if (!newValue) { return console.error('No new value specified') }

        const mySqlQuery = `UPDATE ${this.tableName} SET ${columnName} = '${newValue}' WHERE ID = ${rowId};`
        if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
        try {
            await exports['oxmysql']['query_async'](mySqlQuery, [])
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Select data from database
     * @param selectionValues 
     * @param limitAmount 
     */
    public getData(selectionValues: string[], limitAmount: number): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            let selectionValue = ''
            for (const index in selectionValues) {
                if (selectionValue != '') {
                    selectionValue = `${selectionValue}, ${selectionValues[index]}`
                } else {
                    selectionValue = `${selectionValues[index]}`
                }
            }

            const mySqlQuery = `SELECT ${selectionValue} FROM ${this.tableName} LIMIT ${limitAmount}`
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            try {
                let results = await exports['oxmysql']['query_async'](mySqlQuery, [])
                resolve(results)
            } catch (error) {
                console.error(error)
            }
        })
    }
}


//=========================================================\\
//====================| DATABASE CORE |====================\\
class Database_Core_V3 extends Error_Core_V3 {
    private databaseReady: boolean
    constructor() {
        super()
        this.databaseReady = true
        const databaseTimeout = setTimeout(() => {
            this.databaseReady = true
            clearTimeout(databaseTimeout)
        }, 5000)
    }

    /**
     * Waits for the database to be loaded
     * @returns When the database is loaded
     */
    public async onDatabaseReady() {
        return new Promise<void>((resolve, reject) => {
            const onReadyInterval = setInterval(() => {
                if (this.databaseReady == true) {
                    clearInterval(onReadyInterval)
                    resolve()
                }
            }, 1);
        })
    }

    /**
     * Check for is a table exists
     * @param tableName
     * @returns
     */
    private async checkForTable(tableName: string) {
        await this.onCoreReady()
        return new Promise(async (resolve, reject) => {
            const mySqlQuery = `SELECT * FROM ${tableName} LIMIT 1;`
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            try {
                await exports['oxmysql']['query_async'](mySqlQuery, [])
                resolve(true)
            } catch (error) {
                resolve(false)
            }
        })
    }

    /**
     * Creates the table
     * @param tableName
     * @returns
     */
    private async buildTable(tableName: string) {
        await this.onCoreReady()
        await this.onDatabaseReady()
        return new Promise<boolean>(async (resolve, reject) => {
            const mySqlQuery = `CREATE TABLE ${tableName} (ID INT AUTO_INCREMENT PRIMARY KEY);`
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            try {
                await exports['oxmysql']['query_async'](mySqlQuery, [])
                resolve(true)
            } catch (error) {
                console.error(error)
                resolve(false)
            }
        })
    }

    /**
     * Creates a the full table
     * @param tableName
     * @param callback
     * @returns
     */
    public async createTable(tableName: string, callback: Function) {
        await this.onCoreReady()
        await this.onDatabaseReady()
        return new Promise(async (resolve, reject) => {
            const tableExists = await this.checkForTable(tableName)
            if (tableExists == false) {
                const successCreate = await this.buildTable(tableName)
                if (successCreate == false) { return }
            }
            const tableCreator = new TableController_V3(tableName)
            tableCreator.finish((columnList: any) => {
                const controller = new DataController_V3(tableName, columnList)
                resolve(controller)
            })
            callback(tableCreator)
        })
    }

    /**
     * Runs a SELECT 
     * @param mySqlQuery 
     * @param args 
     * @returns 
     */
    public async getSql(mySqlQuery: string, args: any): Promise<any> {
        await this.onCoreReady()
        await this.onDatabaseReady()
        return new Promise(async (resolve, reject) => {
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            const results = await exports['oxmysql']['query_async'](mySqlQuery, args)
            resolve(results)
        })
    }

    /**
     * Runs a INSERT / DELETE / UPDATE and other function that change the database
     * @param mySqlQuery 
     * @param args 
     * @returns 
     */
    public async runSql(mySqlQuery: string, args: any): Promise<any> {
        await this.onCoreReady()
        await this.onDatabaseReady()
        return new Promise(async (resolve, reject) => {
            if (mySQLDebug == true) { terminal.log('MySQL Debug', mySqlQuery, 'yellow') }
            const results = await exports['oxmysql']['query_async'](mySqlQuery, args)
            resolve(results)
        })
    }
}


//========================================================\\
//====================| DISCORD CORE |====================\\
class Discord_Core_V3 extends Database_Core_V3 {
    private discord: any;
    private commands: any;
    private discordReady: boolean;
    private guild: any;
    private commandInteractions: []
    private onInteractionCreateCallback: Function[]
    public bot: any;
    constructor() {
        super()
        this.discordReady = false
        this.guild = null
        this.commandInteractions = []
        this.onInteractionCreateCallback = []
    }

    /**
     * Ready the discord bot for connection
     */
    public async startDiscordBot(): Promise<boolean> {
        this.discord = require('discord.js')
        this.commands = new this.discord.Collection();

        return new Promise<boolean>(async (resolve, reject) => {
            this.bot = new this.discord.Client({ intents: 3276799 })

            if (GetConvar('cpt_discord_token', '') != '') {
                const discordToken = GetConvar('cpt_discord_token', '')
                this.bot.login(discordToken)
            } else {
                resolve(false)
                return
            }

            this.registerBotEvents(() => {
                resolve(true)
            })

            const discordLoadTimeout = setTimeout(() => {
                resolve(false)
                clearTimeout(discordLoadTimeout)
            }, 5000)
        })
    }

    /**
     * Register all bot events
     */
    private registerBotEvents(onReadyCallback: Function): void {
        this.bot.on('ready', async () => {
            this.guild = this.bot.guilds.cache.get(GetConvar('cpt_discord_guild', ''));
            this.discordReady = true
            onReadyCallback()
        });

        this.bot.on('interactionCreate', async (interaction: { isButton: () => Function; customId: string; }) => {
            if (!interaction.isButton()) return
            const buttonId = interaction.customId
            for (let i = 0; i < this.onInteractionCreateCallback.length; i++) {
                this.onInteractionCreateCallback[i](buttonId, interaction)
            }
        })

    }

    /**
     * On Interaction Submit
     * @param callback
     */
    public onInteraction(callback: Function): void {
        this.onInteractionCreateCallback.push(callback)
    }

    /**
     * On Discord Ready
     * @returns When the discord bot is ready
     */
    public onDiscordReady(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const onReadyInterval = setInterval(() => {
                if (this.discordReady == true && this.coreReady == true) {
                    clearInterval(onReadyInterval)
                    resolve()
                }
            }, 1);
        })
    }

    /**
     * Check user for role
     * @param memberId
     * @param roleId
     * @returns If the player has the discord role
     */
    public async checkForRole(memberId: string, roleId: string): Promise<boolean> {
        await this.onCoreReady()
        await this.onDiscordReady()
        return new Promise<boolean>((resolve, reject) => {
            const foundMember = this.guild.members.cache.get(memberId);

            if (!this.guild || !foundMember) {
                console.error('Guild or member not found.');
                return;
            }

            let foundRole = false
            const foundRoles = foundMember.roles.cache;
            for (let i = 0; i < foundRoles.length; i++) {
                if (foundRoles[i].id == roleId) {
                    foundRole = true
                }
            }
            resolve(foundRole)
        })
    }

    /**
     * Get player roles
     * @param source
     * @returns The players discord ID
     */
    public async getPlayerDiscord(source: string): Promise<string> {
        await this.onCoreReady()
        await this.onDiscordReady()
        for (let i = 0; i < GetNumPlayerIdentifiers(source); i++) {
            const identifiers = GetPlayerIdentifier(source, i)
            if (identifiers) {
                const position = identifiers.search('discord')
                if (position == 0) {
                    return identifiers.slice(8, identifiers.length)
                }
            }
        }
        return ''
    }

    /**
     * Check user for role
     * @param memberId 
     * @param roleId 
     * @returns All roles the user has
     */
    public async getRoles(memberId: string): Promise<string[]> {
        await this.onCoreReady()
        await this.onDiscordReady()
        return new Promise<string[]>((resolve, reject) => {
            const foundMember = this.guild.members.cache.get(memberId);

            if (!this.guild || !foundMember) {
                console.error('Guild or member not found.');
                return;
            }

            let allMyRoles = []
            const foundRoles = foundMember.roles.cache;
            for (let [key, value] of foundRoles) {
                allMyRoles.push(key)
            }

            resolve(allMyRoles)
        })
    }

}


//=====================================================\\
//====================| LOGS CORE |====================\\
class Logs_Core_V3 extends Discord_Core_V3 {
    private logsReady: boolean;
    private logsTable: any;
    constructor() {
        super()
        this.logsReady = false
    }

    /**
     * Get player licnese
     * @param source
     * @returns The players license key
     */
    public async getPlayerLicense(source: string): Promise<string> {
        await this.onCoreReady()
        await this.onDiscordReady()
        for (let i = 0; i < GetNumPlayerIdentifiers(source); i++) {
            const identifiers = GetPlayerIdentifier(source, i)
            if (identifiers) {
                const position = identifiers.search('license')
                if (position == 0) {
                    return identifiers.slice(8, identifiers.length)
                }
            }
        }

        return ''
    }

    /**
     * Create a new server based log
     * @param channelId
     * @param action
     * @param additionalLogs
     * @returns When the logs has been sent to discord
     */
    public async sendServerLog(channelId: string, action: string, additionalLogs: additionalLogsDetail): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }
        const currentDate = new Date()
        const readyDate = currentDate.toString()

        const channel = this.bot.channels.cache.get(channelId);
        let createdFields = [
            {
                "name": "Date/Time",
                "value": `${readyDate}`
            }
        ]

        for (let i = 0; i < additionalLogs.length; i++) {
            if (additionalLogs[i].title && additionalLogs[i].message) {
                if (additionalLogs[i].title != '' && additionalLogs[i].message != '') {
                    createdFields.push({
                        "name": additionalLogs[i].title.toString(),
                        "value": additionalLogs[i].message.toString()
                    })
                }
            }
        }

        try {
            channel.send({
                "content": "",
                "tts": false,
                "embeds": [
                    {
                        "id": 668337861,
                        "title": `Log | ${action}`,
                        "color": 2162432,
                        "footer": {
                            "text": "CPT Development",
                            "icon_url": "https://imgur.com/MtupAHR.png"
                        },
                        "fields": createdFields
                    }
                ],
                "components": [],
                "actions": {},
                "username": "CPT Development",
                "avatar_url": "https://imgur.com/MtupAHR.png"
            })
        } catch (error: any) {
            const errorReport = error.toString()
            this.reportError(errorReport)
        }

        return true
    }

    /**
     * Create a new log
     * @param channelId
     * @param source
     * @param action
     * @param additionalLogs
     * @returns When the logs has been sent to discord
     */
    public async sendLog(channelId: string, source: string, action: string, additionalLogs: additionalLogsDetail): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }
        const playerName = GetPlayerName(source)
        const playerDiscord = await this.getPlayerDiscord(source)
        const playerLicense = await this.getPlayerLicense(source)
        const playerIpAddress = await this.getPlayerIpAddress(source)
        const currentDate = new Date()
        const readyDate = currentDate.toString()

        const channel = this.bot.channels.cache.get(channelId);
        let createdFields = [
            {
                "name": "Player Name",
                "value": `${playerName}`
            },
            {
                "name": "Discord ID",
                "value": `${playerDiscord}`
            },
            {
                "name": "Player License",
                "value": `${playerLicense}`
            },
            {
                "name": "Player IP Address",
                "value": `${playerIpAddress}`
            },
            {
                "name": "Date/Time",
                "value": `${readyDate}`
            }
        ]

        for (let i = 0; i < additionalLogs.length; i++) {
            if (additionalLogs[i].title && additionalLogs[i].message) {
                if (additionalLogs[i].title != '' && additionalLogs[i].message != '') {
                    createdFields.push({
                        "name": additionalLogs[i].title.toString(),
                        "value": additionalLogs[i].message.toString()
                    })
                }
            }
        }

        try {
            channel.send({
                "content": "",
                "tts": false,
                "embeds": [
                    {
                        "id": 668337861,
                        "title": `Log | ${action}`,
                        "color": 2162432,
                        "footer": {
                            "text": "CPT Development",
                            "icon_url": "https://imgur.com/MtupAHR.png"
                        },
                        "fields": createdFields
                    }
                ],
                "components": [],
                "actions": {},
                "username": "CPT Development",
                "avatar_url": "https://imgur.com/MtupAHR.png"
            })
        } catch (error: any) {
            const errorReport = error.toString()
            this.reportError(errorReport)
        }

        return true
    }

    /**
     * 
     * @param channelId
     * @param source
     * @param action
     * @param additionalLogs
     * @returns When teh alert log is sent to discord
     */
    public async sendAlertLog(channelId: string, source: string, action: string, additionalLogs: additionalLogsDetail): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }
        if (!staffRole) { console.error('Staff role not defined in config') }
        const playerName = GetPlayerName(source)
        const playerDiscord = await this.getPlayerDiscord(source)
        const playerLicense = await this.getPlayerLicense(source)
        const playerIpAddress = await this.getPlayerIpAddress(source)
        const currentDate = new Date()
        const readyDate = currentDate.toString()
        const channel = this.bot.channels.cache.get(channelId);

        const Buffer = require("buffer").Buffer;
        exports['screenshot-basic']['requestClientScreenshot'](source, {
            // fileName: 'cache/screenshot.jpg'
        }, async (err: string, data: string) => {
            let screenshotData: any = data.split(";base64,").pop()
            const name = `cpt_Development_image.jpg`;
            const buffer: any = new Buffer.from(screenshotData, "base64");

            let createdFields = [
                {
                    "name": "Player Name",
                    "value": `${playerName}`
                },
                {
                    "name": "Discord ID",
                    "value": `${playerDiscord}`
                },
                {
                    "name": "Player License",
                    "value": `${playerLicense}`
                },
                {
                    "name": "Player IP Address",
                    "value": `${playerIpAddress}`
                },
                {
                    "name": "Date/Time",
                    "value": `${readyDate}`
                }
            ]

            for (let i = 0; i < additionalLogs.length; i++) {
                if (additionalLogs[i].title && additionalLogs[i].message) {
                    if (additionalLogs[i].title != '' && additionalLogs[i].message != '') {
                        createdFields.push({
                            "name": additionalLogs[i].title.toString(),
                            "value": additionalLogs[i].message.toString()
                        })
                    }
                }
            }

            try {
                channel.send({
                    "content": `Staff Alert! <@&${staffRole}>`,
                    "tts": false,
                    "embeds": [
                        {
                            "id": 668337861,
                            "title": `Staff Alert | ${action}`,
                            "color": 2162432,
                            "footer": {
                                "text": "CPT Development",
                                "icon_url": "https://imgur.com/MtupAHR.png"
                            },
                            "image": {
                                "url": `attachment://${name}`
                            },
                            "fields": createdFields
                        }
                    ],
                    "files": [{ "attachment": buffer, "name": name }],
                    "components": [],
                    "actions": {},
                    "username": "CPT Development",
                    "avatar_url": "https://imgur.com/MtupAHR.png"
                });
            } catch (error: any) {
                const errorReport = error.toString()
                this.reportError(errorReport)
            }

        })

        return true
    }

    /**
     * 
     * @param channelId
     * @param source
     * @param action
     * @param additionalLogs
     * @returns When the cheating log has been sent to discord
     */
    public async sendCheatAlertLog(channelId: string, source: string, action: string, additionalLogs: additionalLogsDetail): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }
        if (!staffRole) { console.error('Staff role not defined in config') }
        const playerName = GetPlayerName(source)
        const playerDiscord = await this.getPlayerDiscord(source)
        const playerLicense = await this.getPlayerLicense(source)
        const playerIpAddress = await this.getPlayerIpAddress(source)
        const currentDate = new Date()
        const readyDate = currentDate.toString()
        const channel = this.bot.channels.cache.get(channelId);

        const Buffer = require("buffer").Buffer;
        exports['screenshot-basic']['requestClientScreenshot'](source, {
            // fileName: 'cache/screenshot.jpg'
        }, async (err: string, data: string) => {
            const screenshotData: any = data.split(";base64,").pop()
            const name = `cpt_Development_image.jpg`;
            const buffer: any = new Buffer.from(screenshotData, "base64");

            let createdFields = [
                {
                    "name": "Player Name",
                    "value": `${playerName}`
                },
                {
                    "name": "Discord ID",
                    "value": `${playerDiscord}`
                },
                {
                    "name": "Player License",
                    "value": `${playerLicense}`
                },
                {
                    "name": "Player IP Address",
                    "value": `${playerIpAddress}`
                },
                {
                    "name": "Date/Time",
                    "value": `${readyDate}`
                }
            ]

            for (let i = 0; i < additionalLogs.length; i++) {
                if (additionalLogs[i].title && additionalLogs[i].message) {
                    if (additionalLogs[i].title != '' && additionalLogs[i].message != '') {
                        createdFields.push({
                            "name": additionalLogs[i].title.toString(),
                            "value": additionalLogs[i].message.toString()
                        })
                    }
                }
            }

            try {
                channel.send({
                    "content": `Cheating Alert! <@&${staffRole}>`,
                    "tts": false,
                    "embeds": [
                        {
                            "id": 668337861,
                            "title": `Anti Cheat Alert | ${action}`,
                            "color": 2162432,
                            "footer": {
                                "text": "CPT Development",
                                "icon_url": "https://imgur.com/MtupAHR.png"
                            },
                            "image": {
                                "url": `attachment://${name}`
                            },
                            "fields": createdFields
                        }
                    ],
                    "files": [{ "attachment": buffer, "name": name }],
                    "components": [],
                    "actions": {},
                    "username": "CPT Development",
                    "avatar_url": "https://imgur.com/MtupAHR.png"
                });
            } catch (error: any) {
                const errorReport = error.toString()
                this.reportError(errorReport)
            }
        })

        return true
    }

    /**
     *  Create a log with a image
     * @param channelId
     * @param source
     * @param action
     * @param additionalLogs
     * @returns When the screen shot log has been sent to discord
     */
    public async sendScreenLog(channelId: string, source: string, action: string, additionalLogs: additionalLogsDetail): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }
        const playerName = GetPlayerName(source)
        const playerDiscord = await this.getPlayerDiscord(source)
        const playerLicense = await this.getPlayerLicense(source)
        const playerIpAddress = await this.getPlayerIpAddress(source)
        const currentDate = new Date()
        const readyDate = currentDate.toString()
        const channel = this.bot.channels.cache.get(channelId);

        const Buffer = require("buffer").Buffer;
        exports['screenshot-basic']['requestClientScreenshot'](source, {
            // fileName: 'cache/screenshot.jpg'
        }, async (err: string, data: string) => {
            const screenshotData: any = data.split(";base64,").pop()
            const name = `cpt_Development_image.jpg`;
            const buffer: any = new Buffer.from(screenshotData, "base64");

            let createdFields = [
                {
                    "name": "Player Name",
                    "value": `${playerName}`
                },
                {
                    "name": "Discord ID",
                    "value": `${playerDiscord}`
                },
                {
                    "name": "Player License",
                    "value": `${playerLicense}`
                },
                {
                    "name": "Player IP Address",
                    "value": `${playerIpAddress}`
                },
                {
                    "name": "Date/Time",
                    "value": `${readyDate}`
                }
            ]

            for (let i = 0; i < additionalLogs.length; i++) {
                if (additionalLogs[i].title && additionalLogs[i].message) {
                    if (additionalLogs[i].title != '' && additionalLogs[i].message != '') {
                        createdFields.push({
                            "name": additionalLogs[i].title.toString(),
                            "value": additionalLogs[i].message.toString()
                        })
                    }
                }
            }

            try {
                channel.send({
                    "content": ``,
                    "tts": false,
                    "embeds": [
                        {
                            "id": 668337861,
                            "title": `Log | ${action}`,
                            "color": 2162432,
                            "footer": {
                                "text": "CPT Development",
                                "icon_url": "https://imgur.com/MtupAHR.png"
                            },
                            "image": {
                                "url": `attachment://${name}`
                            },
                            "fields": createdFields
                        }
                    ],
                    "files": [{ "attachment": buffer, "name": name }],
                    "components": [],
                    "actions": {},
                    "username": "CPT Development",
                    "avatar_url": "https://imgur.com/MtupAHR.png"
                });
            } catch (error: any) {
                const errorReport = error.toString()
                this.reportError(errorReport)
            }
        })

        return true
    }

    /**
     * Send a log using a web hook
     * @param webHook
     * @param source
     * @param action
     * @param additionalLogs
     * @returns When the webhook log is sent
     */
    public async setWebhookLog(webHook: string, source: string, action: string, additionalLogs: additionalLogsDetail): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }
        const playerName = GetPlayerName(source)
        const playerDiscord = await this.getPlayerDiscord(source)
        const playerLicense = await this.getPlayerLicense(source)
        const playerIpAddress = await this.getPlayerIpAddress(source)
        const currentDate = new Date()
        const readyDate = currentDate.toString()

        let createdFields = [
            {
                "name": "Player Name",
                "value": `${playerName}`
            },
            {
                "name": "Discord ID",
                "value": `${playerDiscord}`
            },
            {
                "name": "Player License",
                "value": `${playerLicense}`
            },
            {
                "name": "Player IP Address",
                "value": `${playerIpAddress}`
            },
            {
                "name": "Date/Time",
                "value": `${readyDate}`
            }
        ]

        for (let i = 0; i < additionalLogs.length; i++) {
            if (additionalLogs[i].title && additionalLogs[i].message) {
                if (additionalLogs[i].title != '' && additionalLogs[i].message != '') {
                    createdFields.push({
                        "name": additionalLogs[i].title.toString(),
                        "value": additionalLogs[i].message.toString()
                    })
                }
            }
        }

        try {
            fetch(webHook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "content": "",
                    "tts": false,
                    "embeds": [
                        {
                            "id": 668337861,
                            "title": `Log | ${action}`,
                            "color": 2162432,
                            "footer": {
                                "text": "CPT Development",
                                "icon_url": "https://imgur.com/MtupAHR.png"
                            },
                            "fields": createdFields
                        }
                    ],
                    "components": [],
                    "actions": {},
                    "username": "CPT Development",
                    "avatar_url": "https://imgur.com/MtupAHR.png"
                }),
            })
        } catch (error: any) {
            const errorReport = error.toString()
            this.reportError(errorReport)
        }

        return true
    }

    /**
     * Send log with a screen shot using a webhook
     * @param webHook 
     * @param source 
     * @param action 
     * @param additionalLogs 
     * @returns When the webhook screen log is sent
     */
    public async sendWebHookScreenLog(webHook: string, source: string, action: string, additionalLogs: additionalLogsDetail): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }
        const playerName = GetPlayerName(source)
        const playerDiscord = await this.getPlayerDiscord(source)
        const playerLicense = await this.getPlayerLicense(source)
        const playerIpAddress = await this.getPlayerIpAddress(source)
        const currentDate = new Date()
        const readyDate = currentDate.toString()

        const Buffer = require("buffer").Buffer;
        exports['screenshot-basic']['requestClientScreenshot'](source, {
            // fileName: 'cache/screenshot.jpg'
        }, async (err: string, data: string) => {
            const screenshotData: any = data.split(";base64,").pop()
            const name = `cpt_Development_image.jpg`;
            const buffer: any = new Buffer.from(screenshotData, "base64");

            let createdFields = [
                {
                    "name": "Player Name",
                    "value": `${playerName}`
                },
                {
                    "name": "Discord ID",
                    "value": `${playerDiscord}`
                },
                {
                    "name": "Player License",
                    "value": `${playerLicense}`
                },
                {
                    "name": "Player IP Address",
                    "value": `${playerIpAddress}`
                },
                {
                    "name": "Date/Time",
                    "value": `${readyDate}`
                }
            ]

            for (let i = 0; i < additionalLogs.length; i++) {
                if (additionalLogs[i].title && additionalLogs[i].message) {
                    if (additionalLogs[i].title != '' && additionalLogs[i].message != '') {
                        createdFields.push({
                            "name": additionalLogs[i].title.toString(),
                            "value": additionalLogs[i].message.toString()
                        })
                    }
                }
            }

            try {
                fetch(webHook, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "content": ``,
                        "tts": false,
                        "embeds": [
                            {
                                "id": 668337861,
                                "title": `Log | ${action}`,
                                "color": 2162432,
                                "footer": {
                                    "text": "CPT Development",
                                    "icon_url": "https://imgur.com/MtupAHR.png"
                                },
                                "image": {
                                    "url": `attachment://${name}`
                                },
                                "fields": createdFields
                            }
                        ],
                        "files": [{ "attachment": buffer, "name": name }],
                        "components": [],
                        "actions": {},
                        "username": "CPT Development",
                        "avatar_url": "https://imgur.com/MtupAHR.png"
                    }),
                })
            } catch (error: any) {
                const errorReport = error.toString()
                this.reportError(errorReport)
            }
        })

        return true
    }

    /**
     * Send a log using a web hook that is safe for the public
     * @param webHook 
     * @param source 
     * @param action 
     * @param additionalLogs 
     * @returns Send a safe for public webhook
     */
    public async sendSafeWebhookLog(webHook: string, source: string, action: string, additionalLogs: additionalLogsDetail): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }
        const playerName = GetPlayerName(source)
        const currentDate = new Date()
        const readyDate = currentDate.toString()

        let createdFields = [
            {
                "name": "Player Name",
                "value": `${playerName}`
            },
            {
                "name": "Date/Time",
                "value": `${readyDate}`
            }
        ]

        for (let i = 0; i < additionalLogs.length; i++) {
            if (additionalLogs[i].title && additionalLogs[i].message) {
                if (additionalLogs[i].title != '' && additionalLogs[i].message != '') {
                    createdFields.push({
                        "name": additionalLogs[i].title.toString(),
                        "value": additionalLogs[i].message.toString()
                    })
                }
            }
        }

        try {
            fetch(webHook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "content": "",
                    "tts": false,
                    "embeds": [
                        {
                            "id": 668337861,
                            "title": `Log | ${action}`,
                            "color": 2162432,
                            "footer": {
                                "text": "CPT Development",
                                "icon_url": "https://imgur.com/MtupAHR.png"
                            },
                            "fields": createdFields
                        }
                    ],
                    "components": [],
                    "actions": {},
                    "username": "CPT Development",
                    "avatar_url": "https://imgur.com/MtupAHR.png"
                }),
            })
        } catch (error: any) {
            const errorReport = error.toString()
            this.reportError(errorReport)
        }

        return true
    }

    /**
     * Send a message using a web hook
     * @param webHook 
     * @param message 
     * @returns When the log is sent
     */
    public async sendWebhookRaw(webHook: string, label: string, title: string, message: string, content: string): Promise<boolean> {
        await this.onCoreReady()
        if (this.production == false) { return false }

        try {
            fetch(webHook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "content": `${content}`,
                    "tts": false,
                    "embeds": [
                        {
                            "id": 668337861,
                            "title": `${label}`,
                            "color": 2162432,
                            "footer": {
                                "text": "CPT Development",
                                "icon_url": "https://imgur.com/MtupAHR.png"
                            },
                            "fields": [
                                {
                                    "name": `${title}`,
                                    "value": `${message}`
                                }
                            ]
                        }
                    ],
                    "components": [],
                    "actions": {},
                    "username": "CPT Development",
                    "avatar_url": "https://imgur.com/MtupAHR.png"
                }),
            })
        } catch (error: any) {
            const errorReport = error.toString()
            this.reportError(errorReport)
        }

        return true
    }
}


//=====================================================\\
//====================| MATH CORE |====================\\
class Math_Core_V3 extends Logs_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Generate random number
     * @param min 
     * @param max 
     * @returns a random number
     */
    public mathRandom(min: number, max: number): number {
        const createdRandomNumber = Math.floor(Math.random() * (max - min + 1) + min)
        return createdRandomNumber
    }

    /**
     * Get distance between two coords
     * @param x1 
     * @param y1 
     * @param z1 
     * @param x2 
     * @param y2 
     * @param z2 
     * @returns The distance between two coords
    */
    public mathDistance(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
        const distance = (p1: coordsV3, p2: coordsV3) => {
            var a = p2.x - p1.x;
            var b = p2.y - p1.y;
            var c = p2.z - p1.z;

            return Math.sqrt(a * a + b * b + c * c);
        }
        return distance({ x: x1, y: y1, z: z1 }, { x: x2, y: y2, z: z2 })
    }

    /**
     * Conver a number to a currency format
     * @param amount
     * @returns A string format from a number
     */
    public async mathCurrencyFormat(amount: number): Promise<string> {
        const mathFormatNumber: string = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
        return mathFormatNumber
    }
}


//=========================================================\\
//====================| CALLBACK CORE |====================\\
class Callback_Core_V3 extends Math_Core_V3 {
    private callbackEvents: allCallbackEvents;
    constructor() {
        super()
        this.callbackEvents = []
        this.registerCallback()
    }

    /**
     * Register new callback
     * @param eventName Event name for the callback
     * @param callback Function that the callback will call
     */
    public callbackRegister(eventName: string, callback: Function): void {
        this.callbackEvents[eventName] = callback
    }

    /**
     * Register callback response
     */
    private async registerCallback(): Promise<void> {
        const readyOnNet = (eventDetails: callbackEventDetail, ...args: any) => {
            const target = source
            if (this.callbackEvents[eventDetails.name]) {
                try {
                    this.callbackEvents[eventDetails.name](target, (...args: any) => {
                        emitNet(`CPT_Core:Client:CallbackSend:${GetCurrentResourceName()}`, target, eventDetails.id, ...args)
                    }, ...args)
                } catch (error) {
                    this.reportError(`Callback Error | ${eventDetails.name} | ${error}`)
                }
            }
        }
        this.registerNetEvent.push({ event: `CPT_Core:Server:CallbackSend:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:CallbackSend:${GetCurrentResourceName()}`, readyOnNet)
    }
}


//=====================================================\\
//====================| GANG CORE |====================\\
class Gang_Core_V3 extends Callback_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Set a players gang
     * @param gangName 
     * @returns A set of gang details
     */
    public getGang(gangName: string): { name: string, label: string, grades: { name: string, isboss: boolean }[] } {
        const foundGang = QBCore.Shared.Gangs[gangName]
        return foundGang
    }
}


//====================================================\\
//====================| JOB CORE |====================\\
class Jobs_Core_V3 extends Gang_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Set a players job
     * @param jobName 
     * @returns A set of job details
     */
    public getJobs(jobName: string): { name: string, label: string, defaultDuty: boolean, grades: { name: string, isboss: boolean, payment: number }[] } {
        const foundJob = QBCore.Shared.Jobs[jobName]
        return foundJob
    }
}


//=======================================================\\
//====================| GLOBAL CORE |====================\\
class GlobalEvent_Core_V3 extends Jobs_Core_V3 {
    constructor() {
        super()
        this.registerGlobalEvent()
    }

    /**
     * Register all global events
     */
    private async registerGlobalEvent(): Promise<void> {
        const readyOnNet = (eventName: string, ...args: any) => {
            emitNet(`CPT_Core:Client:SendGlobalEvent:${GetCurrentResourceName()}`, -1, eventName, ...args)
        }
        this.registerNetEvent.push({ event: `CPT_Core:Server:SendGlobalEvent:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:SendGlobalEvent:${GetCurrentResourceName()}`, readyOnNet)
    }
}


//================================================================\\
//====================| REACTIVE CONFIG CORE |====================\\
class ReactiveConfig_Core_V3 extends GlobalEvent_Core_V3 {
    private allConfigs: reactiveConfigDetail
    constructor() {
        super()
        this.allConfigs = []
        this.registerReactiveConfig()
    }

    /**
     * Get a reactive config
     * @param key The key to the config
     * @returns The reactive config details
     */
    public reactiveConfigGet(key: string): any {
        return this.allConfigs[key]
    }

    /**
     * Set a reactive config
     * @param key The key to the config
     * @param value The new value for the config
     */
    public reactiveConfigSet(key: string, value: any): void {
        this.allConfigs[key] = value
        emitNet(`CPT_Core:Client:UpdateReactiveConfig:${GetCurrentResourceName()}`, -1, key, value)
    }

    /**
     * Ready the reactive config system
     * @param key The key to the config
     * @param value The new value for the config
     */
    private async registerReactiveConfig(): Promise<void> {
        this.callbackRegister(`CPT_Core:Server:getAllReactiveConfigs:${GetCurrentResourceName()}`, (source: number, rtn: Function, key: any) => {
            rtn(this.allConfigs[key])
        })

        const readyOnNet = (key: string, table: any) => {
            this.allConfigs[key] = table
            emitNet(`CPT_Core:Client:UpdateReactiveConfig:${GetCurrentResourceName()}`, -1, key, table)
        }
        this.registerNetEvent.push({ event: `CPT_Core:Server:UpdateReactiveConfig:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:UpdateReactiveConfig:${GetCurrentResourceName()}`, readyOnNet)
    }
}


//======================================================\\
//====================| ITEMS CORE |====================\\
class Items_Core_V3 extends ReactiveConfig_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Get item details
     * @param itemName The name of the item
     * @returns Item details
     */
    public getItem(itemName: string): any {
        const foundQbItem = QBCore.Shared.Items[itemName]
        const allItems = exports['ox_inventory']['Items']()
        const foundOxItem = allItems[itemName]
        if (foundQbItem == null) { this.reportError(`Item missing from QBCore Items Table : ${itemName}`) }
        if (foundOxItem == null) { this.reportError(`Item missing from Ox Inventory Items Table : ${itemName}`) }
        return foundOxItem
    }

    /**
     * Create usable item
     * @param itemName The name of the item
     * @param callback The function to call when active
     */
    public createUsableItem(itemName: string, callback: Function): void {
        try {
            QBCore.Functions.CreateUseableItem(itemName, (source: string, item: string) => {
                try {
                    callback(source, item)
                } catch (error) {
                    this.reportError('Unalbe to use the item')
                }
            })
        } catch (error) {
            this.reportError('Error in QB core item register')
        }
    }

    /**
     * Use item
     * @param source
     * @param itemName
     */
    public useItem(source: number, itemName: string): void {
        exports['ox_inventory']['UseItem'](source, itemName)
    }

    /**
     * Get the item in a slot number
     * @param source 
     * @param slotNumber 
     * @returns 
     */
    public getItemBySlot(source: number, slotNumber: number) {
        return exports['ox_inventory']['GetSlot'](source, slotNumber)
    }

    /**
     * Clear a inventory
     * @param inventoryId 
     */
    public clearInventory(inventoryId: string) {
        exports['ox_inventory']['ClearInventory'](inventoryId, [])
    }

    /**
     * Add item to the inventory
     * @param inventoryId 
     * @param item 
     * @param count 
     * @param metaData 
     * @param slot 
     * @returns 
     */
    public addInventoryItem(inventoryId: string, item: string, count: number, metaData: any | null, slot: number) {
        exports['ox_inventory']['AddItem'](inventoryId, item, count, metaData, slot)
    }
}


//=======================================================\\
//====================| PLAYER CORE |====================\\
class Player_Core_V3 extends Items_Core_V3 {
    constructor() {
        super()
    }

    /**
    * Player get item
    * @param source The player server ID
    * @param itemName The item that is being pulled
    * @returns Item details
    */
    public playerGetSlotItem(source: number, itemName: string): any | null {
        const Player = QBCore.Functions.GetPlayer(source)
        if (Player) {
            try {
                const foundItem = exports['ox_inventory']['Search'](source, 'slots', itemName);
                return foundItem
            } catch (error) {
                this.reportError('Search Item By Name QB Function has stopped working')
            }
        } else {
            this.reportError(`Invalid player with ID ${source}`)
            return null
        }
    }

    /**
     * Player get item
     * @param source The player server ID
     * @param itemName The item that is being pulled
     * @returns Item details
     */
    public playerGetItem(source: number, itemName: string): any | null {
        const Player = QBCore.Functions.GetPlayer(source)
        if (Player) {
            try {
                const foundItem = Player.Functions.GetItemByName(itemName)
                return foundItem
            } catch (error) {
                this.reportError('Get Item By Name QB Function has stopped working')
            }
        } else {
            this.reportError(`Invalid player with ID ${source}`)
            return null
        }
    }

    /**
     * Player give item
     * @param source The player server ID
     * @param itemName The item that is being pulled
     * @param itemAmount The amount of times to be given
     * @param itemDetails The meta details on a item
     */
    public playerGiveItem(source: number, itemName: string, itemAmount: number, itemDetails: any): void {
        exports['ox_inventory']['AddItem'](source, itemName, itemAmount, itemDetails)
    }

    /**
     * Player remove item
     * @param source The player server ID
     * @param itemName The item that is being pulled
     * @param itemAmount The amount of times to be removed
     * @returns If the function could remove the items
     */
    public playerRemoveItem(source: number, name: string, amount: number): boolean {
        const foundItem = this.playerGetItemsAmount(source, name)
        if (foundItem < amount) { return false }

        for (let i = 0; i < amount; i++) {
            exports['ox_inventory']['RemoveItem'](source, name, 1)
        }

        return true
    }

    /**
     * Player remove item by slot number
     * @param source The player server ID
     * @param itemName The item that is being pulled
     * @param itemAmount The amount of times to be removed
     * @param itemSlot The slot of the item
     * @returns
   */
    public playerRemoveItemSlot(source: number, itemName: string, itemAmount: number, itemSlot: number): void {
        exports['ox_inventory'].RemoveItem(source, itemName, itemAmount, itemSlot);
    }

    /**
     * Player set item durability
     * @param source The player server id 
     * @param itemSlot The current item slot  
     * @param durability The new durability
     */
    public playerSetItemDurability(source: number, itemSlot: number, durability: number): void {
        exports['ox_inventory'].SetDurability(source, itemSlot, durability);
    }

    /**
     * Get player details
     * @param source The player server ID
     * @returns All player details
     */
    public playerGetDetails(source: number): playerDetails {
        let returnedPlayer = {
            source: 0,
            cid: '',
            license: '',
            firstname: '',
            lastname: '',
            job: {
                name: '',
                label: '',
                payment: 0,
                onduty: false,
                grade: {
                    name: '',
                    level: 0
                }
            },
            gang: {
                name: '',
                label: '',
                isboss: false,
                grade: {
                    name: '',
                    level: 0
                }
            },
            metadata: {}
        }

        const stringTarget = source.toString()
        const numberTarget = parseInt(stringTarget)
        const foundPlayer = QBCore.Functions.GetPlayer(numberTarget)
        if (foundPlayer) {
            returnedPlayer.source = foundPlayer.PlayerData.source
            returnedPlayer.cid = foundPlayer.PlayerData.citizenid
            returnedPlayer.license = foundPlayer.PlayerData.license

            returnedPlayer.firstname = foundPlayer.PlayerData.charinfo.firstname
            returnedPlayer.lastname = foundPlayer.PlayerData.charinfo.lastname

            returnedPlayer.job.name = foundPlayer.PlayerData.job.name
            returnedPlayer.job.label = foundPlayer.PlayerData.job.label
            returnedPlayer.job.payment = foundPlayer.PlayerData.job.payment
            returnedPlayer.job.onduty = foundPlayer.PlayerData.job.onduty
            returnedPlayer.job.grade.name = foundPlayer.PlayerData.job.grade.name
            returnedPlayer.job.grade.level = foundPlayer.PlayerData.job.grade.level

            returnedPlayer.gang.name = foundPlayer.PlayerData.gang.name
            returnedPlayer.gang.label = foundPlayer.PlayerData.gang.label
            returnedPlayer.gang.grade.name = foundPlayer.PlayerData.gang.grade.name
            returnedPlayer.gang.grade.level = foundPlayer.PlayerData.gang.grade.level

            returnedPlayer.metadata = foundPlayer.PlayerData.metadata
        }

        return returnedPlayer
    }

    /**
     * Player inventory detials
     * @param source The player server ID
     * @returns A found item
     */
    public playerGetInventory(source: number): any {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        return foundPlayer.PlayerData.items
    }

    /**
     * Player inventory items
     * @param source The player server ID
     * @param itemName The name of the item to get
     * @returns Get the amount of items the player has
     */
    public playerGetItemsAmount(source: number, itemName: string): number {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        const allItems = foundPlayer.PlayerData.items
        let foundAmount = 0
        for (const property in allItems) {
            if (itemName == allItems[property].name) {
                foundAmount = foundAmount + allItems[property].amount
            }
        }
        return foundAmount
    }

    /**
     * Get all players
     * @returns All player server IDs
     */
    public getAllPlayers(): number[] {
        const allPlayers = QBCore.Functions.GetPlayers()
        return allPlayers
    }

    /**
     * Player add money
     * @param source The player server ID
     * @param type Where the money is going
     * @param amount The amount of money
     * @param reason The reason why the money is being added
     */
    public playersAddMoney(source: number, type: string, amount: number, reason?: string): void {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        if (!reason) { reason = GetCurrentResourceName() }
        foundPlayer.Functions.AddMoney(type, amount, reason)
    }

    /**
     * Player remove money
     * @param source The player server ID
     * @param type Where the money is going
     * @param amount The amount of money
     * @param reason The reason why the money is being removed
     */
    public playersRemoveMoney(source: number, type: string, amount: number, reason?: string): void {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        if (!reason) { reason = GetCurrentResourceName() }
        foundPlayer.Functions.RemoveMoney(type, amount, reason)
    }

    /**
     * Player get money
     * @param source The player server ID
     * @param type Where the money is going
     * @returns The amount of money the playes has in the defined location
     */
    public playerGetMoney(source: number, type: string): number {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        const foundMoney = foundPlayer.Functions.GetMoney(type)
        return foundMoney
    }

    /**
     * Player dirty money
     * @param source The player server ID
     * @param removeOnFind Remove when found
     * @returns The value amout of dirty money the player has
     */
    public playerDirtyMoney(source: number, removeOnFind: boolean): number {
        const allItems = this.playerGetInventory(source)
        let totalMoney = 0
        for (const property in allItems) {
            if (allItems[property].name == 'markedbills') {
                if (removeOnFind == true) { this.playerRemoveItem(source, 'markedbills', 1) }
                if (allItems[property].info) {
                    totalMoney = allItems[property].info.worth + totalMoney
                }
            }
        }
        return totalMoney
    }

    /**
     * Player get meta data
     * @param source The player server ID
     * @param id Id of the meta data
     * @returns The meta data the player has
     */
    public playerGetMetaData(source: number, id: string): any {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        const currentValue = foundPlayer.PlayerData.metadata[id]
        if (currentValue) {
            return currentValue
        } else {
            return null
        }
    }

    /**
     * Player set meta data
     * @param source The player server ID
     * @param id Id of the meta data
     * @param value The value of the meta
     */
    public playerSetMetaData(source: number, id: string, value: any): void {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        foundPlayer.Functions.SetMetaData(id, value)
    }

    /**
     * Player set job
     * @param source The player server ID
     * @param jobId Id of the job
     * @param jobGrade Grade of the job
     */
    public playerSetJob(source: number, jobId: string, jobGrade: number): void {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        foundPlayer.Functions.SetJob(jobId, jobGrade)
    }

    /**
     * Player set job
     * @param source The player server ID
     * @param jobId Id of the job
     * @param jobGrade Grade of the job
     */
    public playerSetGang(source: number, gangId: string, gangLevel: number): void {
        const foundPlayer = QBCore.Functions.GetPlayer(source)
        foundPlayer.Functions.SetGang(gangId, gangLevel)
    }

    /**
     * Player check admin
     * @param source The player server ID
     * @param permissionLevel Permission to check
     * @returns If the player has the permission level
     */
    public playerCheckAdmin(source: number, permissionLevel: string): boolean {
        return QBCore.Functions.HasPermission(source, permissionLevel)
    }

    /**
     * Player check online ( License )
     * @param citizenId The player citizen ID
     * @returns If the player is online and if so their player details
     */
    public playerCheckOnline(citizenId: string): [boolean, any] {
        if (QBCore.Functions.GetPlayerByCitizenId(citizenId)) {
            return [true, QBCore.Functions.GetPlayerByCitizenId(citizenId)]
        } else {
            return [false, {}]
        }
    }

    /**
     * Save the players information
     */
    public playerSave(source: number): void {
        const Player = QBCore.Functions.GetPlayer(source)
        Player.Functions.Save()
    }

    /**
     * Player check license
     * @param source The player server ID
     * @param license The license to check
     * @returns If the player has the license
     */
    public playerCheckLicense(source: number, license: string): boolean {
        const Player = QBCore.Functions.GetPlayer(source)
        const allLicenses = Player.PlayerData.metadata["licences"]
        if (allLicenses[license]) {
            return true
        } else {
            return false
        }
    }
}


//=========================================================\\
//====================| REQUIRED CORE |====================\\
class RequiredItems_Core_V3 extends Player_Core_V3 {
    constructor() {
        super()
        this.registerRequiredEvent()
    }

    /**
     * Register required items event
     */
    registerRequiredEvent() {
        this.callbackRegister('CPT_Core:Server:CheckItems', (source: number, rtn: Function, itemName: string, itemAmount: number) => {
            const foundItem = this.playerGetItem(source, itemName)
            if (!foundItem) { rtn(false); return }
            if (foundItem.amount < itemAmount) {
                rtn(false); return
            }
            rtn(true)
        })

        this.callbackRegister('CPT_Core:Server:CheckMoney', (source: number, rtn: Function, location: string, amount: number) => {
            const myMoney = this.playerGetMoney(source, location)
            if (myMoney >= amount) {
                rtn(true)
            } else {
                rtn(false)
            }
        })
    }
}


//======================================================\\
//====================| SOUND CORE |====================\\
class PlaySound_Core_V2 extends RequiredItems_Core_V3 {
    constructor() {
        super()
        this.registerSoundEvents()
    }

    /**
     * Start playing a song at a location
     * @param id 
     * @param song 
     * @param distance 
     * @param location 
     * @param volume 
     */
    public async playSound(id: string, song: string, distance: number, location: coordsV3, volume: number): Promise<void> {
        try {
            exports['xsound']['PlayUrlPos'](-1, id, song, 0.9, location, true)
            exports['xsound']['Distance'](-1, id, distance)
            exports['xsound']['setVolume'](-1, id, volume)
        } catch (error) {
            this.reportError('xSound Resource Missing')
        }
    }

    /**
     * Pause the song by the ID
     * @param id 
     */
    public async pauseSound(id: string): Promise<void> {
        try {
            exports['xsound']['Pause'](-1, id)
        } catch (error) {
            this.reportError('xSound Resource Missing')
        }
    }

    /**
     * Resume the sound
     * @param id 
     */
    public async resumeSound(id: string): Promise<void> {
        try {
            exports['xsound']['Resume'](-1, id)
        } catch (error) {
            this.reportError('xSound Resource Missing')
        }
    }

    /**
     * Set the volume of the sound
     * @param id 
     * @param volume 
     */
    public async setVolumeSound(id: string, volume: number): Promise<void> {
        try {
            exports['xsound']['setVolume'](-1, id, volume)
        } catch (error) {
            this.reportError('xSound Resource Missing')
        }
    }

    /**
     * Stop the sound effect by id
     * @param id 
     */
    public async stopSound(id: string): Promise<void> {
        try {
            exports['xsound']['Destroy'](-1, id)
        } catch (error) {
            this.reportError('xSound Resource Missing')
        }
    }

    /**
     * Register all events to be used by the client
     */
    private async registerSoundEvents(): Promise<void> {
        const readyOnNet = (id: string, song: string, distance: number, location: coordsV3, volume: number) => { this.playSound(id, song, distance, location, volume) }
        this.registerNetEvent.push({ event: `CPT_Core:Server:PlaySound:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:PlaySound:${GetCurrentResourceName()}`, readyOnNet)

        const readyOnNet2 = (id: string) => { this.pauseSound(id) }
        this.registerNetEvent.push({ event: `CPT_Core:Server:PauseSound:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:PauseSound:${GetCurrentResourceName()}`, readyOnNet2)

        const readyOnNet3 = (id: string) => { this.resumeSound(id) }
        this.registerNetEvent.push({ event: `CPT_Core:Server:ResumeSound:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:ResumeSound:${GetCurrentResourceName()}`, readyOnNet3)

        const readyOnNet4 = (id: string, volume: number) => { this.setVolumeSound(id, volume) }
        this.registerNetEvent.push({ event: `CPT_Core:Server:VolumeSound:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:VolumeSound:${GetCurrentResourceName()}`, readyOnNet4)

        const readyOnNet5 = (id: string) => { this.stopSound(id) }
        this.registerNetEvent.push({ event: `CPT_Core:Server:StopSound:${GetCurrentResourceName()}`, action: readyOnNet })
        onNet(`CPT_Core:Server:StopSound:${GetCurrentResourceName()}`, readyOnNet5)
    }
}


//========================================================\\
//====================| VEHICLE CORE |====================\\
class Vehicle_Core_V2 extends PlaySound_Core_V2 {
    private vehicleTable: string;
    private vehiclePlateLocation: string
    constructor() {
        super()
        this.vehicleTable = 'player_vehicles'
        this.vehiclePlateLocation = 'plate'
        this.registerVehicleTest()
    }

    /**
     * Ready testing for vehicles
     */
    private registerVehicleTest(): void {
        this.callbackRegister(`CPT_Core:Server:testForVehicle:${GetCurrentResourceName()}`, async (source: string, rtn: Function, plateNumber: string) => {
            await this.onDatabaseReady()
            const selectionQuery = `SELECT * FROM ${this.vehicleTable} WHERE ${this.vehiclePlateLocation} = '${plateNumber}' LIMIT 5;`
            try {
                const results = await exports['oxmysql']['query_async'](selectionQuery, [])
                if (results.length == 0) {
                    rtn(false)
                } else {
                    rtn(true)
                }
            } catch (erorr) {
                rtn(false)
            }
        })
    }
}


//==========================================================\\
//====================| DOOR LOCK CORE |====================\\
class DoorLock_Core_V3 extends Vehicle_Core_V2 {
    constructor() {
        super()
    }

    /**
     * Update door state
     * @param id
     * @param state
     */
    setDoorState(id: string, state: boolean) {
        this.reactiveConfigSet(`CPT_Core:DoorConfig:Locked:${id}`, state)
    }
}


//====================================================\\
//====================| LUA CORE |====================\\
class Lua_Core_V3 extends DoorLock_Core_V3 {
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
    constructor() {
        super()
        this.registerInteractionCallbacks()
    }

    /**
     * Setup interaction callbacks
     */
    private registerInteractionCallbacks() {

        //===| Check Job Callback |===\\
        this.callbackRegister('FrameworkCreation:CheckJob', (source: number, rtn: Function, jobs: { name: string, rank: number, duty: boolean }[]) => {
            const playerDetails = this.playerGetDetails(source)
            let validJob: boolean = false
            for (let i = 0; i < jobs.length; i++) {
                if (playerDetails.job.name == jobs[i].name && playerDetails.job.grade.level >= jobs[i].rank) {
                    if (jobs[i].duty == true) {
                        if (playerDetails.job.onduty == true) {
                            validJob = true
                        }
                    } else {
                        validJob = true
                    }
                }
            }
            rtn(validJob)
        })

        //===| Check Gang Callback |===\\
        this.callbackRegister('FrameworkCreation:CheckGang', (source: number, rtn: Function, gangs: { name: string, rank: number }[]) => {
            const playerDetails = this.playerGetDetails(source)
            let validGang: boolean = false
            for (let i = 0; i < gangs.length; i++) {
                if (playerDetails.gang.name == gangs[i].name && playerDetails.gang.grade.level >= gangs[i].rank) {
                    validGang = true
                }
            }
            rtn(validGang)
        })

        //===| Check Cid Callback |===\\
        this.callbackRegister('FrameworkCreation:CheckCid', (source: number, rtn: Function, cids: { id: string }[]) => {
            const playerDetails = this.playerGetDetails(source)
            let validCid: boolean = false
            for (let i = 0; i < cids.length; i++) {
                if (playerDetails.cid == cids[i].id) {
                    validCid = true
                }
            }
            rtn(validCid)
        })

        //===| Check Item Callback |===\\
        this.callbackRegister('FrameworkCreation:CheckItems', (source: number, rtn: Function, items: { name: string, amount: number, remove: boolean }[]) => {
            let itemCheckPass: boolean = true

            for (let i = 0; i < items.length; i++) {
                const validItem = this.playerGetItem(source, items[i].name)
                if (validItem == null) {
                    itemCheckPass = false
                } else if (validItem.count < items[i].amount) {
                    itemCheckPass = false
                }
            }

            if (itemCheckPass == true) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].remove == true) {
                        this.playerRemoveItem(source, items[i].name, items[i].amount)
                    }
                }
            }

            rtn(itemCheckPass)
        })

        //===| Check Item Degrade Callback |===\\
        this.callbackRegister('FrameworkCreation:CheckDegradeItems', (source: number, rtn: Function, items: { name: string, amount: number, level: number }[]) => {
            let itemCheckPass: boolean = true
            for (let i = 0; i < items.length; i++) {
                const validItem = this.playerGetSlotItem(source, items[i].name)
                if (validItem == null) {
                    itemCheckPass = false
                } else if (validItem.length == 0) {
                    itemCheckPass = false
                } else if (itemCheckPass == true) {
                    for (let i2 = 0; i2 < validItem.length; i2++) {
                        const currentDurability = (validItem[i2].metadata && validItem[i2].metadata.durability) ? validItem[i2].metadata.durability : 100
                        const newDurability = currentDurability - (items[i].level / validItem[i2].count)
                        if (newDurability <= 0) {
                            itemCheckPass = false
                            this.playerSetItemDurability(source, validItem[i2].slot, 0)
                            this.playerRemoveItemSlot(source, validItem[i2].name, 1, validItem[i2].slot)
                        } else {
                            itemCheckPass = true
                            this.playerSetItemDurability(source, validItem[i2].slot, newDurability)
                            rtn(itemCheckPass)
                            return
                        }
                    }
                }
            }
            rtn(itemCheckPass)
        })

        //===| Check Required Accounts |===\\
        this.callbackRegister('FrameworkCreation:CheckAccount', async (source: number, rtn: Function, accounts: { name: string, limit: number }[]) => {
            let validAccount: boolean = true

            for (let i = 0; i < accounts.length; i++) {
                const businessAccount = await this.getSql("SELECT amount FROM management_funds WHERE job_name = ?", [accounts[i].name])
                if (businessAccount[0]) {
                    if (businessAccount[0] < accounts[i].limit) {
                        validAccount = false
                    }
                } else {
                    validAccount = false
                }
            }

            rtn(validAccount)
        })

        //===| Check Required Config |===\\
        this.callbackRegister('FrameworkCreation:CheckConfig', async (source: number, rtn: Function, configKey: { key: string, value: boolean }[]) => {
            for (let i = 0; i < configKey.length; i++) {
                let getReactiveConfigValue = await this.reactiveConfigGet(configKey[i].key);
                if (getReactiveConfigValue == configKey[i].value) {
                    rtn(true)
                } else {
                    rtn(false)
                }
            }
        })

        //===| Check Admin |===\\
        this.callbackRegister('FrameworkCreation:CheckAdmin', (source: number, rtn: Function) => {
            const playerAdminAccess = this.playerCheckAdmin(source, 'admin_5')
            if (playerAdminAccess == true) {
                rtn(true)
            } else {
                rtn(false)
            }
        })
    }
}


//============================================================\\
//====================| INVENTORY CIRCLE |====================\\
class Inventory_Core_V3 extends Interaction_Core_V3 {
    constructor() {
        super()
        this.registerInventoryCallbacks()
    }

    /**
     * Register Inventory Callbacks
     */
    private registerInventoryCallbacks() {
        this.callbackRegister('CPT_Framework:Server:OpenTempInv', async (source: number, rtn: Function, label: string, items: any, allItems: any) => {
            const registeredInventory = await exports['ox_inventory']['CreateTemporaryStash']({
                label: label,
                slots: items.length + 1,
                maxWeight: 20000,
                items: allItems
            })

            emitNet('ox_inventory:openInventory', source, 'stash', registeredInventory)
            rtn()
        })

        this.callbackRegister('CPT_Framework:Server:OpenCrafting', (source: number, rtn: Function, id: string, allItems: any) => {
            emit('CPT_Framework:Server:RegisterCrafting', id, allItems)
            rtn()
        })

        this.callbackRegister('CPT_Framework:Server:OpenStash', (source: number, rtn: Function, id: string, weight: number, slots: number) => {
            exports['ox_inventory']['RegisterStash'](id, 'Stash', slots, weight)
            rtn()
        })

        this.callbackRegister('CPT_Framework:Server:RegisterShop', (source: number, rtn: Function, id: string, label: string, oxReadyInventory: { item: string, price: number }[], playerLocation: [number, number, number]) => {
            exports['ox_inventory']['RegisterShop'](id, {
                name: id,
                inventory: oxReadyInventory
            })
            rtn()
        })

        this.callbackRegister('CPT_Framework:Server:Shop:CheckLicense', (source: number, rtn: Function, license: string) => {
            let licenseStatus = this.playerCheckLicense(source, license)
            rtn(licenseStatus)
        })
    }
}


//---------------| This is required to be added in the ox_inventory (modules/crafting/server.lua) |---------------\\
//AddEventHandler('CPT_System:Server:RegisterCrafting', function (id, recipe)
//    createCraftingBench(id, recipe)
//end)


//============================================================\\
//====================| On Player Loaded |====================\\
class OnPlayerLoad_Core_V3 extends Inventory_Core_V3 {
    constructor() {
        super()
        this.registerPlayerLoadedEvent()
    }

    /**
     * Register Inventory Callbacks
     */
    private registerPlayerLoadedEvent() {
        RegisterCommand('load', (source: number, args: any) => {
            if (args[0] == GetCurrentResourceName()) {
                if (source == 0) {
                    emitNet(`CPT_Framework:Client:Load:${GetCurrentResourceName()}`, -1)
                } else {
                    const permsCheck = this.playerCheckAdmin(source, 'admin_7')
                    if (permsCheck == true) {
                        emitNet(`CPT_Framework:Client:Load:${GetCurrentResourceName()}`, -1)
                    }
                }
            }
        }, false)

        //on('QBCore:Server:PlayerLoaded', (playerDetails: any) => {
        //    emitNet(`CPT_Framework:Client:PlayerLoaded:${GetCurrentResourceName()}`, playerDetails.PlayerData.source)
        //    clearTimeout(playerLoadedAwait)
        //})

        onNet('QBCore:Server:OnPlayerLoaded', () => {
            const target: number = source
            const onLoadTimeout = setTimeout(() => {
                emitNet(`CPT_Framework:Client:PlayerLoaded:${GetCurrentResourceName()}`, target)
                clearTimeout(onLoadTimeout)
            }, 5500)
        })
    }
}


//============================================================\\
//====================| Framework Editor |====================\\
class FrameworkEditor_Core_V3 extends OnPlayerLoad_Core_V3 {
    constructor() {
        super()
    }

    /**
     * Create a new gang and add it to the Qb Shared
     * @param id 
     * @param label 
     * @param gangDetials 
     */
    public addNewGang(id: string, label: string, gangDetials: gangRank[]) {
        let newGangInfo: any = {}

        for (let i = 0; i < gangDetials.length; i++) {
            newGangInfo[i] = { name: gangDetials[i].name, isboss: gangDetials[i].isBoss }
        }

        QBCore.Functions.AddGang(id, {
            label: label,
            grades: newGangInfo
        })
    }

    /**
    * Create a new job and add it to the Qb Shared
    * @param id 
    * @param label 
    * @param gangDetials 
    */
    public addNewJob(id: string, label: string, jobDetail: jobRank[]) {
        let newJobInfo: any = {}

        for (let i = 0; i < jobDetail.length; i++) {
            newJobInfo[i] = { name: jobDetail[i].name, payment: jobDetail[i].payment, isboss: jobDetail[i].isBoss }
        }

        QBCore.Functions.AddJob(id, {
            label: label,
            grades: newJobInfo
        })
    }
}



//========================================================\\
//====================| OFF RESOURCE |====================\\
class OffResource_Server_v3 extends FrameworkEditor_Core_V3 {
    constructor() {
        super()
        this.onScriptOff()
    }

    /**
     * When the script turns off it will clear objects
     */
    private onScriptOff() {
        on('onResourceStop', (resourceName: string) => {
            if (resourceName == GetCurrentResourceName()) {
                for (let i = 0; i < this.registerNetEvent.length; i++) {
                    //removeEventListener(this.registerNetEvent[i].event, this.registerNetEvent[i].action)
                }
            }
        })
    }
}


//========================================================\\
//====================| PRIMARY CORE |====================\\
class CPT_Server_V3 extends OffResource_Server_v3 {
    constructor() {
        super()
        this.startUp()
    }

    /**
     * Start up Framework
     */
    private async startUp(): Promise<void> {
        this.showAuthorBadge()
        this.checkProductionState()
        terminal.log('Database Connection', 'Online', 'green')
        // this.reportCPTResources()
        this.checkRequiredResources()
        this.coreReady = true
    }
}


//==================================================\\
//====================| EXPORT |====================\\
export const CPT_Framework = CPT_Server_V3
export const Terminal = terminal