import Dexie from 'dexie'

const SCHEMA_VERSION = 16

export class MyDatabase extends Dexie {
    public posts?: Dexie.Table<IPost, number>
    public myPosts?: Dexie.Table<IPost, number>
    public notices?: Dexie.Table<INotice, number>
    public requests?: Dexie.Table<IRequest, number>

    constructor () {
        super('MyDatabase')

        this.version(SCHEMA_VERSION).stores({
            posts: "++id, name, viewName, userId, text, files, createdAt, updatedAt, replyToId, replyFromId, threadId, indent, toUsers, like, rePost",
            myPosts: "++id, name, viewName, userId, text, files, createdAt, updatedAt, replyToId, replyFromId, threadId, indent, toUsers, like, rePost",
            notices: "++id, category, text, createdAt",
            requests: "++id, fromUserId, untilDate"
        })

        this.posts = this.table("posts")
        this.myPosts = this.table("myPosts")
        this.notices = this.table("notices")
        this.requests = this.table("requests")
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
    threadId: string
    indent: number
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

export interface IRequest {
    id?: string,
    fromUserId: string,
    untilDate: number,
}