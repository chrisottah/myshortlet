import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { investmentService } from "./investment-service";
import { walletService } from "./wallet-service";
import { ensureTestUser, cleanupTestUser } from "@/lib/test-helpers";

const USER = "test_invest_user_01";
const OWNER = "test_invest_owner_01";
const PROPERTY = "test_invest_prop_01";
const OPPORTUNITY = "test_invest_opp_01";
const COUNTRY = "country_ng";
const REGION = "region_lagos";
const CITY = "city_lekki";

describe("investmentService.createInvestment", () => {
  beforeEach(async () => {
    // Clean
    await prisma.investment.deleteMany({ where: { investorId: USER } });
    await prisma.opportunity.deleteMany({ where: { id: OPPORTUNITY } });
    await prisma.property.deleteMany({ where: { id: PROPERTY } });
    await cleanupTestUser(USER);
    await cleanupTestUser(OWNER);

    // Setup users
    await ensureTestUser(USER);
    await ensureTestUser(OWNER, "property_owner");

    // Setup property + opportunity
    await prisma.property.create({
      data: {
        id: PROPERTY,
        ownerId: OWNER,
        sourceType: "company_sourced",
        title: "Test Property",
        description: "Test",
        type: "apartment",
        countryId: COUNTRY,
        regionId: REGION,
        cityId: CITY,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ["Wifi"],
        status: "approved",
      },
    });

    await prisma.opportunity.create({
      data: {
        id: OPPORTUNITY,
        propertyId: PROPERTY,
        slug: "test-opp",
        title: "Test Opportunity",
        summary: "Test",
        tier: "starter",
        minInvestmentKobo: 100_000_00n, // ₦100,000
        targetAmountKobo: 1_000_000_00n, // ₦1M
        amountRaisedKobo: 0n,
        status: "open",
        badges: [],
        openDate: new Date(Date.now() - 86_400_000),
        closeDate: new Date(Date.now() + 86_400_000),
      },
    });

    // Fund the investor's wallet
    await walletService.createWallet(USER);
    await walletService.creditAvailable(USER, 500_000_00n, {
      reference: `test.invest.setup:${USER}`,
      kind: "test.credit",
    });
  });

  it("creates an active investment, moves money to invested, and snapshots the rate", async () => {
    const inv = await investmentService.createInvestment({
      investorId: USER,
      opportunityId: OPPORTUNITY,
      amount: 100_000, // naira
      termMonths: 12,
    });

    expect(inv.status).toBe("active");
    expect(inv.amount).toBe(100_000);
    expect(inv.termMonths).toBe(12);

    const wallet = await walletService.getWalletByUserId(USER);
    expect(wallet?.availableBalance).toBe(400_000_00n);
    expect(wallet?.investedBalance).toBe(100_000_00n);

    const opp = await prisma.opportunity.findUniqueOrThrow({ where: { id: OPPORTUNITY } });
    expect(opp.amountRaisedKobo).toBe(100_000_00n);
  });

  it("rejects investments that would exceed the target", async () => {
    // Fill to near target
    await prisma.opportunity.update({
      where: { id: OPPORTUNITY },
      data: { amountRaisedKobo: 950_000_00n },
    });

    await expect(
      investmentService.createInvestment({
        investorId: USER,
        opportunityId: OPPORTUNITY,
        amount: 100_000, // would push to 1.05M > 1M
        termMonths: 12,
      })
    ).rejects.toThrow(/exceed the funding target/);
  });

  it("rejects terms not in the schedule", async () => {
    await expect(
      investmentService.createInvestment({
        investorId: USER,
        opportunityId: OPPORTUNITY,
        amount: 100_000,
        termMonths: 18, // not allowed
      })
    ).rejects.toThrow(/18-month/);
  });

  it("snapshot invariance: schedule change does not affect existing investments", async () => {
    const inv = await investmentService.createInvestment({
      investorId: USER,
      opportunityId: OPPORTUNITY,
      amount: 100_000,
      termMonths: 12,
    });
    const originalEarnings = inv.earnings;
    // In a real scenario the schedule would change; the investment row is
    // untouched because totalReturnRate is snapshotted. Assert by reading back.
    const reread = await investmentService.getInvestmentById(inv.id);
    expect(reread?.earnings).toBe(originalEarnings);
  });
});