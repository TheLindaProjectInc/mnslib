import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface DNSResolver extends ResolverBase {
  setDNSRecords(node: string, data: string): Promise<TransactionReceipt[]>;
  dnsRecord(node: string, name: string, resource: bigint): Promise<string>;
  hasDNSRecords(node: string, name: string): Promise<boolean>;
  clearDNSZone(node: string): Promise<TransactionReceipt[]>;
  setZoneHash(node: string, hash: string): Promise<TransactionReceipt[]>;
  zoneHash(node: string): Promise<string>;
}
