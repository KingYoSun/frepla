/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($toUserId: String) {
    onCreateMessage(toUserId: $toUserId) {
      toUserId
      fromUserId
      message
      ttl
      createdAt
      updatedAt
    }
  }
`;
export const onCreateProfile = /* GraphQL */ `
  subscription OnCreateProfile {
    onCreateProfile {
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
export const onUpdateProfile = /* GraphQL */ `
  subscription OnUpdateProfile {
    onUpdateProfile {
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
export const onDeleteProfile = /* GraphQL */ `
  subscription OnDeleteProfile {
    onDeleteProfile {
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
export const onCreateFriend = /* GraphQL */ `
  subscription OnCreateFriend {
    onCreateFriend {
      id
      status
      toUserId
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateFriend = /* GraphQL */ `
  subscription OnUpdateFriend {
    onUpdateFriend {
      id
      status
      toUserId
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteFriend = /* GraphQL */ `
  subscription OnDeleteFriend {
    onDeleteFriend {
      id
      status
      toUserId
      createdAt
      updatedAt
    }
  }
`;
