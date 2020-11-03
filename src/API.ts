/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateProfileInput = {
  id?: string | null,
  name: string,
  description?: string | null,
};

export type ModelProfileConditionInput = {
  name?: ModelStringInput | null,
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

export type UpdateProfileInput = {
  id: string,
  name?: string | null,
  description?: string | null,
};

export type DeleteProfileInput = {
  id?: string | null,
};

export type CreateMessageInput = {
  fromUserId: string,
  toUserId: string,
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

export type UpdateMessageInput = {
  fromUserId: string,
  toUserId: string,
  message?: string | null,
  ttl?: number | null,
  createdAt?: string | null,
  updatedAt?: string | null,
};

export type DeleteMessageInput = {
  fromUserId: string,
  toUserId: string,
};

export type ModelProfileFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelProfileFilterInput | null > | null,
  or?: Array< ModelProfileFilterInput | null > | null,
  not?: ModelProfileFilterInput | null,
};

export type ModelIDInput = {
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
  fromUserId?: ModelStringInput | null,
  toUserId?: ModelStringInput | null,
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


export type CreateProfileMutationVariables = {
  input: CreateProfileInput,
  condition?: ModelProfileConditionInput | null,
};

export type CreateProfileMutation = {
  createProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
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
    fromUserId: string,
    toUserId: string,
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
    fromUserId: string,
    toUserId: string,
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
    fromUserId: string,
    toUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
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
      description: string | null,
      createdAt: string,
      updatedAt: string,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type GetMessageQueryVariables = {
  fromUserId: string,
  toUserId: string,
};

export type GetMessageQuery = {
  getMessage:  {
    __typename: "Message",
    fromUserId: string,
    toUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type ListMessagesQueryVariables = {
  fromUserId?: string | null,
  toUserId?: ModelStringKeyConditionInput | null,
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
      fromUserId: string,
      toUserId: string,
      message: string,
      ttl: number,
      createdAt: string | null,
      updatedAt: string | null,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type OnCreateProfileSubscription = {
  onCreateProfile:  {
    __typename: "Profile",
    id: string,
    name: string,
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
    description: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateMessageSubscription = {
  onCreateMessage:  {
    __typename: "Message",
    fromUserId: string,
    toUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type OnUpdateMessageSubscription = {
  onUpdateMessage:  {
    __typename: "Message",
    fromUserId: string,
    toUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};

export type OnDeleteMessageSubscription = {
  onDeleteMessage:  {
    __typename: "Message",
    fromUserId: string,
    toUserId: string,
    message: string,
    ttl: number,
    createdAt: string | null,
    updatedAt: string | null,
  } | null,
};
