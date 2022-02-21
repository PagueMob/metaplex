import * as anchor from '@project-serum/anchor';
import * as web3 from "@solana/web3.js";
import { config } from "dotenv";
import fs from "fs";
import log from 'loglevel';
import { actions, NodeWallet, MetadataJson, MetadataJsonAttribute, MetadataJsonCollection, MetadataJsonProperties, MetadataJsonCreator, MetadataJsonFile } from '@metaplex/js';

import { putObject } from './s3.js';
import BN from 'bn.js';

import {
    ENDPOINT_NAME,
  } from '@oyster/common';

// import * as webnft from 'web/src/actions/nft';
// import {mintNFT} from '@metaplex/cli/src/commands/mint-nft'
// import { mintNFT } from '../dist/cli/src/commands/mint-nft.js'
// import {mintNFT} from '../../web/src/actions/nft'
import {mintNFT} from './actions/nft.js'
import { AuctionManager, Store } from '@metaplex-foundation/mpl-metaplex';
import {Uses, UseMethod } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey } from '@solana/web3.js';
import { Auction, CreateAuction, CreateAuctionV2, PriceFloor, PriceFloorType, WinnerLimit, WinnerLimitType } from '@metaplex-foundation/mpl-auction';

setupLog();

function setupLog() {
    config();
    log.setLevel('debug');
}

export async function auction() {
    const targetEnv = process.env.env_target || 'devnet'; // devnet, testnet, mainnet-beta
    const connection = new anchor.web3.Connection(getCluster(targetEnv));
    const wallet = loadWallet(process.env.wallet_keypair)

    const balance = await connection.getBalance(wallet.publicKey);
    log.debug(`balance ${balance}`);

    // init store
    const { storeId } = await actions.initStore({ connection, wallet, isPublic: true });
    log.info(`storeId ${storeId}`);

    // Get Auction managers 
    const auctionManagers = await AuctionManager.findMany(connection, {
        store: storeId,
    });
    log.debug(`auctionManagers ${JSON.stringify(auctionManagers)}`)

    // get auctions
    const auctions = await Promise.all(
        auctionManagers.map((m) => m.getAuction(connection))
    );
    log.debug(`auctions ${JSON.stringify(auctions)}`);

    var date = new Date();
    date.setDate(date.getDate() + 1);
    const winners = new WinnerLimit({
        type: WinnerLimitType.Unlimited,
        usize: new BN(100)
    });

    // actions.createVault({
    //     connection: connection,
    //     wallet: wallet,
    //     priceMint: 100,
    //     externalPriceAccount: new PublicKey(`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)
    // })

    // actions.initAuction({
    //     connection: connection,
    //     wallet: wallet,
    //     vault: va,
    //     auctionSettings: {
    //         instruction: 0, // ?
    //         winners: winners,
    //         endAuctionAt: new BN(date.getUTCDate()),
    //         auctionGap: new BN(0),
    //         tokenMint: 'DK6JSQrnd1AXSRG8KFRXmhodze2SL7RA9kYbCtL7693N', // master edition 
    //         priceFloor: {
    //             type: PriceFloorType.Minimum,
    //             hash: null,
    //             minPrice: new BN(100)
    //         },
    //         tickSize: new BN(0),
    //         gapTickSizePercentage: null
    //     }
    // })

    // const createAuction = new CreateAuction({}, {
    //     auction: wallet.publicKey,
    //     auctionExtended: wallet.publicKey,
    //     creator: wallet.publicKey,
    //     args: {}
    // });

    

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
    attributes: MetadataJsonAttribute[]): Promise<string | void> {

    log.info(`received request to create nft lot ${ticketName} for eventId ${eventId}`);

    const targetEnv = process.env.env_target || 'devnet'; // devnet, testnet, mainnet-beta
    const solConnection = new anchor.web3.Connection(getCluster(targetEnv));
    const walletKeypair = loadKeypair(process.env.wallet_keypair);
    const wallet = loadWallet(process.env.wallet_keypair);
    const walletPub = walletKeypair.publicKey.toBase58();
    log.debug(`wallet loaded ${walletPub}`);

    // store eventId on attributes to be used later
    attributes.push({ trait_type: "eventId", value: eventId.toString() });
    log.debug(`attributes ${JSON.stringify(attributes)}`)

    const metadadata = buildMetadata(imageArtType, imageArtUrl, walletPub, creatorWalletAddr, creatorName, ticketName, description, attributes);
    const metadataJson = JSON.stringify(metadadata);
    log.debug(`metadata ${metadataJson}`);
    const metadataUri = await storeMetadata(ticketName, eventId, metadataJson);

    const mintResponse = await mintNFT(solConnection,wallet,getEndpointName(targetEnv),[],metadadata,null, quantity);

    // const uses: Uses = {
    //     useMethod: UseMethod.Single,
    //     total: 1,
    //     remaining: 1
    // }
    // const mintResponse = await mintNFT(solConnection, walletKeypair, metadataUri, true, null, quantity, false);
    log.debug(`mintResponse ${mintResponse} - ${JSON.stringify(mintResponse)}`)
    
    // const { mint} = await actions.mintEditionFromMaster({
    //     connection: solConnection, 
    //     wallet: wallet, 
    //     masterEditionMint: new web3.PublicKey(`DK6JSQrnd1AXSRG8KFRXmhodze2SL7RA9kYbCtL7693N`),
    //     updateAuthority: wallet.publicKey
    // })
    // log.debug(`mintEditionFromMasterResponse ${mint}`);
    // log.debug(`mintEditionFromMasterResponse ${JSON.stringify(mintEditionFromMasterResponse)}`);

    // return (mintResponse as PublicKey).toBase58();
    // return mint.toBase58();

    // const mintNFTResponse: actions.MintNFTResponse = await actions.mintNFT({
    //     connection: solConnection,
    //     wallet: wallet,
    //     uri: metadataUri,
    //     maxSupply: 1
    // });
    // log.debug(`mintNFTResponse - ${JSON.stringify(mintNFTResponse)}`);

    // TODO this call is still failing. will fix on a following PR.
    // const createMasterEditionResponse = await actions.createMasterEdition({
    //     connection: solConnection,
    //     wallet: wallet,
    //     editionMint: mintNFTResponse.mint,
    //     updateAuthority: wallet.publicKey,
    //     maxSupply: new BN(quantity)
    // });
    // log.debug(`createMasterEditionResponse ${createMasterEditionResponse}`);

    return "";

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
    
    // collection?: string;
    // uses?: Uses;


    return {
        name: ticketName,
        symbol: 'VamoNFT',
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

function loadWallet(keypair: string | undefined): NodeWallet {
    return new NodeWallet(loadKeypair(keypair));
}

function loadKeypair(keypair: string | undefined): web3.Keypair {
    if (!keypair || keypair == '') throw new Error('Keypair is required! create a Solana wallet and assign its path to `wallet_keypair` on .env file at root');
    const payer = web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(keypair, { encoding: "utf-8" }))));
    return payer;
}

export async function ticketNftSoldRequest(masterEditionAddr: String, quantity: number, destinationAddr: String) {
    // TODO implement

    // interface MintEditionFromMasterParams {
    //     connection: Connection;
    //     wallet: Wallet;
    //     masterEditionMint: PublicKey;
    //     updateAuthority?: PublicKey;
    //   }
    // mintEditionFromMaster()

}

export async function validateEntranceNftRequest(nft: String, sign: String) {
    // TODO implement

    // interface UpdateMetadataParams {
    //     connection: Connection;
    //     wallet: Wallet;
    //     editionMint: PublicKey;
    //     newMetadataData?: MetadataDataData;
    //     newUpdateAuthority?: PublicKey;
    //     primarySaleHappened?: boolean;
    //   }
    // updateMetadata()
}

function getCluster(name: string): string {
    if (name == 'mainnet-beta') {
        return 'https://api.metaplex.solana.com/';
    } else if (name == 'testnet') {
        return web3.clusterApiUrl('testnet')
    }
    return web3.clusterApiUrl('devnet');
}

function getEndpointName(name: string): ENDPOINT_NAME {
    if (name == 'mainnet-beta') {
        return 'mainnet-beta';
    } else if (name == 'testnet') {
        return 'testnet';
    }
    return 'devnet';
}
