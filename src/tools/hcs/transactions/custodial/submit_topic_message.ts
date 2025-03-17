import { Client, TopicId, TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { SubmitMessageResult } from "../../../../types";

export const submit_topic_message = async (
    topicId: TopicId,
    message: string,
    client: Client
): Promise<SubmitMessageResult> => {
    const tx = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: message,
    })

    const txResponse = await tx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const txStatus = receipt.status;
    return {
        status: txStatus.toString(),
        txHash: txResponse.transactionId.toString(),
    }
}
