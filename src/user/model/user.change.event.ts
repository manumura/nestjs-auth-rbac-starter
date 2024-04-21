import { MessageEvent } from '@nestjs/common';
import { UserModel } from './user.model';
import { UUID } from 'crypto';

export class UserChangeEvent implements MessageEvent {
    id?: string;
    type?: UserChangeEventType;
    retry?: number;
    data: UserEventModel;

    constructor(type: UserChangeEventType, user: UserModel, auditUserUuid?: UUID, retry?: number) {
        this.id = type + '-' + user.uuid;
        this.type = type;
        this.data = new UserEventModel(user, auditUserUuid);
        this.retry = retry;
    }
}

export class UserEventModel {
    user: UserModel;
    auditUserUuid?: UUID;

    constructor(user: UserModel, auditUserUuid?: UUID) {
        this.user = user;
        this.auditUserUuid = auditUserUuid;
    }
}

export enum UserChangeEventType {
    CREATED = 'USER_CREATED',
    UPDATED = 'USER_UPDATED',
    DELETED = 'USER_DELETED',
}
