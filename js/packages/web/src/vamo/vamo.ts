import log from 'loglevel';
import { mintNFT } from './nft';

async function runVamo() {
    log.setLevel('debug');
    log.debug('start runVamo');

    await mintNFT();

}

runVamo().then(() => {
    log.info('end runVamo');
});
