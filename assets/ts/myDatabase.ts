import Dexie from 'dexie'

const SCHEMA_VERSION = 8

export class MyDatabase extends Dexie {
    public posts?: Dexie.Table<IPost, number>
    public configs?: Dexie.Table<IConfig, number>
    public notice?: Dexie.Table<INotice, number>


    constructor () {
        super('MyDatabase')

        this.version(SCHEMA_VERSION).stores({
            posts: "++id, name, viewName, userId, text, files, createdAt, updatedAt, replyToId, replyFromId, toUsers, like, rePost",
            configs: "++category, name, num, val, flag",
            notice: "++id, category, text, createdAt"
        })

        this.posts = this.table("posts")
        this.configs = this.table("configs")
        this.notice = this.table("notice")
    }
    
}

export interface IPost {
    id?: string
    name: string
    viewName: string
    userId: string
    text: string
    files: Array<string>
    createdAt: number
    updatedAt: number
    replyToId: string
    replyFromId: Array<string>
    toUsers: Array<string>
    like: Array<string>
    rePost: Array<string>
}

export interface IConfig {
    category?: string
    name: string
    num: number
    val: string
    flag: boolean
}

export interface INotice {
    id?: number
    category: string
    text: string
    createdAt: number
}