import { Client, TopicId, TopicInfo, TopicInfoQuery } from "@hashgraph/sdk";

export const get_topic_info = async (topicId: TopicId, client: Client): Promise<TopicInfo> => {
    const tx = await new TopicInfoQuery().setTopicId(topicId);

    const txResponse: TopicInfo = await tx.execute(client);

    if (!txResponse) {
        throw new Error("Could not find or fetch topic info");
    }

    return txResponse;
}