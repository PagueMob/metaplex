import log from 'loglevel';
import { mintNFT } from './nft';
import * as anchor from '@project-serum/anchor';
import * as web3 from "@solana/web3.js";
import { ENDPOINT_NAME } from '@oyster/common';
import fs from "fs";
import { config } from "dotenv";

runVamo().then(() => {
    log.info('end runVamo');
});

async function runVamo() {
    config();
    log.setLevel('debug');
    log.debug('start runVamo');

    const targetEnv = process.env.env_target || 'devnet'; // devnet, testnet, mainnet-beta
    const endpointName = getEndpointName(targetEnv);
    const connection = new anchor.web3.Connection(getCluster(targetEnv));
    const wallet = loadWallet(process.env.wallet_keypair!)

    const metadadata = buildMetadata("", "", "", "", "", "", "", []);
    const metadataUri = "";
    const quantity = 100;

    const mintResponse = await mintNFT(connection,wallet,endpointName,[],metadadata,metadataUri,quantity);
    log.debug(`mintResponse ${mintResponse}`);

}

interface MetadataJsonAttribute {
    trait_type: string,
    value: string
}

function buildMetadata(imageArtType: string, imageArtUrl: string, adminWallet: string, creatorWalletAddr: string, creatorName: string, ticketName: string, description: string, attributes: MetadataJsonAttribute[]) {
    log.debug(`will build metadata`);
    return {
        name: ticketName,
        symbol: 'VamoNFT',
        // collection?: string;
        // uses?: Uses;
        description: description,
        sellerFeeBasisPoints: 200,
        image: imageArtUrl,
        external_url: "",
        animation_url: undefined,
        attributes: attributes,
        properties: {
            files: [
                { type: imageArtType, uri: imageArtUrl }
            ],
            category: 'image',
        },
        creators: [
            { address: adminWallet, share: 50, verified: true },
            { address: creatorWalletAddr, share: 50, verified: true },
        ]
    };
}

function loadWallet(keypair: string): anchor.Wallet {
    return new anchor.Wallet(loadKeypair(keypair));
}

function loadKeypair(keypair: string): web3.Keypair {
    if (!keypair || keypair == '') throw new Error('Keypair is required! create a Solana wallet and assign its path to `wallet_keypair` on .env file at root');
    const payer = web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(keypair, { encoding: "utf-8" }))));
    return payer;
}

function getEndpointName(name: string): ENDPOINT_NAME {
    if (name == 'mainnet-beta') {
        return 'mainnet-beta';
    } else if (name == 'testnet') {
        return 'testnet';
    }
    return 'devnet';
}

function getCluster(name: string): string {
    if (name == 'mainnet-beta') {
        return 'https://api.metaplex.solana.com/';
    } else if (name == 'testnet') {
        web3.clusterApiUrl('testnet')
    }
    return web3.clusterApiUrl('devnet');
}
