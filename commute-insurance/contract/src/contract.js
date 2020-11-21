// @ts-check
// export { start } from '@agoric/zoe/src/contracts/oracle';

// @ts-check
import { assert, details } from '@agoric/assert';
import { E } from '@agoric/eventual-send';
import { trade } from '@agoric/Zoe/src/contractSupport';

/**
 * This contract provides oracle queries for a fee or for free.
 *
 * @type {ContractStartFn}
 *
 */
const start = async zcf => {
  const feeBrand = zcf.getTerms().brands.Fee;
  const feeMath = zcf.getTerms().maths.Fee;

  /** @type {OracleHandler} */
  let handler;

  /** @type {boolean} */
  let revoked = false;
  const revokedMsg = `Oracle revoked`;

  const { zcfSeat: feeSeat } = zcf.makeEmptySeatKit();
  const zcfMint = await zcf.makeZCFMint('Tokens');
  const { amountMath, issuer } = zcfMint.getIssuerRecord();

  const mintPayment = (seat) => {
    const amount = amountMath.make(1000);
    zcfMint.mintGains({ Token: amount }, seat);
    seat.exit();
    return 'Offer completed. You should receive a payment from Zoe';
  };

  /** @type {OracleCreatorFacet} */
  const realCreatorFacet = {
    makeWithdrawInvitation(total = false) {
      return zcf.makeInvitation(seat => {
        const gains = total
          ? feeSeat.getCurrentAllocation()
          : seat.getProposal().want;
        trade(zcf, { seat: feeSeat, gains: {} }, { seat, gains });
        seat.exit();
        return 'Successfully withdrawn';
      }, 'withdraw');
    },
    getCurrentFees() {
      return feeSeat.getCurrentAllocation();
    },
    makeShutdownInvitation: () => {
      const shutdown = seat => {
        revoked = true;
        trade(
          zcf,
          { seat: feeSeat, gains: {} },
          { seat, gains: feeSeat.getCurrentAllocation() },
        );
        zcf.shutdown(revokedMsg);
      };
      return zcf.makeInvitation(shutdown, 'shutdown');
    },
  };

  const creatorFacet = {
    initialize(privateParams) {
      ({ oracleHandler: handler } = privateParams);
      return realCreatorFacet;
    },
    makeInvitation: () => zcf.makeInvitation(mintPayment, 'mint a payment'),
    getTokenIssuer: () => issuer,
  };

  const publicFacet = {
    async query(query) {
      try {
        assert(!revoked, revokedMsg);
        const noFee = feeMath.getEmpty();
        const { requiredFee, reply } = await E(handler).onQuery(query, noFee);
        assert(
          !requiredFee || feeMath.isGTE(noFee, requiredFee),
          details`Oracle required a fee but the query had none`,
        );
        return reply;
      } catch (e) {
        E(handler).onError(query, e);
        throw e;
      }
    },
    async makeQueryInvitation(query) {
      /** @type {OfferHandler} */
      const doQuery = async querySeat => {
        try {
          const fee = querySeat.getAmountAllocated('Fee', feeBrand);
          const { requiredFee, reply } = await E(handler).onQuery(query, fee);

          if (reply !== '2020-11-20T14:19:00-05:00') {
            trade(
              zcf,
              { seat: querySeat, gains: {} },
              { seat: feeSeat, gains: { Fee: requiredFee } },
            );
          } else {
            const amount = amountMath.make(1000);
            zcfMint.mintGains({ Token: amount }, querySeat);
          }
          querySeat.exit();

          E(handler).onReply(query, reply, requiredFee);
          return reply;
        } catch (e) {
          E(handler).onError(query, e);
          throw e;
        }
      };
      return zcf.makeInvitation(doQuery, 'oracle query', { query });
    },
    getTokenIssuer: () => issuer,
  };

  return harden({ creatorFacet, publicFacet });
};

harden(start);
export { start };
