import { IRequestData, IResponseData } from "./messages";

export type MessageData = IDisconnect | IRequestData | IResponseData;

export type IMessage = IGenericMessage<MessageData>;

export interface IGenericMessage<T> {
  type: 'BROADCAST' | 'SINGLE';
  from: string;
  data: T;
  echoBroadcast?: boolean;
}

interface IDisconnect {
  command: 'DISCONNECTED';
  name: string;
}
