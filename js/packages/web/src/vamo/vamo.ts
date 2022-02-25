import log from 'loglevel';

async function runVamo() {
    log.setLevel('debug');
    log.debug('start runVamo');
}

runVamo().then(() => {
    log.info('end runVamo');
});
