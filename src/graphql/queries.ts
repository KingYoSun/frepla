/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProfile = /* GraphQL */ `
  query GetProfile($id: ID!) {
    getProfile(id: $id) {
      id
      name
      viewName
      email
      iconUrl
      banner
      url
      div
      lastLogin
      identityId
      description
      followCount
      followerCount
      createdAt
      updatedAt
    }
  }
`;
export const listProfiles = /* GraphQL */ `
  query ListProfiles(
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        viewName
        email
        iconUrl
        banner
        url
        div
        lastLogin
        identityId
        description
        followCount
        followerCount
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($toUserId: String!, $fromUserId: String!) {
    getMessage(toUserId: $toUserId, fromUserId: $fromUserId) {
      toUserId
      fromUserId
      message
      ttl
      createdAt
      updatedAt
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $toUserId: String
    $fromUserId: ModelStringKeyConditionInput
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listMessages(
      toUserId: $toUserId
      fromUserId: $fromUserId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        toUserId
        fromUserId
        message
        ttl
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getFriend = /* GraphQL */ `
  query GetFriend($id: String!, $status: String!) {
    getFriend(id: $id, status: $status) {
      id
      status
      toUserId
      createdAt
      updatedAt
    }
  }
`;
export const listFriends = /* GraphQL */ `
  query ListFriends(
    $id: String
    $status: ModelStringKeyConditionInput
    $filter: ModelFriendFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFriends(
      id: $id
      status: $status
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
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
`;
export const profileSortedByLastTime = /* GraphQL */ `
  query ProfileSortedByLastTime(
    $div: Int
    $lastLogin: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    profileSortedByLastTime(
      div: $div
      lastLogin: $lastLogin
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        viewName
        email
        iconUrl
        banner
        url
        div
        lastLogin
        identityId
        description
        followCount
        followerCount
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const friendByToUserId = /* GraphQL */ `
  query FriendByToUserId(
    $id: String
    $toUserId: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFriendFilterInput
    $limit: Int
    $nextToken: String
  ) {
    friendByToUserId(
      id: $id
      toUserId: $toUserId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
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
`;
export const friendsToFollower = /* GraphQL */ `
  query FriendsToFollower(
    $toUserId: String
    $status: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFriendFilterInput
    $limit: Int
    $nextToken: String
  ) {
    friendsToFollower(
      toUserId: $toUserId
      status: $status
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
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
`;
