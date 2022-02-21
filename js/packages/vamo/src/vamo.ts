import { config } from "dotenv";
import log from 'loglevel';
import {  MetadataJsonAttribute, NodeWallet } from '@metaplex/js';
import { putObject } from './s3.js';
import * as anchor from '@project-serum/anchor';
import * as web3 from "@solana/web3.js";
import fs from "fs";

setupLog();

function setupLog() {
    config();
    log.setLevel('debug');
}

export async function createNftLotRequest(eventId: number,
    ticketName: string,
    description: string,
    quantity: number,
    startSaleAt: Date,
    endSaleAt: Date,
    imageArtUrl: string,
    imageArtType: string,
    creatorName: string,
    creatorWalletAddr: string,
    attributes: MetadataJsonAttribute[]): Promise<string> {

    log.info(`received request to create nft lot ${ticketName} for eventId ${eventId}`);

    const targetEnv = process.env.env_target || 'devnet'; // devnet, testnet, mainnet-beta
    const connection = new anchor.web3.Connection(getCluster(targetEnv));
    const wallet = loadWallet(process.env.wallet_keypair)
    const walletPub = wallet.publicKey.toBase58();
    
    const balance = await connection.getBalance(wallet.publicKey);
    log.debug(`balance ${balance/1e9}`);

    attributes.push({ trait_type: "eventId", value: eventId.toString() });
    
    const metadadata = buildMetadata(imageArtType, imageArtUrl, walletPub, creatorWalletAddr, creatorName, ticketName, description, attributes);
    const metadataJson = JSON.stringify(metadadata);
    log.debug(`metadata ${metadataJson}`);
    const metadataUri = await storeMetadata(ticketName, eventId, metadataJson);

    return "createNftLotRequest end";
}

function loadWallet(keypair: string): NodeWallet {
    return new NodeWallet(loadKeypair(keypair));
}

function loadKeypair(keypair: string): web3.Keypair {
    if (!keypair || keypair == '') throw new Error('Keypair is required! create a Solana wallet and assign its path to `wallet_keypair` on .env file at root');
    const payer = web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(keypair, { encoding: "utf-8" }))));
    return payer;
}

function getCluster(name: string): string {
    if (name == 'mainnet-beta') {
        return 'https://api.metaplex.solana.com/';
    } else if (name == 'testnet') {
        web3.clusterApiUrl('testnet')
    } else {
        return web3.clusterApiUrl('devnet');
    }
}

async function storeMetadata(ticketName: string, eventId: number, metadataJson: string) {
    const bucket = 'nft.sandbox.vamoapp.com';
    const cleanName = ticketName.toLowerCase().replace(/ /g, "-");
    const cleanDate = new Date().toISOString().substring(0, 10);
    const key = `${eventId}-${cleanName}-${cleanDate}.json`;
    const response = await putObject(bucket, key, metadataJson);
    log.debug(`response ${JSON.stringify(response)}`);
    const metadataUri = `https://s3.amazonaws.com/${bucket}/${key}`;
    return metadataUri;
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
