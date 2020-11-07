/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateProfileInput = {
  id: string,
  name: string,
  viewName?: string | null,
  email: string,
  iconUrl?: string | null,
  div: number,
  lastLogin: number,
  description?: string | null,
};

export type ModelProfileConditionInput = {
  name?: ModelStringInput | null,
  viewName?: ModelStringInput | null,
  email?: ModelStringInput | null,
  iconUrl?: ModelStringInput | null,
  div?: ModelIntInput | null,
  lastLogin?: ModelIntInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelProfileConditionInput | null > | null,
  or?: Array< ModelProfileConditionInput | null > | null,
  not?: ModelProfileConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type UpdateProfileInput = {
  id: string,
  name?: string | null,
  viewName?: string | null,
  email?: string | null,
  iconUrl?: string | null,
  div?: number | null,
  lastLogin?: number | null,
  description?: string | null,
};

export type DeleteProfileInput = {
  id?: string | null,
};

export type CreateMessageInput = {
  toUserId: string,
  fromUserId: string,
  message: string,
  ttl: number,
  createdAt?: string | null,
  updatedAt?: string | null,
};

export type ModelMessageConditionInput = {
  message?: ModelStringInput | null,
  ttl?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelMessageConditionInput | null > | null,
  or?: Array< ModelMessageConditionInput | null > | null,
  not?: ModelMessageConditionInput | null,
};

export type UpdateMessageInput = {
  toUserId: string,
  fromUserId: string,
  message?: string | null,
  ttl?: number | null,
  createdAt?: string | null,
  updatedAt?: string | null,
};

export type DeleteMessageInput = {
  toUserId: string,
  fromUserId: string,
};

export type CreateFriendInput = {
  id: string,
  status: string,
  toUserId: string,
};

export type ModelFriendConditionInput = {
  toUserId?: ModelStringInput | null,
  and?: Array< ModelFriendConditionInput | null > | null,
  or?: Array< ModelFriendConditionInput | null > | null,
  not?: ModelFriendConditionInput | null,
};

export type UpdateFriendInput = {
  id: string,
  status: string,
  toUserId?: string | null,
};

export type DeleteFriendInput = {
  id: string,
  status: string,
};

export type ModelProfileFilterInput = {
  id?: ModelStringInput | null,
  name?: ModelStringInput | null,
  viewName?: ModelStringInput | null,
  email?: ModelStringInput | null,
  iconUrl?: ModelStringInput | null,
  div?: ModelIntInput | null,
  lastLogin?: ModelIntInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelProfileFilterInput | null > | null,
  or?: Array< ModelProfileFilterInput | null > | null,
  not?: ModelProfileFilterInput | null,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type ModelMessageFilterInput = {
  toUserId?: ModelStringInput | null,
  fromUserId?: ModelStringInput | null,
  message?: ModelStringInput | null,
  ttl?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelMessageFilterInput | null > | null,
  or?: Array< ModelMessageFilterInput | null > | null,
  not?: ModelMessageFilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelFriendFilterInput = {
  id?: ModelStringInput | null,
  status?: ModelStringInput | null,
  toUserId?: ModelStringInput | null,
  and?: Array< ModelFriendFilterInput | null > | null,
  or?: Array< ModelFriendFilterInput | null > | null,
  not?: ModelFriendFilterInput | null,
};

export type ModelIntKeyConditionInput = {
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type CreateProfileMutationVariables = {
  input: CreateProfileInput,
  condition?: ModelProfileConditionInput | null,
};

export type CreateProfileMutation = {
  createProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
    viewName: string | null,
    email: string,
    iconUrl: string | null,
    div: number,
    lastLogin: number,
    description: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateProfileMutationVariables = {
  input: UpdateProfileInput,
  condition?: ModelProfileConditionInput | null,
};

export type UpdateProfileMutation = {
  updateProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
    viewName: string | null,
    email: string,
    iconUrl: string | null,
    div: number,
    lastLogin: number,
    description: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteProfileMutationVariables = {
  input: DeleteProfileInput,
  condition?: ModelProfileConditionInput | null,
};

export type DeleteProfileMutation = {
  deleteProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
    viewName: string | null,
    email: string,
    iconUrl: string | null,
    div: number,
    lastLogin: number,
    description: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateMessageMutationVariables = {
  input: CreateMessageInput,
  condition?: ModelMessageConditionInput | null,
};

export type CreateMessageMutation = {
  createMessage:  {
    __typename: "Message",
    toUserId: string,
    fromUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type UpdateMessageMutationVariables = {
  input: UpdateMessageInput,
  condition?: ModelMessageConditionInput | null,
};

export type UpdateMessageMutation = {
  updateMessage:  {
    __typename: "Message",
    toUserId: string,
    fromUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type DeleteMessageMutationVariables = {
  input: DeleteMessageInput,
  condition?: ModelMessageConditionInput | null,
};

export type DeleteMessageMutation = {
  deleteMessage:  {
    __typename: "Message",
    toUserId: string,
    fromUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type CreateFriendMutationVariables = {
  input: CreateFriendInput,
  condition?: ModelFriendConditionInput | null,
};

export type CreateFriendMutation = {
  createFriend:  {
    __typename: "Friend",
    id: string,
    status: string,
    toUserId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateFriendMutationVariables = {
  input: UpdateFriendInput,
  condition?: ModelFriendConditionInput | null,
};

export type UpdateFriendMutation = {
  updateFriend:  {
    __typename: "Friend",
    id: string,
    status: string,
    toUserId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteFriendMutationVariables = {
  input: DeleteFriendInput,
  condition?: ModelFriendConditionInput | null,
};

export type DeleteFriendMutation = {
  deleteFriend:  {
    __typename: "Friend",
    id: string,
    status: string,
    toUserId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetProfileQueryVariables = {
  id: string,
};

export type GetProfileQuery = {
  getProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
    viewName: string | null,
    email: string,
    iconUrl: string | null,
    div: number,
    lastLogin: number,
    description: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListProfilesQueryVariables = {
  filter?: ModelProfileFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListProfilesQuery = {
  listProfiles:  {
    __typename: "ModelProfileConnection",
    items:  Array< {
      __typename: "Profile",
      id: string,
      name: string,
      viewName: string | null,
      email: string,
      iconUrl: string | null,
      div: number,
      lastLogin: number,
      description: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type GetMessageQueryVariables = {
  toUserId: string,
  fromUserId: string,
};

export type GetMessageQuery = {
  getMessage:  {
    __typename: "Message",
    toUserId: string,
    fromUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type ListMessagesQueryVariables = {
  toUserId?: string | null,
  fromUserId?: ModelStringKeyConditionInput | null,
  filter?: ModelMessageFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListMessagesQuery = {
  listMessages:  {
    __typename: "ModelMessageConnection",
    items:  Array< {
      __typename: "Message",
      toUserId: string,
      fromUserId: string,
      message: string,
      ttl: number,
      createdAt: string | null,
      updatedAt: string | null,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type GetFriendQueryVariables = {
  id: string,
  status: string,
};

export type GetFriendQuery = {
  getFriend:  {
    __typename: "Friend",
    id: string,
    status: string,
    toUserId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListFriendsQueryVariables = {
  id?: string | null,
  status?: ModelStringKeyConditionInput | null,
  filter?: ModelFriendFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListFriendsQuery = {
  listFriends:  {
    __typename: "ModelFriendConnection",
    items:  Array< {
      __typename: "Friend",
      id: string,
      status: string,
      toUserId: string,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type ProfileSortedByLastTimeQueryVariables = {
  div?: number | null,
  lastLogin?: ModelIntKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelProfileFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ProfileSortedByLastTimeQuery = {
  profileSortedByLastTime:  {
    __typename: "ModelProfileConnection",
    items:  Array< {
      __typename: "Profile",
      id: string,
      name: string,
      viewName: string | null,
      email: string,
      iconUrl: string | null,
      div: number,
      lastLogin: number,
      description: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type OnCreateProfileSubscription = {
  onCreateProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
    viewName: string | null,
    email: string,
    iconUrl: string | null,
    div: number,
    lastLogin: number,
    description: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateProfileSubscription = {
  onUpdateProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
    viewName: string | null,
    email: string,
    iconUrl: string | null,
    div: number,
    lastLogin: number,
    description: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteProfileSubscription = {
  onDeleteProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
    viewName: string | null,
    email: string,
    iconUrl: string | null,
    div: number,
    lastLogin: number,
    description: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateMessageSubscription = {
  onCreateMessage:  {
    __typename: "Message",
    toUserId: string,
    fromUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type OnUpdateMessageSubscription = {
  onUpdateMessage:  {
    __typename: "Message",
    toUserId: string,
    fromUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type OnDeleteMessageSubscription = {
  onDeleteMessage:  {
    __typename: "Message",
    toUserId: string,
    fromUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type OnCreateFriendSubscription = {
  onCreateFriend:  {
    __typename: "Friend",
    id: string,
    status: string,
    toUserId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateFriendSubscription = {
  onUpdateFriend:  {
    __typename: "Friend",
    id: string,
    status: string,
    toUserId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteFriendSubscription = {
  onDeleteFriend:  {
    __typename: "Friend",
    id: string,
    status: string,
    toUserId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};
