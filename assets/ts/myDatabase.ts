import Dexie from 'dexie'

const SCHEMA_VERSION = 12

export class MyDatabase extends Dexie {
    public posts?: Dexie.Table<IPost, number>
    public myPosts?: Dexie.Table<IPost, number>
    public notice?: Dexie.Table<INotice, number>

    constructor () {
        super('MyDatabase')

        this.version(SCHEMA_VERSION).stores({
            posts: "++id, name, viewName, userId, text, files, createdAt, updatedAt, replyToId, replyFromId, toUsers, like, rePost",
            myPosts: "++id, name, viewName, userId, text, files, createdAt, updatedAt, replyToId, replyFromId, toUsers, like, rePost",
            notice: "++id, category, text, createdAt"
        })

        this.posts = this.table("posts")
        this.myPosts = this.table("myPosts")
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

export interface INotice {
    id?: number
    category: string
    text: string
    createdAt: number
}