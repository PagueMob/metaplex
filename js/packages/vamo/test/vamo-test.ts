import { auction, createNftLotRequest, ticketNftSoldRequest, validateEntranceNftRequest } from "../src/vamo.js";
import { expect } from "chai";

describe('vamo listener functions', () => {

  describe('master record creation', () => {

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
        console.log("end");
      });

      console.log(`response ${response}`);

      // TODO validate
      // expect(typeof response).to(`string`);


    });

    //   // TODO add more tests

    // it('init auction program', async () => {
    //   await auction();
    // });

  });

  describe('master record print sold', () => {

    it('successfully sells a master record print', async () => {

      const masterEditionAddr = "";
      const destinationAddr = "";
      await ticketNftSoldRequest(masterEditionAddr, 100, destinationAddr);

      // TODO validate
      expect(1).to.equal(1);
    });

    // TODO add more tests

  });

  describe('update nft print as used', () => {

    it('successfully updates metadata to used=true', async () => {

      const nft = "";
      const sign = "";
      await validateEntranceNftRequest(nft, sign);

      // TODO validate
      expect(1).to.equal(1);
    });

    // TODO add more tests

  });

});
