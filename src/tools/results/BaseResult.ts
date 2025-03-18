export interface BaseResult<T> {
    actionName: string;
    getStringifiedResponse(): string;
    getRawResponse(): T;
    getName(): AgentKitActionName;
}

export enum AgentKitActionName {
    CREATE_TOPIC_CUSTODIAL = 'createTopicCustodial',
    CREATE_TOPIC_NON_CUSTODIAL = 'createTopicNonCustodial'
}
