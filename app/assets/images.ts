const makeIpfsUrl = (cid: string, base = process.env.NEXT_PUBLIC_ASSETS_BASE_URL) =>
  `${base}/ipfs/${cid}`;

export const IMAGES = {
  DRUNK_MONSTER_DEFAULT: makeIpfsUrl("bafkreif6az3lv35pzdqclqsgoaaopcsrlgf5dyzuxhrm7gy2qldzoqf7je"),
  DRUNK_MONSTER_WELCOME: makeIpfsUrl("bafkreihivyapvkf7m5i6durdfxvhfflr2jayf2ra7tbuk7gdlky3wgi524"),
  DRUNK_MONSTER_VERIFYING: makeIpfsUrl("bafkreiblbphz42b3z2axalbnldvr3o63r55lkd3cs6he2ocmf4ohmivvwu"),
  DRUNK_MONSTER_CELEBRATING: makeIpfsUrl("bafkreidvhozwql2s5faqcmcknrewkoll2w5rpaukmfodl6puix4hqmohj4"),
  DRUNK_MONSTER_FROWNING: makeIpfsUrl("bafkreihmwcofhkxlblqdowk2jkllw233dbqtihreuohi5x24qwhe6y6wsi"),
  DRUNK_MONSTER_SLEEPING: makeIpfsUrl("bafkreihofs7quyxr7azmkupyvvrwwi5bmaqde3bsczsj4rm6dbzrifvbmq"),
  LOGO: makeIpfsUrl("bafkreiamgwxxpv67s65whe4mrigos7mmh25b7lzk655at6nr52t65e2m7q"),
  HORN_PUB: makeIpfsUrl("bafkreifzu6glduaihq7gbsoafvn26jm4lrphw52nrb3mf4jikphcv3acse"),
  HORN_PUB_PORTRAIT: makeIpfsUrl("bafkreigsennq5mfx3bgkzmantlz3wpv4arjvwq7y7juh5rwekzzlcxy7ve"),
};
