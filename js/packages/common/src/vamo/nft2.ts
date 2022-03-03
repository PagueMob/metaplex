// import {
//     Attribute,
//     createAssociatedTokenAccountInstruction,
//     createMasterEditionV3,
//     createMetadataV2,
//     updateMetadataV2,
//     createMint,
//     Creator,
//     ENDPOINT_NAME,
//     findProgramAddress,
//     getAssetCostToStore,
//     programIds,
//     sendTransactionWithRetry,
//     StringPublicKey,
//     toPublicKey,
//     WalletSigner,
// //   } from '@oyster/common';
// } from '../index';
//   import { MintLayout, Token } from '@solana/spl-token';
//   import {
//     Connection,
//     Keypair,
//     PublicKey,
//     SystemProgram,
//     TransactionInstruction,
//   } from '@solana/web3.js';
//   import crypto from 'crypto';

import { Connection, Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Attribute, Creator } from "../actions/metadata";
import { ENDPOINT_NAME } from "../contexts/connection";
import { WalletSigner } from "../contexts/wallet";
import { StringPublicKey } from "../utils/ids";
import React, { Dispatch, SetStateAction } from 'react';
  
  
//   import BN from 'bn.js';
  import {
    Collection,
    DataV2,
    Uses,
  } from '@metaplex-foundation/mpl-token-metadata';
import { programIds } from "../utils/programIds";
// import { WalletSigner } from '../contexts/wallet';
// import { ENDPOINT_NAME, sendTransactionWithRetry } from '../contexts/connection';
// import { Attribute, createMasterEditionV3, createMetadataV2, Creator, updateMetadataV2 } from '../actions/metadata';
// import { StringPublicKey, toPublicKey } from '../utils/ids';
// import { programIds } from '../utils/programIds';
// import { createAssociatedTokenAccountInstruction, createMint } from '../actions/account';
// import { findProgramAddress } from '../utils/utils';
// import { getAssetCostToStore } from '../utils/assets';
  
  const RESERVED_METADATA = 'metadata.json';
  
  const AR_SOL_HOLDER_ID = new PublicKey(
    '6FKvsq4ydWFci6nGq9ckbjYMtnmaqAoatz5c9XWjiDuS',
  );
  
  export const mintNFT = async (
    connection: Connection,
    wallet: WalletSigner | undefined,
    endpoint: ENDPOINT_NAME,
    files: File[],
    metadata: {
      name: string;
      symbol: string;
      description: string;
      image: string | undefined;
      animation_url: string | undefined;
      attributes: Attribute[] | undefined;
      external_url: string;
      properties: any;
      creators: Creator[] | null;
      sellerFeeBasisPoints: number;
      collection?: string;
      uses?: Uses;
    },
    uploadedUrl: string,
    maxSupply?: number,
  ): Promise<{
    metadataAccount: StringPublicKey;
  } | void> => {
    if (!wallet?.publicKey) return;

    const metadataContent = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      seller_fee_basis_points: metadata.sellerFeeBasisPoints,
      image: metadata.image,
      animation_url: metadata.animation_url,
      attributes: metadata.attributes,
      external_url: metadata.external_url,
      properties: {
        ...metadata.properties,
        creators: metadata.creators?.map(creator => {
          return {
            address: creator.address,
            share: creator.share,
          };
        }),
      },
      collection: metadata.collection
        ? new PublicKey(metadata.collection).toBase58()
        : null,
      use: metadata.uses ? metadata.uses : null,
    };
  
    
    const realFiles: File[] = [
      ...files,
      new File([JSON.stringify(metadataContent)], RESERVED_METADATA),
    ];

    console.log(`realFiles ${realFiles}`);

    // const { instructions: pushInstructions, signers: pushSigners } =
    //   await prepPayForFilesTxn(wallet, realFiles);
  
  
    return {
      metadataAccount: "resposta"
    };
  };
  

  export const prepPayForFilesTxn = async (
    wallet: WalletSigner,
    files: File[],
  ): Promise<{
    instructions: TransactionInstruction[];
    signers: Keypair[];
  }> => {
    // const memo = programIds().memo;
  
    // const instructions: TransactionInstruction[] = [];
    // const signers: Keypair[] = [];
  
    // if (wallet.publicKey)
    //   instructions.push(
    //     SystemProgram.transfer({
    //       fromPubkey: wallet.publicKey,
    //       toPubkey: AR_SOL_HOLDER_ID,
    //       lamports: await getAssetCostToStore(files),
    //     }),
    //   );
  
    // for (let i = 0; i < files.length; i++) {
    //   const hashSum = crypto.createHash('sha256');
    //   hashSum.update(await files[i].text());
    //   const hex = hashSum.digest('hex');
    //   instructions.push(
    //     new TransactionInstruction({
    //       keys: [],
    //       programId: memo,
    //       data: Buffer.from(hex),
    //     }),
    //   );
    // }

    console.log(`prepPayForFilesTxn`);
  
    // return {
    //   instructions,
    //   signers,
    // };
    return {
      instructions: [],
      signers: [],
    };
  };
  