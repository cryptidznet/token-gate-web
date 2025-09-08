const makeIpfsUrl = (cid: string, base = process.env.NEXT_PUBLIC_ASSETS_BASE_URL) =>
  `${base}/ipfs/${cid}`;

export const IMAGES = {
  DRUNK_MONSTER_DEFAULT: makeIpfsUrl("bafybeih4gp53kmmjunm247ph64kso6hwun5tueji72am5lk42jhfxy7dna"),
  DRUNK_MONSTER_WELCOME: makeIpfsUrl("bafybeifsm5nckgaan5apyq465vmi6k3wa32h53dilbwrtabnexomvg5blu"),
  DRUNK_MONSTER_VERIFYING: makeIpfsUrl("bafybeiddnukgymk27smuvvnnizvwrbsmbkdxgyn435g2s7aq7wz5wnlgru"),
  DRUNK_MONSTER_CELEBRATING: makeIpfsUrl("bafybeieskvcp3cgydaskar6sgfsv6vpm5keulkbwh5ig5jq6l4aeem56z4"),
  DRUNK_MONSTER_FROWNING: makeIpfsUrl("bafkreihmwcofhkxlblqdowk2jkllw233dbqtihreuohi5x24qwhe6y6wsi"),
  LOGO: makeIpfsUrl("bafkreiamgwxxpv67s65whe4mrigos7mmh25b7lzk655at6nr52t65e2m7q"),
  HORN_PUB: makeIpfsUrl("bafybeian24muduau6ircz5tmpz3a4njvdnnnhjxgti72nktwpkhjsoouri"),
  HORN_PUB_PORTRAIT: makeIpfsUrl("bafybeig5y5k75qp5fyx6c26l6corglbmflg3srczrqgj5chdumirlriprm"),
};
