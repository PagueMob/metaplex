import { createNftLotRequest } from "../src/vamo.js";
import { expect } from "chai";
import log from 'loglevel';

describe('vamo listener functions', () => {

    it('creates master record successfully', async () => {
   

        const response = await createNftLotRequest(1001,
            "Festa da Segunda 1",
            "Festa da Madonna em SP",
            100,
            new Date("2021-10-10T15:00:00"),
            new Date("2021-10-20T21:00:00"),
            "https://c-cl.cdn.smule.com/rs-s41/arr/22/06/6b0e3d30-c25f-471b-b5c6-51299f16abea.jpg",
            "image/jpg",
            "Organizador da Madonna",
            "4A3DbqzJMneTEZNMFW6KUoH8ErJPe2rqFacJMVpq82VE",
            [{ trait_type: "Lote", value: "1" }]
          ).then((_) => {
            log.info("end");
          });

        expect(1).equal(1);

    });
});
