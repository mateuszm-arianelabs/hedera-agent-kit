import {Client, TopicDeleteTransaction, TopicId} from "@hashgraph/sdk";

export const delete_topic = async (topicId: TopicId, client: Client): Promise<void> => {
    const tx = new TopicDeleteTransaction()
        .setTopicId(topicId)
        .freezeWith(client);

    const txResponse = await tx.execute(client);

    const rx = await txResponse.getReceipt(client)

    if (!rx.status.toString().includes('SUCCESS')) {
        throw new Error("Topic deletion transaction failed");
    }
}