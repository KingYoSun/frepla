import API, { graphqlOperation } from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'
import { moduleFileExtensions } from '~/jest.config'

export async function getFollowList (id, status) {
    let nextToken = null
    let follow = []
    do {
        nextToken = (nextToken !== null && nextToken !== "null") ? `"${nextToken}"` : null
        const listFriends = `
            query ListFriends {
                listFriends(
                    id: "${id}",
                    status: {
                        eq: "${status}"
                    },
                    limit: 50,
                    nextToken: ${nextToken},
                    sortDirection: DESC
                ) {
                items {
                    id
                    status
                    toUserId
                    createdAt
                    updatedAt
                }
                nextToken
                }
            }
        `
        try {
            await API.graphql(graphqlOperation(listFriends))
                .then((res) => {
                    const items = res.data.listFriends.items
                    for (const item of items) {
                        if (follow.length === 0 || (follow.find(elem => elem.id === item.id) === undefined && "toUserId" in item && item.toUserId)) {
                            follow.push(item.toUserId)
                        }
                    }
                    nextToken = res.data.listFriends.nextToken
                })
        } catch (e) {
            console.log("Getting Follow List is Failed: " + e)
            nextToken = null
        }
    } while (nextToken !== null && nextToken !== "null")
    return follow
}

export async function getFollowerList (id, status) {
    let nextToken = null
    let followers = []
    do {
        nextToken = (nextToken !== null && nextToken !== "null") ? `"${nextToken}"` : null
        const listFriendsToFollower = `
            query FriendsToFollower {
                friendsToFollower(
                    toUserId: "${id}",
                    status: {
                        eq: "${status}"
                    },
                    limit: 50,
                    nextToken: ${nextToken},
                    sortDirection: DESC
                ) {
                items {
                    id
                    status
                    toUserId
                    createdAt
                    updatedAt
                }
                nextToken
                }
            }
        `
        try {
            await API.graphql(graphqlOperation(listFriendsToFollower))
                .then((res) => {
                    const items = res.data.friendsToFollower.items
                    for (const item of items) {
                        if (followers.length === 0 || (followers.find(elem => elem.id === item.id) === undefined && "id" in item && item.id)) {
                            followers.push(item.id)
                        }
                    }
                    nextToken = res.data.friendsToFollower.nextToken
                })
        } catch (e) {
            console.log("Getting Follower List is Failed: " + e)
            nextToken = null
        }
    } while (nextToken !== null && nextToken !== "null")
    return followers
}

export async function setImgFile (obj) {
    if (obj.imgURL !== null && obj.imgURL !== 'null') {
        try {
            await Storage.get(obj.imgURL, {level: 'protected'})
                .then((res) => {
                    obj.imgPreview = res
                    obj.showPreviewImg = true
                })
                .catch((e) => {
                    console.log("Getting Image Failed: " + e)
                })
        } catch (e) {
            console.log("Getting Image Failed: " + e)
        } finally {
            return obj
        }
    }
}

export async function setImgFileUser (obj, identityId) {
    if (obj.imgURL !== null && obj.imgURL !== 'null' && identityId !== null) {
        try {
            await Storage.get(obj.imgURL, {
                level: 'protected',
                identityId: identityId
            })
                .then((res) => {
                    obj.imgPreview = res
                    obj.showPreviewImg = true
                })
                .catch((e) => {
                    console.log("Getting Image Failed: " + e)
                })
        } catch (e) {
            console.log("Getting Image Failed: " + e)
        } finally {
            return obj
        }
    }
}

export function getNow () {
    const date = new Date()
    const unixtimenow = Math.floor(date.getTime() / 1000)
    return unixtimenow
}