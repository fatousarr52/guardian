import axios from 'axios';
import { Environment, TokenInfo, TopicInfo } from '@indexer/common';

export class HederaService {
    private static mirrorNodeUrl: string;

    public static async init() {
        this.mirrorNodeUrl = Environment.mirrorNode;
    }

    public static async getMessages(topicId: string, lastNumber: number): Promise<TopicInfo | null> {
        const url = this.mirrorNodeUrl + 'topics/' + topicId + '/messages';
        const option: any = {
            params: {
                limit: 100
            },
            responseType: 'json',
            timeout: 2 * 60 * 1000,
        };
        if (lastNumber > 0) {
            option.params.sequencenumber = `gt:${lastNumber}`;
        }
        const response = await axios.get(url, option);
        const topicInfo = response?.data as TopicInfo;
        if (topicInfo && Array.isArray(topicInfo.messages)) {
            if (!topicInfo.links) {
                topicInfo.links = { next: null };
            }
            return topicInfo;
        } else {
            return null;
        }
    }

    public static async getSerials(tokenId: string, lastNumber: number): Promise<TokenInfo | null> {
        const url = this.mirrorNodeUrl + 'tokens/' + tokenId + '/nfts';
        const option: any = {
            params: {
                order: 'asc',
                limit: 100
            },
            responseType: 'json',
            timeout: 2 * 60 * 1000,
        };
        if (lastNumber > 0) {
            option.params.serialnumber = `gt:${lastNumber}`;
        }
        const response = await axios.get(url, option);
        const tokenInfo = response?.data as TokenInfo;
        if (tokenInfo && Array.isArray(tokenInfo.nfts)) {
            if (!tokenInfo.links) {
                tokenInfo.links = { next: null };
            }
            return tokenInfo;
        } else {
            return null;
        }
    }
}