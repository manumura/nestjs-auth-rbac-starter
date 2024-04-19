import { MessageEvent } from '@nestjs/common';
import { UserModel } from './user.model';

export class UserChangeEvent implements MessageEvent {
    id?: string;
    type?: UserChangeEventType;
    retry?: number;
    data: UserModel;

    constructor(id: string, type: UserChangeEventType, data: UserModel) {
        this.id = id;
        this.type = type;
        this.data = data;
    }
}

export enum UserChangeEventType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}
