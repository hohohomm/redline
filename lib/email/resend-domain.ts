import { Resend } from "resend";

type DnsRecord = {
  record: string;
  name: string;
  type: string;
  ttl: string;
  status: string;
  value: string;
};

type DomainStatus = {
  verified: boolean;
  dnsRecords: DnsRecord[];
};

export async function getDomainStatus(domainId: string): Promise<DomainStatus> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.domains.get(domainId);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to fetch domain status");
  }

  const verified = data.status === "verified";
  const dnsRecords: DnsRecord[] = (data.records ?? []).map((r) => ({
    record: r.record,
    name: r.name,
    type: r.type,
    ttl: String(r.ttl),
    status: r.status,
    value: r.value,
  }));

  return { verified, dnsRecords };
}
