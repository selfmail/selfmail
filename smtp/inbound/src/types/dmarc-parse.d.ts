declare module "dmarc-parse" {
  type DMARCTag = {
    name: string;
    value: string;
  };

  type DMARCTags = {
    v?: DMARCTag;
    p?: DMARCTag;
    sp?: DMARCTag;
    pct?: DMARCTag;
    rua?: DMARCTag;
    ruf?: DMARCTag;
    fo?: DMARCTag;
    aspf?: DMARCTag;
    adkim?: DMARCTag;
    rf?: DMARCTag;
    ri?: DMARCTag;
  };

  type ParsedDMARC = {
    tags: DMARCTags;
  };

  function dmarcParse(record: string): ParsedDMARC;

  export = dmarcParse;
}
