declare module "spf-check" {
  type SPFResult =
    | "pass"
    | "fail"
    | "softfail"
    | "neutral"
    | "none"
    | "temperror"
    | "permerror";

  function spfCheck(
    ip: string,
    domain: string,
    sender: string
  ): Promise<SPFResult>;

  export = spfCheck;
}
