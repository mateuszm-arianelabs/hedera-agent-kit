import {Client, TopicCreateTransaction, TopicId} from "@hashgraph/sdk";

export const create_topic = async (memo: string, client: Client): Promise<TopicId> => {
    const tx = new TopicCreateTransaction().setTopicMemo(memo);

    const txResponse = await tx.execute(client);

    const rx = await txResponse.getReceipt(client);

    if (!rx.status.toString().includes('SUCCESS')) {
        throw new Error("Topic creation transaction failed");
    }

    if(!rx.topicId) {
        throw new Error("Unknown error occurred during topic creation.");
    }

    return rx.topicId;
}